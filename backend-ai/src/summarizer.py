import fitz  # PyMuPDF
import httpx
import os
from openai import OpenAI
from minio import Minio
from io import BytesIO

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# MinIO client
minio_client = Minio(
    os.getenv("MINIO_ENDPOINT", "localhost:9000"),
    access_key=os.getenv("MINIO_ACCESS_KEY", "minioadmin"),
    secret_key=os.getenv("MINIO_SECRET_KEY", "minioadmin"),
    secure=os.getenv("MINIO_USE_SSL", "false").lower() == "true"
)

BUCKET_NAME = os.getenv("MINIO_BUCKET", "documents")
NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:3001")


async def extract_text_from_pdf(file_key: str, file_url: str = None) -> str:
    """Extract text from PDF stored in MinIO"""
    try:
        # Get PDF from MinIO
        pdf_data = None
        try:
            response = minio_client.get_object(BUCKET_NAME, file_key)
            pdf_data = response.read()
            response.close()
            response.release_conn()
        except Exception as e:
            # Try fetching from URL if MinIO direct access fails
            if file_url:
                async with httpx.AsyncClient() as client:
                    url_response = await client.get(file_url)
                    pdf_data = url_response.content
            else:
                raise Exception(f"Failed to get PDF from MinIO: {str(e)}")
        
        if not pdf_data:
            raise Exception("No PDF data retrieved")

        # Extract text using PyMuPDF
        doc = fitz.open(stream=pdf_data, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()

        return text
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")


async def summarize_pdf(document_id: str, file_url: str, file_key: str) -> dict:
    """Summarize PDF and extract key information"""
    try:
        # Extract text
        text = await extract_text_from_pdf(file_key, file_url)
        
        if not text.strip():
            raise Exception("No text extracted from PDF")

        # Truncate if too long (GPT-4o-mini has context limits)
        max_chars = 100000  # Leave room for response
        if len(text) > max_chars:
            text = text[:max_chars] + "\n\n[Content truncated...]"

        # Generate summary using OpenAI
        prompt = f"""Analyze the following document and provide:

1. A comprehensive summary (2-3 paragraphs)
2. Key points (bullet list, 5-10 items)
3. Action items (if any, bullet list)
4. Glossary of important terms (term: definition format)

Document text:
{text}

Format your response as JSON with these keys:
- summary: string
- keyPoints: array of strings
- actionItems: array of strings
- glossary: object with term: definition pairs
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that analyzes documents and extracts key information. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )

        result_text = response.choices[0].message.content
        
        # Parse JSON response
        import json
        try:
            result = json.loads(result_text)
        except:
            # Fallback if JSON parsing fails
            result = {
                "summary": result_text,
                "keyPoints": [],
                "actionItems": [],
                "glossary": {}
            }

        # Update document in database via Node API
        async with httpx.AsyncClient() as http_client:
            await http_client.post(
                f"{NODE_API_URL}/api/documents/{document_id}/update",
                json={
                    "summary": result.get("summary", ""),
                    "keyPoints": result.get("keyPoints", []),
                    "actionItems": result.get("actionItems", []),
                    "glossary": result.get("glossary", {}),
                    "status": "COMPLETED"
                }
            )

        return {
            "documentId": document_id,
            "summary": result.get("summary", ""),
            "keyPoints": result.get("keyPoints", []),
            "actionItems": result.get("actionItems", []),
            "glossary": result.get("glossary", {}),
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
        
        raise Exception(f"Failed to summarize PDF: {str(e)}")

