# Behavioral Impact Tracking System

Full-stack capstone application for recording behavior, measuring impact, and reviewing personal activity over time.

## Features

- Username and password registration and login
- Google third-party sign-in with verified Google ID tokens
- Password hashing with bcrypt
- JWT-based authentication for protected API routes
- MongoDB persistence for users and behavior records
- Create, view, edit, and delete behavior records
- Impact score tracking with dashboard statistics
- Ownership protection so users can only manage their own records
- Responsive React dashboard with logout and expired-session handling

## Tech Stack

- React and Vite
- Node.js and Express
- MongoDB and Mongoose
- JSON Web Tokens and bcryptjs

## Requirements

- Node.js 18 or newer
- MongoDB connection string

## Setup

Install backend dependencies from the project root:

```powershell
npm install
```

Install frontend dependencies:

```powershell
cd client
npm install
cd ..
```

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

Create `client/.env` from `client/.env.example` and add the same Google web client ID:

```env
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

In Google Cloud Console, create an OAuth 2.0 **Web application** client. Add `http://localhost:5173` to the authorized JavaScript origins, then use the client ID in both environment files. The frontend uses Google Identity Services and the backend verifies the returned ID token before issuing the app JWT.

## Run Locally

Open two terminals in the project root.

Terminal 1, start the API:

```powershell
npm run server
```

Terminal 2, start the React client:

```powershell
npm run dev
```

Open `http://localhost:5173` in a browser. The Vite development server proxies `/api` requests to the Express server on port `5000`.

## Authentication Flow

1. Select **Need an account? Create one** and register with a username and password.
2. Sign in with the same credentials.
3. Add behavior records and assign an impact score from 0 to 10.
4. Edit or delete records from the dashboard.
5. Use **Log out** to clear the local session.

To test Google authentication, select **Continue with Google** on the sign-in screen and choose a Google account. A Google-linked user is created automatically on first sign-in.

## API Endpoints

- `POST /api/auth/register` - create an account
- `POST /api/auth/login` - receive a JWT token
- `POST /api/auth/google` - verify a Google ID token and receive a JWT token
- `GET /api/auth/me` - verify the current token
- `GET /api/behaviors` - list the signed-in user's records
- `POST /api/behaviors` - create a record
- `PUT /api/behaviors/:id` - update a record
- `DELETE /api/behaviors/:id` - delete a record

## Validation

```powershell
cd client
npm run build
npm run lint
cd ..
node --check server.js
```

## Pull Request

Authentication implementation branch:

`feature/username-password-authentication`

## Author

A. Shanmuga Priya
B.Tech - Artificial Intelligence and Machine Learning, AMET University
