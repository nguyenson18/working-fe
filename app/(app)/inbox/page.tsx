"use client";

import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { DateTime } from "luxon";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from "@/features/tasks/hooks";
import {
  type Task,
  TaskStatus,
  TaskPriority,
  TaskStatusGroups,
  TaskPriorityGroups,
} from "@/features/tasks/types";
import { useProjects } from "@/features/projects/hooks";
import { Project } from "@/features/projects/types";
import { Autocomplete, Chip } from "@mui/material";
import { useTags } from "@/features/tags/hooks";
import { useSetTaskTags } from "@/features/tasks/hooks";
import type { Tag } from "@/features/tags/types";
import {
  SdButton,
  SdCheckBox,
  SdDate,
  SdInput,
  SdInputNumber,
  SdSelect,
} from "@/components";

type EditForm = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string; // ISO
  estimateMinutes?: number;
  pinned: boolean;
  projectId?: string | null;
};

export default function InboxPage() {
  const [status, setStatus] = useState<TaskStatus>();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<Task>>({});
  const [projectId, setProjectId] = useState<string>();
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const params = useMemo(
    () => ({
      status: status,
      q: q.trim() || undefined,
      projectId: projectId,
    }),
    [status, q, projectId],
  );
  const { data, isLoading } = useTasks(params);
  const createMut = useCreateTask(params);
  const updateMut = useUpdateTask(params);
  const deleteMut = useDeleteTask(params);
  const projectsQ = useProjects(false);

  const onQuickAdd = async () => {
    if (!title) return;
    await createMut.mutateAsync({ title, priority: TaskPriority.MEDIUM });
    setTitle("");
  };

  const markDone = (task: Task, done: boolean) => {
    updateMut.mutate({
      id: task.id,
      patch: { status: done ? "DONE" : "TODO" },
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={800} sx={{ color: "black" }}>
          Danh sách Công việc
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems="stretch"
        >
          <TextField
            size="small"
            placeholder="Tìm công việc..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
          />
          <SdSelect
            items={TaskStatusGroups}
            value={status}
            sdChange={(item: any, value: any) => {
              setStatus(value);
            }}
          />
          <SdSelect
            items={
              projectsQ.data?.data.map((item) => ({
                display: item.name,
                value: item.id,
              })) || []
            }
            value={projectId}
            sdChange={(item: any, value: any) => {
              setProjectId(value);
            }}
          />
        </Stack>
        <Stack direction={"row"} spacing={1}>
          <SdInput
            placeholder="Thêm công việc nhanh..."
            value={title}
            sdChange={(value) => {
              setTitle(value);
            }}
          />
          <SdButton
            type="submit"
            variant="contained"
            disabled={createMut.isPending}
            label="Thêm"
            onClick={onQuickAdd}
          />
        </Stack>

        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack spacing={1}>
            {data?.data?.map((t) => (
              <Box
                key={t.id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Checkbox
                  checked={t.status === "DONE"}
                  onChange={(e) => markDone(t, e.target.checked)}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    fontWeight={700}
                    sx={{
                      textDecoration:
                        t.status === "DONE" ? "line-through" : "none",
                      opacity: t.status === "DONE" ? 0.6 : 1,
                    }}
                    noWrap
                  >
                    {t.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" noWrap>
                    {t.dueAt
                      ? `Quá hạn: ${DateTime.fromISO(t.dueAt).toFormat(
                          "dd/LL HH:mm",
                        )}`
                      : "Không có ngày đến hạn"}
                    {" • "}
                    Ưu tiên:{" "}
                    {
                      TaskPriorityGroups.find(
                        (item) => item.value === t.priority,
                      )?.display
                    }
                    {t.pinned ? " • Đã ghim" : ""}
                  </Typography>
                </Box>

                <SdButton
                  icon={<EditOutlinedIcon />}
                  onClick={() => {
                    setEditing(t);
                    setOpenPopup(!openPopup);
                  }}
                />

                <SdButton
                  icon={<DeleteOutlineIcon />}
                  onClick={() => deleteMut.mutate(t.id)}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Stack>

      <EditTaskDialog
        open={openPopup}
        task={editing}
        onClose={() => setOpenPopup(false)}
        projects={projectsQ.data?.data ?? []}
        onSave={(id, patch) => updateMut.mutate({ id, patch })}
      />
    </Container>
  );
}

function EditTaskDialog({
  open,
  task,
  onClose,
  onSave,
  projects,
}: {
  open: boolean;
  task: Partial<Task>;
  onClose: () => void;
  onSave: (id: string, patch: Partial<EditForm>) => void;
  projects: Project[];
}) {
  const tagsQ = useTags();
  const setTagsMut = useSetTaskTags();
  const [selectedTags, setSelectedTags] = useState<string[]>();
  const [req, setReq] = useState<Partial<Task>>({});

  useEffect(() => {
    setReq(task);
    setSelectedTags(task?.tagIds);
  }, [task]);
  const form = useForm<EditForm>();

  const submit = async (v: EditForm) => {
    if (!req.id) return;
    // 1) update task fields
    onSave(req.id, {
      title: req.title?.trim(),
      description: req.description?.trim() || "",
      status: req.status,
      priority: req.priority,
      dueAt: req.dueAt ? new Date(req.dueAt).toISOString() : "",
      estimateMinutes: req.estimateMinutes ?? 0,
      pinned: req.pinned,
      projectId:
        (req as any).projectId === "NONE" ? "" : (req as any).projectId,
    });

    // 2) update tags ONLY if user touched tags
    await setTagsMut.mutateAsync({
      taskId: req.id,
      tagIds: selectedTags || [],
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chỉnh sửa công việc</DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <SdInput
            label="Tiêu đề"
            value={req.title}
            sdChange={(value) => setReq({ ...req, title: value })}
          />
          <SdSelect
            items={
              projects.map((item) => ({
                display: item.name,
                value: item.id,
              })) || []
            }
            value={req.projectId}
            sdChange={(item: any, value: any) => {
              setReq({ ...req, projectId: value });
            }}
          />
          <SdSelect
            label="Thẻ"
            multiple
            items={
              tagsQ.data?.data.map((item) => ({
                display: item.name,
                value: item.id,
              })) || []
            }
            value={selectedTags}
            sdChange={(item: any, value: any) => setSelectedTags(value)}
          />
          <SdInput
            value={req.description}
            placeholder="Mô tả"
            multiline
            rows={3}
            sdChange={(value) => setReq({ ...req, description: value })}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <SdSelect
              items={TaskStatusGroups}
              value={req.status}
              sdChange={(item: any, value: any) => {
                setReq({ ...req, status: value });
              }}
            />
            <SdSelect
              items={TaskPriorityGroups || []}
              value={req.priority}
              sdChange={(item: any, value: any) => {
                setReq({ ...req, priority: value });
              }}
            />
          </Stack>
          {/* <SdDate
            value={req.dueAt || ""}
            sdChange={(value) => setReq({ ...req, dueAt: value })}
          /> */}
          <TextField
            label="DueAt (local)"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            onChange={(e) => {
              setReq({ ...req, dueAt: e.target.value });
            }}
          />
          <SdInput
            label="Thời gian dự kiến (m)"
            value={req.estimateMinutes}
            type="number"
            sdChange={(value) =>
              setReq({ ...req, estimateMinutes: Number(value) })
            }
          />

          <Stack direction="row" alignItems="center">
            <SdCheckBox
              value={req.pinned}
              sdChange={(value) => setReq({ ...req, pinned: value })}
            />
            <Typography>Ghim</Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={form.handleSubmit(submit)}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
