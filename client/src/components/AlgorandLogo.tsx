import React from "react";

interface AlgorandMarkProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Algorand "A" geometric mark — two angular legs + crossbar
 */
export function AlgorandMark({ size = 24, className = "", color = "currentColor" }: AlgorandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill={color}
      className={className}
      aria-label="Algorand"
      role="img"
    >
      {/* Left leg */}
      <polygon points="50,5 5,95 22,95" />
      {/* Right leg */}
      <polygon points="50,5 95,95 78,95" />
      {/* Crossbar */}
      <rect x="29" y="59" width="42" height="11" />
    </svg>
  );
}

/**
 * "Built on Algorand" pill badge
 */
export function AlgorandBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/20 bg-black text-white text-xs font-body font-semibold tracking-wide ${className}`}
    >
      <AlgorandMark size={12} color="white" />
      Built on Algorand
    </span>
  );
}

/**
 * Algorand wordmark: mark + "ALGORAND" text
 */
export function AlgorandWordmark({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <AlgorandMark size={size} />
      <span
        className="font-body font-bold tracking-[0.15em] uppercase text-foreground"
        style={{ fontSize: size * 0.7 }}
      >
        ALGORAND
      </span>
    </span>
  );
}
