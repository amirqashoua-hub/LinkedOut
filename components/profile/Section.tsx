import type { ReactNode } from "react";

type Props = {
  title: string;
  action?: ReactNode; // optional button(s) on the right of the heading, e.g. "+ Add skill"
  children: ReactNode;
};

// Every profile section is a white card with a heading
export default function Section({ title, action, children }: Props) {
  return (
    <section className="rounded-lg border bg-card px-6 py-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}