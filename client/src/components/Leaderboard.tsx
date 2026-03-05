import React, { useRef, useEffect } from "react";
import { useScores } from "@/hooks/use-scores";
import { Trophy, Loader2 } from "lucide-react";
import { AlgorandMark } from "./AlgorandLogo";
import type { Score } from "@shared/schema";

const rankStyles = [
  { bg: "bg-black text-white", row: "bg-black/5 border border-black/10" },
  { bg: "bg-black/70 text-white", row: "" },
  { bg: "bg-black/40 text-white", row: "" },
];

interface LeaderboardProps {
  currentWallet?: string | null;
}

export function Leaderboard({ currentWallet }: LeaderboardProps) {
  const { data: scores, isLoading, isError } = useScores();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentUserRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);

  // Auto-scroll to current user's row ONCE after both scores and wallet are ready.
  // Uses manual scrollTop so only the leaderboard container scrolls, not the page.
  useEffect(() => {
    if (hasAutoScrolled.current) return;
    if (!currentUserRef.current || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const row = currentUserRef.current;

    const timer = setTimeout(() => {
      const rowTop = row.offsetTop;
      const rowHeight = row.offsetHeight;
      const containerHeight = container.clientHeight;
      container.scrollTop = rowTop - containerHeight / 2 + rowHeight / 2;
      hasAutoScrolled.current = true;
    }, 200);

    return () => clearTimeout(timer);
  }, [scores, currentWallet]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 xs:p-6 sm:p-8 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] rounded-lg xs:rounded-xl sm:rounded-2xl">
        <Loader2 className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-black animate-spin mb-2 xs:mb-2.5 sm:mb-3" />
        <p className="text-muted-foreground font-medium text-xs xs:text-sm">Loading high scores…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 xs:p-6 sm:p-8 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] rounded-lg xs:rounded-xl sm:rounded-2xl text-center">
        <p className="text-destructive font-medium text-xs xs:text-sm">Failed to load leaderboard.</p>
      </div>
    );
  }

  // Show ALL scores sorted — no slice so every player can find themselves
  const allScores = [...((scores as Score[]) || [])].sort((a, b) => b.score - a.score);

  if (allScores.length === 0) {
    return (
      <div className="p-4 xs:p-6 sm:p-8 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] rounded-lg xs:rounded-xl sm:rounded-2xl text-center">
        <Trophy className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 text-black/20 mx-auto mb-2 xs:mb-2.5 sm:mb-3" />
        <h3 className="text-base xs:text-lg font-display text-foreground mb-1 tracking-wide">No scores yet!</h3>
        <p className="text-muted-foreground text-xs xs:text-sm">Be the first to catch some ALGO.</p>
      </div>
    );
  }

  const currentUserIndex = currentWallet
    ? allScores.findIndex((s) => s.wallet.toLowerCase() === currentWallet.toLowerCase())
    : -1;

  return (
    <div className="bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-black px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2 md:py-3 flex items-center justify-between flex-shrink-0">
        <h2 className="text-sm xs:text-base sm:text-base md:text-lg lg:text-xl font-display text-white m-0 tracking-wide">
          Top Catchers
        </h2>
        {currentUserIndex !== -1 && (
          <span className="text-white/60 text-[9px] xs:text-[10px] font-body">
            #{currentUserIndex + 1} of {allScores.length}
          </span>
        )}
      </div>

      {/* Scrollable List */}
      <div
        ref={scrollContainerRef}
        className="p-1.5 xs:p-2 sm:p-2 md:p-3 space-y-0.5 xs:space-y-1 overflow-y-auto flex-1 min-h-0 overscroll-contain"
      >
        {allScores.map((score, idx) => {
          const isTop3 = idx < 3;
          const isCurrentUser =
            currentWallet && score.wallet.toLowerCase() === currentWallet.toLowerCase();
          const style = rankStyles[idx] ?? { bg: "bg-black/5 text-black/50", row: "" };

          return (
            <div
              key={score.id}
              ref={isCurrentUser ? currentUserRef : undefined}
              className={`
                flex items-center justify-between px-1.5 xs:px-2 sm:px-3 py-1.5 xs:py-2 sm:py-2.5 rounded-md xs:rounded-lg sm:rounded-xl
                transition-colors touch-manipulation
                ${isCurrentUser ? "bg-gray-800 text-white ring-2 ring-gray-500" : "hover:bg-black/[0.03] active:bg-black/[0.05]"}
                ${isTop3 && !isCurrentUser ? style.row : ""}
              `}
            >
              <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 min-w-0 flex-1">
                <div
                  className={`
                    w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md xs:rounded-lg font-display font-bold text-[10px] xs:text-xs sm:text-sm shrink-0
                    ${isCurrentUser
                      ? "bg-white text-gray-800"
                      : isTop3
                      ? style.bg
                      : "bg-black/5 text-black/40"
                    }
                  `}
                >
                  {idx + 1}
                </div>
                <span
                  className={`font-body font-semibold text-[10px] xs:text-xs sm:text-sm truncate ${
                    isCurrentUser
                      ? "text-white font-bold"
                      : isTop3
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {score.wallet.slice(0, 6)}...{score.wallet.slice(-4)}
                  {isCurrentUser && (
                    <span className="ml-1 text-white/60 text-[9px] xs:text-[10px]">(you)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 shrink-0">
                {isTop3 && (
                  <AlgorandMark
                    size={9}
                    className="xs:w-[10px] xs:h-[10px] sm:w-[11px] sm:h-[11px]"
                    color={isCurrentUser ? "#fff" : idx === 0 ? "#000" : "#666"}
                  />
                )}
                <span
                  className={`font-display font-bold text-xs xs:text-sm sm:text-base ${
                    isCurrentUser
                      ? "text-white"
                      : isTop3
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {score.score.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
