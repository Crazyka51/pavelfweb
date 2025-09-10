"use client";

// Flag pro sledování, zda byl SDK již inicializován
let isSDKInitialized = false;

// Rozhraní pro Facebook SDK
declare global {
  interface Window {
    FB?: {
      XFBML: {
        parse: () => void;
      };
    };
  }
}

/**
 * Inicializuje Facebook SDK pro celou aplikaci
 * Zajišťuje, že SDK je načteno pouze jednou
 * @returns Promise, který se vyřeší, když je SDK načteno
 */
export function initFacebookSDK(): Promise<void> {
  return new Promise((resolve) => {
    // Pokud již byl SDK inicializován, okamžitě vraťte výsledek
    if (isSDKInitialized) {
      if (window.FB) {
        resolve();
      } else {
        // Pokud ještě není FB dostupný, počkejme na jeho načtení
        const checkFB = setInterval(() => {
          if (window.FB) {
            clearInterval(checkFB);
            resolve();
          }
        }, 100);
      }
      return;
    }

    // Vytvoř fb-root element, pokud neexistuje
    if (!document.getElementById("fb-root")) {
      const div = document.createElement("div");
      div.id = "fb-root";
      document.body.prepend(div);
    }

    // Načtení Facebook SDK, pokud ještě není
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.src = "https://connect.facebook.net/cs_CZ/sdk.js#xfbml=1&version=v19.0";
      
      // Sleduj načtení SDK
      script.onload = () => {
        isSDKInitialized = true;
        // Počkej chvíli, aby se FB objekt správně inicializoval
        setTimeout(() => {
          resolve();
        }, 200);
      };
      
      document.body.appendChild(script);
    } else {
      isSDKInitialized = true;
      resolve();
    }
  });
}

/**
 * Znovu analyzuje XFBML elementy na stránce
 * Užitečné, když se dynamicky přidávají Facebook widgety
 */
export function parseXFBML(): void {
  if (window.FB) {
    window.FB.XFBML.parse();
  }
}
