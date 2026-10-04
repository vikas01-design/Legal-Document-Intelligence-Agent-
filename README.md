# ThinkDoc — Legal Document Intelligence Agent

ThinkDoc is an AI-powered legal document analysis platform that lets anyone upload a contract or legal agreement and instantly get plain-language risk assessments, compliance checks, clause summaries, and actionable recommendations — all grounded in Indian law.

---

## Who Is This For?

| User | How ThinkDoc Helps |
|---|---|
| **Startup Founders** | Review NDAs, vendor contracts, and investor agreements without expensive lawyers |
| **Small Business Owners** | Understand payment terms, liability clauses, and termination conditions |
| **Legal Professionals** | Speed up first-pass contract reviews and risk flagging |
| **Freelancers** | Check client contracts for unfair clauses before signing |
| **Law Students** | Learn how Indian contract law applies to real documents |
| **HR & Procurement Teams** | Screen employment agreements and supplier contracts at scale |

---

## What It Does

### 1. Upload a Contract
Drag and drop any PDF contract. ThinkDoc parses the document, splits it into semantic chunks, generates embeddings, and stores them in a Qdrant vector database — all in the background while you get an instant response.

### 2. Ask Legal Questions
Chat naturally with the AI about your document:
- *"What are the termination conditions?"*
- *"Is there an indemnity clause? Is it fair?"*
- *"Summarize the payment terms"*
- *"What risks should I know about?"*

The AI retrieves the most relevant contract sections, applies the ThinkDoc 10-step legal analysis framework, and gives you a structured answer backed by evidence from your document.

### 3. Full Contract Risk Analysis
Click Analyze to get a complete risk report covering up to 10 critical legal risk categories:
- Unlimited Liability
- Confidentiality obligations
- Termination clauses
- Indemnity exposure
- Payment terms
- Intellectual Property ownership
- Force Majeure
- Governing Law & jurisdiction
- Non-compete restrictions
- Data Protection compliance

Each risk is classified as **High / Medium / Low** with the relevant Indian law citation and a concrete recommendation.

---

## How It Works — Architecture

```
User (Browser)
     │
     ▼
React Frontend (Vite + Tailwind)
     │
     │  REST API calls
     ▼
Python Flask Backend (port 3001)
     │
     ├── /upload  ──► PDF Parser ──► Chunker ──► Embeddings (Gemini) ──► Qdrant
     │
     ├── /chat    ──► Intent Detection ──► Guardrails ──► RAG Retrieval ──► Gemini LLM
     │
     └── /analyze ──► Full Contract Retrieval ──► Risk Analyzer ──► Gemini LLM
```

### Key Components

**Frontend** (`backend/frontend/`)
- React 19 + Vite + Tailwind CSS
- Clerk authentication (sign up / sign in)
- Upload UI, Chat interface, Risk dashboard
- Deployed on **Vercel**

**Backend** (`backend/`)
- Python Flask REST API
- PDF parsing with PyPDF
- Text chunking and semantic embedding via Google Gemini
- Vector storage and retrieval with Qdrant Cloud
- Content safety guardrails via Enkrypt AI
- 10-step legal analysis prompt framework
- Deployed on **Render**

**AI Pipeline** (for every chat message)
1. Intent detection — greeting, legal question, illegal request, or general
2. Enkrypt guardrails — blocks harmful or illegal prompts
3. RAG retrieval — pulls the most relevant contract chunks from Qdrant
4. Prompt construction — wraps evidence + user question in the legal analysis template
5. Gemini LLM — generates a structured, evidence-backed legal answer
6. Citations returned — every answer links back to the exact contract section

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| Auth | Clerk |
| Backend | Python 3, Flask, Flask-CORS |
| AI / LLM | Google Gemini (default), Groq, OpenAI, xAI (switchable) |
| Embeddings | Google Gemini Embeddings |
| Vector DB | Qdrant Cloud |
| Guardrails | Enkrypt AI |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | *(your Vercel URL after deploy)* |
| Backend API | https://legal-document-intelligence-agent.onrender.com |
| Health Check | https://legal-document-intelligence-agent.onrender.com/api/health |

