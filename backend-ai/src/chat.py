import os
from openai import OpenAI
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import httpx

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize embedding model
_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        print("Loading embedding model...")
        _embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    return _embedding_model

# Initialize ChromaDB
chroma_client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",
    persist_directory="./chroma_db"
))

NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:3001")


async def initialize_chat(document_id: str):
    """Initialize chat by indexing document"""
    try:
        # Get document from Node API
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(
                f"{NODE_API_URL}/api/documents/{document_id}",
                headers={"Authorization": "Bearer dummy"}  # Will be handled by Node API
            )
            if response.status_code != 200:
                raise Exception("Document not found")
            
            document = response.json()
            
            # Get document text (for PDFs, use summary + key points)
            # For now, we'll use the summary. In production, extract full text.
            text = document.get("summary", "")
            
            if not text:
                raise Exception("No text available for indexing")
            
            # Split into chunks
            chunks = split_text_into_chunks(text, chunk_size=500, overlap=50)
            
            # Generate embeddings and store in ChromaDB
            model = get_embedding_model()
            embeddings = model.encode(chunks)
            
            collection = chroma_client.get_or_create_collection(
                name=f"doc_{document_id}"
            )
            
            # Store chunks
            collection.add(
                embeddings=[emb.tolist() for emb in embeddings],
                documents=chunks,
                ids=[f"{document_id}_chunk_{i}" for i in range(len(chunks))]
            )
            
            return {"status": "initialized"}
    except Exception as e:
        raise Exception(f"Failed to initialize chat: {str(e)}")


def split_text_into_chunks(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    """Split text into overlapping chunks"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    
    return chunks


async def chat_with_document(document_id: str | None, message: str, user_id: str) -> dict:
    """Chat with document using RAG"""
    try:
        if document_id:
            # Get relevant chunks from document
            model = get_embedding_model()
            query_embedding = model.encode([message])[0]
            
            collection = chroma_client.get_or_create_collection(
                name=f"doc_{document_id}"
            )
            
            results = collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=3
            )
            
            # Build context from retrieved chunks
            context = "\n\n".join(results["documents"][0] if results["documents"] else [])
            
            prompt = f"""You are a helpful assistant answering questions about a document.

Document context:
{context}

User question: {message}

Provide a clear, concise answer based on the document context. If the answer isn't in the context, say so."""
        else:
            # General chat without document
            prompt = f"""You are a helpful AI assistant. Answer the user's question.

User question: {message}"""

        # Generate response
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )

        answer = response.choices[0].message.content

        # Save chat to database via Node API
        try:
            async with httpx.AsyncClient() as http_client:
                await http_client.post(
                    f"{NODE_API_URL}/api/chat",
                    json={
                        "userId": user_id,
                        "documentId": document_id,
                        "message": message,
                        "response": answer
                    }
                )
        except:
            pass  # Don't fail if chat saving fails

        return {
            "response": answer,
            "documentId": document_id
        }

    except Exception as e:
        raise Exception(f"Failed to chat: {str(e)}")

