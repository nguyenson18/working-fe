"use client";

import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  TextField,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { useWeeklyStats } from "@/features/stats/hooks";

function weekStartMondayISO(dt: DateTime) {
  // dt.weekday: 1=Mon ... 7=Sun
  return dt.minus({ days: dt.weekday - 1 }).toISODate()!;
}

export default function WeeklyReviewPage() {
  const [weekStart, setWeekStart] = useState(() =>
    weekStartMondayISO(DateTime.local())
  );

  const q = useWeeklyStats(weekStart);

  const title = useMemo(() => {
    const start = DateTime.fromISO(weekStart);
    const end = start.plus({ days: 6 });
    return `${start.toFormat("dd/LL")} – ${end.toFormat("dd/LL/yyyy")}`;
  }, [weekStart]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Box>
            <Typography variant="h5" fontWeight={900} sx={{color:'black'}}>Tông kết tuần</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
          </Box>

          <TextField
            label="Ngày bắt đầu"
            type="date"
            size="small"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        {q.isLoading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : q.data ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
              alignItems: "start",
            }}
          >
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography fontWeight={900}>Thống kê</Typography>
              <Divider sx={{ my: 1 }} />

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`Hoàn thành: ${q.data.data.stats.tasksCompletedCount}`} />
                <Chip label={`Mới tạo: ${q.data.data.stats.tasksCreatedCount}`} />
                <Chip label={`Sự kiện: ${q.data.data.stats.eventsCount}`} />
                <Chip label={`Giờ làm việc theo sự kiện: ${q.data.data.stats.totalScheduledHours}`} />
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Timezone: {q.data.data.timezone}
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography fontWeight={900}>Công việc chưa hoàn thành</Typography>
              <Divider sx={{ my: 1 }} />

              <Stack spacing={1}>
                {q.data.data.lists.unfinishedCandidates.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Không có task tồn.</Typography>
                ) : (
                  q.data.data.lists.unfinishedCandidates.map((t) => (
                    <Box
                      key={t.id}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 1.25,
                      }}
                    >
                      <Typography fontWeight={800} noWrap>{t.title}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {t.dueAt ? `Ngày ${DateTime.fromISO(t.dueAt).toFormat("dd/LL HH:mm")}` : "No due date"}
                        {" • "}
                        {t.priority}
                        {" • "}
                        {t.status}
                      </Typography>
                    </Box>
                  ))
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography fontWeight={900}>Hạn chót</Typography>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={1}>
                {(q.data.data.lists.dueThisWeek ?? []).map((t) => (
                  <Typography key={t.id} variant="body2">
                    • {t.title}
                  </Typography>
                ))}
                {!q.data.data.lists.dueThisWeek?.length && (
                  <Typography variant="body2" color="text.secondary">Trống</Typography>
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography fontWeight={900}>Lịch tuần này</Typography>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={1}>
                {(q.data.data.lists.scheduledThisWeek ?? []).map((t) => (
                  <Typography key={t.id} variant="body2">
                    • {t.title}
                  </Typography>
                ))}
                {!q.data.data.lists.scheduledThisWeek?.length && (
                  <Typography variant="body2" color="text.secondary">Trống</Typography>
                )}
              </Stack>
            </Paper>
          </Box>
        ) : null}
      </Stack>
    </Container>
  );
}
