// Demo accounts for the account switcher.
// The handles must match DEMO_ACCOUNTS on the server (Person 2 / Vercel env).
export const DEMO_ACCOUNTS = [
  { handle: "sophie-mcbroom", name: "Sophie McB", tagline: "Main demo account" },
  { handle: "evan-deng", name: "Evan Deng", tagline: "Potential enabler" },
  { handle: "ella-rikley", name: "Ella Rikley", tagline: "Enabler" },
];

// Kept for older code that still links to the demo profile
export const DEMO_HANDLE = DEMO_ACCOUNTS[0].handle;