export type Me = {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;

  timezone: string;
  workingStartMin: number;
  workingEndMin: number;
  defaultEventDurationMin: number;
  defaultReminderMin: number;

  createdAt: string;
  updatedAt: string;
};

export type UpdateSettingsPayload = Partial<Pick<
  Me,
  "timezone" | "workingStartMin" | "workingEndMin" | "defaultEventDurationMin" | "defaultReminderMin"
>>;
