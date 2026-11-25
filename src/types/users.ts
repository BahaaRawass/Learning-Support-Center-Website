import type { Semester } from "./Student Affiars/semesters";
import type {
  AsyncSubmitFunction,
  DeepNonNullable,
  Tables,
  UpdateFieldsType,
} from "./types";

type UsersTable = Tables["Users"];

export type User = DeepNonNullable<UsersTable["Row"]>;

export type NewUser = UsersTable["Insert"];

export type UpdatedUser = UsersTable["Update"];

export type UserInput = {
  displayname: User["display_name"];
  email: User["email"];
  password: string;
  department_id: User["department_id"];
  time_slots: TimeSlot[];
  Semester_id: Semester["id"];
};

export type UserMode = {
  mode: "user";
  userInput: UserInput;
  handleUserSubmit: AsyncSubmitFunction;
  updateFields: UpdateFieldsType<UserInput>;
  studentInput?: never;
  handleStudentSubmit?: never;
};

export type TimeSlot = Pick<User, "time_slots">["time_slots"][number];

export type Weekday = TimeSlot["weekday"];
