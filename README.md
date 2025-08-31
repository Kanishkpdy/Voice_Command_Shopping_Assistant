Voice Command Shopping Assistant - Final

Run locally:

Backend:
cd backend
npm install
cp .env.example .env   # optionally add GEMINI_API_KEY
npm start

Frontend:
cd frontend
npm install
npm run dev

Deployment (Cloud Run + Firebase Hosting or Vercel + Render):
- Build backend docker and deploy to Cloud Run (set GEMINI_API_KEY env var if using Gemini)
- Build frontend and host on Firebase/ Vercel / Netlify. Configure /api proxy to backend URL or use VITE_API_BASE.
