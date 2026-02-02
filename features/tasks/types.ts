export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

export const TaskPriorityGroups = [
  {
    display: "Thấp",
    value: TaskPriority.LOW
  },
  {
    display: "Trung bình",
    value: TaskPriority.MEDIUM
  },
  {
    display: "Cao",
    value: TaskPriority.HIGH
  },
]

export enum TaskStatus {
  TODO = "TODO",
  DOING = "DOING",
  DONE = "DONE"
}

export const TaskStatusGroups = [
  {
    display: "Cần làm",
    value: TaskStatus.TODO
  },
  {
    display: "Đang làm",
    value: TaskStatus.DOING
  },
  {
    display: "Đã xong",
    value: TaskStatus.DONE
  }
]

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string | null;
  estimateMinutes?: number ;
  pinned: boolean;
  projectId?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  tagIds?: string[]
};
