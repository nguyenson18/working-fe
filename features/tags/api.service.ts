import { unwrap } from "@/src/lib/unwrap";
import { Tag } from "./types";
import { api } from "@/src/lib/api";


export function listTags() {
  return unwrap<Tag[]>(api.get("/tags"));
}

export function createTag(payload: { name: string; color?: string }) {
  return unwrap<Tag>(api.post("/tags", payload));
}

export function updateTag(id: string, payload: { name?: string; color?: string | null }) {
  return unwrap<Tag>(api.patch(`/tags/${id}`, payload));
}

export function deleteTag(id: string) {
  return unwrap<{ success: boolean }>(api.delete(`/tags/${id}`));
}
