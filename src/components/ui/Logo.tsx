import { useId } from "react";

/**
 * Quantara Logo
 * Story: A stylised atom — the nucleus represents a single source of knowledge,
 * the orbiting ring represents the AI pipeline that processes and returns it.
 * The gap in the ring echoes the letter Q (Quantara).
 */
const Logo = ({ size = 40 }: { size?: number }) => {
  const id = useId();

  const bgId = `${id}-bg`;
  const ringId = `${id}-ring`;
  const nucleusId = `${id}-nucleus`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Quantara logo"
      role="img"
      className="quantara-logo"
      style={{ flexShrink: 0 }}
    >
      <style>{`
      .quantara-logo .ring {
        transform-origin: 20px 20px;
        transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .quantara-logo:hover .ring {
        transform: rotate(180deg);
      }
      .quantara-logo .nucleus {
        transition: r 0.3s ease, opacity 0.3s ease;
      }
      .quantara-logo:hover .nucleus {
        r: 4;
      }
    `}</style>

      {/* Background pill */}
      <rect width="40" height="40" rx="10" fill={`url(#${bgId})`} />

      {/* Orbit ring with Q-gap */}
      <circle
        className="ring"
        cx="20"
        cy="20"
        r="11"
        stroke={`url(#${ringId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="56 14"
        strokeDashoffset="0"
        fill="none"
      />

      {/* Nucleus */}
      <circle className="nucleus" cx="20" cy="20" r="3" fill={`url(#${nucleusId})`} />

      {/* Tail of the Q — the "exit vector" */}
      <line
        x1="28"
        y1="28"
        x2="32"
        y2="32"
        stroke={`url(#${ringId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id={ringId} x1="9" y1="9" x2="31" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="100%" stopColor="#e0e7ff" />
        </linearGradient>
        <radialGradient id={nucleusId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export default Logo;
