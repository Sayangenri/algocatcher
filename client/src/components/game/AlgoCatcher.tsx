import React, { useEffect, useRef } from "react";

interface AlgoCatcherProps {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
  wallet?: string;
}

// Game Constants
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 800;
const BASKET_WIDTH = 110;
const BASKET_HEIGHT = 22;
const COIN_RADIUS = 22;


export function AlgoCatcher({ onGameOver, isPlaying, wallet }: AlgoCatcherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
const algoImgRef = useRef<HTMLImageElement | null>(null);

useEffect(() => {
  const img = new Image();
  img.src = "/algo.svg";
  img.onload = () => {
    algoImgRef.current = img;
  };
}, []);

  useEffect(() => {

    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let score = 0;
    let lives = 3;
    let frames = 0;
    let spawnRate = 90;

    const basket = {
      x: CANVAS_WIDTH / 2 - BASKET_WIDTH / 2,
      y: CANVAS_HEIGHT - 60,
      width: BASKET_WIDTH,
      height: BASKET_HEIGHT,
      speed: 8,
      dx: 0,
    };

    const coins: Array<{ x: number; y: number; speed: number; id: number }> = [];
    let coinIdCounter = 0;

    const keys = { ArrowLeft: false, ArrowRight: false };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") keys.ArrowLeft = true;
      if (e.code === "ArrowRight") keys.ArrowRight = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") keys.ArrowLeft = false;
      if (e.code === "ArrowRight") keys.ArrowRight = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      if (touchX < rect.width / 2) {
        keys.ArrowLeft = true;
        keys.ArrowRight = false;
      } else {
        keys.ArrowRight = true;
        keys.ArrowLeft = false;
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      keys.ArrowLeft = false;
      keys.ArrowRight = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    // ── Drawing helpers ──────────────────────────────────────────────────────

    const drawBackground = () => {
      // White bg
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle dot grid
      ctx.fillStyle = "#EBEBEB";
      for (let x = 20; x < CANVAS_WIDTH; x += 40) {
        for (let y = 20; y < CANVAS_HEIGHT; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawBasket = () => {
      const { x, y, width, height } = basket;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(x + 4, y + 4, width, height + 4);

      // Basket body
      ctx.fillStyle = "#000000";
      ctx.fillRect(x, y, width, height);

      // Basket rim highlight
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(x + 2, y + 2, width - 4, 4);

      // "ALGO" label on basket
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 12px 'Bungee', cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ALGO", x + width / 2, y + height / 2 + 1);
    };

const drawCoin = (coin: { x: number; y: number }) => {
  const r = COIN_RADIUS;

  // Shadow
  ctx.beginPath();
  ctx.arc(coin.x + 3, coin.y + 3, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fill();

  // White coin background
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  if (algoImgRef.current) {
    const size = r * 1.6;
    ctx.drawImage(
      algoImgRef.current,
      coin.x - size / 2,
      coin.y - size / 2,
      size,
      size
    );
  }
};

    const drawHUD = () => {
      // Score (left)
      ctx.fillStyle = "#000000";
      ctx.font = "bold 24px 'Bungee', cursive";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`${score}`, 20, 15);

      ctx.font = "11px 'Orbitron', sans-serif";
      ctx.fillStyle = "#888888";
      ctx.textAlign = "left";
      ctx.fillText("SCORE", 20, 42);

      // Lives (right) — filled / empty dots
      const dotR = 8;
      const dotStart = CANVAS_WIDTH - 20;
      ctx.textAlign = "right";
      ctx.font = "11px 'Orbitron', sans-serif";
      ctx.fillStyle = "#888888";
      ctx.fillText("LIVES", dotStart - (2 * 24), 42);

      for (let i = 0; i < 3; i++) {
        const dx = dotStart - i * 24;
        ctx.beginPath();
        ctx.arc(dx, 28, dotR, 0, Math.PI * 2);
        if (i < lives) {
          ctx.fillStyle = "#000000";
          ctx.fill();
        } else {
          ctx.strokeStyle = "#CCCCCC";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Divider line under HUD
      ctx.strokeStyle = "#EBEBEB";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 64);
      ctx.lineTo(CANVAS_WIDTH, 64);
      ctx.stroke();
    };

    // ── Game loop ────────────────────────────────────────────────────────────

    const update = () => {
      frames++;

      // Update basket
      if (keys.ArrowLeft) basket.dx = -basket.speed;
      else if (keys.ArrowRight) basket.dx = basket.speed;
      else basket.dx = 0;

      basket.x += basket.dx;
      if (basket.x < 0) basket.x = 0;
      if (basket.x + basket.width > CANVAS_WIDTH)
        basket.x = CANVAS_WIDTH - basket.width;

      // Spawn coins
      if (frames % spawnRate === 0) {
        coins.push({
          x: Math.random() * (CANVAS_WIDTH - COIN_RADIUS * 2) + COIN_RADIUS,
          y: -COIN_RADIUS,
          speed: 3 + Math.random() * 2 + score * 0.05,
          id: coinIdCounter++,
        });
        if (spawnRate > 30) spawnRate = Math.floor(spawnRate * 0.98);
      }

      // Update coins + collisions
      for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        coin.y += coin.speed;

        const isCollision =
          coin.y + COIN_RADIUS >= basket.y &&
          coin.y - COIN_RADIUS <= basket.y + basket.height &&
          coin.x + COIN_RADIUS >= basket.x &&
          coin.x - COIN_RADIUS <= basket.x + basket.width;

        if (isCollision) {
          score += 10;
          coins.splice(i, 1);
          continue;
        }

        if (coin.y - COIN_RADIUS > CANVAS_HEIGHT) {
          lives -= 1;
          coins.splice(i, 1);
          if (lives <= 0) {
            onGameOver(score);
            return;
          }
        }
      }

      // Render
      drawBackground();
      coins.forEach(drawCoin);
      drawBasket();
      drawHUD();

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPlaying, onGameOver]);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden border-2 border-black shadow-[6px_6px_0px_0px_#000] rounded-lg flex items-center justify-center" style={{ aspectRatio: '3/4', maxHeight: '100%' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block w-full h-full object-contain touch-none bg-white"
        style={{ touchAction: "none", maxHeight: '100%' }}
      />
    </div>
  );
}
