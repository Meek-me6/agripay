/**
 * USSD API — build offline interactive menus for feature phones.
 *
 * IMPORTANT: USSD sessions are initiated by a telco when a farmer
 * dials a short code (e.g. *XXX#) on a FEATURE PHONE. They never
 * touch this React Native app — there's no "app" involved on that
 * side at all. Moolre calls a webhook on YOUR backend for each
 * USSD session step, your backend responds with the next menu
 * text, and Moolre relays it back to the phone over USSD.
 *
 * So this file is a placeholder/reference for the USSD MENU TREE
 * your backend needs to implement — not something the mobile app
 * calls directly. Keeping it here so the menu logic lives next to
 * the rest of the Moolre integration and is easy to hand to
 * whoever builds the backend webhook.
 */

export const USSD_MENU_TREE = {
  root: {
    text: 'Welcome to Agripay\n1. Check prices\n2. My balance\n3. Apply for credit\n4. Cooperative savings',
    options: {
      1: 'priceMenu',
      2: 'balanceMenu',
      3: 'creditMenu',
      4: 'coopMenu',
    },
  },
  priceMenu: {
    text: 'Select crop:\n1. Maize\n2. Cocoa\n3. Cassava\n4. Tomato',
    options: {
      1: 'priceResult_maize',
      2: 'priceResult_cocoa',
      3: 'priceResult_cassava',
      4: 'priceResult_tomato',
    },
  },
  // TODO: flesh out remaining branches (balanceMenu, creditMenu,
  // coopMenu, priceResult_* terminal screens) once the backend
  // webhook contract with Moolre's USSD API is confirmed.
};
