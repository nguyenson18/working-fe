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
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { Project } from "@/features/projects/types";
import {
  useArchiveProject,
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/features/projects/hooks";

type ProjectForm = { name: string; color?: string };

export default function ProjectsPage() {
  const [includeArchived, setIncludeArchived] = useState(false);

  const q = useProjects(includeArchived);
  const createMut = useCreateProject();
  const updateMut = useUpdateProject();
  const archiveMut = useArchiveProject();
  const deleteMut = useDeleteProject();

  const [editing, setEditing] = useState<Project | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const list = useMemo(() => q.data?.data ?? [], [q.data?.data]);

  const createForm = useForm<ProjectForm>({ defaultValues: { name: "", color: "" } });

  const submitCreate = async (v: ProjectForm) => {
    const name = v.name.trim();
    if (!name) return;
    await createMut.mutateAsync({ name, color: v.color?.trim() || undefined });
    createForm.reset({ name: "", color: "" });
    setCreateOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Dự án</Typography>
            <Typography variant="body2" color="text.secondary">
              Tạo dự án để lọc công việc theo nhóm.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">Lưu trữ</Typography>
            <Switch checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} />
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              Tạo mới dự án
            </Button>
          </Stack>
        </Stack>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          {q.isLoading ? (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <Stack spacing={1}>
              {list.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Chưa có project nào.
                </Typography>
              ) : (
                list.map((p) => {
                  const isArchived = !!p.archivedAt;
                  return (
                    <Box
                      key={p.id}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={900} noWrap>
                          {p.name} {isArchived ? " (archived)" : ""}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {p.color ? `Color: ${p.color}` : "No color"}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => setEditing(p)} aria-label="edit">
                          <EditOutlinedIcon />
                        </IconButton>

                        <IconButton
                          onClick={() => archiveMut.mutate({ id: p.id, archived: !isArchived })}
                          aria-label="archive"
                          disabled={archiveMut.isPending}
                        >
                          {isArchived ? <UnarchiveOutlinedIcon /> : <ArchiveOutlinedIcon />}
                        </IconButton>

                        <IconButton
                          onClick={() => deleteMut.mutate(p.id)}
                          aria-label="delete"
                          disabled={deleteMut.isPending}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    </Box>
                  );
                })
              )}
            </Stack>
          )}
        </Paper>
      </Stack>

      {/* Create */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New project</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" {...createForm.register("name", { required: true })} />
            <TextField label="Color (optional)" placeholder="#1976d2" {...createForm.register("color")} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createForm.handleSubmit(submitCreate)} disabled={createMut.isPending}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit */}
      <EditProjectDialog
        project={editing}
        onClose={() => setEditing(null)}
        onSave={(id, patch) => updateMut.mutate({ id, patch })}
      />
    </Container>
  );
}

function EditProjectDialog({
  project,
  onClose,
  onSave,
}: {
  project: Project | null;
  onClose: () => void;
  onSave: (id: string, patch: { name?: string; color?: string | null }) => void;
}) {
  const open = !!project;
  const form = useForm<ProjectForm>({
    values: project ? { name: project.name, color: project.color ?? "" } : undefined,
  });

  const submit = (v: ProjectForm) => {
    if (!project) return;
    onSave(project.id, {
      name: v.name.trim(),
      color: v.color?.trim() ? v.color.trim() : null,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit project</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" {...form.register("name", { required: true })} />
          <TextField label="Color" placeholder="#1976d2" {...form.register("color")} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={form.handleSubmit(submit)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
