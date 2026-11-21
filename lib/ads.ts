// "Promoted" posters in the home page's left column.
// To add one: put the image in public/ads/ and add an entry here. To remove one: delete its entry.
// Shown in this order. `date` is optional (leave it out if the poster doesn't say).
export type BarAd = {
  image: string; // path under public/, e.g. "/ads/bdband.webp"
  title: string;
  venue: string;
  date?: string;
  blurb: string; // the LinkedIn-ad pitch line
};

export const BAR_ADS: BarAd[] = [
  {
    image: "/ads/bdband.webp",
    title: "BDBAND",
    venue: "Bar des Arts × Jam for Justice",
    date: "Thu, Nov 26 · 8 PM",
    blurb: "Blufin, Bebe and Oona, Resonance. In support of Motionball and Special Olympics Canada.",
  },
  {
    image: "/ads/blues-choice-awards.webp",
    title: "MEUS Blues Choice Awards 2026",
    venue: "EUS Common Room",
    date: "Fri, Nov 27 · 4–9 PM",
    blurb: "Get slimed. Get nominated. Get recognized for your contributions to nothing.",
  },
  {
    image: "/ads/labba.webp",
    title: "LABBA",
    venue: "The Lab",
    date: "Thu, Dec 3 · 9 PM",
    blurb: "Mamma mia, here we go again. Dancing queen experience required.",
  },
];
