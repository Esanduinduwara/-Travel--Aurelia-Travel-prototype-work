from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, field_validator
from pathlib import Path
from datetime import datetime, timedelta, timezone
import json
import uuid
import sqlite3
import os
import secrets
import re
import hashlib
import hmac
import base64
import struct
import smtplib
from email.message import EmailMessage
from urllib.parse import quote

# Configuration & Constants
ADMIN_INVITE_CODE = os.environ.get('ADMIN_INVITE_CODE', 'AURELIA-ADMIN-2026')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

DATA = Path(__file__).resolve().parent.parent / 'data'
DATA.mkdir(exist_ok=True)

def get_secret_key() -> str:
    configured_key = os.environ.get('SECRET_KEY')
    if configured_key:
        return configured_key

    key_file = DATA / '.secret_key'
    try:
        stored_key = key_file.read_text(encoding='utf-8').strip()
        if stored_key:
            return stored_key
    except FileNotFoundError:
        pass

    generated_key = secrets.token_hex(32)
    try:
        with key_file.open('x', encoding='utf-8') as secret_file:
            secret_file.write(generated_key)
        return generated_key
    except FileExistsError:
        return key_file.read_text(encoding='utf-8').strip()

SECRET_KEY = get_secret_key()
DB_PATH = DATA / 'aurelia.db'
DEST = DATA / 'destinations.json'
ENQ = DATA / 'enquiries.json'

security = HTTPBearer(auto_error=False)

