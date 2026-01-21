# Migrating to Supabase

This guide provides instructions for migrating the JobPrepAI backend from
Appwrite to Supabase.

## 1. Authentication

**Appwrite**: `account.createEmailSession()` **Supabase**:
`supabase.auth.signInWithPassword()`

### Changes Required:

1. **Frontend**: Update `AuthContext.tsx`.
   - Replace `client.setProject()` with
     `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`.
   - Refactor `login/register` functions to use Supabase Auth API.
2. **Backend**: Update `server/middleware.js`.
   - Validate JWT tokens using `@supabase/supabase-js`.

## 2. Database (PostgreSQL)

Appwrite Collections -> Postgres Tables.

### Schema Migration (SQL)

```sql
-- Profiles (Public data linked to Auth Users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  headline text,
  email text,
  skills text[],
  avatar_url text
  -- Add other fields
);

-- Wallets
create table public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  balance int default 0,
  last_ad_view timestamptz
);

-- Transactions
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  amount int not null,
  type text check (type in ('EARN', 'SPEND')),
  description text,
  created_at timestamptz default now()
);

-- Services (Pricing)
create table public.services (
  slug text primary key,
  name text,
  cost int
);
```

### Row Level Security (RLS)

Unlike Appwrite's implicit collection permissions, Supabase uses RLS.

- **Profiles**:
  - `SELECT` public policy (everyone can see).
  - `UPDATE` policy `auth.uid() = id`.
- **Wallets/Transactions**:
  - **CRITICAL**: Do NOT expose `INSERT/UPDATE` to public.
  - Keep logic in the Node.js backend (using `SERVICE_ROLE_KEY`) OR migrate
    logic to **Postgres Functions / Database Webhooks** to go serverless.

## 3. Storage

**Appwrite Buckets** -> **Supabase Storage**

1. Create bucket `avatars`.
2. Set policy: `SELECT` public, `INSERT` authenticated users (restricted to own
   folder).

## 4. Code Refactoring

- **Backend (`Node.js`)**:
  - Replace `node-appwrite` with `@supabase/supabase-js`.
  - `databases.listDocuments` -> `supabase.from('table').select('*')`.
- **Backend (Alternative)**:
  - Supabase allows you to bypass the Node.js middleware for some reads if RLS
    is set up, but for the **Wallet Economy**, keep the Node.js server (as an
    Edge Function or current Express app) to securely handle
    `addCredits`/`deductCredits`.

## 5. Migration Checklist

- [ ] Run SQL Schema in Supabase Dashboard.
- [ ] Export data from Appwrite (JSON).
- [ ] Import data to Supabase (Script needed to map `userId` strings to
      `auth.users` UUIDs).
- [ ] Update `.env` with `SUPABASE_URL` and `SUPABASE_KEY`.
- [ ] Verify `WalletContext` correctly connects to the new backend endpoints.
