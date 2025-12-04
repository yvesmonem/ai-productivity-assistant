from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from src.summarizer import summarize_pdf
from src.transcriber import transcribe_audio
from src.chat import chat_with_document, initialize_chat
from src.report import generate_report

load_dotenv()

app = FastAPI(title="Neo AI Workspace API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class SummarizePDFRequest(BaseModel):
    documentId: str
    fileUrl: str
    fileKey: str

class TranscribeRequest(BaseModel):
    documentId: str
    fileUrl: str
    fileKey: str
    mimeType: str

class ChatRequest(BaseModel):
    documentId: str | None = None
    message: str
    userId: str

class GenerateReportRequest(BaseModel):
    topic: str

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/ai/summarize-pdf")
async def api_summarize_pdf(request: SummarizePDFRequest):
    try:
        result = await summarize_pdf(
            document_id=request.documentId,
            file_url=request.fileUrl,
            file_key=request.fileKey
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/transcribe")
async def api_transcribe(request: TranscribeRequest):
    try:
        result = await transcribe_audio(
            document_id=request.documentId,
            file_url=request.fileUrl,
            file_key=request.fileKey,
            mime_type=request.mimeType
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/chat")
async def api_chat(request: ChatRequest):
    try:
        result = await chat_with_document(
            document_id=request.documentId,
            message=request.message,
            user_id=request.userId
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/generate-report")
async def api_generate_report(request: GenerateReportRequest):
    try:
        result = await generate_report(request.topic)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

