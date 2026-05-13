import type { Tables } from "./types";

type Asked_About_Table = Tables["Asked_About"]

export type Asked_About = Asked_About_Table["Row"]

export type New_Asked_About = Asked_About_Table["Insert"]

export type Update_Asked_About = Asked_About_Table["Update"]