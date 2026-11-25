import type { Department } from "../department";

export type StaffInput = {
    displayname: string;
    email: string;
    password: string;
    department_id: Department["id"];
}