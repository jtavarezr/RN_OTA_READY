# Appwrite Configuration (Current Source of Truth)

This document details the current Appwrite implementation to facilitate
migration to other platforms.

## 1. Project Structure

- **SDK**: `node-appwrite` (Backend), `appwrite` (Frontend Web/React Native)
- **Endpoint**: Configurable via `EXPO_PUBLIC_API_BASE_URL` (proxy) or direct
  Appwrite Endpoint.
- **Project ID**: Managed in `.env` or code constants.

## 2. Authentication (`AuthContext`)

- **Methods Used**:
  - `account.createEmailSession(email, password)`: Sign In.
  - `account.create(ID.unique(), email, password, name)`: Sign Up.
  - `account.deleteSession('current')`: Sign Out.
  - `account.get()`: Retrieve current user.
- **Session Persistence**: Managed automatically by the Client SDK.

## 3. Database Schema

All collections reside in a single Database (ID defined in config).

### Collection: `profiles`

Stores extended user information not native to the Auth Account.

- **Permissions**: User: Read/Update/Delete (Own).
- **Attributes**:
  - `userId` (String, Index): Link to Auth Account ID.
  - `fullName` (String)
  - `email` (String)
  - `headline` (String)
  - `skills` (String array)
  - ... (See `ProfileModel.js` for full list)

### Collection: `wallets`

Stores the virtual currency balance.

- **Permissions**: Server-side Access Only (Client reads via API proxy).
- **Attributes**:
  - `userId` (String, Index): Link to Auth Account ID.
  - `balance` (Integer): Current credits.
  - `lastAdView` (DateTime): For cooldown logic.

### Collection: `transactions`

Immutable ledger of credit history.

- **Permissions**: Server-side Access Only.
- **Attributes**:
  - `userId` (String, Index)
  - `walletId` (String)
  - `amount` (Integer)
  - `type` (String: 'EARN' | 'SPEND')
  - `description` (String)
  - `timestamp` (DateTime)

### Collection: `services`

Dynamic pricing configuration.

- **Permissions**: Read-only for Client/Server. Admin write.
- **Attributes**:
  - `slug` (String, Unique): e.g., `BASIC_REPORT`.
  - `cost` (Integer)
  - `name` (String)

## 4. Storage (Buckets)

- **Bucket**: `avatars` (or similar, inferred from code).
- **Usage**: Storing Profile Pictures and Banner Images.
- **Access**: Public Read.

## 5. Security & Rules

- **Client Side**: Can read/write `profiles` (Own data).
- **Server Side**:
  - `wallets`, `transactions`, `services` are managed via Server SDK (API Key
    with Admin or specific scopes).
  - The React Native app does **not** write to `wallets` directly; it calls the
    Node.js backend (`/api/wallet/*`).
