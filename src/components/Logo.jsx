import { Link } from "react-router-dom";

// marbly brand mark: coral steak with cream marbling. Recreated from the brand
// logo as SVG so it stays sharp at every size.
export function LogoMark({ className = "h-9 w-9" }) {
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
      <path
        d="M12 58 C7 42 18 31 36 27 C52 23 60 11 80 7 C101 3 116 16 113 37 C110 58 95 72 72 78 C51 84 19 84 12 58 Z"
        fill="#e35f5e"
      />
      <g fill="none" stroke="#fcf5ee" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 49 C30 40 45 45 56 36 C64 29 70 21 81 19" />
        <path d="M81 19 C95 17 105 28 103 41 C101 54 89 61 79 55" />
        <path d="M84 30 C90 33 92 41 88 47" />
        <path d="M56 36 C63 46 60 58 70 71" />
        <path d="M33 45 C41 54 38 66 48 77" />
        <path d="M66 47 C71 49 75 53 79 55" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = "text-2xl" }) {
  return (
    <span className={`font-brand font-bold lowercase tracking-tight text-ink ${className}`}>
      marbly
    </span>
  );
}

export default function Logo({ to = "/", size = "md" }) {
  const mark = size === "lg" ? "h-14 w-14" : "h-9 w-11";
  const text = size === "lg" ? "text-4xl" : "text-2xl";
  return (
    <Link to={to} className="flex items-center gap-2" aria-label="marbly — beranda">
      <LogoMark className={mark} />
      <Wordmark className={text} />
    </Link>
  );
}
