export type Difficulty = "easy" | "medium" | "hard";

export interface Paddle {
  y: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface GameState {
  player: Paddle;
  opponent: Paddle;
  ball: Ball;
  playerScore: number;
  opponentScore: number;
  paused: boolean;
  gameOver: boolean;
  winner: "player" | "opponent" | null;
  width: number;
  height: number;
}
