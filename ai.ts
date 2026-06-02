import type { Difficulty } from "./types";
import { PADDLE_HEIGHT, PADDLE_SPEED } from "./constants";

const DIFFICULTY: Record<
  Difficulty,
  { smooth: number; maxSpeed: number; jitter: number; centerSmooth: number }
> = {
  easy: { smooth: 0.06, maxSpeed: 5, jitter: 18, centerSmooth: 0.04 },
  medium: { smooth: 0.09, maxSpeed: 6.5, jitter: 8, centerSmooth: 0.06 },
  hard: { smooth: 0.12, maxSpeed: PADDLE_SPEED, jitter: 2, centerSmooth: 0.08 },
};

function lerpToward(
  current: number,
  target: number,
  smooth: number,
  dt: number,
  maxSpeed: number,
): number {
  const factor = 1 - Math.pow(1 - smooth, dt);
  let next = current + (target - current) * factor;
  const delta = next - current;
  if (Math.abs(delta) > maxSpeed * dt) {
    next = current + Math.sign(delta) * maxSpeed * dt;
  }
  return next;
}

export function updateAiPaddle(
  paddleY: number,
  ballY: number,
  ballVx: number,
  courtHeight: number,
  difficulty: Difficulty,
  dt: number,
): number {
  const maxY = courtHeight - PADDLE_HEIGHT;
  const centerY = (courtHeight - PADDLE_HEIGHT) / 2;
  const { smooth, maxSpeed, jitter, centerSmooth } = DIFFICULTY[difficulty];

  if (ballVx <= 0) {
    const next = lerpToward(paddleY, centerY, centerSmooth, dt, maxSpeed * 0.6);
    return Math.max(0, Math.min(maxY, next));
  }

  const targetY = ballY - PADDLE_HEIGHT / 2;
  const noisyTarget = targetY + (Math.random() - 0.5) * jitter;
  const next = lerpToward(paddleY, noisyTarget, smooth, dt, maxSpeed);
  return Math.max(0, Math.min(maxY, next));
}
