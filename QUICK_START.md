# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Start Infrastructure
```bash
docker-compose up -d
```

### Step 2: Configure Environment

**backend-node/.env:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neo_ai_workspace
JWT_SECRET=change-this-secret-key
FASTAPI_URL=http://localhost:8000
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=documents
```

**backend-ai/.env:**
```env
OPENAI_API_KEY=sk-your-key-here
NODE_API_URL=http://localhost:3001
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=documents
```

**frontend/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
```

### Step 3: Install & Setup

```bash
# Terminal 1 - Node Backend
cd backend-node
npm install
npx prisma migrate dev
npm run dev

# Terminal 2 - AI Backend
cd backend-ai
pip install -r requirements.txt
uvicorn src.main:app --reload

# Terminal 3 - Frontend
cd frontend
npm install
npm run dev
```

### Step 4: Access Application

- **Frontend**: http://localhost:3000
- **Node API**: http://localhost:3001
- **AI API**: http://localhost:8000
- **MinIO Console**: http://localhost:9001

## 🎯 First Steps

1. **Create Account**: Sign up at http://localhost:3000/login
2. **Upload PDF**: Test PDF summarization
3. **Upload Audio**: Test meeting transcription
4. **Generate Report**: Try report generation
5. **Chat**: Ask questions about documents

## 📝 Notes

- First Whisper model load takes ~30 seconds
- PDF processing depends on file size
- Ensure OpenAI API key has credits
- MinIO bucket is auto-created on first upload

## 🐛 Troubleshooting

**Database connection error?**
- Check PostgreSQL is running: `docker ps`
- Verify DATABASE_URL format

**MinIO errors?**
- Access console at http://localhost:9001
- Create "documents" bucket manually if needed

**OpenAI errors?**
- Verify API key is correct
- Check API key has credits
- Ensure model access (gpt-4o-mini)

**Port conflicts?**
- Change ports in respective .env files
- Default: Frontend 3000, Node 3001, AI 8000

