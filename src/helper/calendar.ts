import type { User, Weekday } from "@/types/users";
import type { EventSourceInput } from "@fullcalendar/react";

export type CalendarDialogInfo =
  | { Isopen: true; user: User | undefined }
  | { Isopen: false; user?: never };

const WEEKDAY_NUMBERS: Record<Weekday, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
};

/**
 * Validates a date in YYYY-MM-DD format.
 */
function normalizeDate(date: string, name: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${name} must be in YYYY-MM-DD format.`);
  }

  const parsed = new Date(`${date}T00:00:00Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new Error(`${name} is not a valid calendar date.`);
  }

  return date;
}

/**
 * Validates a time and normalizes it to HH:mm:ss.
 * Accepts HH:mm or HH:mm:ss.
 */
function normalizeTime(time: string, name: string): string {
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(time);

  if (!match) {
    throw new Error(`${name} must be in HH:mm or HH:mm:ss format.`);
  }

  const [, hours, minutes, seconds = "00"] = match;

  return `${hours}:${minutes}:${seconds}`;
}

export function CreateCalendarEvents(
  users: User[],
  SemisterStart: string,
  SemisterEnd: string,
): EventSourceInput {
  const semesterStart = normalizeDate(SemisterStart, "SemisterStart");
  const semesterEnd = normalizeDate(SemisterEnd, "SemisterEnd");

  if (semesterStart > semesterEnd) {
    throw new Error("SemisterStart must be before or equal to SemisterEnd.");
  }

  const events: EventSourceInput = [];

  for (const user of users) {
    for (const slot of user.time_slots) {
      const startTime = normalizeTime(
        slot.start_time,
        `${user.display_name}'s start_time`,
      );

      const endTime = normalizeTime(
        slot.end_time,
        `${user.display_name}'s end_time`,
      );

      if (startTime >= endTime) {
        throw new Error(
          `Invalid time slot for ${user.display_name}: ${startTime} - ${endTime}.`,
        );
      }

      events.push({
        id: `${user.id}-${slot.weekday}-${startTime}`,
        title: user.display_name,
        daysOfWeek: [WEEKDAY_NUMBERS[slot.weekday]],
        startTime,
        endTime,
        startRecur: semesterStart,
        // FullCalendar's endRecur is exclusive.
        // Add one day so events can occur on SemisterEnd itself.
        endRecur: (() => {
          const date = new Date(`${semesterEnd}T00:00:00Z`);
          date.setUTCDate(date.getUTCDate() + 1);
          return date.toISOString().slice(0, 10);
        })(),
        color: "#8b5cf6", // Violet background/accent
        contrastColor: "#ffffff", // Contrasting foreground
        extendedProps: { userId: user.id },
      });
    }
  }

  return events;
}
