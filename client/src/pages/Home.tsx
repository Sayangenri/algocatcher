import React, { useState } from "react";
import { AlgoCatcher } from "@/components/game/AlgoCatcher";
import { Leaderboard } from "@/components/Leaderboard";
import { useCreateScore } from "@/hooks/use-scores";
import { Trophy, Play, RotateCcw, Send, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import confetti from "canvas-confetti";

type GameState = "idle" | "playing" | "gameover";

const formSchema = z.object({
  playerName: z.string().min(2, "Name must be at least 2 characters").max(20, "Name is too long"),
});

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const createScore = useCreateScore();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
    }
  });

  const startGame = () => {
    setGameState("playing");
    setFinalScore(0);
    setHasSubmitted(false);
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setGameState("gameover");
    if (score > 0) {
      triggerConfetti();
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#38BDF8', '#FBBF24', '#FB7185']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#38BDF8', '#FBBF24', '#FB7185']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const onSubmitScore = (data: z.infer<typeof formSchema>) => {
    createScore.mutate(
      { playerName: data.playerName, score: finalScore },
      {
        onSuccess: () => {
          setHasSubmitted(true);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-body">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center py-6">
          <div className="inline-flex items-center justify-center gap-3 bg-white px-6 py-3 rounded-full shadow-soft mb-4 border border-border/50">
            <Star className="w-6 h-6 text-secondary fill-secondary" />
            <h1 className="text-3xl md:text-4xl font-display text-foreground m-0 tracking-tight">
              ALGO Catcher
            </h1>
            <Star className="w-6 h-6 text-secondary fill-secondary" />
          </div>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Catch the falling ALGO coins in your basket. Don't let them drop!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Game Area */}
          <div className="lg:col-span-7 xl:col-span-8 relative">
            <AlgoCatcher 
              isPlaying={gameState === "playing"} 
              onGameOver={handleGameOver} 
            />

            {/* Overlays */}
            {gameState === "idle" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                <button
                  onClick={startGame}
                  className="
                    flex items-center gap-3 px-8 py-4 rounded-full font-display font-bold text-2xl
                    bg-gradient-to-r from-primary to-cyan-400 text-white
                    shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 
                    hover:-translate-y-1 active:translate-y-0
                    transition-all duration-200 border-2 border-white/20
                  "
                >
                  <Play className="w-8 h-8 fill-current" />
                  PLAY NOW
                </button>
              </div>
            )}

            {gameState === "gameover" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white/95 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white max-w-sm w-full">
                  <Trophy className="w-16 h-16 text-secondary mx-auto mb-4" />
                  <h2 className="text-3xl font-display text-foreground mb-1">Game Over!</h2>
                  <p className="text-muted-foreground mb-6">You caught</p>
                  <div className="text-6xl font-display font-bold text-primary mb-8 text-glow">
                    {finalScore}
                  </div>

                  {!hasSubmitted && finalScore > 0 ? (
                    <form onSubmit={handleSubmit(onSubmitScore)} className="space-y-4 text-left">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1 ml-1">
                          Enter your name
                        </label>
                        <input
                          {...register("playerName")}
                          className="
                            w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent
                            text-foreground font-medium placeholder:text-muted-foreground
                            focus:outline-none focus:border-primary focus:bg-white
                            transition-all duration-200
                          "
                          placeholder="Player One"
                          autoComplete="off"
                        />
                        {errors.playerName && (
                          <p className="text-destructive text-sm mt-1 ml-2 font-medium">
                            {errors.playerName.message}
                          </p>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="
                          w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg
                          bg-foreground text-white shadow-md hover:bg-slate-800
                          active:scale-[0.98] transition-all disabled:opacity-70
                        "
                      >
                        {isSubmitting ? (
                          "Saving..."
                        ) : (
                          <>
                            Submit Score <Send className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {hasSubmitted && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-2xl font-medium mb-4">
                          Score saved successfully!
                        </div>
                      )}
                      <button
                        onClick={startGame}
                        className="
                          w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg
                          bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40
                          active:scale-[0.98] transition-all
                        "
                      >
                        <RotateCcw className="w-5 h-5" /> Play Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Leaderboard */}
          <div className="lg:col-span-5 xl:col-span-4">
            <Leaderboard />
            
            <div className="mt-6 bg-primary/5 rounded-[2rem] p-6 border border-primary/10 text-center">
              <h3 className="font-display text-lg text-foreground mb-2">How to Play</h3>
              <ul className="text-muted-foreground text-sm space-y-2 text-left bg-white p-4 rounded-xl">
                <li className="flex gap-2"><span>⌨️</span> <span>Use <strong>Left/Right</strong> arrow keys to move.</span></li>
                <li className="flex gap-2"><span>📱</span> <span>Tap left/right sides of screen on mobile.</span></li>
                <li className="flex gap-2"><span>🪙</span> <span>Catch ALGO to score +10 pts.</span></li>
                <li className="flex gap-2"><span>❤️</span> <span>Don't miss! You only have 3 lives.</span></li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
