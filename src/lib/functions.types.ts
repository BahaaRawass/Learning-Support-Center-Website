// One contract shared by the browser and the Edge Functions.
export type {
  StaffRole, EdgeFunctionError, FunctionResponse,
  CreateUserRequest, CreateUserResponse, DeleteUserRequest, DeleteUserResponse,
  SendEmailRequest, SendEmailResponse, EdgeFunctionMap,
} from "../../supabase/functions/_shared/contracts";
