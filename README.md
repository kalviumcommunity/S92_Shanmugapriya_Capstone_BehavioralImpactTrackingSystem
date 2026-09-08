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
- Evidence file uploads for behavior records with authenticated downloads
- Bruno API collection covering all public and protected endpoints

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

## Deploy Backend on Render

The repository includes `render.yaml` for a Node web service. In Render, choose **New > Blueprint**, connect this GitHub repository, and select the `main` branch. Render will use `npm install` to build, `npm start` to run, and `/` as the health check.

Add these values when Render asks for Blueprint secrets:

- `MONGO_URI`: the MongoDB Atlas connection string
- `JWT_SECRET`: a long random secret, or keep Render's generated value
- `GOOGLE_CLIENT_ID`: the Google OAuth web client ID if Google login is enabled

After deployment, verify `https://your-service.onrender.com/` returns `Behavioral Impact Tracking System API is running`. Add the Render URL to Google OAuth authorized origins if Google sign-in is used. Render's free service filesystem is ephemeral, so uploaded evidence files should eventually move to object storage such as Cloudinary or S3 for durable production storage.

## Deploy Frontend on Netlify

1. Push this repository to GitHub and choose **Add new project > Import an existing project** in Netlify.
2. Select the repository. Netlify reads [`netlify.toml`](netlify.toml), which sets the client directory as the build base, runs `npm run build`, and publishes `dist`.
3. In Netlify project settings, add these environment variables:

```env
VITE_API_URL=https://your-service.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

Replace the API URL with the deployed Render backend URL without a trailing slash. Trigger a deploy and verify the Netlify URL loads the login screen. The SPA redirect in `netlify.toml` keeps direct routes working after refresh.

Add the deployed frontend URL to the authorized JavaScript origins for the Google OAuth web client. Record the final public URL here for the deployment submission:

`https://teal-brioche-89a8df.netlify.app`

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
- `POST /api/behaviors` accepts multipart field `attachment` (PDF, PNG, JPG, or TXT; max 5 MB)
- `GET /api/behaviors/:id/attachment` - securely download a record attachment
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

## Bruno API Collection

The `bruno/` folder is a runnable Bruno collection. Import that folder into Bruno and select the `local` environment. Run `Auth / Login` first so the collection stores the JWT token automatically, then run the behavior and attachment requests. The collection includes health, API info, password auth, Google auth, user management, behavior CRUD, and file upload/download requests.

## Pull Request

Authentication implementation branch:

`feature/username-password-authentication`

## Author

A. Shanmuga Priya
B.Tech - Artificial Intelligence and Machine Learning, AMET University
