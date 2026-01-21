# Project Context & Developer Guide

## Welcome

This document serves as the **Master Context** for AI Assistants and Developers
working on the **JobPrepAI** project. It outlines the architecture,
documentation structure, and standard workflows.

## Documentation Index

Please refer to these specific documents for detailed information:

- **[FRONTEND.md](./FRONTEND.md)**: React Native App architecture, navigation,
  components, and state management.
- **[BACKEND.md](./BACKEND.md)**: Node.js server, API structure, Appwrite
  integration, and database schema.
- **[WALLET.md](./WALLET.md)**: Deep dive into the Virtual Economy system
  (Credits, Ads, Transactions).
- **[swagger/api-docs](http://localhost:3030/api-docs)**: (Running local only)
  Interactive API reference.

## System Overview

**JobPrepAI** is a mobile platform helping users prepare for careers using AI.
It relies on a "Freemium + Ad-Supported" model where users earn credits to
access premium AI features.

### Architecture Map

```mermaid
graph TD
    Client[Mobile App (React Native)] -->|HTTP /api| Server[Node.js Backend]
    Client -->|SDK| Appwrite[Appwrite Cloud]
    Server -->|SDK| Appwrite
    Server -->|Logs| Logger[Console/File]
    
    subgraph Client Layer
      Auth[AuthContext]
      Wallet[WalletContext]
      UI[UI Kitten + Tailwind]
    end
    
    subgraph Server Layer
      API[Express Routes]
      Logic[Controllers]
      DB_Models[Appwrite Models]
    end
```

## Quick Start for AI Agents

1. **Understand the Task**: Determine if the request touches the **UI**
   (Frontend), **Business Logic** (Backend), or **Database** (Appwrite).
2. **Check Context**:
   - For **UI changes**: Read `FRONTEND.md` and check `src/components`.
   - For **API changes**: Read `BACKEND.md` and check `server/routes`.
   - For **Wallet/Pricing**: Read `WALLET.md`.
3. **Code Standards**:
   - **Frontend**: Use Functional Components, Hooks, and `tailwind-rn`. Avoid
     class components.
   - **Backend**: Use `async/await` in Controllers. Always use the `logger`
     utility.
   - **General**: clear variable names, comprehensive comments for complex
     logic.

## Common Workflows

- **Adding a New Service**:
  1. Add entry to `ServiceModel` (Backend) to define price.
  2. Implement backend logic/route if needed.
  3. Update `ReportPrices` interface in `walletService.ts` (Frontend).
  4. Use `useWallet().prices` to display cost in UI.

- **Debugging API**:
  1. Check Server Logs (Console).
  2. Check App Logs (Metro Bundler).
  3. Verify `EXPO_PUBLIC_API_BASE_URL` in `.env`.

## Current Status (Jan 2026)

- **stable**: Core Wallet, Auth, and Basic CV Reports.
- **stable**: **SofIA (AI Career Coach)** with Audio/Memory processing.
- **stable**: **AdminPanel** for User & Service Management.
- **in-progress**: Advanced AI Resume Analysis features.
