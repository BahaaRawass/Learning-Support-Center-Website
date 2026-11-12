import type { Department } from "./department";
import type { Tables } from "./types";
import type { User } from "./users";

export type CalendarDialogInfo =
  | { Isopen: true; user: User | undefined; timeslot: string }
  | { Isopen: false; user?: never; timeslot?: never };

type BookingTable = Tables["Bookings"];

export type Booking = BookingTable["Row"];

export type BookingInsert = BookingTable["Insert"];

export type BookingUpdate = BookingTable["Update"];

export type BookingInput = {
  name: string;
  email: string;
  department_id: Department["id"];
  courses: string[];
  rhuId: number;
};

export type BookingStatus = Booking["status"];

export type CategorySelectType = "name" | "id" | "email" | "courses" | "status";

export type DisplayStyle = "grid" | "list";