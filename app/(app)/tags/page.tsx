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
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Tag } from "@/features/tags/types";
import { useCreateTag, useDeleteTag, useTags, useUpdateTag } from "@/features/tags/hooks";

type TagForm = { name: string; color?: string };

export default function TagsPage() {
  const q = useTags();
  const createMut = useCreateTag();
  const updateMut = useUpdateTag();
  const deleteMut = useDeleteTag();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);

  const createForm = useForm<TagForm>({ defaultValues: { name: "", color: "" } });

  const submitCreate = async (v: TagForm) => {
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
            <Typography variant="h5" fontWeight={900}>Thẻ</Typography>
            <Typography variant="body2" color="text.secondary">
              Tạo thẻ để phân loại công việc .
            </Typography>
          </Box>

          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Tạo mới thẻ
          </Button>
        </Stack>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          {q.isLoading ? (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <Stack spacing={1}>
              {(q.data?.data ?? []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Chưa có thẻ nào.
                </Typography>
              ) : (
                (q.data?.data ?? []).map((t) => (
                  <Box
                    key={t.id}
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
                      <Typography fontWeight={900} noWrap>{t.name}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {t.color ? `Color: ${t.color}` : "No color"}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => setEditing(t)} aria-label="edit">
                        <EditOutlinedIcon />
                      </IconButton>

                      <IconButton
                        onClick={() => deleteMut.mutate(t.id)}
                        aria-label="delete"
                        disabled={deleteMut.isPending}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                ))
              )}
            </Stack>
          )}
        </Paper>
      </Stack>

      {/* Create */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New tag</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" {...createForm.register("name", { required: true })} />
            <TextField label="Color (optional)" placeholder="#d32f2f" {...createForm.register("color")} />
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
      <EditTagDialog
        tag={editing}
        onClose={() => setEditing(null)}
        onSave={(id, patch) => updateMut.mutate({ id, patch })}
      />
    </Container>
  );
}

function EditTagDialog({
  tag,
  onClose,
  onSave,
}: {
  tag: Tag | null;
  onClose: () => void;
  onSave: (id: string, patch: { name?: string; color?: string | null }) => void;
}) {
  const open = !!tag;
  const form = useForm<TagForm>({
    values: tag ? { name: tag.name, color: tag.color ?? "" } : undefined,
  });

  const submit = (v: TagForm) => {
    if (!tag) return;
    onSave(tag.id, {
      name: v.name.trim(),
      color: v.color?.trim() ? v.color.trim() : null,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit tag</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" {...form.register("name", { required: true })} />
          <TextField label="Color" placeholder="#d32f2f" {...form.register("color")} />
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
