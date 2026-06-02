import { useCallback, useRef, useState } from "react";

type SoundKind = "hit" | "score" | "win";

export function useSound() {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "square") => {
      if (muted) return;
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        /* audio unavailable */
      }
    },
    [muted, getCtx],
  );

  const play = useCallback(
    (kind: SoundKind) => {
      switch (kind) {
        case "hit":
          playTone(440, 0.06);
          break;
        case "score":
          playTone(220, 0.12);
          break;
        case "win":
          playTone(523, 0.1);
          setTimeout(() => playTone(659, 0.15), 100);
          break;
      }
    },
    [playTone],
  );

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  return { muted, toggleMute, play };
}
