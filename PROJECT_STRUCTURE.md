# Project Structure

```
ai-productivity-suite/
├── frontend/                    # Next.js 14 frontend
│   ├── app/                    # App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Login/Register page
│   │   └── dashboard/         # Main dashboard
│   ├── components/            # React components
│   │   ├── ui/                # ShadCN UI components
│   │   ├── FileUpload.tsx     # File upload component
│   │   ├── DocumentList.tsx   # Document list view
│   │   └── ReportGenerator.tsx # Report generation UI
│   ├── lib/                   # Utilities
│   │   ├── api.ts             # API client
│   │   ├── store.ts           # Zustand stores
│   │   └── utils.ts            # Helper functions
│   └── package.json
│
├── backend-node/              # Node.js + Express API
│   ├── src/
│   │   ├── routes/           # API routes
│   │   │   ├── auth.ts       # Authentication
│   │   │   ├── documents.ts  # Document management
│   │   │   ├── chat.ts       # Chat endpoints
│   │   │   └── reports.ts    # Report endpoints
│   │   ├── middleware/       # Express middleware
│   │   │   └── auth.ts       # JWT authentication
│   │   ├── lib/              # Libraries
│   │   │   ├── prisma.ts     # Prisma client
│   │   │   └── minio.ts      # MinIO client
│   │   └── index.ts          # Express app entry
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── package.json
│
├── backend-ai/                # FastAPI AI service
│   ├── src/
│   │   ├── main.py           # FastAPI app
│   │   ├── summarizer.py     # PDF summarization
│   │   ├── transcriber.py    # Audio transcription
│   │   ├── chat.py           # Document chat (RAG)
│   │   └── report.py         # Report generation
│   ├── requirements.txt      # Python dependencies
│   └── README.md
│
├── docker-compose.yml         # Infrastructure services
├── README.md                  # Main documentation
├── SETUP.md                   # Setup instructions
└── .gitignore
```

## Key Technologies

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **ShadCN/UI** - Component library
- **Zustand** - State management
- **React Dropzone** - File uploads

### Backend (Node.js)
- **Express** - Web framework
- **Prisma** - ORM for PostgreSQL
- **JWT** - Authentication
- **MinIO** - S3-compatible storage
- **Multer** - File upload handling

### Backend (Python)
- **FastAPI** - Async web framework
- **OpenAI** - GPT-4o-mini for text generation
- **Whisper** - Speech-to-text
- **PyMuPDF** - PDF text extraction
- **Sentence Transformers** - Embeddings
- **ChromaDB** - Vector database

### Infrastructure
- **PostgreSQL** - Relational database
- **MinIO** - Object storage
- **Docker** - Containerization

## Data Flow

1. **User uploads file** → Frontend → Node.js API → MinIO storage
2. **Node.js API** → Creates document record → Triggers AI processing
3. **AI Service** → Processes file → Updates document via Node.js API
4. **Frontend** → Polls for updates → Displays results

## Features Implemented

✅ User authentication (JWT)
✅ PDF upload and summarization
✅ Audio/video transcription
✅ Document chat with RAG
✅ Report generation
✅ Document management
✅ Real-time status updates

