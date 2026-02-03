"use client";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import type { EventInput } from "@fullcalendar/core";

import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { DateTime } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useTasks } from "@/features/tasks/hooks";
import {
  TaskPriorityGroups,
  TaskStatus,
  TaskStatusGroups,
  type Task,
} from "@/features/tasks/types";

import {
  useCreateEvent,
  useCreateTimeblock,
  useDeleteEvent,
  useEvents,
  useMarkLinkedTaskDone,
  useUpdateEvent,
} from "@/features/events/hooks";
import type { CalendarEvent } from "@/features/events/types";
import { useMe } from "@/features/user/hooks";
import viLocale from "@fullcalendar/core/locales/vi";

function minsToDuration(mins: number) {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
}

type CreateEventForm = {
  title: string;
  startLocal: string; // datetime-local string
  endLocal: string;
};

export default function CalendarPage() {
  // calendar visible range
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);

  // events query
  const eventsQ = useEvents(
    range ? { ...range, includeTask: true, includeReminders: true } : undefined,
  );

  // tasks sidebar (TODO + DOING)
  const todoQ = useTasks({ status: TaskStatus.TODO });
  const doingQ = useTasks({ status: TaskStatus.DOING });

  const meQ = useMe();
  const minTime = meQ.data?.data
    ? minsToHHMM(meQ.data.data.workingStartMin)
    : "06:00";
  const maxTime = meQ.data?.data
    ? minsToHHMM(meQ.data.data.workingEndMin)
    : "22:00";
  const defaultEventDurationMin = meQ.data?.data.defaultEventDurationMin;

  const tasks = useMemo(() => {
    const a = todoQ.data?.data ?? [];
    const b = doingQ.data?.data ?? [];
    // ưu tiên pinned lên đầu (nếu có)
    return [...a, ...b].sort((x, y) => Number(y.pinned) - Number(x.pinned));
  }, [todoQ.data?.data, doingQ.data?.data]);

  // mutations
  const createEventMut = useCreateEvent(range ?? undefined);
  const updateEventMut = useUpdateEvent();
  const deleteEventMut = useDeleteEvent();
  const createTimeblockMut = useCreateTimeblock();
  const markDoneMut = useMarkLinkedTaskDone();

  // external draggable tasks
  const taskListRef = useRef<HTMLDivElement | null>(null);
  const draggableRef = useRef<any>(null);

  useEffect(() => {
    if (!taskListRef.current) return;

    // cleanup old draggable (FullCalendar docs: draggable.destroy()) :contentReference[oaicite:1]{index=1}
    if (draggableRef?.current?.destroy) draggableRef.current.destroy();

    draggableRef.current = new Draggable(taskListRef.current, {
      itemSelector: ".fc-task",
      eventData: (el) => {
        const title = el.getAttribute("data-title") || "Task";
        const taskId = el.getAttribute("data-task-id") || "";
        const durationMin = Number(
          el.getAttribute("data-duration-min") || "60",
        );
        return {
          title,
          duration: minsToDuration(durationMin), // FullCalendar supports "HH:mm"
          extendedProps: { taskId },
        };
      },
    });

    return () => {
      if (draggableRef.current?.destroy) draggableRef.current.destroy();
    };
  }, [tasks.length]);

  // FullCalendar events input
  const fcEvents: EventInput[] | undefined = useMemo(() => {
    return eventsQ.data?.data.map((e: CalendarEvent) => ({
      id: e.id,
      title: e.title,
      start: e.startAt,
      end: e.endAt,
      allDay: e.allDay,
      extendedProps: {
        linkedTaskId: e.linkedTaskId ?? null,
        linkedTask: e.linkedTask ?? null,
      },
    }));
  }, [eventsQ.data?.data]);

  // create event dialog (from select)
  const [createOpen, setCreateOpen] = useState(false);
  const form = useForm<CreateEventForm>({
    defaultValues: { title: "", startLocal: "", endLocal: "" },
  });

  const openCreateWithRange = (start: Date, end: Date) => {
    form.reset({
      title: "",
      startLocal: DateTime.fromJSDate(start).toFormat("yyyy-LL-dd'T'HH:mm"),
      endLocal: DateTime.fromJSDate(end).toFormat("yyyy-LL-dd'T'HH:mm"),
    });
    setCreateOpen(true);
  };

  const submitCreate = async (v: CreateEventForm) => {
    const startAt = new Date(v.startLocal).toISOString();
    const endAt = new Date(v.endLocal).toISOString();
    await createEventMut.mutateAsync({ title: v.title.trim(), startAt, endAt });
    setCreateOpen(false);
  };

  function minsToHHMM(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // event details dialog
  const [selected, setSelected] = useState<{
    id: string;
    title: string;
    start?: Date;
    end?: Date;
    linkedTaskId?: string | null;
    linkedTask?: Task | null;
  } | null>(null);

  const closeSelected = () => setSelected(null);

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={800} sx={{ color: "black" }}>
          Quản lý lịch biểu
        </Typography>

        <Stack direction={"row"} spacing={1}>
          {/* LEFT: Tasks draggable */}
          <Paper sx={{ p: 2, borderRadius: 2, minWidth: "250px" }}>
            <Typography fontWeight={800} sx={{ mb: 1 }}>
              Công việc (kéo thả vào lịch)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Chỉ hiển thị Cần làm/Đang làm
            </Typography>

            <Divider sx={{ mb: 1 }} />

            <Box ref={taskListRef}>
              <Stack spacing={1}>
                {(tasks ?? []).map((t) => (
                  <Box
                    key={t.id}
                    className="fc-task"
                    data-task-id={t.id}
                    data-title={t.title}
                    data-duration-min={defaultEventDurationMin ?? 60}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 1.25,
                      cursor: "grab",
                      userSelect: "none",
                    }}
                  >
                    <Typography fontWeight={700} noWrap>
                      {t.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {`${defaultEventDurationMin} phút`}•{" "}
                      {
                        TaskPriorityGroups.find(
                          (item) => item.value === t.priority,
                        )?.display
                      }
                      {t.pinned ? " • Đã ghim" : ""}
                    </Typography>
                  </Box>
                ))}
                {!tasks.length && (
                  <Typography variant="body2" color="text.secondary">
                    Không có công việc Cần làm/Đang làm.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Paper>

          {/* RIGHT: Calendar */}
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              height="auto"
              nowIndicator
              editable
              selectable
              droppable
              eventStartEditable
              eventDurationEditable
              allDaySlot={false}
              slotMinTime={minTime}
              slotMaxTime={maxTime}
              locale={viLocale}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "timeGridDay,timeGridWeek",
              }}
              datesSet={(arg) => {
                // arg.start/arg.end là Date (end exclusive)
                setRange({
                  from: arg.start.toISOString(),
                  to: arg.end.toISOString(),
                });
              }}
              events={fcEvents}
              select={(info) => {
                openCreateWithRange(info.start, info.end);
              }}
              eventReceive={async (info) => {
                // External task dropped -> create timeblock in BE
                const taskId = info.event.extendedProps?.taskId as
                  | string
                  | undefined;
                const startAt = info.event.start?.toISOString();
                const endAt = info.event.end?.toISOString();

                // remove temp event first (BE will be source of truth)
                info.event.remove();

                if (!taskId || !startAt) return;
                await createTimeblockMut.mutateAsync({
                  taskId,
                  startAt,
                  endAt,
                });
              }}
              eventDrop={async (info) => {
                try {
                  await updateEventMut.mutateAsync({
                    id: info.event.id,
                    patch: {
                      startAt: info.event.start?.toISOString(),
                      endAt: info.event.end?.toISOString(),
                    },
                  });
                } catch {
                  info.revert();
                }
              }}
              eventResize={async (info) => {
                try {
                  await updateEventMut.mutateAsync({
                    id: info.event.id,
                    patch: {
                      startAt: info.event.start?.toISOString(),
                      endAt: info.event.end?.toISOString(),
                    },
                  });
                } catch {
                  info.revert();
                }
              }}
              eventClick={(info) => {
                const ep = info.event.extendedProps;
                setSelected({
                  id: info.event.id,
                  title: info.event.title,
                  start: info.event.start ?? undefined,
                  end: info.event.end ?? undefined,
                  linkedTaskId: ep?.linkedTaskId ?? null,
                  linkedTask: ep?.linkedTask ?? null,
                });
              }}
            />
          </Paper>
        </Stack>
      </Stack>

      {/* Create Event Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Tạo event</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              {...form.register("title", { required: true })}
            />
            <TextField
              label="Start"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              {...form.register("startLocal", { required: true })}
            />
            <TextField
              label="End"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              {...form.register("endLocal", { required: true })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={form.handleSubmit(submitCreate)}
            disabled={createEventMut.isPending}
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selected} onClose={closeSelected} fullWidth maxWidth="sm">
        <DialogTitle>Chi tiết sự kiện</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {selected && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Typography fontWeight={800}>{selected.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selected.start
                  ? DateTime.fromJSDate(selected.start).toFormat(
                      "dd/LL/yyyy HH:mm",
                    )
                  : ""}
                {"  "}→{"  "}
                {selected.end
                  ? DateTime.fromJSDate(selected.end).toFormat(
                      "dd/LL/yyyy HH:mm",
                    )
                  : ""}
              </Typography>

              <Divider />

              {selected.linkedTaskId ? (
                <Box>
                  <Typography fontWeight={700}>Nhiệm vụ liên kết</Typography>
                  <Typography variant="body2">
                    {selected.linkedTask?.title ?? selected.linkedTaskId}
                    {selected.linkedTask?.status
                      ? ` • ${TaskStatusGroups.find((item) => item.value === selected?.linkedTask?.status)?.display}`
                      : ""}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => markDoneMut.mutate(selected.id)}
                      disabled={markDoneMut.isPending}
                    >
                      Đánh dấu nhiệm vụ
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sự kiện này không liên kết công việc.
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSelected}>Đóng</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!selected) return;
              await deleteEventMut.mutateAsync(selected.id);
              closeSelected();
            }}
            disabled={deleteEventMut.isPending}
          >
            Xóa sự kiện
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
