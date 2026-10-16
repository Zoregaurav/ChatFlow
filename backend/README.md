# ChatFlow — GPT Backend

A backend service for an AI conversational assistant built with **Node.js, Express.js, MongoDB, Redis, and Google Gemini API**.

ChatFlow handles user authentication, chat and message persistence, AI conversations, Redis-based rate limiting and token tracking, JWT token revocation, and AI usage limits.

---

## 🚀 Features

- 🔐 JWT-based authentication
- 🍪 HTTP-only cookie authentication
- 🔑 Password hashing with bcrypt
- 🤖 Google Gemini API integration
- 💬 Persistent chat and message history
- 🗄️ MongoDB with Mongoose
- ⚡ Redis-based rate limiting
- 🚫 JWT token revocation on logout
- 📊 AI token usage tracking
- ⏱️ Per-user request limits
- 🧮 AI token-limit enforcement
- 📝 Incremental conversation summaries
- ✅ Request validation using Zod
- 🛡️ Authentication and authorization middleware

---

## 🏗️ Tech Stack

### Backend
- Node.js
- Express.js
- JavaScript

### Database
- MongoDB
- Mongoose

### Caching & Request Control
- Redis

### Authentication & Security
- JWT
- HTTP-only Cookies
- bcrypt
- Zod

### AI
- Google Gemini API

### Development Tools
- Git
- GitHub
- Postman

---

## 📂 Project Structure

```text
backend/
│
├── controllers/
│   ├── auth.controller.js
│   ├── chat.controller.js
│   └── message.controller.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── rateLimiter.middleware.js
│   ├── tokenUsage.middleware.js
│   └── loadUser.middleware.js
│
├── models/
│   ├── User.js
│   ├── Chat.js
│   └── Message.js
│
├── routes/
│   ├── auth.routes.js
│   ├── chat.routes.js
│   └── message.routes.js
│
├── services/
│   ├── gemini.service.js
│   └── redis.service.js
│
├── validators/
│   └── auth.validator.js
│
├── utils/
│
├── app.js
├── server.js
├── package.json
└── .env
```

> Folder names may vary depending on the current implementation.

---

# 🔄 How It Works

The basic request flow looks like this:

```text
Client
  │
  ▼
Express Server
  │
  ├── Authentication
  │      │
  │      ▼
  │   JWT Verification
  │
  ├── Rate Limiting
  │      │
  │      ▼
  │   Redis
  │
  ├── Token Usage Check
  │      │
  │      ▼
  │   Redis
  │
  ▼
Chat Controller
  │
  ├── MongoDB
  │      ├── Chat
  │      └── Message
  │
  ▼
Gemini API
  │
  ▼
AI Response
  │
  ▼
MongoDB
```

The important idea is that the backend is not simply forwarding a request to an AI API.

It also manages:

- who can access the API
- how frequently a user can make requests
- how much AI usage a user has consumed
- conversation history
- authentication state
- logout/token revocation

---

# 🔐 Authentication

ChatFlow uses **JWT authentication with HTTP-only cookies**.

### Authentication Flow

```text
Register
   ↓
Password → bcrypt hash
   ↓
User stored in MongoDB
   ↓
Login
   ↓
JWT generated
   ↓
JWT stored in HTTP-only cookie
   ↓
Protected request
   ↓
JWT verification
   ↓
User authenticated
```

HTTP-only cookies help prevent client-side JavaScript from directly accessing the authentication token.

---

# 🚪 Logout & Token Revocation

Simply deleting the cookie on logout is not enough if a previously issued JWT is still valid.

ChatFlow uses Redis to maintain a temporary token blocklist.

```text
Logout
   ↓
JWT extracted
   ↓
Token added to Redis blocklist
   ↓
Expiration = remaining JWT lifetime
   ↓
Cookie cleared
```

Example Redis key:

```text
blocklist:<token>
```

The blocked token automatically expires from Redis when the original JWT would have expired.

---

# ⚡ Rate Limiting

ChatFlow uses Redis for per-user request rate limiting.

Each authenticated user gets a Redis key:

```text
rate-limit:user:<userId>
```

The request counter is incremented using Redis.

A short expiration window is applied to the counter.

If the user exceeds the configured request limit, the API responds with:

```text
429 Too Many Requests
```

The response also provides information about when the user can retry.

---

# 🧮 AI Token Usage Limiting

AI APIs have usage and token costs, so the backend tracks token consumption separately.

ChatFlow maintains token usage in Redis:

```text
token-usage:<userId>
```

The backend checks the user's current usage before allowing an AI request.

```text
Request
   ↓
Authentication
   ↓
Check token usage
   ↓
Within limit?
   ├── No → 429 Response
   │
   └── Yes
        ↓
      Gemini API
        ↓
      AI Response
        ↓
    Update usage
```

The token limit and reset duration are configurable through environment variables.

---

# 🤖 Gemini Integration

