# JobsPrepAI App

## Setup Instructions

### 1. Installation

Install the dependencies:

```bash
npm install
```

### 2. Configuration

**Appwrite Setup**

The Appwrite configuration is located in `src/services/appwrite.ts`.

**Important**:
- The endpoint is configured as: `https://dev.tavarez.app.jobsprepai/v1`
- **You MUST set your Project ID** in `src/services/appwrite.ts`. The variable `PROJECT_ID` is currently a placeholder.
- **Security Warning**: Do not use the Secret API Key in the client-side application. The provided API Key `JobsPrepAI_Prod_API_Key` should only be used in server-side code (Node.js, etc.). For this mobile app, ensure you are using the correct **Project ID** from your Appwrite console.

### 3. Tailwind CSS (tailwind-rn)

This project uses `tailwind-rn` for styling.

**Development:**

To run the app with Tailwind CSS watch mode (updates styles in real-time):

```bash
npm run dev:tailwind
```

**Build Styles:**

If you make changes to `tailwind.config.js` or need to regenerate styles manually:

```bash
npm run build:tailwind
```

### 4. Running the App

To start the development server:

```bash
npm start
```

- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on physical device

### 5. Features

- **Authentication**: Login, Register, Password Recovery using Appwrite.
- **Navigation**:
  - Auth Stack (Login, Register, Forgot Password)
  - Main Tab Navigator (Home, Utility, Settings)
- **UI/UX**:
  - **UI Kitten**: Main UI Framework.
  - **Tailwind CSS (tailwind-rn)**: Utility classes for styling.
  - **Theming**: Light/Dark mode support (Toggle in Settings).
  - **i18n**: English and Spanish support (Toggle in Settings).
- **Structure**:
  - `src/components`: Reusable components (ScreenLayout, LoadingIndicator).
  - `src/context`: Global state (Auth, Theme).
  - `src/screens`: App screens.
  - `src/services`: External services (Appwrite).
  - `src/i18n`: Localization configuration.

## Build

To build for Android/iOS using EAS:

```bash
eas build
```
