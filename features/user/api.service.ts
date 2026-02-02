
import { unwrap } from "@/src/lib/unwrap";
import type { Me, UpdateSettingsPayload } from "./types";
import { api } from "@/src/lib/api";

export function getMe() {
  return unwrap<Me>(api.get("/users/me"));
}

export function updateSettings(payload: UpdateSettingsPayload) {
  return unwrap<Me>(api.patch("/users/me/settings", payload));
}
