import React, { useState, useEffect } from "react";
import { AlgoCatcher } from "@/components/game/AlgoCatcher";
import { Leaderboard } from "@/components/Leaderboard";
import { useCreateScore } from "@/hooks/use-scores";
import { Trophy, Play, RotateCcw, Copy } from "lucide-react";
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
    <div className="h-screen bg-background font-body flex flex-col overflow-hidden">
      <div className="flex-1 max-w-6xl mx-auto w-full px-2 md:px-4 py-2 md:py-3 flex flex-col min-h-0">
        {/* Header bar with title, wallet, and logout */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-2 flex-shrink-0 w-full">
          {/* ALGO Catcher Title */}
          <div className="flex items-center w-full sm:w-auto justify-center sm:justify-start">
            <div className="inline-flex items-center justify-center gap-2 bg-white px-3 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2 rounded-full shadow-[4px_4px_0px_0px_#000] border-2 border-black">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display tracking-wider whitespace-nowrap">
                ALGO Catcher
              </h1>
            </div>
          </div>
          
          {/* Wallet address and Logout side by side */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
            {/* Wallet banner */}
            {wallet && (
              <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg border border-gray-700">
                <span className="font-mono text-xs truncate max-w-[100px] xs:max-w-[120px] sm:max-w-[140px] md:max-w-[180px] bg-black/20 px-1.5 sm:px-2 py-0.5 rounded select-all">
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0.5 sm:p-1 border border-white/20 rounded hover:bg-white/10 h-5 w-5 sm:h-6 sm:w-6 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(wallet);
                  }}
                  title="Copy wallet address"
                >
                  <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </Button>
              </div>
            )}
            
            {/* Logout button */}
            <Button variant="outline" onClick={handleLogout} className="h-7 sm:h-8 text-xs px-2 sm:px-3 whitespace-nowrap shrink-0">
              Logout
            </Button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-3 items-start flex-1 min-h-0 overflow-hidden">

          {/* Game */}
          <div className="lg:col-span-7 xl:col-span-7 relative h-[60vh] sm:h-[70vh] lg:h-full flex items-center justify-center min-h-0">
            <div className="w-full h-full max-h-full flex items-center justify-center">
              <AlgoCatcher
                isPlaying={gameState === "playing"}
                onGameOver={handleGameOver}
                wallet={wallet || undefined}
              />
            </div>

            {/* Idle */}
            {gameState === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 backdrop-blur-sm">
                <button
                  onClick={startGame}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-display font-normal text-sm sm:text-base md:text-lg bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:scale-105 hover:shadow-[6px_6px_0px_0px_#000] transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-white" />
                  <span className="whitespace-nowrap">PLAY NOW</span>
                </button>
              </div>
            )}

            {/* Game Over */}
            {gameState === "gameover" && (
              <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 text-center z-10 bg-white/80 backdrop-blur-sm">
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl max-w-sm w-full mx-2">
                  <Trophy className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 text-yellow-500" />
                  <h2 className="text-lg sm:text-xl md:text-2xl font-display tracking-wide mb-2">GAME OVER!</h2>

                  <div className="text-2xl sm:text-3xl md:text-4xl font-display font-normal mb-3 sm:mb-4 tracking-wide">
                    {finalScore}
                    <span className="text-xs sm:text-sm md:text-base ml-2 text-muted-foreground font-body">
                      pts
                    </span>
                  </div>

                  {hasSubmitted && (
                    <div className="bg-green-50 border-2 border-green-200 p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm mb-2 sm:mb-3 font-body">
                      ✓ Score saved to leaderboard!
                    </div>
                  )}

                  <Button
                    onClick={startGame}
                    className="w-full rounded-xl bg-black text-white hover:bg-black/90 font-display font-normal text-xs sm:text-sm md:text-base py-1.5 sm:py-2 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Play Again
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5 xl:col-span-5 h-[40vh] sm:h-[30vh] lg:h-full overflow-hidden flex flex-col">
            <Leaderboard currentWallet={wallet} />
          </div>

        </div>
      </div>
    </div>
  );
}