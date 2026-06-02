import { useCallback, useEffect, useRef, useState } from "react";
import { updateAiPaddle } from "../game/ai";
import {
  PADDLE_ACCEL,
  PADDLE_FRICTION,
  PADDLE_SPEED,
} from "../game/constants";
import { clampPaddleY, createInitialState, stepGame } from "../game/engine";
import type { Difficulty, GameState } from "../game/types";

export function useSoloGame(
  difficulty: Difficulty,
  onScore?: () => void,
  onWin?: () => void,
  onHit?: () => void,
) {
  const stateRef = useRef<GameState>(createInitialState());
  const [frame, setFrame] = useState(0);
  const keysRef = useRef({ up: false, down: false });
  const playerVelRef = useRef(0);
  const prevScoresRef = useRef({ player: 0, opponent: 0 });
  const prevBallVxRef = useRef(0);

  const onScoreRef = useRef(onScore);
  const onWinRef = useRef(onWin);
  const onHitRef = useRef(onHit);
  onScoreRef.current = onScore;
  onWinRef.current = onWin;
  onHitRef.current = onHit;

  const bumpFrame = useCallback(() => setFrame((n) => n + 1), []);

  const setPaused = useCallback(
    (paused: boolean) => {
      stateRef.current = { ...stateRef.current, paused };
      bumpFrame();
    },
    [bumpFrame],
  );

  const togglePause = useCallback(() => {
    if (stateRef.current.gameOver) return;
    setPaused(!stateRef.current.paused);
  }, [setPaused]);

  const rematch = useCallback(() => {
    stateRef.current = createInitialState();
    playerVelRef.current = 0;
    prevScoresRef.current = { player: 0, opponent: 0 };
    prevBallVxRef.current = 0;
    bumpFrame();
  }, [bumpFrame]);

  const setTouchInput = useCallback((up: boolean, down: boolean) => {
    keysRef.current.up = up;
    keysRef.current.down = down;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        keysRef.current.up = true;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        keysRef.current.down = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") keysRef.current.up = false;
      if (e.key === "ArrowDown") keysRef.current.down = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const rawDt = (now - lastTime) / 16.67;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0.25), 2.5);

      let state = stateRef.current;
      if (!state.paused && !state.gameOver) {
        let vel = playerVelRef.current;
        if (keysRef.current.up) vel -= PADDLE_ACCEL * dt;
        if (keysRef.current.down) vel += PADDLE_ACCEL * dt;
        if (!keysRef.current.up && !keysRef.current.down) {
          vel *= Math.pow(PADDLE_FRICTION, dt);
        }
        vel = Math.max(-PADDLE_SPEED, Math.min(PADDLE_SPEED, vel));
        playerVelRef.current = vel;

        let playerY = clampPaddleY(state.player.y + vel * dt, state.height);

        const opponentY = updateAiPaddle(
          state.opponent.y,
          state.ball.y,
          state.ball.vx,
          state.height,
          difficulty,
          dt,
        );

        state = {
          ...state,
          player: { y: playerY },
          opponent: { y: opponentY },
        };

        const prevVx = prevBallVxRef.current;
        const prevPlayerScore = state.playerScore;
        const prevOpponentScore = state.opponentScore;
        state = stepGame(state);
        const scored =
          state.playerScore !== prevPlayerScore ||
          state.opponentScore !== prevOpponentScore;

        if (
          !scored &&
          Math.sign(state.ball.vx) !== Math.sign(prevVx) &&
          prevVx !== 0
        ) {
          onHitRef.current?.();
        }
        prevBallVxRef.current = state.ball.vx;

        if (scored) {
          onScoreRef.current?.();
          prevScoresRef.current = {
            player: state.playerScore,
            opponent: state.opponentScore,
          };
        }

        if (state.gameOver && state.winner) {
          onWinRef.current?.();
        }
      }

      stateRef.current = state;
      bumpFrame();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [difficulty, bumpFrame]);

  return {
    state: stateRef.current,
    frame,
    setPaused,
    togglePause,
    rematch,
    setTouchInput,
  };
}
