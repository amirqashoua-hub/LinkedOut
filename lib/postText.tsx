import type { ReactNode } from "react";

// Post text from the AI sometimes contains Markdown: **bold** and *italic*.
// Render those as real formatting instead of showing the asterisks. Everything else is plain text
// (React escapes it, so this can't inject HTML).
const PATTERN = /\*\*([^*\n]+?)\*\*|\*([^*\s][^*\n]*?)\*/g;

export function formatPostText(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(PATTERN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    out.push(m[1] !== undefined ? <strong key={key++}>{m[1]}</strong> : <em key={key++}>{m[2]}</em>);
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// Same text with the Markdown markers removed (for link previews and other plain-text places)
export function stripPostMarkdown(text: string): string {
  return text.replace(PATTERN, (_m, bold, italic) => bold ?? italic);
}
