import React from "react";
import { useScores } from "@/hooks/use-scores";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";

export function Leaderboard() {
  const { data: scores, isLoading, isError } = useScores();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card rounded-[2rem] shadow-soft">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Loading high scores...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-card rounded-[2rem] shadow-soft text-center">
        <p className="text-destructive font-medium">Failed to load leaderboard.</p>
      </div>
    );
  }

  // Sort descending and take top 10
  const topScores = [...(scores || [])]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  if (topScores.length === 0) {
    return (
      <div className="p-8 bg-card rounded-[2rem] shadow-soft text-center border border-border/50">
        <Trophy className="w-12 h-12 text-muted mx-auto mb-4" />
        <h3 className="text-xl font-display text-foreground mb-2">No scores yet!</h3>
        <p className="text-muted-foreground">Be the first to catch some ALGO.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-[2rem] shadow-soft overflow-hidden border border-border/50">
      <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center gap-3">
        <Trophy className="w-6 h-6 text-secondary" />
        <h2 className="text-2xl font-display text-foreground m-0">Top Catchers</h2>
      </div>
      
      <div className="p-2">
        {topScores.map((score, idx) => {
          const isTop3 = idx < 3;
          return (
            <div 
              key={score.id} 
              className={`
                flex items-center justify-between p-4 mb-2 last:mb-0 rounded-xl
                transition-all hover:bg-slate-50
                ${idx === 0 ? 'bg-secondary/10 border border-secondary/20' : ''}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-8 h-8 flex items-center justify-center rounded-full font-display font-bold
                  ${idx === 0 ? 'bg-secondary text-secondary-foreground' : 
                    idx === 1 ? 'bg-slate-300 text-slate-700' : 
                    idx === 2 ? 'bg-amber-600/30 text-amber-800' : 
                    'bg-slate-100 text-slate-400'}
                `}>
                  {idx + 1}
                </div>
                <span className={`font-medium ${isTop3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {score.playerName}
                </span>
              </div>
              <div className={`font-display font-bold text-lg ${isTop3 ? 'text-primary' : 'text-muted-foreground'}`}>
                {score.score.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
