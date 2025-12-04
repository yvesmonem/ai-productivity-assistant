# AI Backend (FastAPI)

This service handles all AI processing:
- PDF summarization
- Audio/video transcription
- Document chat (RAG)
- Report generation

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables in `.env`:
```env
OPENAI_API_KEY=your-key-here
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=documents
NODE_API_URL=http://localhost:3001
```

3. Run the server:
```bash
uvicorn src.main:app --reload
```

## API Endpoints

- `POST /ai/summarize-pdf` - Summarize PDF document
- `POST /ai/transcribe` - Transcribe audio/video
- `POST /ai/chat` - Chat with document
- `POST /ai/generate-report` - Generate report from topic

## Models Used

- **OpenAI GPT-4o-mini** - Text generation, summarization
- **Whisper Base** - Speech-to-text (can upgrade to `large-v3` for better quality)
- **Sentence Transformers** - Document embeddings for RAG
- **ChromaDB** - Vector database for document search

## Notes

- Whisper model is loaded on first use (may take time)
- Embedding model is cached after first load
- ChromaDB data is persisted in `./chroma_db`

