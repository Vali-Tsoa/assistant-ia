import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("mt-1 shrink-0", className)}
    >
      <defs>
        {/* Dégradé du robot */}
        <linearGradient
          id="robotGradient"
          x1="8"
          y1="8"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#81A9F8" />
          <stop offset="0.5" stopColor="#CDAFFA" />
          <stop offset="1" stopColor="#A4FCF5" />
        </linearGradient>

        {/* Ombre */}
        <filter
          id="robotShadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodOpacity="0.15"
          />
        </filter>
      </defs>

      {/* Cercle extérieur */}
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="url(#robotGradient)"
        opacity="0.18"
      />

      {/* Tête du robot */}
      <rect
        x="10"
        y="13"
        width="28"
        height="23"
        rx="8"
        className="fill-white dark:fill-[#18181B]"
        stroke="url(#robotGradient)"
        strokeWidth="2"
        filter="url(#robotShadow)"
      />

      {/* Antenne */}
      <path
        d="M24 13V9"
        stroke="url(#robotGradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Boule de l'antenne */}
      <circle
        cx="24"
        cy="7"
        r="2.5"
        fill="url(#robotGradient)"
      />

      {/* Œil gauche */}
      <circle
        cx="18"
        cy="23"
        r="3"
        fill="url(#robotGradient)"
      />

      {/* Œil droit */}
      <circle
        cx="30"
        cy="23"
        r="3"
        fill="url(#robotGradient)"
      />

      {/* Bouche */}
      <path
        d="M18 30C21 33 27 33 30 30"
        stroke="url(#robotGradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Oreille gauche */}
      <rect
        x="7"
        y="20"
        width="4"
        height="9"
        rx="2"
        fill="url(#robotGradient)"
      />
      <rect
        x="37"
        y="20"
        width="4"
        height="9"
        rx="2"
        fill="url(#robotGradient)"
      />
    </svg>
  );
}