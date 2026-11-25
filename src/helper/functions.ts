import type { UpdaterFunction } from "@/types/types";
import type { Session } from "@supabase/supabase-js";

// Formatting the Date to this format: Day, Month, Year at HH:MM AM/PM
export function formatDate(_date?: string) {
  const date = _date ? new Date(_date) : new Date();

  return date.toLocaleString("en-LB", {
    timeZone: "Asia/Beirut",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function GetInitials(name: string) {
  return (
    name
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || ""
  );
}

export function IsAdmin(Session: Session | null) {
  return (
    Session?.user.app_metadata.role === "admin" ||
    Session?.user.app_metadata.role === "student_affairs"
  );
}

export function updateFields<RType>(
  feilds: Partial<RType>,
  setState: UpdaterFunction<RType>,
) {
  setState((prev) => ({ ...prev, ...feilds }));
}
