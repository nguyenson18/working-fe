import type { Task } from "@/features/tasks/types";

export type WeeklyStatsPayload = {
  weekStart: string; // YYYY-MM-DD
  timezone: string;
  range: {
    startLocal: string;
    endLocal: string;
    startUtc: string;
    endUtc: string;
  };
  stats: {
    tasksCompletedCount: number;
    tasksCreatedCount: number;
    eventsCount: number;
    totalScheduledMinutes: number;
    totalScheduledHours: number;
  };
  lists: {
    dueThisWeek: Task[];
    scheduledThisWeek: Task[];
    unfinishedCandidates: Task[];
  };
};
