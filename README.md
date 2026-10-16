# ChatFlow — AI-Powered Chat Application

ChatFlow is a full-stack AI chat application built to explore how a modern web application works end to end — from a React frontend to a Node.js API, database, and external AI service.

The project focuses on practical backend concepts such as authentication, REST API design, data persistence, request limits, and integration with the Google Gemini API.

> **Project status:** Personal learning project in active development. Deployment, automated tests, and additional production-readiness improvements are planned.

## Why I Built This

I built ChatFlow to strengthen my full-stack development skills while focusing on backend engineering fundamentals: designing APIs, protecting routes, managing conversation data, integrating an AI provider, and organizing code into maintainable modules.

## Features

- **AI chat:** Send messages and receive responses through the Google Gemini API.
- **Authentication:** Signup/login/logout flows using JWT-based authentication and HTTP-only cookies.
- **Password security:** Password hashing with bcrypt.
- **Conversation history:** Store chat and message data in MongoDB.
- **Recent chats:** Retrieve and reopen previous conversations.
- **Request and usage controls:** Use Redis for rate limiting and AI usage tracking.
- **Input validation:** Validate incoming data with Zod.
- **Frontend state management:** Use Zustand for shared user and chat state.
- **API integration:** Use Axios to communicate with the backend while sending credentials where required.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, Axios, React Router, Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| In-memory data store | Redis |
| AI integration | Google Gemini API, `@google/genai` |
| Authentication | JWT, HTTP-only cookies, bcrypt |
| Validation | Zod |
| Tools | Git, GitHub, npm |

## Application Architecture

```text
User
 |
 v
React + Vite Frontend
 |
 | HTTP requests (Axios)
 v
Express.js API
 |
 +--> Authentication and validation middleware
 |
 +--> Controllers and services
 |       |
 |       +--> Google Gemini API
 |
 +--> MongoDB (users, chats, messages)
 |
 +--> Redis (rate limits, usage counters, token blocklist)
```

## Project Structure

```text
ChatFlow/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── model/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── index.js
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── store/
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Run the Project Locally

### Prerequisites

Install Node.js and npm. You will also need access to MongoDB, Redis, and a Google Gemini API key.

### 1. Configure the backend

Create a `.env` file inside the `backend/` directory. Use the exact variable names required by your backend code.

Example template (adjust names to match your implementation):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
REDIS_URL=your_redis_connection_url
TOKEN_LIMIT=your_configured_token_limit
```

Never commit real secrets or `.env` files to GitHub.

### 2. Install and start the backend

In a terminal:

```bash
cd backend
npm install
npm run
```

`npm run` lists the scripts configured in `backend/package.json`. Start the server using the available script, for example:

```bash
npm run dev
```

Use the actual script defined in your `package.json` if it differs. Make sure MongoDB and Redis are running and the environment variables are configured.

### 3. Install and start the frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, commonly `http://localhost:5173`.

Ensure the frontend API base URL points to the backend server. The backend CORS configuration must allow the frontend origin and credentials when cookie-based authentication is used.

## API Overview

The backend includes authentication, user, chat, and message routes. The following paths are referenced by the current frontend integration; check `backend/routes/` for the exact methods, payloads, and current route definitions.

| Endpoint | Purpose |
|---|---|
| `GET /user/profile` | Load the authenticated user's profile |
| `GET /user/usage` | Load AI usage information |
| `GET /chat/getRecentChat` | Load recent conversations |
| `/msg` | Send a message / start a conversation |
| `/msg/:chatId` | Send a message in an existing conversation |

Authentication routes are also implemented. Refer to the backend route files for the exact signup, login, logout, and account-management endpoints.

## Backend Concepts Practiced

This project has helped me practice and connect several backend concepts:

- **REST APIs and middleware:** Organizing request handling and separating responsibilities across routes, controllers, services, and middleware.
- **Authentication:** Using JWTs with HTTP-only cookies and password hashing.
- **Data modeling:** Persisting users, chats, and messages with MongoDB and Mongoose.
- **Request control:** Using Redis-backed counters and expiry windows for rate limiting and usage tracking.
- **Validation:** Checking incoming request data with Zod.
- **External API integration:** Calling the Gemini API through a backend service.
- **Frontend/backend integration:** Handling authenticated API requests and shared UI state.

## Current Focus / Roadmap

- [ ] Verify setup instructions and environment variable names against the codebase.
- [ ] Add automated backend API tests.
- [ ] Add GitHub Actions for checks and builds.
- [ ] Dockerize the backend and frontend.
- [ ] Deploy the application and document the live demo.
- [ ] Add screenshots and a short architecture walkthrough.
- [ ] Improve production logging, error handling, and monitoring.

## What I'm Learning

My goal with ChatFlow is not only to make the features work, but also to understand the decisions behind them: how requests flow through a backend, how authentication is enforced, how application data is stored, and how to prepare a project for deployment.

## Author

**Gaurav Zore**

- GitHub: [@Zoregaurav](https://github.com/Zoregaurav)

---

If you explore the repository, feedback on the backend structure, API design, or deployment approach is welcome.
