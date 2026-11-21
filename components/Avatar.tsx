import { initials } from "@/lib/format";

type Props = { name: string | null; url?: string | null; size?: number; className?: string };

export default function Avatar({ name, url, size = 48, className = "" }: Props) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name ?? ""}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  );
}