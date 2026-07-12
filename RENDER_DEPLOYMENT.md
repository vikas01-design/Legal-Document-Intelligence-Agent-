# Render Deployment Guide for Lexora AI

## Architecture

Your Lexora AI app consists of two separate Render services:
- **Frontend**: https://lexora-ai-app.onrender.com (React app)
- **Backend**: https://lexora-ai-w6cs.onrender.com (Express API server)

## Required Environment Variables

Set these environment variables in your Render dashboard for the **backend service**:

### Core API Keys
- `GOOGLE_API_KEY` - Your Google AI API key for Gemini embeddings and chat
- `QDRANT_URL` - Your Qdrant vector database URL (e.g., `https://your-qdrant-instance.qdrant.io`)
- `QDRANT_API_KEY` - Your Qdrant API key
- `ENKRYPT_API_KEY` - Your Enkrypt API key for content safety checks

### Optional Configuration
- `LLM_PROVIDER` - LLM provider to use (default: `gemini`)
  - Options: `gemini`, `groq`, `openai`, `xai`

### Port Configuration
- `PORT` - Port for the backend server (default: `3001`)

## Frontend Configuration

The frontend is configured to use the backend URL `https://lexora-ai-w6cs.onrender.com` in production. If you need to change this, set the `VITE_API_URL` environment variable in your frontend service.

## CORS Configuration

The backend is configured to allow CORS requests from:
- https://lexora-ai-app.onrender.com (production frontend)
- http://localhost:5173 (local development)
- http://localhost:5174 (local development)
- http://localhost:3000 (local development)

If you deploy to different domains, update the `allowedOrigins` array in `backend/src/server.ts`.

## Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fix API configuration and error handling"
   git push origin main
   ```

2. **Create a Web Service on Render**
   - Connect your GitHub repository
   - Root directory: `backend`
   - Build command: `npm install && cd frontend && npm install && npm run build`
   - Start command: `npm start`
   - Node version: `22.13.0` or higher

3. **Add Environment Variables**
   - Go to your Render service dashboard
   - Add all the required environment variables listed above
   - Make sure to add them before the first deployment

4. **Deploy**
   - Render will automatically deploy when you push to GitHub
   - Monitor the deployment logs for any errors

## Common Issues and Solutions

### Issue: "QDRANT_URL and QDRANT_API_KEY must be set"
**Solution**: Make sure both QDRANT_URL and QDRANT_API_KEY are set in Render environment variables.

### Issue: "GOOGLE_API_KEY is missing in environment variables"
**Solution**: Add your GOOGLE_API_KEY to Render environment variables.

### Issue: Upload or chat not working
**Solution**: 
- Check browser console for API errors
- Verify environment variables are set correctly
- Check Render logs for backend errors
- Ensure Qdrant instance is accessible

### Issue: Frontend can't reach backend
**Solution**: 
- The frontend now uses relative URLs in production
- Ensure both frontend and backend are served from the same domain
- Check that the backend is running and responding to health checks

## Testing the Deployment

1. **Health Check**
   - Visit `https://your-app-url.onrender.com/api/health`
   - Should return: `{"status":"Legal Document Intelligence API Running"}`

2. **Upload Test**
   - Upload a PDF document
   - Check browser console for upload response
   - Check Render logs for processing status

3. **Chat Test**
   - Ask a legal question
   - Check browser console for chat response
   - Verify AI response is displayed

## Monitoring

- Check Render logs for real-time error tracking
- Monitor Qdrant dashboard for vector database status
- Use browser console for frontend debugging

## Local Development

For local development, the frontend uses Vite's proxy to route API calls to localhost:3001. No environment variables are needed for local development except those required by the backend services.
