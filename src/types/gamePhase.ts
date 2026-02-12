export type GamePhase = "BOOT" | "EARLY" | "MID" | "LATE"

export function getGamePhase(r: Room): GamePhase {
  const rcl = r.controller?.level ?? 0
  if (rcl <= 2) { return "BOOT" }
  else if (rcl <= 4) { return "EARLY" }
  else if (rcl <= 7) { return "MID" }
  else return "LATE"
}

