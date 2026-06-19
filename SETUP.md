Agripay — Complete Setup & Project Overview

Summary

Agripay is an Expo (React Native) mobile app and reference client for Moolre APIs. It provides a farmer-facing smartphone UI and ships with mock data so the app is fully navigable offline. The repo includes UI components, screens, a small local profile store, a Moolre API client (configurable for demo vs. backend-proxy), and placeholder files for USSD and SMS flows.

Quickstart

1. Open a terminal at project root:
   cd C:\Users\HP\Desktop\Moolre\AgriPay
2. Install dependencies:
   npm install
3. Run the dev server (LAN):
   npm run start
   or npx expo start --clear
   or run start-local.bat
4. Or run via tunnel:
   npm run tunnel
   or run start.bat
5. Scan the Expo QR from the dev tools with Expo Go.

NPM scripts

- start: expo start --clear
- android: expo start --android --clear
- ios: expo start --ios --clear
- web: expo start --web
- tunnel: expo start --tunnel --clear

Environment & API keys

- .env.example documents these slots:
  - MOOLRE_API_USER, MOOLRE_API_KEY, MOOLRE_API_PUBKEY, MOOLRE_API_VASKEY
  - MOOLRE_BASE_URL (default: https://api.moolre.com)
- Two operation modes: direct app->Moolre (demo) or app->YOUR_BACKEND->Moolre (production). Toggle USE_BACKEND_PROXY in src/api/moolreClient.js.

Security note: Never ship real secret keys inside the app. Use a backend proxy for payments/transfers in production.

What was built (features)

- Price Board: daily crop prices (mocked), pull-to-refresh UI.
- Marketplace: buyer/seller listings + escrow flow notes (mocked listings).
- Subsidy Tracker: government disbursement status UI.
- Cooperative Savings: group contribution flow (local update + payments API stub).
- Credit: loan application UI using transaction-history-as-collateral (mock flow).
- Registration & Profile: local profile stored in AsyncStorage; minimal onboarding UI.
- USSD menu tree reference for feature-phone users (backend webhook contract provided as a placeholder).
- Moolre API client with header-building, timeout, and optional backend proxy.

Full project structure

Root files
- App.js — app entry, wraps Navigation and FarmerProvider, chooses RegisterScreen vs MainTabs
- README.md — project README and quick notes
- SETUP.md — this file (detailed setup & structure)
- package.json / package-lock.json — dependencies and scripts
- start.bat, start-local.bat — convenience scripts to launch Expo with or without tunnel
- app.json — Expo app metadata
- .env.example — documented env slots for Moolre credentials
- .npmrc, babel.config.js, metro.config.js — build/runtime config
- .expo/ — Expo local config (devices.json, settings)

src/
- src/navigation/MainTabs.js — Bottom tab navigation (Home, Prices, Marketplace, Subsidy, Cooperative, Credit, Profile)
- src/context/FarmerContext.js — React Context + AsyncStorage for local farmer profile, register/update helpers
- src/data/mockData.js — mockPrices, mockListings, mockFarmer, mockSubsidyStatus used across screens
- src/theme/colors.js — color palette, spacing, radii constants

src/components/
- Header.js — simple header component (title + optional subtitle)
- ModuleCard.js — home-screen module entry cards
- PriceRow.js — row renderer for price list (includes trend icon/color)

src/screens/
- RegisterScreen.js — onboarding form (name, phone, region). Skips OTP in demo mode.
- HomeScreen.js — dashboard, wallet balance, quick access module cards
- PriceBoardScreen.js — list of crop prices (uses mockPrices)
- MarketplaceScreen.js — listings and buy flow alert (notes how Payments/Transfers would be used)
- SubsidyScreen.js — subsidy card + status (mockSubsidyStatus)
- CooperativeScreen.js — contribute amount into group savings (updates local profile)
- CreditScreen.js — request loan UI; notes for how transaction history would be used
- ProfileScreen.js — view profile, reset demo profile, and a keys-detected indicator

src/api/
- moolreClient.js — axios instance, header builder, keysConfigured(), USE_BACKEND_PROXY toggle, BACKEND_URL
- paymentsApi.js — collectPayment, getPaymentStatus (POST /payments/collect etc.)
- transfersApi.js — disburseToFarmer, getTransferStatus (POST /transfers/disburse etc.)
- accountApi.js — getWalletBalance, createSubAccount, getTransactionHistory
- smsApi.js — sendOtp, verifyOtp, sendBulkSms
- ussdApi.js — USSD_MENU_TREE placeholder for backend implementers

Notes on implementation details

- Offline/demo mode: many screens import the real API functions but use mock data; the real calls are commented or referenced in comments so wiring keys/backends will enable live flows.
- Local persistence: FarmerContext saves the farmer profile to AsyncStorage under key 'agripay:farmer'.
- Moolre headers: moolreClient sends only non-placeholder header values and sets Content-Type application/json.
- USSD: USSD_MENU_TREE is a reference — real USSD logic must run on a telco-facing backend webhook.

Where to change things (developer pointers)

- Add real Moolre keys: edit src/api/moolreClient.js OR implement .env parsing and set USE_BACKEND_PROXY=true.
- Swap mock data for live calls: replace usages of mockPrices/mockListings in screens with API calls and handle loading states.
- Backend: create a server to hold keys and proxy Payments/Transfers/Account endpoints. Set BACKEND_URL and USE_BACKEND_PROXY=true.

Troubleshooting

- Clear caches: npx expo start --clear
- If an API call fails: check keysConfigured() in Profile screen and verify headers in moolreClient.js
- To reset the demo profile: open Profile -> Reset demo profile (clears registered flag in AsyncStorage)

Project metadata

- Expo SDK ~54.0.0, React 18.2.0, React Native 0.74.5
- Navigation: @react-navigation/native and bottom-tabs
- Storage: @react-native-async-storage/async-storage
- Networking: axios

Files inspected to compile this file
- README.md, package.json, .env.example, start.bat, start-local.bat, app.json
- App.js, src/context/FarmerContext.js, src/navigation/MainTabs.js, src/data/mockData.js
- All files in src/components, src/screens, src/api, src/theme

If any other artifacts (backend repo, CI, EAS build config, or assets) should be documented here, provide their paths or add them to the repo and rerun this SETUP update.