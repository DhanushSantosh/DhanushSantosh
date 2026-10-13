// Shared between HomepageIntroLoader (client) and the root layout (server):
// constants exported from a "use client" module arrive in a server
// component as client references, not values, so they live here instead.

export const INTRO_SEEN_STORAGE_KEY = "homepage-intro-seen";
const INTRO_SEEN_ATTR = "data-intro-seen";

// The intro overlay is server-rendered solid, so on a full reload within the
// same session it would paint before hydration could remove it. Run from
// <head> during HTML parsing — before that first paint — this flags <html>
// so globals.css hides the overlay outright.
export const introSeenInitScript = `try{if(sessionStorage.getItem(${JSON.stringify(INTRO_SEEN_STORAGE_KEY)})==="1")document.documentElement.setAttribute(${JSON.stringify(INTRO_SEEN_ATTR)},"")}catch(e){}`;
