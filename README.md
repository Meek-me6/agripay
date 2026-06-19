# Agripay (Expo / React Native)

One unified app for Ghanaian smallholder farmers, built around 5 modules
that all share a single farmer profile and run on Moolre's APIs:

| Module          | What it does                                  | Moolre APIs used        |
|------------------|------------------------------------------------|--------------------------|
| Price Board      | Daily crop prices per market                   | SMS (bulletin push)      |
| Marketplace      | Buyer/seller listings with escrow               | Payments, Transfers      |
| Subsidy Tracker  | Government disbursement status                 | Transfers                |
| Cooperative      | Group savings contributions                     | Payments, Account        |
| Credit           | Loan application using transaction history       | Account, Transfers       |

Feature-phone farmers are meant to reach the same data via USSD/SMS
(see `src/api/ussdApi.js` for the menu tree reference) — this repo is
the smartphone app + the shared API layer; the USSD side lives on a
backend webhook, not in this app.

## 1. Install

```bash
cd agripay-app
npm install
```

## 2. Run with Expo Go

```bash
npx expo start
```

Scan the QR code with the Expo Go app on your phone (same Wi-Fi network).

## 3. Add your Moolre API key(s)

Open `src/api/moolreClient.js` and fill in whichever of these Moolre
actually gave you (it lists 4 header types — you may only need one):

```js
const MOOLRE_API_USER = 'YOUR_MOOLRE_API_USER_HERE';
const MOOLRE_API_KEY = 'YOUR_MOOLRE_API_KEY_HERE';
const MOOLRE_API_PUBKEY = 'YOUR_MOOLRE_API_PUBKEY_HERE';
const MOOLRE_API_VASKEY = 'YOUR_MOOLRE_API_VASKEY_HERE';
```

Leave any you don't have as-is — the client only sends headers that
have a real value, so unused placeholders are skipped automatically.

There's also a `.env.example` documenting the same slots if you'd
rather wire up `react-native-dotenv` or `expo-constants` later.

## 4. What's wired up vs. what's a placeholder

- **UI, navigation, local profile storage (AsyncStorage)** — fully working.
- **Moolre API call functions** (`src/api/*.js`) — written with the
  correct header pattern and sensible payload shapes, but the exact
  endpoint paths are marked `// TODO: confirm against current docs`
  since competition docs can change. Test each one against a real
  Moolre sandbox call before demo day.
- **Screens currently use mock data** (`src/data/mockData.js`) so the
  app is fully clickable offline. Swap the mock arrays for the real
  API calls (already imported but commented out in each screen) once
  your keys are confirmed working.

## 5. Before you take real money

Don't ship real secret keys inside the Expo app bundle for
production — anyone can extract them. Move Payments/Transfers/Account
calls behind your own backend and flip `USE_BACKEND_PROXY = true` in
`moolreClient.js` once that backend exists. Fine to skip this for a
competition demo.
