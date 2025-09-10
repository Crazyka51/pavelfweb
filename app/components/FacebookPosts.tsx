"use client";

import { useEffect } from "react";
import { initFacebookSDK, parseXFBML } from "../lib/facebook-sdk";

export default function FacebookPosts() {
  useEffect(() => {
    // Inicializace Facebook SDK a následné zpracování Facebook prvků
    const loadFacebook = async () => {
      try {
        await initFacebookSDK();
        parseXFBML();
      } catch (error) {
        console.error("Nepodařilo se načíst Facebook SDK:", error);
      }
    };

    loadFacebook();
  }, []);

  return (
    <section id="facebook" className="relative z-10 py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Aktuality z Facebooku</h2>
        <p className="text-lg text-gray-600 mb-8">
          Sledujte nejnovější informace a aktuality ze stránky Pavel Fišer – Zastupitel Praha 4.
        </p>
        <div className="flex justify-center">
          <div
            className="fb-page"
            data-href="https://www.facebook.com/profile.php?id=61574874071299"
            data-tabs="timeline"
            data-width="1000"
            data-height=""
            data-small-header="false"
            data-adapt-container-width="true"
            data-hide-cover="false"
            data-show-facepile="true"
          >
            <blockquote
              cite="https://www.facebook.com/profile.php?id=61574874071299"
              className="fb-xfbml-parse-ignore"
            >
              <a href="https://www.facebook.com/profile.php?id=61574874071299">
                Pavel Fišer – Zastupitel Praha 4
              </a>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
