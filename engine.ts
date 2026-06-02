import {
  BALL_SIZE,
  BALL_SPEED,
  COURT_HEIGHT,
  COURT_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_WIDTH,
  WINNING_SCORE,
} from "./constants";
import type { Ball, GameState } from "./types";

function centerPaddleY(): number {
  return (COURT_HEIGHT - PADDLE_HEIGHT) / 2;
}

function createBall(serveToPlayer: boolean): Ball {
  const angle = (Math.random() * 0.6 - 0.3) * Math.PI;
  const dir = serveToPlayer ? 1 : -1;
  return {
    x: COURT_WIDTH / 2,
    y: COURT_HEIGHT / 2,
    vx: Math.cos(angle) * BALL_SPEED * dir,
    vy: Math.sin(angle) * BALL_SPEED,
  };
}

export function createInitialState(): GameState {
  return {
    player: { y: centerPaddleY() },
    opponent: { y: centerPaddleY() },
    ball: createBall(Math.random() > 0.5),
    playerScore: 0,
    opponentScore: 0,
    paused: false,
    gameOver: false,
    winner: null,
    width: COURT_WIDTH,
    height: COURT_HEIGHT,
  };
}

export function resetBall(state: GameState, scoredOn: "player" | "opponent"): GameState {
  const serveToPlayer = scoredOn === "opponent";
  return {
    ...state,
    ball: createBall(serveToPlayer),
    player: { y: centerPaddleY() },
    opponent: { y: centerPaddleY() },
  };
}

function collidePaddle(
  ball: Ball,
  paddleY: number,
  paddleX: number,
  direction: 1 | -1,
): Ball {
  const approaching = direction === 1 ? ball.vx < 0 : ball.vx > 0;
  if (!approaching) return ball;

  const ballLeft = ball.x - BALL_SIZE / 2;
  const ballRight = ball.x + BALL_SIZE / 2;
  const ballTop = ball.y - BALL_SIZE / 2;
  const ballBottom = ball.y + BALL_SIZE / 2;

  const paddleTop = paddleY;
  const paddleBottom = paddleY + PADDLE_HEIGHT;
  const paddleLeft = paddleX;
  const paddleRight = paddleX + PADDLE_WIDTH;

  const hitsX =
    direction === 1
      ? ballRight >= paddleLeft && ballLeft <= paddleRight
      : ballLeft <= paddleRight && ballRight >= paddleLeft;

  if (!hitsX || ballBottom < paddleTop || ballTop > paddleBottom) {
    return ball;
  }

  const hitPos = (ball.y - paddleY) / PADDLE_HEIGHT - 0.5;
  const maxBounce = 0.85;
  const bounceAngle = hitPos * maxBounce * (Math.PI / 2);

  const vx = Math.cos(bounceAngle) * BALL_SPEED * direction;
  let vy = Math.sin(bounceAngle) * BALL_SPEED;
  const mag = Math.hypot(vx, vy);
  if (mag > 0) {
    vy = (vy / mag) * BALL_SPEED;
  }

  return {
    x:
      direction === 1
        ? paddleLeft - BALL_SIZE / 2 - 1
        : paddleRight + BALL_SIZE / 2 + 1,
    y: ball.y,
    vx,
    vy,
  };
}

export function stepGame(state: GameState): GameState {
  if (state.paused || state.gameOver) return state;

  let { ball } = state;
  let { playerScore, opponentScore } = state;

  ball = {
    ...ball,
    x: ball.x + ball.vx,
    y: ball.y + ball.vy,
  };

  if (ball.y - BALL_SIZE / 2 <= 0) {
    ball = { ...ball, y: BALL_SIZE / 2, vy: Math.abs(ball.vy) };
  } else if (ball.y + BALL_SIZE / 2 >= state.height) {
    ball = { ...ball, y: state.height - BALL_SIZE / 2, vy: -Math.abs(ball.vy) };
  }

  const playerX = PADDLE_MARGIN;
  const opponentX = state.width - PADDLE_MARGIN - PADDLE_WIDTH;

  ball = collidePaddle(ball, state.player.y, playerX, 1);
  ball = collidePaddle(ball, state.opponent.y, opponentX, -1);

  if (ball.x < 0) {
    opponentScore += 1;
    const next = {
      ...state,
      ball,
      opponentScore,
      playerScore,
    };
    if (opponentScore >= WINNING_SCORE) {
      return { ...next, gameOver: true, winner: "opponent" as const };
    }
    return resetBall(next, "player");
  }

  if (ball.x > state.width) {
    playerScore += 1;
    const next = {
      ...state,
      ball,
      playerScore,
      opponentScore,
    };
    if (playerScore >= WINNING_SCORE) {
      return { ...next, gameOver: true, winner: "player" as const };
    }
    return resetBall(next, "opponent");
  }

  return { ...state, ball, playerScore, opponentScore };
}

export function clampPaddleY(y: number, courtHeight: number): number {
  return Math.max(0, Math.min(courtHeight - PADDLE_HEIGHT, y));
}

export const PLAYER_PADDLE_X = PADDLE_MARGIN;
export function opponentPaddleX(courtWidth: number): number {
  return courtWidth - PADDLE_MARGIN - PADDLE_WIDTH;
}
