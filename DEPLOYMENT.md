# Deployment Guide — Aurelia Travel

This guide deploys the project as two services:

| Part | What it is | Host |
|---|---|---|
| Frontend | React + Vite static site (`frontend/`) | Cloudflare Pages |
| Backend | FastAPI + SQLite API (`backend/`) | Render (Web Service with a persistent disk) |

The two services talk over HTTPS. The browser loads the site from Cloudflare, and every API call goes directly to Render. The backend must therefore allow the Cloudflare origin through CORS.

---

## 0. Before you start

You need:

- A GitHub account with access to `Esanduinduwara/-Travel--Aurelia-Travel-prototype-work`.
- A [Cloudflare](https://dash.cloudflare.com) account (free plan is fine).
- A [Render](https://dashboard.render.com) account. **A paid instance is required** because the SQLite database needs a persistent disk, and Render disks are not available on the free plan. The `starter` plan in `render.yaml` is used.
- An SMTP account for password reset emails. For Gmail, create a **16-character App Password** (Google Account → Security → 2-Step Verification → App passwords). Never use your normal Gmail password.

Run the tests once locally to confirm the code is healthy:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt
python -m pytest -q tests
```

Expected: `13 passed`.

Build the frontend once:

```bash
cd frontend
npm ci
npm run build
```

Expected: a `dist/` folder with no errors.

---

## 1. Deploy the backend to Render

The repository root contains `render.yaml`, a Render Blueprint that describes the service, the start command, the health check and the disk.

1. Go to **Render Dashboard → New → Blueprint**.
2. Select the GitHub repository `-Travel--Aurelia-Travel-prototype-work` and the `main` branch.
3. Render reads `render.yaml` and shows the `aurelia-api` service. Click **Apply**.
4. Render asks for the values marked `sync: false`. Fill them in:

   | Variable | Value | Notes |
   |---|---|---|
   | `ADMIN_INVITE_CODE` | a long random string | Required to create admin accounts. Do not keep the default. |
   | `CORS_ORIGINS` | `https://YOUR-PROJECT.pages.dev` | Your Cloudflare Pages URL (see step 2). Add your custom domain too if you use one, comma-separated, no trailing slash. |
   | `FRONTEND_URL` | `https://YOUR-PROJECT.pages.dev` | Used to build the password reset link. Same as the site URL. |
   | `SMTP_USER` | your sender address | e.g. `you@gmail.com` |
   | `SMTP_PASSWORD` | 16-character App Password | Keep it secret. |
   | `SMTP_FROM` | your sender address | Usually the same as `SMTP_USER` |

   `SECRET_KEY` is generated automatically by Render. `SMTP_HOST`, `SMTP_PORT` and `AURELIA_DATA_DIR` are already set.

   > You can fill in `CORS_ORIGINS` and `FRONTEND_URL` with placeholder values first, then edit them after step 2 once you know the Cloudflare URL.

5. Click **Deploy**. Wait until the status is **Live**.
6. Check the API. Replace the host with your Render URL:

   ```bash
   curl https://aurelia-api.onrender.com/api/health
   # {"status":"ok","service":"Aurelia Travel API"}
   ```

7. Note your API URL. It is the Render URL with `/api` at the end, for example `https://aurelia-api.onrender.com/api`. You need it in step 2.

### Render notes

- The database lives on the disk at `/var/data`, so data survives redeploys. Do not scale the service above one instance, because SQLite does not support multiple writers across instances.
- Render's free tier sleeps after inactivity. The starter plan does not.
- To check logs: **Render Dashboard → aurelia-api → Logs**.

---

## 2. Deploy the frontend to Cloudflare Pages

The site uses hash-based routing (`/#/…`), so it does not need any redirect rules.

1. Go to **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Select the same GitHub repository and the `main` branch.
3. Enter the build settings:

   | Setting | Value |
   |---|---|
   | Framework preset | None (or Vite) |
   | Root directory | `frontend` |
   | Build command | `npm ci && npm run build` |
   | Build output directory | `dist` |

4. Open **Environment variables (Production)** and add:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://aurelia-api.onrender.com/api` (your Render URL from step 1, ending in `/api`) |
   | `NODE_VERSION` | `22` |

   `VITE_API_URL` is compiled into the site at build time. If you change it, you must redeploy.

5. Click **Save and Deploy**. When the build finishes, Cloudflare gives you a URL like `https://aurelia-travel.pages.dev`.
6. Go back to Render and set `CORS_ORIGINS` and `FRONTEND_URL` to that exact URL (no trailing slash). Render redeploys automatically.

### Custom domain (optional)

1. In Cloudflare Pages → your project → **Custom domains**, add your domain.
2. Add the domain to Render's `CORS_ORIGINS` (comma-separated, alongside the `.pages.dev` URL).
3. Update `FRONTEND_URL` on Render to the custom domain.

---

## 3. Verify the live site

Run through these checks in order:

1. **API health:** `https://YOUR-API/api/health` returns `ok`.
2. **Site loads:** open the Cloudflare URL. There should be no CORS errors in the browser console (F12 → Console).
3. **Destinations load:** the destinations section shows six cards.
4. **Chat:** the chat widget answers a question such as "Tell me about Japan".
5. **Enquiry:** submit the enquiry form. You should see a confirmation message.
6. **Sign up and sign in:** create an account, then sign in.
7. **Password reset:** request a reset. The email should arrive, and the link should open the site's reset page (`…/#/reset-password?token=…`). Set a new password, then sign in with it.
8. **Admin:** create an admin account with the invite code you set as `ADMIN_INVITE_CODE`, then open the admin area.

If a step fails, see the troubleshooting section below.

---

## 4. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Browser console: `blocked by CORS policy` | `CORS_ORIGINS` on Render does not match the site URL | Set it to the exact origin (`https://…pages.dev`, no trailing slash) and let Render redeploy. |
| Site calls `/api/...` and gets 404 | `VITE_API_URL` was not set when the frontend was built | Set `VITE_API_URL` in Cloudflare and redeploy. |
| Sign in or enquiry fails with network error | Render service is down or still starting | Check `/api/health`, then **Render → Logs**. |
| Reset email says "not configured" (503) | `SMTP_HOST`, `SMTP_USER` or `SMTP_PASSWORD` missing | Set them on Render. |
| Reset email fails (503 "Could not send") | Wrong SMTP login | Check the App Password and that 2-Step Verification is on. Check Render logs for the exception. |
| Reset link goes to the wrong host | `FRONTEND_URL` is wrong | Set it to the live site URL. |
| Data disappears after redeploy | Disk not attached | Confirm the disk `aurelia-data` is mounted at `/var/data` (**Render → aurelia-api → Disks**). |
| Admin signup says "Invalid admin invite code" | `ADMIN_INVITE_CODE` differs from what you typed | Use the value set on Render. |

---

## 5. Updating the site later

- Push to `main`. Cloudflare Pages and Render both redeploy automatically.
- After changing `VITE_API_URL`, `CORS_ORIGINS` or `FRONTEND_URL`, redeploy the affected service.

## 6. Optional: GitHub Pages

The repository also contains `.github/workflows/pages.yml`, which publishes the frontend to GitHub Pages. You do not need it if you use Cloudflare. If you keep it, set the repository variable `VITE_API_URL` to the same API URL and add the Pages origin (`https://esanduinduwara.github.io`) to `CORS_ORIGINS`.

## 7. Security checklist before going live

- [ ] `ADMIN_INVITE_CODE` is set to a long random value (not the default `AURELIA-ADMIN-2026`).
- [ ] `SMTP_PASSWORD` is only in Render's secret environment variables, never committed.
- [ ] `CORS_ORIGINS` lists only your real site origins.
- [ ] The backend is served over HTTPS (Render does this by default).
- [ ] `backend/data/aurelia.db` and `enquiries.json` in the repository are test data. Consider deleting them from git history before going live, since they contain test enquiries. The live site uses the disk at `/var/data`, not these files.
