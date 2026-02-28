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
    let lives = 3;
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
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, "#F8FAFC"); // Light top
      gradient.addColorStop(1, "#E2E8F0"); // Slightly darker bottom
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };
    
    const drawBasket = () => {
      ctx.fillStyle = "#38BDF8"; // Primary cyan
      ctx.shadowColor = "rgba(56, 189, 248, 0.4)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      
      // Rounded rectangle
      const { x, y, width, height } = basket;
      const radius = 10;
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.fill();
      ctx.closePath();
      
      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    };
    
    const drawCoins = () => {
      coins.forEach(coin => {
        // Outer circle
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, COIN_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#FBBF24"; // Yellow
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#D97706"; // Darker orange ring
        ctx.stroke();
        
        // Inner 'A'
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 22px 'Fredoka', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("A", coin.x, coin.y + 2);
      });
    };
    
    const drawHUD = () => {
      ctx.fillStyle = "#1E293B"; // Dark foreground
      ctx.font = "600 24px 'Fredoka', sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`Score: ${score}`, 20, 20);
      
      ctx.textAlign = "right";
      
      // Draw heart icons for lives
      const heartXStart = CANVAS_WIDTH - 20;
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < lives ? "#FB7185" : "#CBD5E1"; // Pink if alive, gray if lost
        ctx.fillText("♥", heartXStart - (i * 30), 20);
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
    <div className="relative w-full max-w-lg mx-auto aspect-[3/4] bg-white rounded-[2rem] shadow-soft overflow-hidden border border-border/50">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block w-full h-full object-contain touch-none"
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
