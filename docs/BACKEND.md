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

### 2. CV & Resume Analysis

- **Endpoints**: `/api/cv/analyze`, `/api/cv/reports`.
- **Logic**: Analyzes Job Descriptions vs Resumes using Gemini's multimodal
  capabilities (supports text and PDF).
- **Features**: Basic and Advanced reports, credit-integrated, history-logged.

### 3. Wallet & Economy

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
- **`cv_reports`**: Stores job compatibility analysis results.
- **`services`**: Configures costs and limits for various AI tools.
- **`wallets`**: Tracks user balances and global platform stats.

## Deployment (Production)

We use **Docker** for containerized deployment, optimized for **Dokploy**.

### 1. Prerequisites

- A Dokploy instance running.
- A GitHub repository with your `chatbot` branch pushed.
- A domain pointed to your server (e.g., `backend.app.jobsprepai.com`).

### 2. Deployment Step-by-Step

#### Step 1: Create a New Application

1. In the Dokploy Dashboard, go to **Projects** and select or create a project.
2. Click **Create Application** -> **Compose**.
3. Name it `jobsprepai-backend`.

#### Step 2: Configure Source

1. Select **GitHub** as the source.
2. Choose your repository and the `chatbot` branch.
3. Set the **Base Directory** to `server` (since our Dockerfile and compose are
   in the `server/` folder).

#### Step 3: Set Environment Variables

Go to the **Environment** tab and add the following keys:

- `NODE_ENV`: `production`
- `PORT`: `3030`
- `APPWRITE_ENDPOINT`: (Your Appwrite URL)
- `APPWRITE_PROJECT_ID`: (Your Project ID)
- `APPWRITE_API_KEY`: (Your Server API Key)
- `GEMINI_API_KEY`: (Your Google AI Key)

#### Step 4: Configure Domain

1. Go to the **Domains** tab in your application.
2. Click **Add Domain**.
3. Enter `backend.app.jobsprepai.com`.
4. Set the **Container Port** to `3030`.
5. Enable **HTTPS** (Let's Encrypt).

#### Step 5: Deploy

1. Go to the **Deploy** tab.
2. Click **Deploy**. Dokploy will pull the code, build the image using the
   `Dockerfile`, and start the container.

### 3. Verification & Logs

- Check logs in the **Logs** tab to ensure the server connected to Gemini and
  Appwrite.
- Access `https://backend.app.jobsprepai.com/api-docs` to verify Swagger is
  running.
