# ATSForge AI — Backend

Express REST API for **ATSForge AI**. Handles authentication, PDF processing, Google Gemini AI generation, and MongoDB persistence for all career tools on the platform.

---

## The Problem We Solve (STAR)

| | |
|---|---|
| **Situation** | Job applicants lose opportunities because ATS software silently filters resumes that lack the right keywords, structure, or role alignment. Preparing for each application manually — rewriting resumes, cover letters, and interview answers — is slow and fragmented. |
| **Task** | Build a secure backend that ingests resumes and job descriptions, runs structured AI analysis, stores user history, and exposes a consistent API for a full job-search workflow. |
| **Action** | This server provides JWT auth, PDF text extraction, Gemini-powered JSON responses (Zod schemas), rate limiting, and MongoDB models for analyses, interviews, applications, cover letters, and saved resumes — all under `/api/v1`. |
| **Result** | Clients receive reliable ATS scores, skill-gap reports, interview prep packs, mock interview feedback, and cover letters in structured JSON — persisted per user for history, dashboards, and application tracking. |

---

## How the Backend Works

```
Client (React)
     │  HTTPS + cookies / FormData
     ▼
Express (app.js)
     ├── Middleware: helmet, cors, rate limit, sanitize, cookie-parser
     ├── Auth: JWT in HTTP-only cookie → auth.middleware
     ├── Uploads: multer (PDF 3 MB · avatar 2 MB)
     └── Routes /api/v1/*
              ├── Controller (validation, business logic)
              ├── ai.service.js → Google Gemini (structured JSON)
              ├── parsePdf.js → pdf-parse v2
              └── Mongoose models → MongoDB
```

1. **Request** — JSON body for most routes; `multipart/form-data` for resume PDF and avatar uploads.
2. **Auth** — `POST /auth/login` sets a JWT cookie. Protected routes verify token and check a blacklist on logout.
3. **AI pipeline** — Controllers build a prompt, call `generateJson()` with a Zod schema, Gemini returns typed JSON, result is saved to MongoDB and returned to the client.
4. **PDF** — Resume files are parsed in-memory via `pdf-parse` (`PDFParse({ data: buffer })`); text is sent to Gemini (raw PDF is not stored).
5. **Static files** — Uploaded avatars served from `/uploads/avatars/`.

---

## API Overview

Base URL: `http://localhost:3000/api/v1`

| Module | Prefix | Key endpoints |
|--------|--------|----------------|
| **Health** | `/health` | `GET` — service status |
| **Auth** | `/auth` | register, login, logout, get-me, google, profile, password, avatar |
| **Resume** | `/resume` | `POST /analyze`, history CRUD |
| **Skill Gap** | `/skill-gap` | `POST /`, history CRUD |
| **Interview** | `/interview` | `POST /`, history CRUD |
| **Mock Interview** | `/mock-interview` | `POST /start`, `POST /:id/submit`, history |
| **Cover Letter** | `/cover-letter` | `POST /`, history CRUD |
| **Resume Builder** | `/resume-builder` | list, save, `POST /generate`, delete |
| **Applications** | `/applications` | CRUD + status, dates, job description |
| **Dashboard** | `/dashboard` | `GET /stats` — aggregated counts & recent activity |

All AI routes require auth and use `aiLimiter` (12 req/min). Auth routes use `authLimiter` (40 req/15 min).

---

## Features (Server-Side)

### Authentication & users
- Email/password (bcrypt) and Google OAuth
- JWT HTTP-only cookies, token blacklist on logout
- Profile update, password change, avatar upload/remove
- User plans: `free` | `pro`

### AI tools (Google Gemini)
- **Resume analysis** — ATS score, keywords, formatting, section feedback
- **Skill gap** — fit score, missing skills, weekly learning plan
- **Interview report** — match score, technical/behavioral Q&A, prep plan
- **Mock interview** — generate questions, score answers with feedback
- **Cover letter** — role-tailored letter with highlights
- **Resume builder** — STAR-method bullets, summary, skills, projects

### Data & workflow
- Per-user history for every AI feature
- Job application tracker (status pipeline, follow-up dates, JD storage)
- Dashboard stats aggregation
- Saved resume drafts

### Security & reliability
- Helmet, CORS (localhost + Vercel), Mongo sanitize
- Global + auth + AI rate limits
- File type/size validation (PDF, images)
- Structured AI output via Zod + JSON schema

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB + Mongoose |
| AI | Google Gemini (`@google/genai`) |
| Auth | JWT, bcrypt, Google OAuth |
| Upload | Multer (memory + disk for avatars) |
| PDF | pdf-parse v2 |
| Validation | Zod + zod-to-json-schema |

---

## Project Structure

```
src/
├── app.js                  # Express app, middleware, routes
├── config/
│   ├── database.js
│   └── googleOAuth.js
├── controller/             # Route handlers
├── middlewares/
│   ├── auth.middleware.js
│   ├── rateLimit.middleware.js
│   ├── file.middleware.js
│   ├── avatar.middleware.js
│   └── sanitize.middleware.js
├── models/                 # Mongoose schemas
├── routes/                 # Express routers
├── services/
│   ├── ai.service.js       # Gemini prompts + schemas
│   └── googleAuth.service.js
└── utils/
    ├── parsePdf.js
    ├── generateToken.js
    └── cookieOptions.js
server.js                   # Entry point
uploads/avatars/            # User avatar files (gitignored)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or Atlas URI
- Google Gemini API key
- Google OAuth client ID (for Google login)

### Setup

```bash
cd atsforge-ai-server
npm install
cp .env.example .env          # Windows: copy .env.example .env
```

### Run

```bash
npm run dev     # nodemon — http://localhost:3000
npm start       # production
```

Verify:

```bash
curl http://localhost:3000/api/v1/health
# {"ok":true,"service":"atsforge-ai-server"}
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default `3000`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `GOOGLE_GENAI_API_KEY` | Yes | Gemini API key for all AI features |
| `GEMINI_MODEL` | No | Model id (default `gemini-3-flash-preview`) |
| `GOOGLE_CLIENT_ID` | Yes* | Google OAuth client ID (*for Google login) |

---

## MongoDB Models

| Model | Purpose |
|-------|---------|
| `user` | Account, plan, avatar, auth provider |
| `ResumeAnalysis` | ATS analysis history |
| `SkillGapReport` | Skill gap reports |
| `interviewReport` | Interview prep reports |
| `MockInterview` | Mock sessions + feedback |
| `CoverLetter` | Generated cover letters |
| `SavedResume` | Resume builder drafts |
| `Application` | Job application tracker |
| `blacklist` | Invalidated JWT tokens |

---

## Related

- **Frontend client** — [`../atsforge-ai-client/README.md`](../atsforge-ai-client/README.md)
