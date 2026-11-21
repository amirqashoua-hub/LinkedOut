// The red "AP" coin for Aura Points: McGill red with a darker rim and an inner ring
export default function AuraToken({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Aura Points"
      className="inline-block shrink-0 align-middle"
    >
      <circle cx="12" cy="12" r="11.5" fill="#B5121B" />
      <circle cx="12" cy="12" r="10" fill="#ED1B2F" />
      <circle cx="12" cy="12" r="8" fill="none" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="0.8" />
      <text
        x="12"
        y="15.4"
        textAnchor="middle"
        fontSize="9"
        fontWeight="800"
        fontFamily="Segoe UI, Helvetica, Arial, sans-serif"
        fill="#FFFFFF"
      >
        AP
      </text>
    </svg>
  );
}

// "🪙 1,250 Aura Points" (negative totals shown as -150)
export function AuraAmount({ points, size = 18, label = true }: { points: number; size?: number; label?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <AuraToken size={size} />
      <span className="font-semibold">
        {points.toLocaleString("en-US")}
        {label && " Aura Points"}
      </span>
    </span>
  );
}
