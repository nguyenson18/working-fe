import { useQuery } from "@tanstack/react-query";
import { getToday } from "./api.service";

export function useToday(date?: string) {
  return useQuery({
    queryKey: ["today", date],
    queryFn: () => getToday(date),
  });
}
