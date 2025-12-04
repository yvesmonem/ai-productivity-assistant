# Setup Guide

## Quick Start

### 1. Infrastructure Setup

Start PostgreSQL and MinIO using Docker:

```bash
docker-compose up -d
```

Verify services are running:
- PostgreSQL: `docker ps | grep postgres`
- MinIO: `docker ps | grep minio`

Access MinIO Console: http://localhost:9001
- Username: `minioadmin`
- Password: `minioadmin`

### 2. Backend Setup

#### Node.js Backend

```bash
cd backend-node
npm install
cp .env.example .env  # Edit with your values
npx prisma migrate dev
npx prisma generate
npm run dev
```

#### Python AI Backend

```bash
cd backend-ai
pip install -r requirements.txt
# Create .env file with OPENAI_API_KEY
uvicorn src.main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
# Create .env.local with API URLs
npm run dev
```

## Environment Variables

### Required Variables

**backend-node/.env:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `MINIO_*` - MinIO configuration
- `FASTAPI_URL` - AI backend URL

**backend-ai/.env:**
- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `MINIO_*` - MinIO configuration
- `NODE_API_URL` - Node backend URL

**frontend/.env.local:**
- `NEXT_PUBLIC_API_URL` - Node backend URL
- `NEXT_PUBLIC_AI_API_URL` - AI backend URL

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `docker ps`
- Check DATABASE_URL format: `postgresql://user:password@host:port/database`

### MinIO Connection Issues
- Verify MinIO is accessible: http://localhost:9000
- Check bucket exists: http://localhost:9001
- Ensure MINIO_ENDPOINT doesn't include protocol (http://)

### OpenAI API Issues
- Verify API key is set correctly
- Check API key has sufficient credits
- Ensure model access (gpt-4o-mini)

### Port Conflicts
- Frontend: 3000
- Node Backend: 3001
- AI Backend: 8000
- PostgreSQL: 5432
- MinIO: 9000, 9001

Change ports in respective `.env` files if needed.

