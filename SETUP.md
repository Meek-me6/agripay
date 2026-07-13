# AgriPay — Full Setup Guide

## Architecture

```
React Native App (Expo)
       │
       ▼ HTTP (JWT)
Express Backend  ──►  Supabase (PostgreSQL DB)
       │
       ▼
Moolre API (Payments, Transfers)
```

---

## Step 1 — Create a Supabase project

1. Go to https://supabase.com and sign up (free)
2. Click **New project**, give it a name (e.g. `agripay`), choose a region close to Ghana
3. Wait for it to provision (~1 min)
4. Go to **Settings → API**:
   - Copy **Project URL** → this is your `SUPABASE_URL`
   - Copy **service_role** key (not anon) → this is your `SUPABASE_SERVICE_KEY`

---

## Step 2 — Run the database schema

1. In your Supabase project, go to **SQL Editor**
2. Click **New query**
3. Paste the entire contents of `backend/schema.sql`
4. Click **Run**

This creates all tables and seeds initial crop prices.

---

## Step 3 — Configure the backend

Open `backend/.env` and fill in:

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...your_service_role_key...
JWT_SECRET=pick_any_long_random_string_here

# Moolre — already filled in
MOOLRE_BASE_URL=https://api.moolre.com
MOOLRE_API_USER=gbekus
MOOLRE_API_KEY=DjC1RBKiIn5NUIS0...
MOOLRE_API_PUBKEY=eyJ0eXAiOiJKV1Q...

PORT=3000
```

---

## Step 4 — Install and run the backend

```bash
cd backend
npm install
npm run dev        # development (with auto-reload)
# or
npm start          # production
```

You should see: `AgriPay backend running on port 3000`

Test it: http://localhost:3000/health → should return `{"ok":true}`

---

## Step 5 — Configure the mobile app

Open `src/api/moolreClient.js` and set the backend URL:

```js
// For local development (your phone must be on the same WiFi):
export const BACKEND_URL = 'http://YOUR_LOCAL_IP:3000';
// e.g. 'http://192.168.1.5:3000'

// For production (after deploying):
export const BACKEND_URL = 'https://your-backend.railway.app';
```

> **Find your local IP:** Run `ipconfig` on Windows, look for IPv4 Address under your WiFi adapter.

---

## Step 6 — Run the mobile app

```bash
cd ..   # back to project root
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone (must be on same WiFi).

---

## Step 7 — Deploy the backend (optional, for real devices on any network)

### Railway (recommended, free tier available)
1. Go to https://railway.app
2. Create new project → Deploy from GitHub (or drag the `backend/` folder)
3. Set all environment variables from `backend/.env` in the Railway dashboard
4. Railway gives you a URL like `https://agripay-backend.railway.app`
5. Update `BACKEND_URL` in `src/api/moolreClient.js` to this URL

### Render (alternative)
1. Go to https://render.com → New Web Service
2. Connect your repo, set root directory to `backend/`
3. Build command: `npm install`, Start command: `npm start`
4. Add environment variables

---

## How it works end-to-end

### Registration
1. Farmer fills in name, phone, region, PIN → hits **Get started**
2. App calls `POST /auth/register` on backend
3. Backend hashes PIN with bcrypt, saves farmer to Supabase
4. Backend tries to create a Moolre sub-account for the farmer
5. Returns JWT token → app stores it, shows main dashboard

### Login
1. Farmer enters phone + PIN → hits **Sign in**
2. App calls `POST /auth/login`
3. Backend verifies PIN hash, returns JWT
4. App stores token and shows dashboard

### Price Board
- Calls `GET /prices` → returns latest prices from Supabase
- Pull-to-refresh fetches fresh data

### Marketplace
- `GET /listings` → live listings with seller info
- `POST /listings` → authenticated farmer posts a listing
- `POST /listings/:id/buy` → triggers Moolre Payments API to collect from buyer's mobile money into escrow

### Subsidy Tracker
- `GET /subsidy` → farmer's current subsidy application
- `POST /subsidy/apply` → submits new application
- Disbursement via `POST /subsidy/:id/disburse` calls Moolre Transfers API

### Cooperative
- `GET /coop` → group pool total, leaderboard, your history
- `POST /coop/contribute` → triggers Moolre Payments collection, updates savings

### Credit
- `GET /credit` → computed credit score + loan history
- `POST /credit/apply` → submits loan application
- Score is computed from coop contributions, activity, and repaid loans

---

## Moolre API endpoints used

| Action | Method | Endpoint |
|--------|--------|----------|
| Create sub-account | POST | `/account/sub-account` |
| Collect payment (escrow/coop) | POST | `/payments/collect` |
| Disburse (subsidy/loan) | POST | `/transfers/disburse` |
| Get balance | GET | `/account/balance` |

> **Note:** Confirm exact endpoint paths against current Moolre API docs. The paths above follow the REST pattern described in the competition docs. If an endpoint returns 404, check the current docs for the exact path.

---

## Troubleshooting

**App can't connect to backend:**
- Make sure phone and computer are on same WiFi
- Use your computer's local IP (not `localhost`) in `BACKEND_URL`
- Check backend is running: `npm run dev` in `backend/`

**Supabase errors:**
- Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
- Make sure you ran the full `schema.sql` in SQL Editor

**Moolre payment fails:**
- The payment endpoints are confirmed against the Moolre docs — if it fails, check the error details returned in the response for the exact reason
- For testing, Moolre may have a sandbox/test mode — check their dashboard
