# Documentation of the Wallet & Reward System (Economy)

## Overview

The **Wallet System** introduces a virtual economy to the application, allowing
users to earn credits by watching ads and spend them to generate premium CV
reports.

## Architecture

### 1. Database (Appwrite)

Two new collections were created to manage the economy:

- **`services`**: Stores dynamic pricing for application features.
  - `slug`: String (Unique ID, e.g., 'BASIC_REPORT')
  - `name`: String (e.g., "Reporte Básico")
  - `cost`: Integer (Credit cost)

### 2. Backend (Node.js/Express)

The server acts as a secure bridge between the client and Appwrite.

- **Controller (`walletController.js`)**:
  - `addCredits`: Validates the ad token (currently mocked) and atomically
    updates the wallet balance + creates a transaction record.
  - `deductCredits`: Checks if `balance >= amount`. If yes, deducts credits and
    logs the transaction. Returns `402 Payment Required` if funds are
    insufficient.
  - `getPrices`: Fetches dynamic prices from the `services` collection (managed
    by `ServiceModel`).

- **Logging**:
  - All critical wallet actions (add/deduct/error) are logged via
    `utils/logger.js`.

- **Routes (`walletRoutes.js`)**:
  - `GET /api/wallet/balance`
  - `POST /api/wallet/add-credits`
  - `POST /api/wallet/deduct-credits`
  - `GET /api/wallet/transactions`
  - `GET /api/wallet/prices` (New endpoint for dynamic pricing)

### 3. Frontend (React Native)

The client manages state using `WalletContext`.

- **`WalletProvider`**: Wraps the application to provide global access to
  `balance`, `transactions`, `prices`, and actions like `earnCredits` and
  `spendCredits`.
- **`WalletPanel`**: A UI component that displays the current balance and a
  "Watch Ad" button. It handles the ad interaction flow.
- **Workflow Integration**:
  - The **Job Resume Compatibility** tool checks the wallet balance against
    dynamic prices before allowing a report generation.
  - **Basic Report Cost**: Dynamic (Default: 1 Credit)
  - **Advanced Report Cost**: Dynamic (Default: 2 Credits)

## Usage Flow

1. **Earning**: User clicks "Watch Ad" -> App simulates ad view -> Calls
   `addCredits` -> Server validates & updates DB -> Client updates Balance.
2. **Spending**: User clicks "Analyze" -> App checks local balance -> Calls
   `spendCredits` -> Server verifies & deducts -> App proceeds to generate
   report.

## Future Improvements

- Replace mock Ad Token verification with real server-side verification using
  AdMob SSV (Server-Side Verification) callbacks.
