import React from "react";
import { useScores } from "@/hooks/use-scores";
import { Trophy, Loader2 } from "lucide-react";
import { AlgorandMark } from "./AlgorandLogo";
import type { Score } from "@shared/schema";

const rankStyles = [
  { bg: "bg-black text-white", row: "bg-black/5 border border-black/10" },
  { bg: "bg-black/70 text-white", row: "" },
  { bg: "bg-black/40 text-white", row: "" },
];

export function Leaderboard() {
  const { data: scores, isLoading, isError } = useScores();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl">
        <Loader2 className="w-8 h-8 text-black animate-spin mb-3" />
        <p className="text-muted-foreground font-medium text-sm">Loading high scores…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl text-center">
        <p className="text-destructive font-medium text-sm">Failed to load leaderboard.</p>
      </div>
    );
  }

  const topScores = [...((scores as Score[]) || [])]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  if (topScores.length === 0) {
    return (
      <div className="p-8 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl text-center">
        <Trophy className="w-10 h-10 text-black/20 mx-auto mb-3" />
        <h3 className="text-lg font-display font-bold text-foreground mb-1">No scores yet!</h3>
        <p className="text-muted-foreground text-sm">Be the first to catch some ALGO.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-black px-5 py-4 flex items-center gap-2.5">
        <h2 className="text-xl font-display font-bold text-white m-0">Top Catchers</h2>
        <span className="ml-auto text-white/50 text-xs font-body">ALGO Leaderboard</span>
      </div>

      {/* List */}
      <div className="p-3 space-y-1">
        {topScores.map((score, idx) => {
          const isTop3 = idx < 3;
          const style = rankStyles[idx] ?? { bg: "bg-black/5 text-black/50", row: "" };

          return (
            <div
              key={score.id}
              className={`
                flex items-center justify-between px-3 py-2.5 rounded-xl
                transition-colors hover:bg-black/[0.03]
                ${isTop3 ? style.row : ""}
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-lg font-display font-bold text-sm
                    ${isTop3 ? style.bg : "bg-black/5 text-black/40"}
                  `}
                >
                  {idx + 1}
                </div>
                <span
                  className={`font-body font-semibold text-sm ${
                    isTop3 ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {score.wallet.slice(0, 6)}...{score.wallet.slice(-4)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {isTop3 && <AlgorandMark size={11} color={idx === 0 ? "#000" : "#666"} />}
                <span
                  className={`font-display font-bold text-base ${
                    isTop3 ? "text-foreground" : "text-muted-foreground"
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
