export type StaffRole = "admin" | "workstudy";

export interface EdgeFunctionError {
  message: string;
  status?: number;
  code?: string;
  name?: string;
}

export type FunctionResponse<T> =
  | { data: T; error: null }
  | { data: null; error: EdgeFunctionError };

export interface CreateUserRequest {
  email: string;
  password: string;
  displayname: string;
  role: StaffRole;
  department_id: number;
}

export interface DeleteUserRequest {
  userId: string;
}

export interface SendEmailRequest {
  to: string;
  from: string;
  subject: string;
  message: string;
  replyto?: string;
  buttontext?: string;
  buttonAction?: string;
}

export type CreateUserResponse = FunctionResponse<{
  user: {
    id: string;
    email: string;
    user_metadata: Record<string, unknown>;
    app_metadata: Record<string, unknown>;
  };
}>;
export type DeleteUserResponse = FunctionResponse<{
  userId: string;
  message: string;
}>;
export type SendEmailResponse = FunctionResponse<{ id: string }>;

export interface EdgeFunctionMap {
  createUser: { body: CreateUserRequest; response: CreateUserResponse };
  deleteUser: { body: DeleteUserRequest; response: DeleteUserResponse };
  sendEmail: { body: SendEmailRequest; response: SendEmailResponse };
}
