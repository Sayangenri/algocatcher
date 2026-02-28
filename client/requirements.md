## Packages
canvas-confetti | Playful celebration effect when submitting high scores
@types/canvas-confetti | Types for canvas-confetti

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
}
Game uses HTML5 Canvas with a fixed internal resolution of 600x800, scaled responsively via CSS object-fit.
