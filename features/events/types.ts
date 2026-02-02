import type { Task } from "@/features/tasks/types";

export type Reminder = {
  id: string;
  minutesBefore: number;
};

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string | null;
  startAt: string; // ISO
  endAt: string;   // ISO
  allDay: boolean;

  linkedTaskId?: string | null;
  linkedTask?: Task | null;

  reminders?: Reminder[];
};
