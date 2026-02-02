import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  createTimeblock,
  deleteEvent,
  listEvents,
  markLinkedTaskDone,
  updateEvent,
  type ListEventsParams
} from "./api.service";

export function useEvents(params?: ListEventsParams) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => listEvents(params!),
    enabled: !!params?.from && !!params?.to,
  });
}

export function useCreateEvent(params?: ListEventsParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => updateEvent(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useCreateTimeblock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTimeblock,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useMarkLinkedTaskDone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => markLinkedTaskDone(eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["tasks"] }); // để list task cập nhật DONE
    },
  });
}
