# Migrating to Firebase

This guide provides instructions for migrating the JobPrepAI backend from
Appwrite to Firebase (Google Cloud).

## 1. Authentication

**Appwrite**: `account.createEmailSession()` **Firebase**:
`signInWithEmailAndPassword()` from `firebase/auth`.

### Changes Required:

1. **Frontend**:
   - Install `firebase` SDK.
   - Initialize `initializeApp(firebaseConfig)`.
   - Update `AuthContext` to listen to `onAuthStateChanged`.
2. **Backend**:
   - Use `firebase-admin` SDK to verify ID Tokens sent by the client.

## 2. Database (Firestore)

Appwrite Collections -> Firestore Collections (NoSQL).

### Schema Mapping

- **`users/{uid}`** (Replaces `profiles`):
  - Store profile attributes directly in the user document.
- **`wallets/{uid}`**:
  - `balance`: number
  - `lastAdView`: timestamp
- **`transactions/{transactionId}`**:
  - `userId`: string
  - `amount`: number
  - `type`: string
- **`config/services`**:
  - Store pricing map.

### Security Rules (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Profiles: Users can read/write their own
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Wallets: NO CLIENT WRITE ACCESS. Read-only for owner.
    match /wallets/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only manageable by Admin SDK (Node Server)
    }

    // Transactions: Read-only for owner
    match /transactions/{txnId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false;
    }
  }
}
```

## 3. Storage

**Appwrite Storage** -> **Cloud Storage for Firebase**

1. Bucket structure remains similar (`avatars/{uid}`).
2. Update security rules to allow read public, write owner.

## 4. Code Refactoring

### Frontend

- Replace `appwrite` with `firebase/app`, `firebase/auth`, `firebase/firestore`.

### Backend (Node.js)

- Replace `node-appwrite` with `firebase-admin`.
- **Initialization**:
  ```javascript
  const admin = require("firebase-admin");
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();
  ```
- **Logic**:
  - `WalletController`: Use `db.runTransaction()` to atomically update
    `wallets/{uid}` and create `transactions/{id}`. This is crucial for data
    integrity.

## 5. Migration Checklist

- [ ] Create Firebase Project & Enable Auth/Firestore/Storage.
- [ ] Generate Service Account Key for Node.js server.
- [ ] Export Appwrite data and write a migration script to
      `admin.firestore().collection().add()`.
- [ ] Update frontend `.env` and `google-services.json` (for Android).
