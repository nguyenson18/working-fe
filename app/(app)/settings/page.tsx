"use client";

import {
  Box,
  Button,
  Container,
  Divider,
  MenuItem,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMe, useUpdateSettings } from "@/features/user/hooks";
import { notifier } from "@/src/lib/notifier";


const timezones = [
  { label: "Việt Nam (Asia/Ho_Chi_Minh)", value: "Asia/Ho_Chi_Minh" },
  { label: "Singapore (Asia/Singapore)", value: "Asia/Singapore" },
  { label: "Tokyo (Asia/Tokyo)", value: "Asia/Tokyo" },
  { label: "Seoul (Asia/Seoul)", value: "Asia/Seoul" },
  { label: "London (Europe/London)", value: "Europe/London" },
  { label: "New York (America/New_York)", value: "America/New_York" },
];

const schema = z.object({
  timezone: z.string().min(1),

  workingStartMin: z.number().int().min(0).max(1440),
  workingEndMin: z.number().int().min(0).max(1440),

  defaultEventDurationMin: z.number().int().min(5).max(720),
  defaultReminderMin: z.number().int().min(0).max(1440),
}).refine((v) => v.workingEndMin > v.workingStartMin, {
  message: "Giờ kết thúc phải lớn hơn giờ bắt đầu",
  path: ["workingEndMin"],
});

type FormValues = z.infer<typeof schema>;

function minsToHHMM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function hhmmToMins(hhmm: string) {
  // expects "HH:MM"
  const [h, m] = hhmm.split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return Math.min(1440, Math.max(0, h * 60 + m));
}

export default function SettingsPage() {
  const meQ = useMe();
  const updateMut = useUpdateSettings();

  const defaults = useMemo<FormValues>(() => {
    const me = meQ.data;
    return {
      timezone: me?.data.timezone ?? "Asia/Ho_Chi_Minh",
      workingStartMin: me?.data.workingStartMin ?? 480,
      workingEndMin: me?.data.workingEndMin ?? 1080,
      defaultEventDurationMin: me?.data.defaultEventDurationMin ?? 60,
      defaultReminderMin: me?.data.defaultReminderMin ?? 10,
    };
  }, [meQ.data]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  // Khi me load xong thì reset form
  useEffect(() => {
    if (meQ.data) form.reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meQ.data]);

  const onSubmit = async (v: FormValues) => {
    try {
      await updateMut.mutateAsync(v);
    } catch (e) {
      // interceptor sẽ show snackbar rồi, nhưng để chắc
      notifier("Cập nhật thất bại", {variant: 'error'});
    }
  };

  if (meQ.isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Cài đặt</Typography>
            <Typography variant="body2" color="text.secondary">
              Thiết lập thời gian, giờ làm việc và mặc định cho lịch.
            </Typography>
          </Box>

          <Divider />

          {/* Timezone */}
          <TextField
            label="Múi giờ"
            select
            value={form.watch("timezone")}
            onChange={(e) => form.setValue("timezone", e.target.value, { shouldValidate: true })}
          >
            {timezones.map((tz) => (
              <MenuItem key={tz.value} value={tz.value}>
                {tz.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Working hours */}
          <Box>
            <Typography fontWeight={800} sx={{ mb: 1 }}>
              Giờ làm việc
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Giờ bắt đầu"
                type="time"
                value={minsToHHMM(form.watch("workingStartMin"))}
                onChange={(e) =>
                  form.setValue("workingStartMin", hhmmToMins(e.target.value), { shouldValidate: true })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Giờ kết thúc"
                type="time"
                value={minsToHHMM(form.watch("workingEndMin"))}
                onChange={(e) =>
                  form.setValue("workingEndMin", hhmmToMins(e.target.value), { shouldValidate: true })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
                error={!!form.formState.errors.workingEndMin}
                helperText={form.formState.errors.workingEndMin?.message}
              />
            </Stack>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {minsToHHMM(form.watch("workingStartMin"))} – {minsToHHMM(form.watch("workingEndMin"))}
              </Typography>

              <Controller
                control={form.control}
                name="workingStartMin"
                render={({ field }) => (
                  <Slider
                    value={field.value}
                    min={0}
                    max={1440}
                    step={15}
                    onChange={(_, v) => field.onChange(v)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => minsToHHMM(v as number)}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="workingEndMin"
                render={({ field }) => (
                  <Slider
                    value={field.value}
                    min={0}
                    max={1440}
                    step={15}
                    onChange={(_, v) => field.onChange(v)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => minsToHHMM(v as number)}
                  />
                )}
              />
            </Box>
          </Box>

          <Divider />

          {/* Default event duration */}
          <Box>
            <Typography fontWeight={800} sx={{ mb: 1 }}>
              Thời lượng 
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Controller
                control={form.control}
                name="defaultEventDurationMin"
                render={({ field }) => (
                  <Slider
                    value={field.value}
                    min={5}
                    max={240}
                    step={5}
                    onChange={(_, v) => field.onChange(v)}
                    valueLabelDisplay="auto"
                  />
                )}
              />
              <TextField
                type="number"
                size="small"
                sx={{ width: 120 }}
                value={form.watch("defaultEventDurationMin")}
                onChange={(e) =>
                  form.setValue("defaultEventDurationMin", Number(e.target.value || 0), { shouldValidate: true })
                }
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Dùng khi kéo công việc vào lịch mà công việc chưa có quản lý.
            </Typography>
          </Box>

          {/* Default reminder */}
          <Box>
            <Typography fontWeight={800} sx={{ mb: 1 }}>
              Thời gian nhắc
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Controller
                control={form.control}
                name="defaultReminderMin"
                render={({ field }) => (
                  <Slider
                    value={field.value}
                    min={0}
                    max={120}
                    step={5}
                    onChange={(_, v) => field.onChange(v)}
                    valueLabelDisplay="auto"
                  />
                )}
              />
              <TextField
                type="number"
                size="small"
                sx={{ width: 120 }}
                value={form.watch("defaultReminderMin")}
                onChange={(e) =>
                  form.setValue("defaultReminderMin", Number(e.target.value || 0), { shouldValidate: true })
                }
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              0 = tắt nhắc mặc định.
            </Typography>
          </Box>

          <Divider />

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => form.reset(defaults)}
              disabled={updateMut.isPending}
            >
              Khôi phục
            </Button>

            <Button
              variant="contained"
              onClick={form.handleSubmit(onSubmit)}
              disabled={updateMut.isPending}
            >
              {updateMut.isPending ? "Đang lưu..." : "Lưu cài đặt"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
