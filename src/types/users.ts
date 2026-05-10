import type { AsyncSubmitFunction, Tables, UpdateFieldsType } from "./types";

type UsersTable = Tables["Users"];

export type User = UsersTable["Row"];

export type NewUser = UsersTable["Insert"]

export type UserInput = {
  displayname: User["display_name"];
  email: User["email"];
  password: string;
  department_id: User["department_id"];
  isSupervisor: boolean;
};

export type UserMode = {
  mode: "user";
  userInput: UserInput;
  handleUserSubmit: AsyncSubmitFunction;
  updateFields: UpdateFieldsType<UserInput>;
  studentInput?: never;
  handleStudentSubmit?: never;
};
