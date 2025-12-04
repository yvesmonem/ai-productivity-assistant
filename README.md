# Neo AI Workspace

An AI-powered productivity assistant for students, professionals, and teams.

## Features

- 📄 **PDF Summarization** - Extract key points, summaries, and action items from PDFs
- 🎤 **Meeting Transcription** - Transcribe audio/video with speaker labels and action items
- 💬 **Chat with Documents** - Ask questions about uploaded documents
- 📝 **Report Generation** - Generate reports, essays, and documentation from topics

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 19
- TypeScript
- TailwindCSS
- ShadCN/UI
- Zustand

### Backend
- Node.js + Express (API & Auth)
- FastAPI (AI Processing)
- PostgreSQL + Prisma
- MinIO (File Storage)

### AI Models
- OpenAI GPT-4o-mini
- Whisper Large v3
- Sentence Transformers (for embeddings)

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- OpenAI API Key

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd ai-productivity-suite
```

2. Start infrastructure services (PostgreSQL & MinIO)
```bash
docker-compose up -d
```

3. Set up environment variables

Create `.env` files in each directory:

**backend-node/.env:**
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neo_ai_workspace
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=documents
MINIO_USE_SSL=false
FASTAPI_URL=http://localhost:8000
```

**backend-ai/.env:**
```env
OPENAI_API_KEY=your-openai-api-key-here
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=documents
MINIO_USE_SSL=false
NODE_API_URL=http://localhost:3001
```

**frontend/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
```

4. Install dependencies
```bash
# Frontend
cd frontend
npm install

# Node Backend
cd ../backend-node
npm install

# AI Backend
cd ../backend-ai
pip install -r requirements.txt
```

5. Set up database
```bash
cd backend-node
npx prisma migrate dev
npx prisma generate
```

6. Initialize MinIO bucket (optional - will be created automatically)
Access MinIO console at http://localhost:9001 (minioadmin/minioadmin) and create bucket "documents"

7. Run development servers
```bash
# Terminal 1 - Frontend (http://localhost:3000)
cd frontend
npm run dev

# Terminal 2 - Node Backend (http://localhost:3001)
cd backend-node
npm run dev

# Terminal 3 - AI Backend (http://localhost:8000)
cd backend-ai
uvicorn src.main:app --reload --port 8000
```

## Project Structure

```
/
├── frontend/          # Next.js frontend
├── backend-node/      # Express API & Auth
├── backend-ai/        # FastAPI AI services
├── docker-compose.yml # Docker configuration
└── README.md
```

## API Documentation

### Node.js Backend
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - List user documents
- `GET /api/documents/:id` - Get document details

### FastAPI Backend
- `POST /ai/summarize-pdf` - Summarize PDF
- `POST /ai/transcribe` - Transcribe audio/video
- `POST /ai/chat` - Chat with document
- `POST /ai/generate-report` - Generate report

## License

MIT

