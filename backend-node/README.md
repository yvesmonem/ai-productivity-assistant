# Node.js Backend

Express API server handling:
- Authentication (JWT)
- Document management
- File uploads to MinIO
- Database operations (Prisma)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables in `.env`

3. Set up database:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Run development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Documents
- `POST /api/documents/upload` - Upload document (multipart/form-data)
- `GET /api/documents` - List user documents
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/update` - Update document (called by AI service)

### Chat
- `POST /api/chat` - Save chat message
- `GET /api/chat` - Get chat history
- `POST /api/chat/send` - Send message to AI

### Reports
- `POST /api/reports` - Generate report
- `GET /api/reports` - List user reports
- `GET /api/reports/:id` - Get report details

## Database Schema

See `prisma/schema.prisma` for full schema.

Main models:
- `User` - User accounts
- `Document` - Uploaded documents
- `Chat` - Chat messages
- `Report` - Generated reports

