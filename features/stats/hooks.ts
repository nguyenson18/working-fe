import { useQuery } from "@tanstack/react-query";
import { getWeeklyStats } from "./api.service";

export function useWeeklyStats(weekStart: string) {
  return useQuery({
    queryKey: ["stats", "weekly", weekStart],
    queryFn: () => getWeeklyStats(weekStart),
    enabled: !!weekStart,
  });
}
