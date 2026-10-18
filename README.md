# -Travel--Aurelia-Travel-prototype-work
A luxury travel website built with React and Vite, showcasing bespoke journeys, elegant design, and seamless navigation for premium travel experiences.

## Password reset email

The authentication API supports emailed password reset links. Copy `.env.example` to `.env`, then add the sending Gmail address and its 16-character Google App Password as `SMTP_USER`, `SMTP_FROM`, and `SMTP_PASSWORD`. The backend loads `.env` when it starts; restart it after changing settings. The reset form address is the recipient and may be the same Gmail address. Set `FRONTEND_URL` to the deployed frontend URL. Reset links expire after 60 minutes and can be used once. Never commit `.env` or share its App Password.
