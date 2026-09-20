# Behavioral Impact Tracking System

A full-stack application for recording meaningful behaviors, measuring their impact, and reviewing personal activity over time.

## Problem Statement

People often perform useful daily actions without recording them consistently, making it difficult to identify progress, patterns, and the impact of their habits. The project provides one authenticated workspace where users can record behaviors, add evidence, and review impact scores.

## Proposed Solution

The application combines a React dashboard with an Express API and MongoDB persistence. Users can register or sign in with Google, create behavior records, attach evidence, edit or delete their own records, and use an AI-assisted writing tool to turn a rough note into a structured behavior entry.

## Technology Stack

- Frontend: React 19, Vite, CSS
- Backend: Node.js, Express 5
- Database: MongoDB with Mongoose
- Authentication: JWT, bcryptjs, Google Identity Services
- File handling: Multer with authenticated downloads
- AI integration: Gemini API with a deterministic offline fallback
- Testing and quality: Jest and Oxlint
- Deployment configuration: Netlify, Render, and Docker

## Architecture Overview

The React client communicates with the Express server through JSON and multipart HTTP requests. Protected routes require a JWT bearer token. The server validates ownership before returning or mutating user records, stores behavior data in MongoDB, and stores uploaded evidence in the `uploads/` directory. In production, the server can serve the built Vite client, while the repository also includes separate Netlify and Render configurations.

The AI flow is deliberately server-side: the client sends a draft to `POST /api/ai/suggest`, the authenticated API uses Gemini when `GEMINI_API_KEY` is configured, and otherwise returns a local keyword-aware suggestion. API keys are never exposed to the browser.

## Key Features

- Username/password registration and login
- Google sign-in with verified ID tokens
- JWT-protected API routes and ownership checks
- Create, view, edit, and delete behavior records
- Impact score tracking from 0 to 10 with dashboard statistics
- Evidence uploads for PDF, PNG, JPG, and TXT files up to 5 MB
- Authenticated evidence downloads
- AI-assisted behavior autocomplete with Gemini and an offline fallback
- Responsive dashboard with logout and expired-session handling
- Bruno API collection for public and protected endpoints

## Live Deployment

- Frontend: https://teal-brioche-89a8df.netlify.app
- Backend configured in the frontend: https://behavioral-impact-api.onrender.com

The Netlify frontend is publicly reachable. The Render URL is the configured backend deployment target and should be checked in Render before final submission; the API root is expected to return `Behavioral Impact Tracking System API is running`.

## Installation

Requirements: Node.js 18 or newer, npm, and a MongoDB connection string.

```powershell
git clone https://github.com/kalviumcommunity/S92_Shanmugapriya_Capstone_BehavioralImpactTrackingSystem.git
cd S92_Shanmugapriya_Capstone_BehavioralImpactTrackingSystem
npm install
cd client
npm install
cd ..
```

## Environment Setup

Copy `.env.example` to `.env` in the repository root and set the required values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
```

Copy `client/.env.example` to `client/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
VITE_API_URL=
```

`GEMINI_API_KEY` is optional. Without it, the AI assistant uses the offline fallback. Never commit `.env` or real credentials.

## Running Locally

Start the API in one terminal:

```powershell
npm run server
```

Start the Vite client in another terminal:

```powershell
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` requests to the server on port 5000.

## Docker

```powershell
docker build -t behavioral-impact-tracker .
docker run --name behavioral-impact-tracker --env-file .env -p 5000:5000 -v behavioral-impact-uploads:/app/uploads behavioral-impact-tracker
```

Open http://localhost:5000 after the container starts.

## API Reference

- `GET /` - backend health response
- `GET /api` - API information and endpoint list
- `POST /api/auth/register` - create an account
- `POST /api/auth/login` - receive a JWT
- `POST /api/auth/google` - verify a Google ID token
- `GET /api/auth/me` - get the authenticated user
- `POST /api/ai/suggest` - generate a behavior suggestion
- `GET /api/behaviors` - list accessible behavior records
- `POST /api/behaviors` - create a record, optionally with `attachment`
- `GET /api/behaviors/:id` - get one record
- `PUT /api/behaviors/:id` - update a record
- `DELETE /api/behaviors/:id` - delete a record
- `GET /api/behaviors/:id/attachment` - download authenticated evidence

## Folder Structure

```text
server.js                 Express API, authentication, and deployment serving
models/                   Mongoose schemas for users, behaviors, and logs
utils/                    Authentication helpers
client/src/               React application and dashboard components
tests/                    Jest tests
bruno/                    API collection and local environment
render.yaml               Render backend configuration
netlify.toml              Netlify frontend configuration
Dockerfile                Full-stack production image
```

## Validation

```powershell
npm test
npm --prefix client run build
npm --prefix client run lint
node --check server.js
```

The final AI integration was validated with 6 passing Jest tests, a successful Vite production build, clean Oxlint output, and a passing backend syntax check.

## Technical Decisions and Challenges

- JWT middleware centralizes authentication and keeps protected routes consistent.
- Ownership checks prevent normal users from reading or changing another user's records.
- Multer handles evidence uploads while metadata remains associated with the behavior document.
- The AI endpoint keeps the provider key on the server and includes an offline fallback for local demos and provider outages.
- Separate Netlify and Render configuration supports independent frontend and backend deployment, while Docker supports a single production image.

The main challenges were coordinating authentication across the React and Express layers, protecting uploaded evidence, and adding useful AI behavior without making the application depend on a paid provider. These were addressed with shared API request handling, route-level authorization, and the fallback suggestion path.

## Future Improvements

- Move uploaded evidence to durable object storage for production deployments.
- Add richer behavior analytics and time-series visualizations.
- Add broader API and component test coverage.
- Add rate limiting and usage monitoring for the AI endpoint.

## Supporting Documentation

The `bruno/` directory contains runnable requests for health, authentication, users, behaviors, and attachments. Run the login request first so Bruno stores the JWT token for protected requests.

## Final Submission

The final documentation branch is `feature/final-project-submission`, targeting `main`. The walkthrough video must be recorded separately and shared with a public Google Drive link.

## Contributor

A. Shanmuga Priya, B.Tech in Artificial Intelligence and Machine Learning, AMET University.
