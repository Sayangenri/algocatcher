import React, { useState, useEffect } from "react";
import { AlgoCatcher } from "@/components/game/AlgoCatcher";
import { Leaderboard } from "@/components/Leaderboard";
import { useCreateScore } from "@/hooks/use-scores";
import { Trophy, Play, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { AlgorandMark, AlgorandBadge } from "@/components/AlgorandLogo";
import { Button } from "@/components/ui/button";

type GameState = "idle" | "playing" | "gameover";

export default function Home() {
  const handleLogout = async () => {
    const { magic } = await import("@/lib/magic");
    await magic.user.logout();
    window.location.replace("/");
  };

  const [gameState, setGameState] = useState<GameState>("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);

  const createScore = useCreateScore();

  // Load wallet from Magic
  useEffect(() => {
    const loadWallet = async () => {
      try {
        const { magic } = await import("@/lib/magic");
        const address = await magic.algorand.getWallet();
        setWallet(address);
      } catch (err) {
        console.error("Failed to load wallet:", err);
      }
    };

    loadWallet();
  }, []);

  const startGame = () => {
    setGameState("playing");
    setFinalScore(0);
    setHasSubmitted(false);
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setGameState("gameover");

    if (score > 0 && wallet) {
      createScore.mutate(
        { wallet, score },
        { onSuccess: () => setHasSubmitted(true) }
      );
    }

    if (score > 0) triggerConfetti();
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
        colors: ["#000000", "#444444", "#888888"],
      });

      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#000000", "#444444", "#888888"],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  };

  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-6 space-y-8">

        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Wallet banner */}
        {wallet && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white rounded-xl px-4 py-2 shadow-lg border border-gray-700 justify-center">
            <span className="font-mono text-xs truncate max-w-[180px] sm:max-w-xs bg-black/20 px-2 py-1 rounded select-all">
              {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 px-2 py-1 text-xs border border-white/20 rounded hover:bg-white/10"
              onClick={() => {
                navigator.clipboard.writeText(wallet);
              }}
            >
              Copy
            </Button>
          </div>
        )}

        {/* Header */}
        <header className="text-center py-4 space-y-3">
          <div className="inline-flex items-center justify-center gap-3 bg-white px-6 py-3 rounded-full shadow-[4px_4px_0px_0px_#000] border-2 border-black mb-1">
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              ALGO Catcher
            </h1>
          </div>



          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Catch the falling ALGO coins in your basket. Don't let them drop!
          </p>
        </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Game */}
          <div className="lg:col-span-7 xl:col-span-8 relative">
            <AlgoCatcher
              isPlaying={gameState === "playing"}
              onGameOver={handleGameOver}
              wallet={wallet || undefined}
            />

            {/* Idle */}
            {gameState === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={startGame}
                  className="flex items-center gap-3 px-8 py-4 rounded-full font-bold text-2xl bg-black text-white border-2 border-black"
                >
                  <Play className="w-7 h-7 fill-white" />
                  PLAY NOW
                </button>
              </div>
            )}

            {/* Game Over */}
            {gameState === "gameover" && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] p-8 rounded-3xl max-w-sm w-full">
                  <Trophy className="w-14 h-14 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Game Over!</h2>

                  <div className="text-6xl font-bold mb-6">
                    {finalScore}
                    <span className="text-lg ml-2 text-muted-foreground">
                      pts
                    </span>
                  </div>

                  {hasSubmitted && (
                    <div className="bg-black/5 border border-black/10 p-3 rounded-xl text-sm mb-3">
                      ✓ Score saved to leaderboard!
                    </div>
                  )}

                  <Button
                    onClick={startGame}
                    className="w-full rounded-xl bg-black text-white hover:bg-black/85 font-bold"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Play Again
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <Leaderboard />
          </div>

        </div>
      </div>


    </div>
  );
}