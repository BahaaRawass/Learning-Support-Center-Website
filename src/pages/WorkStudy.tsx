import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, IsAdmin, updateFields } from "@/helper/functions";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/useDepartments";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useUsers } from "@/hooks/useUsers";
import { exportData } from "@/lib/exportUtils";
import type { NewUser, User, UserInput } from "@/types/users";
import {
  FilterIcon,
  InfoIcon,
  LightbulbIcon,
  MoreHorizontalIcon,
  UserRoundIcon,
} from "lucide-react";
import { Fragment, useState, type SubmitEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ErrorCard from "@/components/error-card";
import LoadingCard from "@/components/loading-card";
import { titleCase } from "title-case";
import { TimeSlotsMenu } from "@/components/TimeSlotMenu";
import { SetErrorMessage } from "@/helper/errorhelpers";
import { validateUserInput } from "@/helper/validation";
import { FilterModal } from "@/components/FilterModal";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import Modal from "@/components/Modal";
import NavigateToLogin from "@/components/NavigateToLogin";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import FormSection from "@/components/FormSection";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/PasswordInput";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TimeSlots from "@/components/TimeSlots";
import { Spinner } from "@/components/ui/spinner";
import { useSettingsContext } from "@/context/SettingsContext";
import { useSemesters } from "@/hooks/student_affairs/useSemesters";
import useWorkstudyAssigment from "@/hooks/student_affairs/useWorkstudyAssigment";
import type { NewWorkstudyAssignment } from "@/types/Student Affiars/workstudy_assigment";

export default function WorkStudy() {
  useDocumentTitle("Manage Workstudy");

  const InitialValue: UserInput = {
    displayname: "",
    email: "",
    password: "",
    department_id: NaN,
    time_slots: [],
    Semester_id: NaN,
  };

  const [UserInput, setUserInput] = useState<UserInput>(InitialValue);
  const [LocalError, setLocalError] = useState<string>("");
  const [IsSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [IsFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [DeletedUser, setDeletedUser] = useState<User | null>(null);

  const [SearchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const {
    Session,
    Loading: AuthLoading,
    Error: AuthError,
    SignUp,
    DeleteUser,
  } = useAuth();

  const {
    Users,
    // Loading: UsersLoading,
    AddUser,
    Error: UsersError,
  } = useUsers(Session?.user);

  const {
    Departments,
    Loading: DepartmentsLoading,
    Error: DepartmentsError,
  } = useDepartments();

  const {
    Semesters,
    Loading: SemestersLoading,
    Error: SemestersError,
  } = useSemesters();

  const {
    WorkstudyAssignments,
    AddWorkstudyAssignment,
    Loading: AssignmentLoading,
    Error: AssignmentError,
  } = useWorkstudyAssigment();

  const { Settings } = useSettingsContext();

  const loading =
    AuthLoading || DepartmentsLoading || SemestersLoading || AssignmentLoading;

  const error =
    AuthError ||
    UsersError ||
    DepartmentsError ||
    SemestersError ||
    AssignmentError;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || IsSubmitting) return;
    setIsSubmitting(true);

    const validationmessage = validateUserInput(UserInput);

    if (validationmessage) {
      setLocalError(validationmessage);
      setIsSubmitting(false);
      return;
    }

    const SignUpData = await SignUp(
      UserInput.email,
      UserInput.password,
      UserInput.displayname,
      "workstudy",
      UserInput.department_id,
    );

    if (!SignUpData?.user) {
      setIsSubmitting(false);
      setLocalError("Failed to create account. Please try again.");
      return;
    }

    const UserId = SignUpData.user.id;

    const newUser: NewUser = {
      id: UserId,
      email: UserInput.email,
      display_name: UserInput.displayname,
      role: "workstudy",
      department_id: UserInput.department_id,
      time_slots: UserInput.time_slots,
    };

    await AddUser(newUser, {
      onSuccess: async (newUser) => {
        const NewAssignment: NewWorkstudyAssignment = {
          semester_id: UserInput.Semester_id,
          user_id: newUser.id,
        };

        await AddWorkstudyAssignment(NewAssignment, {
          onSuccess: () => {
            setUserInput(InitialValue);
          },
          onSettled: (_data, error) => {
            if (error)
              setLocalError(
                "Failed to create workstudy assignment. Please try again.",
              );
            setIsSubmitting(false);
          },
        });
      },
      onError: () => {
        setIsSubmitting(false);
        setLocalError("Failed to create account. Please try again.");
      },
    });
  }

  if (error) {
    return <ErrorCard message={SetErrorMessage(error)} />;
  }

  if (loading) {
    return (
      <LoadingCard
        message={AuthLoading ? "Checking authentication" : "Loading data"}
      />
    );
  }

  if (!Session) {
    return <NavigateToLogin />;
  }

  if (!IsAdmin(Session) || Session.user.is_anonymous)
    return (
      <ErrorCard
        message="You do not have permission to view this page."
        actionLabel="Go to Home"
        onAction={() => navigate("/")}
      />
    );

  const data = Users && Departments && Semesters && WorkstudyAssignments;

  if (!data) return <ErrorCard message="Failed to load required data." />;

  const IsFilterActive = SearchParams.toString() !== "";

  const filteredUsers = IsFilterActive
    ? Users.filter((user) => {
        const nameFilter = SearchParams.get("name");
        const emailFilter = SearchParams.get("email");
        const roleFilter = SearchParams.get("role");
        const departmentFilter = SearchParams.get("department_id");
        const dateFilter = SearchParams.get("date");
        // const timeSlotsFilter = SearchParams.get("time_slots");

        const selectedDate = dateFilter ? new Date(dateFilter) : null;
        const createdDate = user.created_at ? new Date(user.created_at) : null;
        const isDateMatch =
          !selectedDate ||
          !createdDate ||
          (createdDate.getFullYear() === selectedDate.getFullYear() &&
            createdDate.getMonth() === selectedDate.getMonth() &&
            createdDate.getDate() === selectedDate.getDate());

        return (
          (!nameFilter || user.display_name.includes(nameFilter)) &&
          (!emailFilter || user.email?.includes(emailFilter)) &&
          (!roleFilter || user.role === roleFilter) &&
          (!departmentFilter ||
            user.department_id === parseInt(departmentFilter)) &&
          isDateMatch
        );
      })
    : Users;

  async function handleDelete(id: User["id"]) {
    const ok = await DeleteUser(id);

    if (!ok) {
      setLocalError("Failed to remove user. Please try again.");
    }
  }

  function handleExport() {
    const exportData_formatted = filteredUsers.map((user) => ({
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
      "Workstudy_Accounts_Export",
    );
  }

  function RowActions({
    user,
    menu_item,
  }: {
    user: User;
    menu_item: "context" | "dropdown";
  }) {
    const MenuItemElement =
      menu_item === "context" ? ContextMenuItem : DropdownMenuItem;

    return (
      <MenuItemElement
        variant="destructive"
        className="cursor-pointer text-[16px] text-primary"
        onClick={() => setDeletedUser(user)}
      >
        Remove
      </MenuItemElement>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
              <UserPlusIcon className="size-8 text-primary" />
              <div>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>
                  Add a new workstudy or supervisor account to the Support
                  Center Staff
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={handleExport}
                className="btn-primary ml-auto"
              >
                Export {Settings.exportFormat === "csv" ? "CSV" : "Excel"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {IsSubmitting ? (
              <LoadingCard
                message={"Adding workstudy"}
                className="min-h-auto!"
              />
            ) : (
              <>
                <FormSection
                  icon={<UserRoundIcon />}
                  title="Workstudy Account Details"
                >
                  <FieldGroup className="grid grid-cols-1 md:grid-cols-2 grid-rows-2">
                    <Field>
                      <FieldLabel>Display Name</FieldLabel>
                      <FieldContent>
                        <Input
                          type="text"
                          value={UserInput.displayname}
                          onChange={(event) =>
                            updateFields(
                              { displayname: event.target.value },
                              setUserInput,
                            )
                          }
                          placeholder="e.g. John Doe"
                          required
                          aria-invalid={LocalError.includes("Display name")}
                          disabled={IsSubmitting}
                        />
                        <FieldDescription>
                          Enter the workstudy's display name <br />
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
                          value={UserInput.email}
                          onChange={(event) =>
                            updateFields(
                              { email: event.target.value },
                              setUserInput,
                            )
                          }
                          placeholder="e.g. john.doe@example.com"
                          required
                          aria-invalid={LocalError.includes("Email")}
                          disabled={IsSubmitting}
                        />
                        <FieldDescription>
                          Enter the workstudy's email address
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>Password</FieldLabel>
                      <FieldContent>
                        <PasswordInput
                          value={UserInput.password}
                          onChange={(event) =>
                            updateFields(
                              { password: event.target.value },
                              setUserInput,
                            )
                          }
                          placeholder="Enter a strong password"
                          required
                          aria-invalid={LocalError.includes("Password")}
                          disabled={IsSubmitting}
                        />
                        <FieldDescription>
                          Enter a strong password for the workstudy account
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>Department</FieldLabel>
                      <FieldContent>
                        <Select
                          value={
                            UserInput.department_id
                              ? String(UserInput.department_id)
                              : undefined
                          }
                          onValueChange={(value) =>
                            updateFields(
                              { department_id: Number(value) },
                              setUserInput,
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
                          Enter the workstudy's department.
                        </FieldDescription>
                        {LocalError.toLowerCase().includes("department") && (
                          <FieldError>{LocalError}</FieldError>
                        )}
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                </FormSection>
                <FormSection icon={<InfoIcon />} title="Additional Information">
                  <FieldGroup className="grid grid-cols-1 md:grid-cols-2 grid-rows-1">
                    <Field>
                      <FieldLabel>Semester Assignment</FieldLabel>
                      <FieldContent>
                        <Select
                          value={
                            UserInput.Semester_id
                              ? String(UserInput.Semester_id)
                              : ""
                          }
                          disabled={IsSubmitting}
                          onValueChange={(value) =>
                            updateFields(
                              { Semester_id: Number(value) },
                              setUserInput,
                            )
                          }
                        >
                          <SelectTrigger
                            className="w-full"
                            aria-invalid={LocalError.toLowerCase().includes(
                              "semester",
                            )}
                            disabled={IsSubmitting}
                          >
                            <SelectValue placeholder="Select a semester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Semesters</SelectLabel>
                              {Semesters.map((semster, index) => (
                                <Fragment key={semster.id}>
                                  <SelectItem value={String(semster.id)}>
                                    {semster.term} {semster.year}
                                  </SelectItem>
                                  {index < Semesters.length - 1 && (
                                    <SelectSeparator />
                                  )}
                                </Fragment>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          Select the semester to which the workstudy will be
                          assigned.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>Time Slots</FieldLabel>
                      <FieldContent>
                        <TimeSlots
                          input={UserInput}
                          updateFields={(fields) =>
                            updateFields(fields, setUserInput)
                          }
                          disabled={IsSubmitting}
                        />
                        <FieldDescription>
                          Select the time slots for the workstudy to be
                          available. <br />
                          At least one time slot must be selected.
                        </FieldDescription>
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
              onClick={() => setUserInput(InitialValue)}
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
                  <Spinner /> Adding WorkStudy
                </>
              ) : (
                "Add WorkStudy"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <div className="p-5 flex flex-col gap-4">
        <h2 className="text-xl text-(--navy) mb-4 font-serif font-semibold flex ">
          Active WorkStudy Accounts
          <div className="flex gap-2 mt-2 ml-auto font-[georgia]">
            <Button
              className="text-lg btn-primary"
              onClick={() => setIsFilterOpen(true)}
            >
              <FilterIcon className="size-5!" /> Filter Records
            </Button>
          </div>
        </h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center"></TableHead>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-center">Department</TableHead>
              <TableHead className="text-center">Time Slots</TableHead>
              <TableHead className="text-center">Semester Assignment</TableHead>
              <TableHead className="text-center">Added At</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers
                .filter((user) => user.role === "workstudy")
                .map((user, index) => {
                  const SmesterId = WorkstudyAssignments.find(
                    (assignment) => assignment.user_id === user.id,
                  )?.semester_id;

                  const Semster = Semesters.find(
                    (semester) => semester.id === SmesterId,
                  );

                  return (
                    <ContextMenu key={user.id}>
                      <ContextMenuTrigger asChild>
                        <TableRow>
                          <TableHead className="text-center">
                            {index + 1}
                          </TableHead>
                          <TableCell className="text-center">
                            {user.display_name}
                          </TableCell>
                          <TableCell className="text-center">
                            {user.email}
                          </TableCell>
                          <TableCell className="text-center">
                            {titleCase(
                              user.role === "admin" ? "Supervisor" : user.role,
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {Departments.find(
                              (department) =>
                                department.id === user.department_id,
                            )?.name || "—"}
                          </TableCell>
                          <TableCell className="flex justify-center items-center">
                            <TimeSlotsMenu timeslots={user.time_slots} />
                          </TableCell>
                          <TableCell className="text-center">
                            {Semster ? `${Semster.term} ${Semster.year}` : "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatDate(user.created_at)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                className="cursor-pointer"
                              >
                                <Button variant="secondary">
                                  <MoreHorizontalIcon />
                                  <span className="sr-only">Open Menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="center"
                                className="focus:bg-none w-full"
                              >
                                <RowActions user={user} menu_item="dropdown" />
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>

                      <ContextMenuContent>
                        <RowActions user={user} menu_item="context" />
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-[17px]">
                  No workstudy found. Check your filters or add new student
                  records to see them here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-center gap-2 text-gray-600/50">
          <LightbulbIcon /> Tip: Right click (hold on mobile) or click the
          actions button on a row to view some quick actions.
        </div>
      </div>

      <Modal
        Open={DeletedUser !== null}
        setOpen={() => setDeletedUser(null)}
        text={DeletedUser?.display_name}
        IsDestructive
        handleDelete={async () => {
          if (!DeletedUser) return;
          return await handleDelete(DeletedUser.id);
        }}
      />

      <FilterModal
        mode="user"
        IsOpen={IsFilterOpen}
        setIsOpen={setIsFilterOpen}
        Departments={Departments}
        SearchParams={SearchParams}
        setSearchParams={setSearchParams}
      />
    </>
  );
}
