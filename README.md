# AI-Powered Suggestion Engine

A community issue reporting and AI-driven action recommendation system.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- OpenAI API Key

### Setup

1. Clone the repository
```bash
git clone <your-repo-url>
cd ai-suggestion-engine
```

2. Set up environment variables
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

3. Start with Docker
```bash
docker-compose up -d
```

4. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

### Local Development

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## License

MIT