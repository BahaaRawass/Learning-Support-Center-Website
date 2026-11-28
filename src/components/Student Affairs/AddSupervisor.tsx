import { ValidateStaffInput } from "@/helper/validation";
import type { StaffInput } from "@/types/Student Affiars/support_center_staff";
import type { MutationOptions } from "@/types/types";
import type { NewUser, User } from "@/types/users";
import { useState, type SubmitEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { UserPlusIcon, UserRoundIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useSettingsContext } from "@/context/SettingsContext";
import LoadingCard from "../loading-card";
import FormSection from "../FormSection";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { formatDate, updateFields } from "@/helper/functions";
import PasswordInput from "../PasswordInput";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Spinner } from "../ui/spinner";
import type { Department } from "@/types/department";
import { exportData } from "@/lib/exportUtils";
import type { CreateUserRequest } from "@/lib/functions.types";

type AddSupervisorProps = {
  SignUp: (
    email: string,
    password: string,
    displayName: string,
    role: CreateUserRequest["role"],
    departmentId: number,
  ) => Promise<{
    user: {
      id: string;
      email: string;
      user_metadata: Record<string, unknown>;
      app_metadata: Record<string, unknown>;
    };
  } | null>;
  AddUser: (
    newUser: NewUser,
    options?: MutationOptions<User, NewUser>,
  ) => Promise<User | null>;
  Departments: Department[];
  Users: User[];
};

export default function AddSupervisor({
  SignUp,
  AddUser,
  Departments,
  Users,
}: AddSupervisorProps) {
  const { Settings } = useSettingsContext();

  const InitialStaffInput: StaffInput = {
    displayname: "",
    email: "",
    password: "",
    department_id: NaN,
  };

  const [StaffInput, setStaffInput] = useState<StaffInput>(InitialStaffInput);
  const [IsSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [LocalError, setLocalError] = useState<string>("");

  async function handleSupervisorSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (IsSubmitting) return;
    setIsSubmitting(true);

    const validationError = ValidateStaffInput(StaffInput);
    if (validationError) {
      setLocalError(validationError);
      setIsSubmitting(false);
      return;
    }

    const SignUpData = await SignUp(
      StaffInput.email,
      StaffInput.password,
      StaffInput.displayname,
      "admin",
      StaffInput.department_id,
    );

    if (!SignUpData?.user) {
      setIsSubmitting(false);
      setLocalError("Failed to create account. Please try again.");
      return;
    }

    const UserId = SignUpData.user.id;

    const newUser: NewUser = {
      id: UserId,
      email: StaffInput.email,
      display_name: StaffInput.displayname,
      role: "admin",
      department_id: StaffInput.department_id,
      time_slots: [],
    };

    await AddUser(newUser, {
      onSettled: () => {
        setIsSubmitting(false);
        setStaffInput(InitialStaffInput);
      },
    });
  }

  function handleExport() {
    const exportData_formatted = Users!.map((user) => ({
      Name: user.display_name,
      Email: user.email,
      Role: user.role === "admin" ? "Supervisor" : user.role,
      Department:
        Departments!.find((d) => d.id === user.department_id)?.name || "—",
      "Created At": formatDate(user.created_at),
      "Time Slots": user.time_slots
        .map((slot) => `${slot.weekday}: ${slot.start_time} - ${slot.end_time}`)
        .join(", "),
    }));

    exportData(
      exportData_formatted,
      Settings.exportFormat,
      "Support_Center_Staff_Export",
    );
  }

  return (
    <form onSubmit={handleSupervisorSubmit}>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <UserPlusIcon className="size-8 text-primary" />
            <div>
              <CardTitle>Add New Supervisor</CardTitle>
              <CardDescription>
                Add a new supervisor account to the Support Center Staff
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={handleExport}
              className="btn-primary ml-auto"
            >
              Export {Settings.exportFormat.toUpperCase()}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {IsSubmitting ? (
            <LoadingCard message="Adding supervisor" className="min-h-auto!" />
          ) : (
            <>
              <FormSection
                icon={<UserRoundIcon />}
                title="Supervisor Account Details"
              >
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 grid-rows-2">
                  <Field>
                    <FieldLabel>Display Name</FieldLabel>
                    <FieldContent>
                      <Input
                        type="text"
                        value={StaffInput.displayname}
                        onChange={(event) =>
                          updateFields(
                            { displayname: event.target.value },
                            setStaffInput,
                          )
                        }
                        placeholder="e.g. John Doe"
                        required
                        aria-invalid={LocalError.includes("Display name")}
                        disabled={IsSubmitting}
                      />
                      <FieldDescription>
                        Enter the supervisor's display name
                      </FieldDescription>
                      {LocalError.includes("Display name") && (
                        <FieldError> {LocalError}</FieldError>
                      )}
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <FieldContent>
                      <Input
                        type="email"
                        value={StaffInput.email}
                        onChange={(event) =>
                          updateFields(
                            { email: event.target.value },
                            setStaffInput,
                          )
                        }
                        placeholder="e.g. john.doe@example.com"
                        required
                        aria-invalid={LocalError.includes("Email")}
                        disabled={IsSubmitting}
                      />
                      <FieldDescription>
                        Enter the supervisor's email address
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>Password</FieldLabel>
                    <FieldContent>
                      <PasswordInput
                        value={StaffInput.password}
                        onChange={(event) =>
                          updateFields(
                            { password: event.target.value },
                            setStaffInput,
                          )
                        }
                        placeholder="Enter a strong password"
                        required
                        aria-invalid={LocalError.includes("Password")}
                        disabled={IsSubmitting}
                      />
                      <FieldDescription>
                        Enter a strong password for the supervisor's account
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>Department</FieldLabel>
                    <FieldContent>
                      <Select
                        value={
                          StaffInput.department_id
                            ? String(StaffInput.department_id)
                            : undefined
                        }
                        onValueChange={(value) =>
                          updateFields(
                            { department_id: Number(value) },
                            setStaffInput,
                          )
                        }
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={LocalError.toLowerCase().includes(
                            "department",
                          )}
                          disabled={IsSubmitting}
                        >
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Departments</SelectLabel>
                            {Departments.map((department) => (
                              <SelectItem
                                key={department.id}
                                value={String(department.id)}
                              >
                                {department.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Enter the supervisor's department
                      </FieldDescription>
                      {LocalError.toLowerCase().includes("department") && (
                        <FieldError>{LocalError}</FieldError>
                      )}
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </FormSection>
            </>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-3">
          <Button
            type="reset"
            variant="outline"
            onClick={() => setStaffInput(InitialStaffInput)}
            disabled={IsSubmitting}
          >
            Clear
          </Button>
          <Button
            type="submit"
            className="btn-primary w-37.5"
            disabled={IsSubmitting}
          >
            {IsSubmitting ? (
              <>
                <Spinner /> Adding Supervisor
              </>
            ) : (
              "Add Supervisor"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
