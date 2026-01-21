# Backend Architecture & Developer Guide

## Overview

This backend is a Node.js/Express application that serves as the API layer for
the OTA-EXPO React Native app. It handles user authentication (via Appwrite),
wallet economy logic, and data storage.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Appwrite (via `node-appwrite` SDK)
- **Documentation**: Swagger/OpenAPI (`swagger-jsdoc`, `swagger-ui-express`)
- **Logging**: Custom `utils/logger.js` (Console + JSON structure)

## API Structure

The API is versioned (implied /api prefix) and divided into logical resources:

- `/api/profile/*` - User profile management (Resume data, skills, etc.)
- `/api/wallet/*` - Virtual economy (Balance, credits, transactions)

## Key Components

### 1. Models (`server/models/`)

Models encapsulate Appwrite database interactions. They are responsible for:

- Checking/Creating Collections (Schema enforcement at runtime).
- CRUD operations.

**Core Models:**

- **`ProfileModel`**: User CV data.
- **`WalletModel`**: User balance (`userId`, `balance`).
- **`TransactionModel`**: Ledger of all credit movements (`EARN`/`SPEND`).
- **`ServiceModel`**: Dynamic pricing configuration (`slug`, `cost`).

### 2. Controllers (`server/controllers/`)

Controllers handle business logic, input validation, and connect Models to
Routes.

- **`walletController.js`**:
  - Enforces pricing rules (checks `ServiceModel`).
  - Validates Ad Tokens.
  - Logs transactions using `TransactionModel`.

### 3. Middleware (`server/middleware.js`)

- **`requireAuth(client)`**: Verifies Appwrite session/tokens. Expects `userId`
  in `req.user` or fallback to `req.query`/`req.body` (legacy/dev support).

### 4. Services (Dynamic Pricing)

Prices are NOT hardcoded. They are fetched from the `services` collection in
Appwrite.

- **Service Slugs**:
  - `BASIC_REPORT`: Cost 1
  - `ADVANCED_REPORT`: Cost 2
  - `OPTIMIZED_GENERATION`: Cost 20
  - `AI_IMPROVEMENT`: Cost 1

## Development Workflow

1. **Start Server**: `node index.js`
   - **Auto-Setup**: On start, the server attempts to connect to Appwrite and
     ensure all Collections and Attributes exist (`.setupDatabase()`).
2. **Swagger Docs**: Visit `http://localhost:3030/api-docs` to interact with the
   API.

## Logging

We use a centralized logger in `server/utils/logger.js`.

- Use `logger.info()` for operational events (transactions, setup).
- Use `logger.error()` for exceptions.
- Use `logger.warn()` for business logic failures (insufficient funds, invalid
  tokens).

## Recent Changes (Jan 2026)

- **Dynamic Pricing**: Moved report costs from hardcoded values to
  `ServiceModel`.
- **Wallet Architecture**: Refactored to separate Wallet vs Transaction models.
- **Swagger Updates**: Added real examples to `/api/wallet` endpoints.
