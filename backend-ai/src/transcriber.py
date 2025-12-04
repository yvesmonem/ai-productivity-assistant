import whisper
import httpx
import os
from minio import Minio
from io import BytesIO
import tempfile

# Load Whisper model (cache it)
_model = None

def get_whisper_model():
    global _model
    if _model is None:
        print("Loading Whisper model...")
        _model = whisper.load_model("base")  # Use 'base' for faster processing, 'large-v3' for best quality
    return _model

# MinIO client
minio_client = Minio(
    os.getenv("MINIO_ENDPOINT", "localhost:9000"),
    access_key=os.getenv("MINIO_ACCESS_KEY", "minioadmin"),
    secret_key=os.getenv("MINIO_SECRET_KEY", "minioadmin"),
    secure=os.getenv("MINIO_USE_SSL", "false").lower() == "true"
)

BUCKET_NAME = os.getenv("MINIO_BUCKET", "documents")
NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:3001")


async def transcribe_audio(document_id: str, file_url: str, file_key: str, mime_type: str) -> dict:
    """Transcribe audio/video and extract insights"""
    try:
        # Get file from MinIO
        audio_data = None
        try:
            response = minio_client.get_object(BUCKET_NAME, file_key)
            audio_data = response.read()
            response.close()
            response.release_conn()
        except Exception as e:
            # Try fetching from URL if MinIO direct access fails
            async with httpx.AsyncClient() as client:
                url_response = await client.get(file_url)
                audio_data = url_response.content
        
        if not audio_data:
            raise Exception("No audio data retrieved")

        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
            tmp_file.write(audio_data)
            tmp_path = tmp_file.name

        try:
            # Transcribe with Whisper
            model = get_whisper_model()
            result = model.transcribe(tmp_path, language="en")
            transcript = result["text"]
        finally:
            # Clean up temp file
            os.unlink(tmp_path)

        # Generate insights using OpenAI
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        prompt = f"""Analyze this meeting transcript and provide:

1. A summary (2-3 paragraphs)
2. Key highlights (bullet list, 5-10 items)
3. Decisions made (bullet list)
4. Action items with owners if mentioned (bullet list)
5. A follow-up email draft (optional)

Transcript:
{transcript}

Format your response as JSON with these keys:
- summary: string
- highlights: array of strings
- decisions: array of strings
- actionItems: array of strings
- followUpEmail: string (optional)
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a meeting assistant that extracts key information from transcripts. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )

        result_text = response.choices[0].message.content
        
        # Parse JSON response
        import json
        try:
            insights = json.loads(result_text)
        except:
            insights = {
                "summary": result_text,
                "highlights": [],
                "decisions": [],
                "actionItems": [],
                "followUpEmail": ""
            }

        # Update document in database via Node API
        async with httpx.AsyncClient() as http_client:
            await http_client.post(
                f"{NODE_API_URL}/api/documents/{document_id}/update",
                json={
                    "transcript": transcript,
                    "highlights": insights.get("highlights", []),
                    "decisions": insights.get("decisions", []),
                    "actionItems": insights.get("actionItems", []),
                    "followUpEmail": insights.get("followUpEmail", ""),
                    "status": "COMPLETED"
                }
            )

        return {
            "documentId": document_id,
            "transcript": transcript,
            "summary": insights.get("summary", ""),
            "highlights": insights.get("highlights", []),
            "decisions": insights.get("decisions", []),
            "actionItems": insights.get("actionItems", []),
            "followUpEmail": insights.get("followUpEmail", ""),
            "status": "COMPLETED"
        }

    except Exception as e:
        # Update document status to FAILED
        try:
            async with httpx.AsyncClient() as http_client:
                await http_client.post(
                    f"{NODE_API_URL}/api/documents/{document_id}/update",
                    json={"status": "FAILED"}
                )
        except:
            pass
        
        raise Exception(f"Failed to transcribe audio: {str(e)}")

