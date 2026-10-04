# Deployment Guide

## Architecture

- **Frontend (Vercel)**: React/Vite app — `backend/frontend/`
- **Backend (Render)**: Python Flask API — `backend/`

---

## Backend → Render

### Setup on Render Dashboard

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo: `vikas01-design/Legal-Document-Intelligence-Agent-`
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Health Check Path**: `/api/health`

### Required Environment Variables

Set these in the Render dashboard under **Environment**:

| Key | Description |
|-----|-------------|
| `GOOGLE_API_KEY` | Google AI / Gemini API key |
| `QDRANT_URL` | Qdrant Cloud cluster URL |
| `QDRANT_API_KEY` | Qdrant API key |
| `ENKRYPT_API_KEY` | Enkrypt guardrails API key |
| `LLM_PROVIDER` | `gemini` (default) |
| `PORT` | `3001` |

> A `render.yaml` is included at the repo root to configure this automatically.

---

## Frontend → Vercel

### Login & Deploy

```bash
vercel login
vercel --cwd backend/frontend --yes --prod
```

### Required Environment Variable on Vercel

After your first deploy, set this in the Vercel dashboard under **Settings → Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://legal-document-intelligence-agent.onrender.com` |

Then redeploy for the variable to take effect:
```bash
vercel --cwd backend/frontend --prod
```

### Update CORS on Backend

After getting your Vercel URL, add it to the `allowed_origins` list in `backend/app.py`:

```python
allowed_origins = [
    "https://your-app.vercel.app",  # add this
    ...
]
```

---

## Local Development

Frontend (Vite proxy routes to localhost:3001 automatically):
```bash
cd backend/frontend && npm run dev
```

Backend:
```bash
cd backend && python app.py
```

Or run both together:
```bash
cd backend && npm run dev:app
```