---

## Local Development

### Prerequisites
- Python 3.10+
- Node.js 22+
- A Qdrant Cloud account (free tier works)
- A Google AI API key (Gemini)

### 1. Clone the repo
```bash
git clone https://github.com/vikas01-design/Legal-Document-Intelligence-Agent-.git
cd Legal-Document-Intelligence-Agent-
```

### 2. Set up backend environment
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:
```env
GOOGLE_API_KEY=your_google_ai_key
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key
ENKRYPT_API_KEY=your_enkrypt_key
LLM_PROVIDER=gemini
PORT=3001
```

### 3. Set up frontend
```bash
cd backend/frontend
npm install
```

### 4. Run both together
```bash
cd backend
npm run dev:app
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## API Endpoints

### `POST /upload`
Upload a PDF document for indexing.

**Request:** `multipart/form-data` with a `file` field (PDF)

**Response:**
```json
{
  "success": true,
  "filename": "contract.pdf",
  "status": "processing"
}
```

---

### `POST /chat`
Ask a legal question about the uploaded document.

**Request:**
```json
{
  "question": "What are the termination conditions?"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "...",
  "intent": "legal-question",
  "citations": [...],
  "sources": [...]
}
```

---

### `POST /analyze`
Run a full contract risk analysis.

**Response:**
```json
{
  "success": true,
  "isLegalDocument": true,
  "documentType": "Non-Disclosure Agreement",
  "risks": [
    {
      "title": "Unlimited Liability",
      "level": "High",
      "description": "...",
      "law": "Section 73, Indian Contract Act, 1872",
      "recommendation": "..."
    }
  ]
}
```

---

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{ "status": "Legal Document Intelligence API Running" }
```

---

## Deployment

### Backend → Render
- Runtime: Python 3
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `python app.py`
- Add all env vars from the `.env` section above

### Frontend → Vercel
- Root directory: `backend/frontend`
- Framework: Vite
- Environment variable: `VITE_API_URL` = your Render backend URL

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed step-by-step instructions.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | ✅ | Google AI (Gemini) API key |
| `QDRANT_URL` | ✅ | Qdrant Cloud cluster URL |
| `QDRANT_API_KEY` | ✅ | Qdrant Cloud API key |
| `ENKRYPT_API_KEY` | ✅ | Enkrypt AI guardrails key |
| `LLM_PROVIDER` | ✗ | `gemini` (default), `groq`, `openai`, `xai` |
| `PORT` | ✗ | Backend port (default: `3001`) |
| `VITE_API_URL` | ✅ (prod) | Backend URL for the frontend (Vercel only) |

---

## Project Structure

```
Legal-Document-Agent/
├── backend/
│   ├── app.py                  # Flask app entry point
│   ├── requirements.txt        # Python dependencies
│   ├── agents/
│   │   └── intent_agent.py     # Intent classification
│   ├── routes/
│   │   ├── upload.py           # PDF upload & indexing
│   │   ├── chat.py             # Chat Q&A endpoint
│   │   └── analyze.py          # Full risk analysis endpoint
│   ├── services/
│   │   ├── legal_pipeline.py   # Core AI pipeline (RAG + LLM)
│   │   ├── contract_analyzer.py# Risk classification & analysis
│   │   ├── embeddings.py       # Gemini embeddings + LLM calls
│   │   ├── qdrant_service.py   # Vector DB operations
│   │   ├── pdf_parser.py       # PDF text extraction
│   │   ├── chunk_text.py       # Semantic text chunking
│   │   ├── retrieval.py        # Semantic search / RAG
│   │   └── enkrypt_guardrails.py # Content safety checks
│   └── frontend/               # React frontend
│       ├── src/
│       │   ├── pages/          # Landing, Auth, Home, Dashboard
│       │   ├── components/     # Chat, Upload, Risk cards
│       │   └── services/api.ts # Axios API client
│       └── vite.config.ts
├── render.yaml                 # Render deployment config
├── RENDER_DEPLOYMENT.md        # Deployment guide
└── README.md                   # This file
```

---

## License

MIT — free to use, modify, and distribute.
