/** Brand-accurate navigation app icons used in GO buttons. */

export function GoogleMapsIcon({
  className = 'w-5 h-5',
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google Maps"
    >
      {/* Pin/teardrop body */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="#EA4335"
      />
      {/* Top-left blue quadrant accent */}
      <path d="M12 2C9.24 2 6.83 3.37 5.41 5.5L12 9V2z" fill="#4285F4" />
      {/* Top-right green quadrant accent */}
      <path d="M12 2v7l5.8-4.05A7 7 0 0 0 12 2z" fill="#34A853" />
      {/* Bottom-left yellow quadrant accent */}
      <path d="M5 9c0 .9.14 1.77.41 2.59L12 9H5z" fill="#FBBC05" />
      {/* White circle center */}
      <circle cx="12" cy="9" r="3.2" fill="white" />
    </svg>
  );
}

export function WazeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Waze"
    >
      {/* Body */}
      <ellipse cx="12" cy="13.5" rx="8.5" ry="8" fill="#33CCFF" />
      {/* Left eye */}
      <circle cx="9.3" cy="12.5" r="1.3" fill="#1A1A2E" />
      {/* Right eye */}
      <circle cx="14.7" cy="12.5" r="1.3" fill="#1A1A2E" />
      {/* Smile */}
      <path
        d="M9 16 Q12 18.8 15 16"
        stroke="#1A1A2E"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Antenna / horn — Waze's distinctive feature */}
      <path
        d="M15.5 6.5 C16.5 4.5 19 5 18 7.5"
        stroke="#1A1A2E"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
