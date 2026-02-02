
import { unwrap } from "@/src/lib/unwrap";
import type { CalendarEvent } from "./types";
import { api } from "@/src/lib/api";

export type ListEventsParams = {
    from: string; // ISO
    to: string;   // ISO
    includeTask?: boolean;
    includeReminders?: boolean;
};

export function listEvents(params: ListEventsParams) {
    return unwrap<CalendarEvent[]>(
        api.get("/events", { params })
    );
}

export function createEvent(payload: {
    title: string;
    description?: string | null;
    startAt: string;
    endAt: string;
    allDay?: boolean;
    reminderMinutes?: number[];
}) {
    return unwrap<CalendarEvent>(api.post("/events", payload));
}

export function updateEvent(id: string, patch: Partial<{
    title: string;
    description: string | null;
    startAt: string;
    endAt: string;
    allDay: boolean;
    linkedTaskId: string | null;
    reminderMinutes: number[];
}>) {
    return unwrap<CalendarEvent>(api.patch(`/events/${id}`, patch));
}

export function deleteEvent(id: string) {
    return unwrap<{ success: boolean }>(api.delete(`/events/${id}`));
}

export function createTimeblock(payload: {
    taskId: string;
    startAt: string;
    endAt?: string;
    durationMinutes?: number;
    reminderMinutes?: number[];
}) {
    return unwrap<CalendarEvent>(api.post("/events/timeblocks", payload));
}

export function markLinkedTaskDone(eventId: string) {
    return unwrap<{ success: boolean; event: CalendarEvent }>(
        api.patch(`/events/${eventId}/linked-task/done`)
    );
}
