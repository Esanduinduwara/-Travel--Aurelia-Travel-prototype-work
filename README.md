# -Travel--Aurelia-Travel-prototype-work
A luxury travel website built with React and Vite, showcasing bespoke journeys, elegant design, and seamless navigation for premium travel experiences.

## Password reset email

The authentication API supports emailed password reset links. Use `.env.example` as a reference, then set those SMTP variables in the environment that runs the FastAPI server. For Gmail SMTP, use a Gmail App Password rather than your regular account password. Set `FRONTEND_URL` to the deployed frontend URL. Reset links expire after 60 minutes and can be used once.
