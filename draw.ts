import {
  BALL_SIZE,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
} from "./constants";
import { opponentPaddleX, PLAYER_PADDLE_X } from "./engine";
import type { GameState } from "./types";

export function drawCourt(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  scale: number,
): void {
  ctx.save();
  ctx.scale(scale, scale);

  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue("--pong-court")
    .trim() || "#1a2744";
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue("--pong-court-line")
    .trim() || "rgba(232, 220, 196, 0.2)";
  ctx.setLineDash([8, 12]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(state.width / 2, 0);
  ctx.lineTo(state.width / 2, state.height);
  ctx.stroke();
  ctx.setLineDash([]);

  const sand =
    getComputedStyle(document.documentElement).getPropertyValue("--pong-sand").trim() ||
    "#e8dcc4";

  ctx.fillStyle = sand;
  ctx.shadowColor = "rgba(232, 220, 196, 0.35)";
  ctx.shadowBlur = 12;

  ctx.fillRect(PLAYER_PADDLE_X, state.player.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillRect(
    opponentPaddleX(state.width),
    state.opponent.y,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
  );

  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