ChatFlow uses the **Google Gemini API** to generate AI responses.

The backend acts as the middle layer between the client and Gemini.

```text
Frontend
   ↓
Chat API
   ↓
Authentication
   ↓
Rate Limit
   ↓
Token Limit
   ↓
Gemini API
   ↓
AI Response
   ↓
MongoDB
```

This keeps the Gemini API credentials on the backend instead of exposing them to the frontend.

---

# 💬 Chat & Message Persistence

Conversations are stored in MongoDB.

The main data models are:

### User

Stores authentication and user-related information.

```text
User
 ├── name
 ├── email
 ├── password
 └── token usage information
```

### Chat

Represents a conversation.

```text
Chat
 ├── userId
 ├── title
 ├── summary
 └── timestamps
```

### Message

Stores individual messages.

```text
Message
 ├── chatId
 ├── userId
 ├── role
 ├── content
 └── createdAt
```

This allows conversations to be retrieved and continued later.

---

# 📝 Conversation Summarization

Long conversations can become expensive to send repeatedly to an AI model.

ChatFlow uses incremental summarization to manage conversation context.

After a defined number of messages, the backend can update the conversation summary.

Conceptually:

```text
Messages
   ↓
Conversation grows
   ↓
Every N messages
   ↓
Generate/update summary
   ↓
Store summary
   ↓
Use summary as part of future context
```

This reduces the need to repeatedly process the entire conversation history.

---

# 🗃️ MongoDB Indexes

Indexes are added for frequently accessed data.

### Chat

```text
{ userId: 1, updatedAt: -1 }
```

Useful for retrieving a user's chats ordered by recent activity.

### Message

```text
{ chatId: 1, createdAt: 1 }
```

Useful for retrieving messages belonging to a conversation in chronological order.

Another index is used for user-based message queries:

```text
{ userId: 1, createdAt: -1 }
```

---

# 🛡️ Request Validation

ChatFlow uses **Zod** to validate incoming request data.

Instead of trusting client input:

```text
Client Request
      ↓
Validation
      ↓
Valid?
 ┌────┴────┐
 No        Yes
 ↓          ↓
400       Controller
```

This helps keep invalid data away from business logic.

---

# 🌍 Environment Variables

Create a `.env` file in the backend directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

REDIS_URL=your_redis_url

TOKEN_LIMIT=10000
```

Never commit your `.env` file to GitHub.

Add it to `.gitignore`:

```gitignore
.env
node_modules/
```

---

# ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Zoregaurav/Thunder.git
```

### 2. Navigate to the backend

```bash
cd Thunder/backend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create:

```text
.env
```

and add the required variables.

### 5. Start the development server

```bash
npm run dev
```

The backend will start on the configured port.

Example:

```text
http://localhost:5000
```

---

# 🔌 API Overview

## Authentication

```http
POST /api/auth/register
```

Create a new user.

```http
POST /api/auth/login
```

Authenticate an existing user.

```http
POST /api/auth/logout
```

Logout and revoke the current JWT.

---

## Chat

```http
POST /api/chats
```

Create a new conversation.

```http
GET /api/chats
```

Retrieve the authenticated user's conversations.

```http
GET /api/chats/:chatId
```

Retrieve a specific conversation.

---

## Messages

```http
POST /api/chats/:chatId/messages
```

Send a message to an existing conversation and generate an AI response.

```http
GET /api/chats/:chatId/messages
```

Retrieve conversation messages.

> Exact routes may differ depending on the current implementation.

---

# 🧠 Backend Concepts Demonstrated

This project was built to understand practical backend concepts such as:

- REST API design
- Authentication
- Authorization
- JWT
- HTTP-only cookies
- Password hashing
- Middleware
- Redis
- Rate limiting
- Token usage management
- Database modeling
- MongoDB indexing
- API validation
- External API integration
- AI API integration
- Conversation persistence
- Context management
- Error handling
- Environment configuration

---

# 🔭 Future Improvements

Possible improvements for the project:

- [ ] TypeScript migration
- [ ] Swagger / OpenAPI documentation
- [ ] PostgreSQL support
- [ ] OAuth authentication
- [ ] Role-based access control
- [ ] Background jobs with BullMQ
- [ ] Docker / Docker Compose setup
- [ ] Automated testing
- [ ] Structured logging
- [ ] Better observability
- [ ] File/image upload support
- [ ] AI-powered search
- [ ] Streaming AI responses

---

# 🎯 Why I Built This

The goal of this project was to go beyond simply calling an AI API.

I wanted to understand what happens around an AI application at the backend level:

```text
Authentication
      +
Request Control
      +
Usage Management
      +
Database
      +
AI API
      +
Conversation Management
```

Building ChatFlow helped me practice how these components work together to form a real backend service.

---

## 👨‍💻 Author

**Gaurav**

GitHub:  
https://github.com/Zoregaurav
