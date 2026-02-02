import { unwrap } from "@/src/lib/unwrap";
import type { TodayPayload } from "./types";
import { api } from "@/src/lib/api";


export function getToday(date?: string) {
  return unwrap<TodayPayload>(api.get("/today", { params: date ? { date } : {} }));
}
