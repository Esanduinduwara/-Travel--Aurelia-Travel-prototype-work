# Aurelia Travel — Luxury Bespoke Travel Platform

A full-stack luxury travel website inspired by the information architecture and experience patterns of premium bespoke travel agencies such as Black Tomato. It uses an **original Aurelia visual identity, copy, layout implementation and data model**.

## Stack
- Frontend: React + Vite + React Router + Lucide
- Backend: Python + FastAPI + Pydantic
- Data: JSON persistence for easy local development
- Images: Unsplash remote image URLs

## Included features
- Editorial luxury-travel homepage
- Responsive navigation
- Destination search and regional filters
- Experience discovery cards
- Trip Finder modal
- Bespoke journey enquiry form
- FastAPI enquiry endpoint with persistent JSON storage
- Destination API + create/delete endpoints for future admin tooling
- Testimonials, inspiration/editorial area, philosophy section
- Mobile responsive design

## Run locally

### 1. Backend
Open a terminal in `backend`:

```bash
python -m venv .venv
# Windows
.venv\\Scripts\\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000
Swagger docs: http://localhost:8000/docs

#### Password reset email

The login page includes a password reset flow. Configure SMTP before starting the backend; for Gmail, use a Gmail App Password (never your regular Gmail password). Copy `backend/.env.example` as a reference and set these environment variables in the terminal that launches Uvicorn:

```powershell
$env:SMTP_HOST = "smtp.gmail.com"
$env:SMTP_PORT = "587"
$env:SMTP_USER = "your-sender@gmail.com"
$env:SMTP_PASSWORD = "your-16-character-app-password"
$env:SMTP_FROM = "your-sender@gmail.com"
$env:FRONTEND_URL = "http://localhost:5173"
python -m uvicorn app.main:app --reload --port 8000
```

The recipient can be any account email, including Gmail. Reset links expire after 60 minutes and can be used once. For a deployed site, set `FRONTEND_URL` to its public HTTPS address and keep SMTP credentials in the hosting provider's secret environment settings.

### 2. Frontend
Open another terminal in `frontend`:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally http://localhost:5173.

## Where enquiries are stored
Every enquiry submitted through the website is stored in:

`backend/data/enquiries.json`

For production, replace this with PostgreSQL/MySQL and add authentication, payment handling, CRM integration and email notifications.

## Production roadmap
- PostgreSQL database
- Admin authentication and roles
- CMS for destinations, stories and experiences
- Customer accounts / saved journeys
- Secure enquiry dashboard
- Email/WhatsApp notifications
- Payment gateway
- Hotel/flight/activity supplier APIs
- Cloud image storage
- SEO metadata and sitemap
- Analytics

## Important
This project is an original implementation inspired by the feature set and luxury-travel interaction model of the referenced website. Do not reuse the reference company's trademarks, proprietary copy, photography, logos, or other protected assets without permission.
