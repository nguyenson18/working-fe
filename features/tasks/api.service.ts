
import { api } from "@/src/lib/api";
import type { Task, TaskStatus, TaskPriority } from "./types";
import { unwrap } from "@/src/lib/unwrap";

export type ListTasksParams = {
    status?: TaskStatus;
    projectId?: string;
    q?: string;
    dueFrom?: string;
    dueTo?: string;
};

export type CreateTaskPayload = {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    projectId?: string;
    dueAt?: string;
    estimateMinutes?: number;
    pinned?: boolean;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export function listTasks(params: ListTasksParams) {
    return unwrap<Task[]>(api.get("/tasks", { params }));
}

export function createTask(payload: CreateTaskPayload) {
    return unwrap<Task>(api.post("/tasks", payload));
}

export function updateTask(id: string, payload: UpdateTaskPayload) {
    return unwrap<Task>(api.patch(`/tasks/${id}`, payload));
}

export function deleteTask(id: string) {
    return unwrap<{ success: boolean }>(api.delete(`/tasks/${id}`));
}

export function setTaskTags(taskId: string, tagIds: string[]) {
  return unwrap<{ success: boolean }>(api.patch(`/tasks/${taskId}/tags`, { tagIds }));
}