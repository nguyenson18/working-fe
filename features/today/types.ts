import type { CalendarEvent } from "@/features/events/types";
import type { Task } from "@/features/tasks/types";

export type TodayPayload = {
  date: string; // YYYY-MM-DD
  timezone: string;
  range: {
    startLocal: string;
    endLocal: string;
    startUtc: string;
    endUtc: string;
  };
  userSettings: {
    workingStartMin: number;
    workingEndMin: number;
    defaultEventDurationMin: number;
    defaultReminderMin: number;
  };
  events: CalendarEvent[];
  tasks: {
    pinned: Task[];
    dueToday: Task[];
    scheduledToday: Task[];
    overdue: Task[];
  };
};
