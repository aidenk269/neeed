const API_BASE = import.meta.env.VITE_API_URL ?? "";

export interface PlayerStats {
  wins: number;
  losses: number;
  gamesPlayed: number;
}

export async function fetchStatsConfig(): Promise<{
  enabled: boolean;
  storage: string;
}> {
  const res = await fetch(`${API_BASE}/api/stats/config`);
  if (!res.ok) return { enabled: false, storage: "none" };
  return res.json();
}

export async function fetchMyStats(accessToken: string): Promise<PlayerStats> {
  const res = await fetch(`${API_BASE}/api/me/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Could not load stats");
  }
  return res.json();
}

export async function recordMatch(
  accessToken: string,
  won: boolean,
): Promise<PlayerStats> {
  const res = await fetch(`${API_BASE}/api/stats/record`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ won, mode: "solo" }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Could not save stats");
  }
  return res.json();
}
