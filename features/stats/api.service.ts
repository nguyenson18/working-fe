
import { unwrap } from "@/src/lib/unwrap";
import type { WeeklyStatsPayload } from "./types";
import { api } from "@/src/lib/api";

export function getWeeklyStats(weekStart: string) {
  return unwrap<WeeklyStatsPayload>(
    api.get("/stats/weekly", { params: { weekStart } })
  );
}
