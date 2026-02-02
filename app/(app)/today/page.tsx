"use client";

import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { useToday } from "@/features/today/hooks";
import { useMarkLinkedTaskDone } from "@/features/events/hooks";
import { TaskStatusGroups } from "@/features/tasks/types";

function fmtTime(iso?: string | null) {
  if (!iso) return "";
  return DateTime.fromISO(iso).toFormat("HH:mm");
}

function fmtDateTitle(yyyyMMdd: string) {
  const dt = DateTime.fromISO(yyyyMMdd);
  return dt.toFormat("cccc, dd/LL/yyyy");
}

export default function TodayPage() {
  const [date, setDate] = useState(() => DateTime.local().toISODate()!);

  const q = useToday(date);
  const markDoneMut = useMarkLinkedTaskDone();

  const events = useMemo(() => {
    const arr = q.data?.data?.events ?? [];
    return [...arr].sort((a, b) =>
      (a.startAt || "").localeCompare(b.startAt || ""),
    );
  }, [q.data?.data?.events]);

  const goPrev = () =>
    setDate(DateTime.fromISO(date).minus({ days: 1 }).toISODate()!);
  const goNext = () =>
    setDate(DateTime.fromISO(date).plus({ days: 1 }).toISODate()!);
  const goToday = () => setDate(DateTime.local().toISODate()!);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
        >
          <Box>
            <Typography variant="h5" fontWeight={900} sx={{ color: "black" }}>
              Hôm nay
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fmtDateTitle(date)}
              {q.data?.data.timezone ? ` • ${q.data?.data?.timezone}` : ""}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={goPrev}>
              Hôm qua
            </Button>
            <Button variant="outlined" onClick={goToday}>
              Hôm nay
            </Button>
            <Button variant="outlined" onClick={goNext}>
              Ngày mai
            </Button>
          </Stack>
        </Stack>

        {q.isLoading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "420px 1fr" },
              gap: 2,
              alignItems: "start",
            }}
          >
            {/* LEFT: Tasks groups */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography fontWeight={900} sx={{ mb: 1 }}>
                Danh sách công việc
              </Typography>

              <TaskGroup
                title="Đã ghim"
                items={q.data?.data?.tasks.pinned ?? []}
              />
              <Divider sx={{ my: 1 }} />
              <TaskGroup
                title="Quá hạn"
                items={q.data?.data?.tasks.overdue ?? []}
                highlight="error"
              />
              <Divider sx={{ my: 1 }} />
              <TaskGroup
                title="Hạn hôm nay"
                items={q.data?.data?.tasks.dueToday ?? []}
                highlight="warning"
              />
              <Divider sx={{ my: 1 }} />
              <TaskGroup
                title="Công việc hôm nay"
                items={q.data?.data?.tasks.scheduledToday ?? []}
              />
            </Paper>

            {/* RIGHT: Events list */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography fontWeight={900}>Đã lên lịch</Typography>
                <Typography variant="body2" color="text.secondary">
                  {q.data?.data?.userSettings
                    ? `Giờ làm việc: ${minsToHHMM(
                        q.data.data?.userSettings.workingStartMin,
                      )}–${minsToHHMM(q.data.data?.userSettings.workingEndMin)}`
                    : ""}
                </Typography>
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Stack spacing={1}>
                {events.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Hôm nay chưa có event nào.
                  </Typography>
                ) : (
                  events.map((ev) => (
                    <Box
                      key={ev.id}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 1.5,
                        display: "flex",
                        gap: 1.5,
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={800} noWrap>
                          {fmtTime(ev.startAt)}–{fmtTime(ev.endAt)} • {ev.title}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                        >
                          {ev.linkedTaskId ? (
                            <Chip
                              size="small"
                              label={`Task: ${
                                ev.linkedTask?.title ?? ev.linkedTaskId
                              }`}
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              size="small"
                              label="No linked task"
                              variant="outlined"
                            />
                          )}

                          {ev.linkedTask?.status ? (
                            <Chip
                              size="small"
                              label={
                                TaskStatusGroups.find(
                                  (item) =>
                                    item.value === ev.linkedTask?.status,
                                )?.display
                              }
                            />
                          ) : null}
                        </Stack>
                      </Box>

                      {ev.linkedTaskId ? (
                        <Button
                          variant="outlined"
                          onClick={() => markDoneMut.mutate(ev.id)}
                          disabled={markDoneMut.isPending}
                        >
                          Hoàn thành
                        </Button>
                      ) : null}
                    </Box>
                  ))
                )}
              </Stack>
            </Paper>
          </Box>
        )}
      </Stack>
    </Container>
  );
}

function TaskGroup({
  title,
  items,
  highlight,
}: {
  title: string;
  items: any[];
  highlight?: "error" | "warning";
}) {
  const color =
    highlight === "error"
      ? "error.main"
      : highlight === "warning"
        ? "warning.main"
        : "text.primary";

  return (
    <Box>
      <Typography fontWeight={900} sx={{ mb: 1, color }}>
        {title} ({items.length})
      </Typography>
      <Stack spacing={1}>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Trống
          </Typography>
        ) : (
          items.map((t) => (
            <Box
              key={t.id}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 1.25,
              }}
            >
              <Typography fontWeight={800} noWrap>
                {t.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {t.dueAt
                  ? `Due ${DateTime.fromISO(t.dueAt).toFormat("dd/LL HH:mm")}`
                  : "No due date"}
                {" • "}
                {t.priority}
                {t.pinned ? " • Pinned" : ""}
              </Typography>
            </Box>
          ))
        )}
      </Stack>
    </Box>
  );
}

function minsToHHMM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
