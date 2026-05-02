import type { Tables } from "./types";

type UsersTable = Tables["Users"];

export type User = UsersTable["Row"];

export type UserInput = {
  displayname: string;
  email: string;
  password: string;
};
