import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, deleteTask, listTasks, ListTasksParams, setTaskTags, updateTask } from "./api.service";


export function useTasks(params: ListTasksParams) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => listTasks(params),
  });
}

export function useCreateTask(params: ListTasksParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", params] }),
  });
}

export function useUpdateTask(params: ListTasksParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => updateTask(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", params] }),
  });
}

export function useDeleteTask(params: ListTasksParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", params] }),
  });
}

export function useSetTaskTags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, tagIds }: { taskId: string; tagIds: string[] }) =>
      setTaskTags(taskId, tagIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