# App Setup
app = FastAPI(title='Aurelia Travel API', version='1.0.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Helper functions for JSON persistence
def load(path: Path, default):
    if not path.exists():
        path.write_text(json.dumps(default, indent=2), encoding='utf-8')
    return json.loads(path.read_text(encoding='utf-8'))

def save(path: Path, data):
    path.write_text(json.dumps(data, indent=2), encoding='utf-8')

def initial_destinations():
    return [
        {'id': 1, 'name': 'Sri Lanka', 'region': 'Asia', 'country': 'Sri Lanka', 'image': 'https://images.unsplash.com/photo-1586500036706-41963de24d8b?auto=format&fit=crop&w=1200&q=85', 'tag': 'Wild · Soulful · Slow'},
        {'id': 2, 'name': 'Amalfi Coast', 'region': 'Europe', 'country': 'Italy', 'image': 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=85', 'tag': 'Romance · Sea · Culture'},
        {'id': 3, 'name': 'Namibia', 'region': 'Africa', 'country': 'Namibia', 'image': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85', 'tag': 'Desert · Wilderness · Wonder'},
        {'id': 4, 'name': 'Japan', 'region': 'Asia', 'country': 'Japan', 'image': 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=85', 'tag': 'Ritual · Food · Discovery'},
        {'id': 5, 'name': 'Patagonia', 'region': 'Americas', 'country': 'Argentina', 'image': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85', 'tag': 'Wild · Vast · Adventure'},
        {'id': 6, 'name': 'Maldives', 'region': 'Indian Ocean', 'country': 'Maldives', 'image': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85', 'tag': 'Barefoot · Ocean · Escape'}
    ]

# Database Setup & Utilities
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL
    );
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      destination TEXT DEFAULT '',
      how_to_feel TEXT DEFAULT '',
      body TEXT DEFAULT '',
      travellers TEXT DEFAULT '1-2',
      status TEXT DEFAULT 'new',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      destination_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
    ''')
    conn.commit()
    conn.close()

# Initialize data and database tables
load(DEST, initial_destinations())
load(ENQ, [])
init_db()

# Password & JWT Utilities (stdlib only — no external deps)
def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with random salt (160k iterations)."""
    salt = secrets.token_bytes(32)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 160_000)
    return salt.hex() + ':' + key.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against PBKDF2 hash."""
    try:
        salt_hex, key_hex = hashed_password.split(':')
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
        actual_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 160_000)
        return hmac.compare_digest(actual_key, expected_key)
    except Exception:
        return False

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('ascii')

def _b64url_decode(s: str) -> bytes:
    s += '=' * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT token using HMAC-SHA256 (stdlib only)."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode['exp'] = int(expire.timestamp())
    header = _b64url_encode(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode())
    payload = _b64url_encode(json.dumps(to_encode).encode())
    signing_input = f'{header}.{payload}'.encode()
    signature = hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
    return f'{header}.{payload}.{_b64url_encode(signature)}'

def verify_token(token: str):
    """Verify and decode a JWT token using HMAC-SHA256 (stdlib only)."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f'{header_b64}.{payload_b64}'.encode()
        expected_sig = hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
        actual_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        payload = json.loads(_b64url_decode(payload_b64))
        exp = payload.get('exp')
        if exp and datetime.now(timezone.utc).timestamp() > exp:
            return None
        return payload
    except Exception:
        return None

# Auth Dependencies
def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Not authenticated',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid or expired token',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    user_id = payload.get('sub')
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Token payload missing subject',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?',
            (user_id,)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='User not found',
                headers={'WWW-Authenticate': 'Bearer'},
            )
        return dict(row)
    finally:
        conn.close()

def get_current_user_optional(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict | None:
    if not credentials or not credentials.credentials:
        return None
    payload = verify_token(credentials.credentials)
    if not payload:
        return None
    user_id = payload.get('sub')
    if not user_id:
        return None
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?',
            (user_id,)
        )
        row = cursor.fetchone()
        return dict(row) if row else None
    except Exception:
        return None
    finally:
        conn.close()

def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Admin privileges required'
        )
    return user

# Pydantic Request Models
class SignupRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, value: str):
        value = value.strip().lower()
        if '@' not in value or '.' not in value.rsplit('@', 1)[-1]:
            raise ValueError('Enter a valid email address')
        return value

class AdminSignupRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    invite_code: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, value: str):
        value = value.strip().lower()
        if '@' not in value or '.' not in value.rsplit('@', 1)[-1]:
            raise ValueError('Enter a valid email address')
        return value

class LoginRequest(BaseModel):
    email: str
    password: str

class PasswordResetRequest(BaseModel):
    email: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, value: str):
        value = value.strip().lower()
        if '@' not in value or '.' not in value.rsplit('@', 1)[-1]:
            raise ValueError('Enter a valid email address')
        return value

class PasswordResetConfirmRequest(BaseModel):
    token: str
    password: str

class MessageCreate(BaseModel):
    subject: str
    destination: str = ''
    how_to_feel: str = ''
    body: str = ''
    travellers: str = '1-2'

class StatusUpdate(BaseModel):
    status: str

class DestinationCreate(BaseModel):
    name: str
    region: str
    country: str
    image: str
    tag: str

class DestinationUpdate(BaseModel):
    name: str | None = None
    region: str | None = None
    country: str | None = None
    image: str | None = None
    tag: str | None = None

class SectionCreate(BaseModel):
    destination_id: int
    title: str
    content: str
    image: str = ''
    sort_order: int = 0

class SectionUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    image: str | None = None
    sort_order: int | None = None

class Enquiry(BaseModel):
    first_name: str
    last_name: str
    email: str
    destination: str = ''
    travellers: str = '1-2'
    message: str = ''

    @field_validator('email')
    @classmethod
    def valid_email(cls, value: str):
        value = value.strip()
        if '@' not in value or '.' not in value.rsplit('@', 1)[-1]:
            raise ValueError('Enter a valid email address')
        return value

class ChatRequest(BaseModel):
    message: str

# Destination Guide and Chat Logic
DESTINATION_GUIDE = {
    'sri lanka': 'Sri Lanka is ideal for tea country, ancient sites, safari, Galle Fort, and Indian Ocean beaches. Plan 10 to 14 days. South and west coasts are strongest from December to April; east coast is better from May to September.',
    'amalfi': 'The Amalfi Coast is best for cliffside towns, sea views, boat days, Ravello, Positano, Amalfi, food, and romance. Plan 4 to 7 days. May, June, September, and early October are usually the most comfortable months.',
    'namibia': 'Namibia suits travellers who want desert landscapes, private lodges, wildlife, photography, Sossusvlei, Damaraland, Etosha, and Skeleton Coast scenery. Plan 10 to 14 days. May to October is strongest for wildlife and cooler desert weather.',
    'japan': 'Japan is excellent for Tokyo dining, Kyoto temples and gardens, ryokan stays, onsen, craft, trains, and seasonal culture. Plan 10 to 14 days. March to May and October to November are the classic high-demand seasons.',
    'patagonia': 'Patagonia is for glaciers, trekking, Fitz Roy, Torres del Paine, Perito Moreno, estancias, and wild landscapes. Plan 10 to 16 days. November to March is the main hiking season.',
    'maldives': 'The Maldives is best for private-island resorts, water villas, reefs, diving, wellness, honeymoons, and quiet beach escapes. Plan 5 to 9 days. December to April is the classic dry season.'
}

def chat_reply(message: str) -> str:
    text = message.lower()
    if any(word in text for word in ['price', 'cost', 'package', 'offer', 'deal', 'budget']):
        return 'Aurelia creates bespoke trips rather than fixed packages. The best next step is to share your destination, travel dates, traveller count, and preferred style. Then the team can design an offer around flights, hotels, guides, transfers, and experiences.'
    if any(word in text for word in ['service', 'services', 'what do you do', 'help me']):
        return 'We help with tailor-made luxury journeys: destination matching, itinerary design, private guides, hotels and resorts, transfers, special experiences, celebrations, honeymoons, family travel, safari, beach escapes, culture, food, and support before and during the trip.'
    if any(word in text for word in ['honeymoon', 'romance', 'couple']):
        return 'For honeymoons and romantic travel, I would shortlist the Maldives for barefoot privacy, Amalfi Coast for food and sea views, Japan for culture and ryokan stays, or Sri Lanka for a varied journey with beach time. Tell me your travel month and pace, and I can narrow it down.'
    if any(word in text for word in ['family', 'kids', 'children']):
        return 'For families, Sri Lanka, Japan, and the Maldives can work especially well. Sri Lanka gives wildlife and beaches, Japan is clean and easy to move around by train, and the Maldives is simple if you choose the right resort island.'
    if any(word in text for word in ['best time', 'when', 'season', 'weather']):
        return 'Best timing depends on destination: Japan is popular in March-May and October-November, Maldives December-April, Patagonia November-March, Namibia May-October, Amalfi May-June or September-early October, and Sri Lanka depends on which coast you want.'
    for key, answer in DESTINATION_GUIDE.items():
        if key in text:
            return answer
    if any(word in text for word in ['destination', 'where', 'recommend', 'suggest']):
        return 'A few good matches: Japan for culture and food, Maldives for beach luxury, Namibia for dramatic wilderness, Patagonia for trekking and glaciers, Sri Lanka for variety, and Amalfi Coast for romance and coastal Italy. What month are you travelling, and what kind of feeling do you want?'
    if any(word in text for word in ['book', 'contact', 'enquire', 'plan', 'start']):
        return 'You can start by using the enquiry form. Share your name, email, dream destination, traveller count, and what you are imagining. A travel designer can then shape a custom journey around you.'
    return 'I can help with Aurelia services, offers, planning style, best time to travel, and destinations like Japan, Sri Lanka, Amalfi Coast, Namibia, Patagonia, and Maldives. Ask me about a destination, travel month, honeymoon, family trip, safari, beach escape, or how to start planning.'

# Auth Endpoints
def send_password_reset_email(recipient: str, reset_url: str) -> None:
    host = os.environ.get('SMTP_HOST')
    username = os.environ.get('SMTP_USER')
    password = os.environ.get('SMTP_PASSWORD')
    sender = os.environ.get('SMTP_FROM') or username
    if not all((host, username, password, sender)):
        raise RuntimeError('SMTP email settings are incomplete')

    message = EmailMessage()
    message['Subject'] = 'Reset your Aurelia Travel password'
    message['From'] = sender
    message['To'] = recipient
    message.set_content(
        f"We received a request to reset your Aurelia Travel password.\n\n"
        f"Choose a new password using this link (valid for 60 minutes):\n{reset_url}\n\n"
        "If you did not request this, you can ignore this email."
    )
    with smtplib.SMTP(host, int(os.environ.get('SMTP_PORT', '587')), timeout=15) as server:
        server.starttls()
        server.login(username, password)
        server.send_message(message)

@app.post('/api/auth/forgot-password')
def forgot_password(req: PasswordResetRequest):
    # Require mail configuration before looking up the address, so the response
    # remains the same for registered and unregistered accounts.
    if not all(os.environ.get(key) for key in ('SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD')):
        raise HTTPException(status_code=503, detail='Password reset email is not configured')
    conn = get_db()
    try:
        row = conn.execute(
            'SELECT id, email FROM users WHERE lower(trim(email)) = ?',
            (req.email,),
        ).fetchone()
        if row:
            raw_token = secrets.token_urlsafe(32)
            token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
            expires = (datetime.now(timezone.utc) + timedelta(minutes=60)).isoformat()
            conn.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', (row['id'],))
            conn.execute(
                'INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
                (token_hash, row['id'], expires),
            )
            conn.commit()
            frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
            reset_url = f'{frontend_url}/#/reset-password?token={quote(raw_token)}'
            try:
                send_password_reset_email(row['email'], reset_url)
            except Exception as exc:
                conn.execute('DELETE FROM password_reset_tokens WHERE token_hash = ?', (token_hash,))
                conn.commit()
                raise HTTPException(status_code=503, detail='Could not send reset email. Check the SMTP settings.') from exc
        return {'message': 'If an account exists for that email, a password reset link has been sent.'}
    finally:
        conn.close()

@app.post('/api/auth/reset-password')
def reset_password(req: PasswordResetConfirmRequest):
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail='Password must be at least 8 characters long')
    token_hash = hashlib.sha256(req.token.encode('utf-8')).hexdigest()
    now = datetime.now(timezone.utc)
    conn = get_db()
    try:
        conn.execute('BEGIN IMMEDIATE')
        row = conn.execute(
            'SELECT user_id, expires_at FROM password_reset_tokens WHERE token_hash = ?',
            (token_hash,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=400, detail='This reset link is invalid or has expired.')
        try:
            expires = datetime.fromisoformat(row['expires_at'])
        except ValueError:
            expires = now
        if expires <= now:
            conn.execute('DELETE FROM password_reset_tokens WHERE token_hash = ?', (token_hash,))
            conn.commit()
            raise HTTPException(status_code=400, detail='This reset link is invalid or has expired.')
        conn.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            (hash_password(req.password), row['user_id']),
        )
        conn.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', (row['user_id'],))
        conn.commit()
        return {'message': 'Your password has been reset. You can now sign in.'}
    except Exception:
        if conn.in_transaction:
            conn.rollback()
        raise
    finally:
        conn.close()

@app.post('/api/auth/signup')
def signup(req: SignupRequest):
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail='Password must be at least 8 characters long')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (req.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail='Email is already registered')
        
        user_id = str(uuid.uuid4())
        hashed = hash_password(req.password)
        now = datetime.now(timezone.utc).isoformat()
        
        cursor.execute(
            'INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (user_id, req.email, hashed, req.first_name, req.last_name, 'customer', now)
        )
        conn.commit()
        return {
            'message': 'Account created successfully',
            'user': {
                'id': user_id,
                'email': req.email,
                'first_name': req.first_name,
                'last_name': req.last_name,
                'role': 'customer'
            }
        }
    finally:
        conn.close()

@app.post('/api/auth/admin-signup')
def admin_signup(req: AdminSignupRequest):
    if req.invite_code != ADMIN_INVITE_CODE:
        raise HTTPException(status_code=403, detail='Invalid admin invite code')
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail='Password must be at least 8 characters long')
    
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (req.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail='Email is already registered')
        
        user_id = str(uuid.uuid4())
        hashed = hash_password(req.password)
        now = datetime.now(timezone.utc).isoformat()
        
        cursor.execute(
            'INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (user_id, req.email, hashed, req.first_name, req.last_name, 'admin', now)
        )
        conn.commit()
        return {
            'message': 'Admin account created successfully',
            'user': {
                'id': user_id,
                'email': req.email,
                'first_name': req.first_name,
                'last_name': req.last_name,
                'role': 'admin'
            }
        }
    finally:
        conn.close()

@app.post('/api/auth/login')
def login(req: LoginRequest):
    email = req.email.strip().lower()
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail='Invalid email or password')
        
        user = dict(row)
        if not verify_password(req.password, user['password_hash']):
            raise HTTPException(status_code=401, detail='Invalid email or password')
        
        token = create_access_token({'sub': user['id'], 'role': user['role']})
        return {
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'role': user['role']
            }
        }
    finally:
        conn.close()

@app.get('/api/auth/me')
def me(current_user: dict = Depends(get_current_user)):
    return {
        'id': current_user['id'],
        'email': current_user['email'],
        'first_name': current_user['first_name'],
        'last_name': current_user['last_name'],
        'role': current_user['role'],
        'created_at': current_user['created_at']
    }

# Customer Message Endpoints
@app.post('/api/messages')
def create_customer_message(msg: MessageCreate, current_user: dict = Depends(get_current_user)):
    msg_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO messages (id, user_id, subject, destination, how_to_feel, body, travellers, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (msg_id, current_user['id'], msg.subject, msg.destination, msg.how_to_feel, msg.body, msg.travellers, 'new', now)
        )
        conn.commit()
        return {
            'id': msg_id,
            'user_id': current_user['id'],
            'subject': msg.subject,
            'destination': msg.destination,
            'how_to_feel': msg.how_to_feel,
            'body': msg.body,
            'travellers': msg.travellers,
            'status': 'new',
            'created_at': now
        }
    finally:
        conn.close()

@app.get('/api/messages/mine')
def get_my_messages(current_user: dict = Depends(get_current_user)):
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC',
            (current_user['id'],)
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

# Admin Endpoints
@app.get('/api/admin/messages')
def admin_get_messages(
    status_filter: str | None = Query(None, alias='status'),
    admin: dict = Depends(require_admin)
):
    conn = get_db()
    try:
        cursor = conn.cursor()
        if status_filter:
            cursor.execute('''
                SELECT m.id, m.user_id, m.subject, m.destination, m.how_to_feel, m.body, m.travellers, m.status, m.created_at,
                       u.first_name, u.last_name, u.email
                FROM messages m
                LEFT JOIN users u ON m.user_id = u.id
                WHERE m.status = ?
                ORDER BY m.created_at DESC
            ''', (status_filter,))
        else:
            cursor.execute('''
                SELECT m.id, m.user_id, m.subject, m.destination, m.how_to_feel, m.body, m.travellers, m.status, m.created_at,
                       u.first_name, u.last_name, u.email
                FROM messages m
                LEFT JOIN users u ON m.user_id = u.id
                ORDER BY m.created_at DESC
            ''')
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

@app.patch('/api/admin/messages/{message_id}')
def admin_update_message_status(
    message_id: str,
    status_update: StatusUpdate,
    admin: dict = Depends(require_admin)
):
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM messages WHERE id = ?', (message_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail='Message not found')
        
        cursor.execute('UPDATE messages SET status = ? WHERE id = ?', (status_update.status, message_id))
        conn.commit()
        cursor.execute('SELECT * FROM messages WHERE id = ?', (message_id,))
        updated = cursor.fetchone()
        return dict(updated)
    finally:
        conn.close()

@app.get('/api/admin/users')
def admin_get_users(admin: dict = Depends(require_admin)):
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC')
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

@app.post('/api/admin/destinations')
def admin_create_destination(d: DestinationCreate, admin: dict = Depends(require_admin)):
    items = load(DEST, initial_destinations())
    new_dest = d.model_dump()
    new_dest['id'] = max([x['id'] for x in items], default=0) + 1
    items.append(new_dest)
    save(DEST, items)
    return new_dest

@app.put('/api/admin/destinations/{destination_id}')
def admin_update_destination(destination_id: int, d: DestinationUpdate, admin: dict = Depends(require_admin)):
    items = load(DEST, initial_destinations())
    for item in items:
        if item['id'] == destination_id:
            updates = d.model_dump(exclude_unset=True)
            item.update(updates)
            save(DEST, items)
            return item
    raise HTTPException(status_code=404, detail='Destination not found')

@app.delete('/api/admin/destinations/{destination_id}')
def admin_delete_destination(destination_id: int, admin: dict = Depends(require_admin)):
    items = load(DEST, initial_destinations())
    new_items = [x for x in items if x['id'] != destination_id]
    if len(new_items) == len(items):
        raise HTTPException(status_code=404, detail='Destination not found')
    save(DEST, new_items)
    return {'deleted': destination_id}

@app.get('/api/admin/sections')
def admin_get_sections(
    destination_id: int | None = Query(None),
    admin: dict = Depends(require_admin)
):
    conn = get_db()
    try:
        cursor = conn.cursor()
        if destination_id is not None:
            cursor.execute(
                'SELECT * FROM sections WHERE destination_id = ? ORDER BY sort_order ASC, created_at ASC',
                (destination_id,)
            )
        else:
            cursor.execute('SELECT * FROM sections ORDER BY destination_id ASC, sort_order ASC')
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

@app.post('/api/admin/sections')
def admin_create_section(sec: SectionCreate, admin: dict = Depends(require_admin)):
    sec_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO sections (id, destination_id, title, content, image, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (sec_id, sec.destination_id, sec.title, sec.content, sec.image, sec.sort_order, now)
        )
        conn.commit()
        return {
            'id': sec_id,
            'destination_id': sec.destination_id,
            'title': sec.title,
            'content': sec.content,
            'image': sec.image,
            'sort_order': sec.sort_order,
            'created_at': now
        }
    finally:
        conn.close()

@app.put('/api/admin/sections/{section_id}')
def admin_update_section(section_id: str, sec: SectionUpdate, admin: dict = Depends(require_admin)):
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM sections WHERE id = ?', (section_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail='Section not found')
        
        current = dict(row)
        updates = sec.model_dump(exclude_unset=True)
        title = updates.get('title', current['title'])
        content = updates.get('content', current['content'])
        image = updates.get('image', current['image'])
        sort_order = updates.get('sort_order', current['sort_order'])
        
        cursor.execute(
            'UPDATE sections SET title = ?, content = ?, image = ?, sort_order = ? WHERE id = ?',
            (title, content, image, sort_order, section_id)
        )
        conn.commit()
        cursor.execute('SELECT * FROM sections WHERE id = ?', (section_id,))
        return dict(cursor.fetchone())
    finally:
        conn.close()

@app.delete('/api/admin/sections/{section_id}')
def admin_delete_section(section_id: str, admin: dict = Depends(require_admin)):
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM sections WHERE id = ?', (section_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Section not found')
        conn.commit()
        return {'deleted': section_id}
    finally:
        conn.close()

# Public Endpoints
@app.get('/api/health')
def health():
    return {'status': 'ok', 'service': 'Aurelia Travel API'}

@app.get('/api/destinations')
def destinations():
    return load(DEST, initial_destinations())

@app.get('/api/destinations/{destination_id}')
def destination(destination_id: int):
    for d in load(DEST, initial_destinations()):
        if d['id'] == destination_id:
            return d
    raise HTTPException(status_code=404, detail='Destination not found')

@app.get('/api/destinations/{destination_id}/sections')
def destination_sections(destination_id: int):
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'SELECT * FROM sections WHERE destination_id = ? ORDER BY sort_order ASC, created_at ASC',
            (destination_id,)
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

# Legacy or Direct destination operations
@app.post('/api/destinations')
def legacy_create_destination(d: DestinationCreate, admin: dict = Depends(require_admin)):
    return admin_create_destination(d, admin)

@app.delete('/api/destinations/{destination_id}')
def legacy_delete_destination(destination_id: int, admin: dict = Depends(require_admin)):
    return admin_delete_destination(destination_id, admin)

@app.post('/api/enquiries')
def create_enquiry(e: Enquiry):
    items = load(ENQ, [])
    record = {'id': str(uuid.uuid4()), 'status': 'new', **e.model_dump()}
    items.append(record)
    save(ENQ, items)
    return {'message': 'Enquiry received', 'id': record['id']}

@app.get('/api/enquiries')
def enquiries(admin: dict = Depends(require_admin)):
    return load(ENQ, [])

@app.patch('/api/enquiries/{enquiry_id}')
def update_enquiry(enquiry_id: str, status_payload: StatusUpdate, admin: dict = Depends(require_admin)):
    items = load(ENQ, [])
    for x in items:
        if x['id'] == enquiry_id:
            x['status'] = status_payload.status
            save(ENQ, items)
            return x
    raise HTTPException(status_code=404, detail='Enquiry not found')

@app.post('/api/chat')
def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail='Message is required')
    return {'reply': chat_reply(req.message)}
