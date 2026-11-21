import { Undo2 } from "lucide-react";

// Remembered for the browser session; visit /?intro to see it again (for demos)
const INTRO_KEY = "lockedout-intro-seen";

// Plain JavaScript (no React), inlined at the top of <body> by the root layout, so it runs on
// whichever page you land on, before anything paints, and Undo works even before React has
// finished loading (or if it never does).
//  * already pressed Undo this session → mark <html data-intro-seen> so CSS hides the splash
//  * click on #intro-undo → <html data-intro-leaving> starts the swirl (CSS)
//  * when the fade ends → data-intro-seen hides it for good
// Listeners are on document (event delegation), so they work for a splash that appears later
// via client-side navigation, and survive React re-rendering the splash.
export const INTRO_SCRIPT = `(function(){
var k=${JSON.stringify(INTRO_KEY)},d=document.documentElement;
try{if(new URLSearchParams(location.search).has("intro"))sessionStorage.removeItem(k);
if(sessionStorage.getItem(k))d.setAttribute("data-intro-seen","");}catch(e){}
document.addEventListener("click",function(e){
var b=e.target&&e.target.closest&&e.target.closest("#intro-undo");
if(!b||d.hasAttribute("data-intro-leaving")||d.hasAttribute("data-intro-seen"))return;
try{sessionStorage.setItem(k,"1");}catch(e){}
d.setAttribute("data-intro-leaving","");
});
document.addEventListener("animationend",function(e){
if(e.target&&e.target.id==="intro-splash"){d.setAttribute("data-intro-seen","");d.removeAttribute("data-intro-leaving");}
},true);
})();`;

// The "LinkedIn" start screen (Home only). Static markup: all behaviour is in INTRO_SCRIPT + CSS.
export default function IntroSplash() {
  return (
    <div
      id="intro-splash"
      className="intro-splash fixed inset-0 z-[100] flex items-center justify-center bg-white"
      role="dialog"
      aria-label="Welcome"
    >
      <div className="intro-content flex flex-col items-center gap-10">
        {/* Text wordmark in LinkedIn's colours (not their logo file) */}
        <p className="flex items-center text-6xl font-bold tracking-tight text-[#0A66C2] select-none sm:text-7xl">
          Linked
          <span className="ml-1 rounded-lg bg-[#0A66C2] px-2 text-white">in</span>
        </p>

        <button
          id="intro-undo"
          type="button"
          className="flex items-center gap-2 rounded-full bg-[#0A66C2] px-8 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-[#004182] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0A66C2]/40"
        >
          <Undo2 className="h-5 w-5" />
          Undo
        </button>
      </div>
    </div>
  );
}
