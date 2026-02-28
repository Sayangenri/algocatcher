import React, { useEffect, useRef } from "react";

interface AlgoCatcherProps {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

// Game Constants
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 800;
const BASKET_WIDTH = 100;
const BASKET_HEIGHT = 20;
const COIN_RADIUS = 20;

export function AlgoCatcher({ onGameOver, isPlaying }: AlgoCatcherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Game State
    let animationFrameId: number;
    let score = 0;
    let lives = 5;
    let frames = 0;
    let spawnRate = 90; // Frames between spawns
    
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
    
    // Input Handling
    const keys = { ArrowLeft: false, ArrowRight: false };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") keys.ArrowLeft = true;
      if (e.code === "ArrowRight") keys.ArrowRight = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") keys.ArrowLeft = false;
      if (e.code === "ArrowRight") keys.ArrowRight = false;
    };
    
    // Touch handling for mobile
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

    // Drawing Functions
    const drawBackground = () => {
      ctx.fillStyle = "#FFFFFF"; // Pure white
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Subtle grid for B/W theme
      ctx.strokeStyle = "#F0F0F0";
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
    };
    
    const drawBasket = () => {
      ctx.fillStyle = "#000000"; // Black basket
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      
      // Sharp rectangle for B/W theme
      const { x, y, width, height } = basket;
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
    };
    
    const drawCoins = () => {
      coins.forEach(coin => {
        // Outer circle - Black with white 'A'
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, COIN_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#000000"; 
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000000";
        ctx.stroke();
        
        // Inner 'A'
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 22px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("A", coin.x, coin.y + 2);
      });
    };
    
    const drawHUD = () => {
      ctx.fillStyle = "#000000"; 
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`SCORE: ${score}`, 20, 20);
      
      ctx.textAlign = "right";
      
      // Draw dots for lives in B/W theme
      const dotXStart = CANVAS_WIDTH - 20;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(dotXStart - (i * 25), 32, 8, 0, Math.PI * 2);
        if (i < lives) {
          ctx.fillStyle = "#000000";
          ctx.fill();
        } else {
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    };

    // Game Loop
    const update = () => {
      frames++;
      
      // 1. Update Basket
      if (keys.ArrowLeft) basket.dx = -basket.speed;
      else if (keys.ArrowRight) basket.dx = basket.speed;
      else basket.dx = 0;
      
      basket.x += basket.dx;
      
      // Clamp basket to screen
      if (basket.x < 0) basket.x = 0;
      if (basket.x + basket.width > CANVAS_WIDTH) basket.x = CANVAS_WIDTH - basket.width;
      
      // 2. Spawn Coins
      if (frames % spawnRate === 0) {
        coins.push({
          x: Math.random() * (CANVAS_WIDTH - COIN_RADIUS * 2) + COIN_RADIUS,
          y: -COIN_RADIUS,
          speed: 3 + Math.random() * 2 + (score * 0.1), // gets faster
          id: coinIdCounter++,
        });
        
        // Slightly increase spawn rate over time, cap at 30 frames
        if (spawnRate > 30) {
          spawnRate = Math.floor(spawnRate * 0.98);
        }
      }
      
      // 3. Update Coins & Check Collisions
      for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        coin.y += coin.speed;
        
        // Collision with basket (AABB vs Circle approximation)
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
        
        // Missed coin
        if (coin.y - COIN_RADIUS > CANVAS_HEIGHT) {
          lives -= 1;
          coins.splice(i, 1);
          
          if (lives <= 0) {
            onGameOver(score);
            return; // End game loop
          }
        }
      }
      
      // Render
      drawBackground();
      drawCoins();
      drawBasket();
      drawHUD();
      
      animationFrameId = requestAnimationFrame(update);
    };
    
    // Start Loop
    update();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPlaying, onGameOver]);

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-[3/4] bg-white shadow-xl overflow-hidden border-2 border-black">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block w-full h-full object-contain touch-none bg-white"
        style={{ touchAction: "none" }}
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
           {/* Overlay content handled by parent, but we add a blur pane here */}
        </div>
      )}
    </div>
  );
}
