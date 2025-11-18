# Deployment guide — Vercel (frontend) + Render (backend)

This file explains the minimal steps to deploy the frontend to Vercel and the backend to Render, and how to migrate existing local uploads to Cloudinary.

1) Prepare the repository
- Ensure your latest code is pushed to the branch you will deploy (e.g., `main`).

2) Backend (Render)
- Create a new Web Service in Render and connect your GitHub repository.
- Set the root path to the repository root (the `server` folder contains `package.json`).
- Use the `npm start` command to start the server (Render will run `npm install` during deploy).
- Add the following environment variables in the Render dashboard (do NOT commit them in `.env`):
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `EMAIL_USER`
  - `EMAIL_PASS`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `CORS_ORIGINS` (comma-separated list of allowed frontend URLs, e.g. `https://your-app.vercel.app`)

- Optional: set `NODE_ENV=production`.

3) Frontend (Vercel)
- Create a new Vercel project and point it to the `client` directory or to the monorepo root with the project root set to `client`.
- Build command: `npm run build`, Output directory: `build`.
- Add these Environment Variables in Vercel's project settings:
  - `REACT_APP_API_URL` = `https://<your-render-service>.onrender.com` (your Render URL)
  - `REACT_APP_GOOGLE_CLIENT_ID` (optional — move the hardcoded value into env)

4) Cloudinary / Uploads
- We've switched uploads to Cloudinary. Make sure the `CLOUDINARY_*` env variables are set on Render.
- Important: your Cloudinary cloud name must not contain spaces. Fix your local `server/.env` (for testing only) and make sure the value on Render has no spaces.

5) Migrate existing local uploads to Cloudinary (optional)
- If you have older records pointing to `/uploads/...` you can run the migration script on your machine or on a temporary server with access to the repo and the `uploads/` directory.

From the repo root:
```powershell
cd server
npm install
node scripts/migrate-uploads-to-cloudinary.js
```

This script will look for files in `server/uploads` and upload them to Cloudinary, then update DB records for `Report.item.imageUrl` and `User.profileImageUrl`.

6) Extra config files added
- `client/vercel.json` — simple Vercel configuration for a CRA build and SPA routing.
- `render.yaml` — example Render service file with env var placeholders (do not include secrets in the file in production).
- `server/Procfile` — contains `web: npm start` for PaaS services.

7) Testing locally
- Backend:
```powershell
cd server
npm install
npm run dev
```
- Frontend:
```powershell
cd client
npm install
REACT_APP_API_URL=http://localhost:5000 npm start
```

8) Troubleshooting
- If uploads fail, check Cloudinary env vars for typos and ensure there are no trailing spaces.
- If CORS errors occur, set `CORS_ORIGINS` on Render to include your Vercel domain (and include `http://localhost:3000` for local dev as needed).

If you want, I can also create the Render service for you (I can't access your account), or help you paste the exact env var values into Render and Vercel.
