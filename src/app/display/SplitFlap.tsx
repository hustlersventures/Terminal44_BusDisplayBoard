const TEXT_SIZE = {
  sm: "text-xs md:text-sm",
  md: "text-sm md:text-lg",
  lg: "text-lg md:text-2xl",
} as const;

// "solid" for use on white/light backgrounds — a filled orange panel with
// white text. "inverted" for use on an orange background, e.g. the header
// clock — a white panel with orange text — so it stays visible either way.
const TONE = {
  solid: { panel: "bg-orange-500 text-white", divider: "border-white/30" },
  inverted: { panel: "bg-white text-orange-600", divider: "border-orange-200" },
} as const;

// Renders text as a single split-flap-style panel (rounded pill, bold
// tabular digits, thin dividers between characters hinting at individual
// flap segments) rather than separate boxes per letter.
export default function SplitFlap({
  text,
  size = "md",
  tone = "solid",
  className = "",
}: {
  text: string;
  size?: keyof typeof TEXT_SIZE;
  tone?: keyof typeof TONE;
  className?: string;
}) {
  const colors = TONE[tone];
  return (
    <span
      className={`inline-flex items-center gap-[2px] rounded-md px-1.5 py-0.5 font-bold tabular-nums ${colors.panel} ${TEXT_SIZE[size]} ${className}`}
    >
      {text.split("").map((char, i) =>
        char === " " ? (
          <span key={i} className="w-2" />
        ) : (
          <span key={i} className={`px-[1px] last:border-r-0 [&:not(:last-child)]:border-r ${colors.divider}`}>
            {char}
          </span>
        ),
      )}
    </span>
  );
}
