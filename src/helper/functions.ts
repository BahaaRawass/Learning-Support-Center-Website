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
