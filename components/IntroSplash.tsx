"use client";

import { useState } from "react";
import { Undo2 } from "lucide-react";

// Remembered for the browser session; visit /?intro to see it again (for demos)
export const INTRO_KEY = "lockedout-intro-seen";

// Runs before the page paints (inlined by the home page): hides the splash for people who've
// already pressed Undo this session, so they never see it flash.
export const INTRO_SCRIPT = `(function(){try{var k=${JSON.stringify(INTRO_KEY)};if(new URLSearchParams(location.search).has("intro"))sessionStorage.removeItem(k);if(sessionStorage.getItem(k))document.documentElement.setAttribute("data-intro-seen","");}catch(e){}})();`;

// The "LinkedIn" start screen. Undo swirls it away to reveal the LockedOut home underneath.
export default function IntroSplash() {
  const [phase, setPhase] = useState<"shown" | "leaving" | "gone">("shown");
  if (phase === "gone") return null;

  function undo() {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // private browsing: it just shows again next time
    }
    setPhase("leaving");
  }

  return (
    <div
      className={`intro-splash fixed inset-0 z-[100] flex items-center justify-center bg-white ${
        phase === "leaving" ? "intro-bg-fade" : ""
      }`}
      // when the white background has faded, remove the splash entirely
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setPhase("gone");
      }}
      role="dialog"
      aria-label="Welcome"
    >
      <div className={`flex flex-col items-center gap-10 ${phase === "leaving" ? "intro-swirl" : ""}`}>
        {/* Text wordmark in LinkedIn's colours (not their logo file) */}
        <p className="flex items-center text-6xl font-bold tracking-tight text-[#0A66C2] select-none sm:text-7xl">
          Linked
          <span className="ml-1 rounded-lg bg-[#0A66C2] px-2 text-white">in</span>
        </p>

        <button
          autoFocus
          onClick={undo}
          disabled={phase === "leaving"}
          className="flex items-center gap-2 rounded-full bg-[#0A66C2] px-8 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-[#004182] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0A66C2]/40"
        >
          <Undo2 className="h-5 w-5" />
          Undo
        </button>
      </div>
    </div>
  );
}
