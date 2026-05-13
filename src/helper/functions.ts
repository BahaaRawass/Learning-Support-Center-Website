import type { Student, StudentInput } from "@/types/students";
import type { BreadcrumbItem } from "@/types/types";
import type { Location } from "react-router-dom";
import { titleCase } from "title-case";

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

// Preventing duplication in the Table
export function checkDupes(
  students: Student[],
  studentInput: StudentInput,
): boolean {
  students.forEach((student) => {
    if (
      student.studentId === studentInput.studentId ||
      student.email === studentInput.email
    ) {
      return true;
    }
  });
  return false;
}

export function simplifyErrorMessage(message?: string | null): string {
  if (!message?.trim()) {
    return "Something went wrong. Please try again.";
  }

  const cleanedMessage = message
    .replace(/^Error:\s*/i, "")
    .replace(/^An Error Occurred:\s*Error Code:\s*\d+\s*Error Message:\s*/i, "")
    .trim();

  const normalizedMessage = cleanedMessage
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)[0]
    ?.replace(/\s+/g, " ");

  if (!normalizedMessage) {
    return "Something went wrong. Please try again.";
  }

  const lowerMessage = normalizedMessage.toLowerCase();

  if (
    lowerMessage.includes("duplicate key value") ||
    lowerMessage.includes("already exists")
  ) {
    return "This Student/User already exists.";
  }

  if (
    lowerMessage.includes("invalid login") ||
    lowerMessage.includes("authentication failed")
  ) {
    return "Invalid email or password.";
  }

  if (
    lowerMessage.includes("row-level security") ||
    lowerMessage.includes("permission denied")
  ) {
    return "You do not have permission to do that.";
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
    return "Network error. Please try again.";
  }

  if (normalizedMessage.length > 120) {
    return `${normalizedMessage.slice(0, 117).trim()}...`;
  }

  return normalizedMessage;
}

export function getBreadcrumbs(location: Location): BreadcrumbItem[] {
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) {
    return [];
  }

  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", path: "/" }];

  let path = "";
  pathnames.forEach((pathname) => {
    path += `/${pathname}`;

    const generatedLabel = pathname
      .replace(/-/g, " ")
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => titleCase(word))
      .join(" ");

    breadcrumbs.push({ label: generatedLabel, path });
  });

  return breadcrumbs;
}
