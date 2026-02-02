
import { unwrap } from "@/src/lib/unwrap";
import type { Project } from "./types";
import { api } from "@/src/lib/api";

export function listProjects(includeArchived = false) {
  return unwrap<Project[]>(
    api.get("/projects", { params: { includeArchived } })
  );
}

export function createProject(payload: { name: string; color?: string }) {
  return unwrap<Project>(api.post("/projects", payload));
}

export function updateProject(id: string, payload: { name?: string; color?: string | null }) {
  return unwrap<Project>(api.patch(`/projects/${id}`, payload));
}

export function setProjectArchived(id: string, archived: boolean) {
  return unwrap<Project>(api.patch(`/projects/${id}/archive`, { archived }));
}

export function deleteProject(id: string) {
  return unwrap<{ success: boolean }>(api.delete(`/projects/${id}`));
}
