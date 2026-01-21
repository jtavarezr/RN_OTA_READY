# Frontend Documentation (React Native)

## Overview

The JobPrepAI mobile application is built with **React Native** and **Expo**,
designed to provide AI-powered career tools. It uses a modern tech stack
combining **UI Kitten** for base components and **Tailwind CSS** for custom
styling.

## Tech Stack

### Core

- **Runtime**: React Native (via Expo SDK 50+)
- **Build Tool**: Expo Go / Development Builds
- **Language**: TypeScript

### State Management

- **Context API**:
  - `AuthContext`: Authentication state (User session, Login/Register).
  - `WalletContext`: Economy state (Balance, Transactions, Prices).
  - `ThemeContext`: User preferences (Light/Dark mode).
- **Zustand**:
  - `SettingsStore`: Global app configuration (Primary color, Font settings).

### Navigation

- **React Navigation v6**:
  - `AppNavigator`: Main entry point switching between Auth and Main stacks.
  - Stack and Tab navigators for authenticated views.

### UI & Styling

- **UI Kitten**: Core component library (Buttons, Inputs, Cards).
- **Tailwind CSS (`tailwind-rn`)**: Utility-first styling for layout and
  detailed design.
- **Eva Icons**: Icon set used throughout the app.

### Services & Integrations

- **Appwrite**: Backend-as-a-Service for Auth, Database, and Storage.
- **Axios**: HTTP Client for connecting to the custom Node.js backend
  (`/api/wallet`).
- **Google Mobile Ads**: Monetization via Rewarded Ads.
- **Expo Document Picker**: File uploads (CV/Resume).
- **i18next**: Internationalization (English/Spanish).

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ads/            # Interaction with AdMob (NativeAd, RewardedAd)
│   ├── CVBuilder*/     # Feature-specific complex components (e.g., JobResumeCompatibility)
│   ├── Wallet/         # Wallet UI (WalletPanel)
│   └── ...
├── context/            # React Context Providers
├── data/               # Static JSON data (Mock reports, default values)
├── navigation/         # Navigator definitions (Stack, Tab)
├── screens/            # Full page views
│   ├── auth/           # Login, Register
│   ├── main/           # Home, Profile, Dashboard
│   └── ...
├── services/           # API wrappers
│   ├── api.ts          # Axios instance configuration
│   ├── walletService.ts# Wallet API endpoints
│   └── ...
├── utils/              # Helper functions (themeColors, tailwind wrappers)
└── i18n/               # Translation files
```

## Key Flows

### 1. Authentication

- Managed by `AuthContext`.
- Persists session using Appwrite SDK.
- Automatically redirects user between AuthStack and MainStack.

### 2. Wallet & Economy

- **Context**: `WalletContext` initializes on app start, fetching Balance and
  Prices from the backend.
- **Earning**: Users watch Rewarded Ads (hook: `useRewardedAd`) to trigger
  `earnCredits`.
- **Spending**: Features like `JobResumeCompatibility` request dynamic prices
  via `prices` object in context and call `spendCredits(cost)`.

### 3. Theming

- The app supports dynamic theming.
- `ThemeContext` toggles Light/Dark mode.
- `SettingsStore` allows user-defined Primary Colors, applied via UI Kitten's
  `ApplicationProvider` and Tailwind utilities.

## Setup & Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Tailwind**:
   ```bash
   npm run dev:tailwind
   ```
   (Keeps `tailwind.css` and `tailwind.json` in sync).
3. **Run App**:
   ```bash
   npx expo start
   ```
   - Press `a` for Android Emulator.
   - Press `i` for iOS Simulator.

## Environment Variables

- `EXPO_PUBLIC_API_BASE_URL`: URL of the Node.js backend (e.g.,
  `http://192.168.1.XX:3030`).
- Appwrite credentials are managed securely within the Appwrite SDK config.
