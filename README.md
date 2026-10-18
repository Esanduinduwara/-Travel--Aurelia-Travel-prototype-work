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

The login page includes a password reset flow. The backend reads `backend/.env` on startup. Copy `backend/.env.example` to `backend/.env` and replace the example sender and password values. For Gmail, use a Gmail App Password, never your regular Gmail password:

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

Set `SMTP_USER` and `SMTP_FROM` to the Gmail account that sends the email, and `SMTP_PASSWORD` to its 16-character App Password. The reset form address is the recipient and can be the same Gmail address. Restart the backend after changing `.env`. Reset links expire after 60 minutes and can be used once. For a deployed site, set `FRONTEND_URL` to its public HTTPS address and keep SMTP credentials in the hosting provider's secret environment settings.

### 2. Frontend
Open another terminal in `frontend`:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally http://localhost:5173.

### Publish the frontend on GitHub Pages

The `Deploy website to GitHub Pages` workflow builds the frontend and deploys it when changes are pushed to `main`. In the repository settings, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The project site URL is `https://esanduinduwara.github.io/-Travel--Aurelia-Travel-prototype-work/`.

GitHub Pages hosts the static frontend only. The FastAPI backend must be deployed separately for login, password reset, destination updates, and enquiry submission to work. Set the repository Actions variable `VITE_API_URL` to the deployed API URL ending in `/api`; configure that API's CORS to allow the GitHub Pages origin. For password reset emails, set the backend's `FRONTEND_URL` to the full Pages URL above.

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
