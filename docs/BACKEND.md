# Backend Documentation (Node.js/Express)

## Overview

The JobPrepAI backend is a **Node.js** server built with **Express**. It serves
as a bridge between the mobile application and several services, including
Appwrite (database/auth), Gemini AI (LLM & STT), and our administrative
dashboard.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database/Auth**: Appwrite (via `node-appwrite` SDK)
- **AI/LLM**: Google Generative AI (Gemini Flash/API)
- **File Handling**: Multer (In-memory storage)
- **Logging**: Custom emoji-based logger (`server/utils/logger.js`)
- **API Documentation**: Swagger/OpenAPI

## Architecture

The server follows a standard MVC-ish pattern:

- **Routes**: Define API endpoints and apply middleware.
- **Controllers**: Handle business logic, interact with models, and communicate
  with external APIs (Gemini).
- **Models**: Abstraction layer for Appwrite collections and documents.
- **Middleware**: Authentication checks and request parsing.

## Key Modules

### 1. Chat & AI Assist (SofIA)

- **Endpoints**: `/api/chat/message`, `/api/chat/audio`, `/api/chat/stt`.
- **Logic**: Manages sessions in Appwrite, tracks interactions, and interacts
  with Gemini.
- **Audio**: Uses `multer.memoryStorage()` to process audio buffers directly
  without saving to disk.

### 2. Wallet & Economy

- **Endpoints**: `/api/wallet/balance`, `/api/wallet/earn`, `/api/wallet/spend`.
- **Logic**: Deducts credits based on service costs defined in the `services`
  collection.

### 3. Admin Panel

- **Endpoints**: `/api/admin/*`.
- **Features**: Dashboard stats, paginated user management, service
  pricing/interaction controls, and user status toggles.
- **UI**: A professional, modern dashboard located at
  `server/public/admin.html`.

## Setup & Configuration

1. **Environment Variables**:
   ```
   PORT=3030
   APPWRITE_ENDPOINT=...
   APPWRITE_PROJECT_ID=...
   APPWRITE_API_KEY=...
   GEMINI_API_KEY=...
   ```
2. **Installation**:
   ```bash
   cd server
   npm install
   ```
3. **Execution**:
   ```bash
   node index.js
   # or with nodemon
   npm start
   ```

## Database Schema (Appwrite)

- **`chat_sessions`**: Stores session state, interaction counts, and user
  mapping.
- **`chat_messages`**: Stores individual message history.
- **`services`**: Configures costs and limits for various AI tools.
- **`wallets`**: Tracks user balances and global platform stats.

## Deployment (Production)

We use **Docker** for containerized deployment, optimized for **Dokploy**.

### 1. Domain Configuration

- Main API: `backend.app.jobsprepai.com`
- Dokploy should be configured to point this domain to the internal port `3030`.

### 2. Deployment Steps

1. Push the code to the `chatbot` branch.
2. In Dokploy, create a new **Compose** application pointing to the `server/`
   directory.
3. Add the following Environment Variables in the Dokploy dashboard:
   - `NODE_ENV=production`
   - `PORT=3030`
   - `APPWRITE_ENDPOINT`
   - `APPWRITE_PROJECT_ID`
   - `APPWRITE_API_KEY`
   - `GEMINI_API_KEY`
4. Deploy.

### 3. Docker Maintenance

- Review logs via `docker logs jobsprepai-backend`.
- Restart service: `docker-compose restart`.
