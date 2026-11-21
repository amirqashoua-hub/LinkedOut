import type { ReactNode } from "react";

// Every profile section is a white card with a heading
export default function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border bg-card px-6 py-5">
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}