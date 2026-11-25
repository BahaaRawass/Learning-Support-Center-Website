import ErrorCard from "@/components/error-card";
import { FilterModal } from "@/components/FilterModal";
import FormSection from "@/components/FormSection";
import LoadingCard from "@/components/loading-card";
import Modal from "@/components/Modal";
import NavigateToLogin from "@/components/NavigateToLogin";
import PasswordInput from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSettingsContext } from "@/context/SettingsContext";
import { SetErrorMessage } from "@/helper/errorhelpers";
import { formatDate, updateFields } from "@/helper/functions";
import { ValidateSemesterInput, ValidateStaffInput } from "@/helper/validation";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/useDepartments";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSemesters } from "@/hooks/student_affairs/useSemesters";
import { useUsers } from "@/hooks/useUsers";
import { exportData } from "@/lib/exportUtils";
import type {
  SemesterInput,
  SemesterTerm,
} from "@/types/Student Affiars/semesters";
import type { StaffInput } from "@/types/Student Affiars/support_center_staff";
import type { NewUser, User } from "@/types/users";
import {
  FilterIcon,
  InfoIcon,
  LightbulbIcon,
  MoreHorizontalIcon,
  PlusCircleIcon,
  UserPlusIcon,
  UserRoundIcon,
} from "lucide-react";
import { Fragment, useState, type SubmitEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { titleCase } from "title-case";

export default function SupportCenterStaff() {
  useDocumentTitle("Support Center Staff");

  const {
    Session,
    SignUp,
    DeleteUser,
    Loading: AuthLoading,
    Error: AuthError,
  } = useAuth();
  const {
    Users,
    AddUser,
    Loading: UsersLoading,
    Error: UsersError,
  } = useUsers(Session?.user);
  const { Settings } = useSettingsContext();
  const {
    Departments,
    Loading: DepartmentsLoading,
    Error: DepartmentsError,
  } = useDepartments();
  const {
    Loading: SemestersLoading,
    Error: SemestersError,
    AddSemester,
  } = useSemesters();
  const navigate = useNavigate();

  const InitialSupervisorValue: StaffInput = {
    displayname: "",
    email: "",
    password: "",
    department_id: NaN,
  };

  const InitialSemesterValue: SemesterInput = {
    term: "Fall",
    year: new Date().getFullYear(),
  };

  const [IsSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [StaffInput, setStaffInput] = useState<StaffInput>(
    InitialSupervisorValue,
  );
  const [SemesterInput, setSemesterInput] =
    useState<SemesterInput>(InitialSemesterValue);
  const [LocalError, setLocalError] = useState<string>("");
  const [DeletedUser, setDeletedUser] = useState<User | null>(null);
  const [IsFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [SearchParams, setSearchParams] = useSearchParams();

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

  const loading =
    AuthLoading || UsersLoading || DepartmentsLoading || SemestersLoading;
  const error = AuthError || UsersError || DepartmentsError || SemestersError;
  const data = Users && Departments;

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

  if (
    Session.user.app_metadata.role !== "student_affairs" ||
    Session.user.is_anonymous
  )
    return (
      <ErrorCard
        message="You do not have permission to view this page."
        actionLabel="Go to Home"
        onAction={() => navigate("/")}
      />
    );

  if (!data) return <ErrorCard message="Failed to load required data." />;

  const SemesterTerms: SemesterTerm[] = ["Fall", "Spring", "Summer"];

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

  async function handleSupervisorSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Session || IsSubmitting) return;
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
        setStaffInput(InitialSupervisorValue);
      },
    });
  }

  async function handleSemesterSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Session || IsSubmitting) return;

    const validationError = ValidateSemesterInput(SemesterInput);

    if (validationError) {
      setIsSubmitting(false);
      setLocalError(validationError);
      return;
    }

    await AddSemester(SemesterInput, {
      onSettled: () => {
        setIsSubmitting(false);
        setSemesterInput(InitialSemesterValue);
      },
    });

    setIsSubmitting(true);
  }

  async function handleDelete(id: User["id"]) {
    const ok = await DeleteUser(id);

    if (!ok) {
      setLocalError("Failed to remove user. Please try again.");
    }
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
      <h1 className="page-title">Support Center Staff</h1>
      <p className="page-desc">Overview of support center staff members.</p>

      <div className="flex flex-col gap-5">
        <form onSubmit={handleSemesterSubmit}>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-4">
                <PlusCircleIcon className="size-8 text-primary" />
                <div>
                  <CardTitle>Add New Semester</CardTitle>
                  <CardDescription>
                    Add a new semester to the Support Center Staff
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {IsSubmitting ? (
                <LoadingCard
                  message="Adding semester"
                  className="min-h-auto!"
                />
              ) : (
                <>
                  <FormSection icon={<InfoIcon />} title="Semester Details">
                    <FieldGroup className="grid grid-cols-1 md:grid-cols-2 grid-rows-1">
                      <Field>
                        <FieldLabel>Semester Term</FieldLabel>
                        <FieldContent>
                          <Select
                            value={SemesterInput.term}
                            onValueChange={(value) =>
                              updateFields(
                                { term: value as SemesterTerm },
                                setSemesterInput,
                              )
                            }
                            disabled={IsSubmitting}
                            required
                          >
                            <SelectTrigger
                              className="w-full"
                              aria-invalid={LocalError.includes("term")}
                              disabled={IsSubmitting}
                            >
                              <SelectValue placeholder="Select a semester term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Semester Terms</SelectLabel>
                                {SemesterTerms.map((term, index) => (
                                  <Fragment key={index}>
                                    <SelectItem value={term}>{term}</SelectItem>
                                    {index < SemesterTerms.length - 1 && (
                                      <SelectSeparator />
                                    )}
                                  </Fragment>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FieldDescription>
                            Select the semester term
                          </FieldDescription>
                          {LocalError.includes("term") && (
                            <FieldError>{LocalError}</FieldError>
                          )}
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Semester Year</FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            value={SemesterInput.year}
                            onChange={(e) =>
                              updateFields(
                                { year: parseInt(e.target.value) },
                                setSemesterInput,
                              )
                            }
                            placeholder="e.g. 2026"
                            required
                            aria-invalid={LocalError.includes("year")}
                            disabled={IsSubmitting}
                          />
                          <FieldDescription>
                            Enter the semester year
                          </FieldDescription>
                          {LocalError.includes("year") && (
                            <FieldError> {LocalError}</FieldError>
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
                onClick={() => setSemesterInput(InitialSemesterValue)}
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
                    <Spinner /> Adding Semester
                  </>
                ) : (
                  "Add Semester"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>

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
                <LoadingCard
                  message="Adding supervisor"
                  className="min-h-auto!"
                />
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
                onClick={() => setStaffInput(InitialSupervisorValue)}
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
      </div>

      <div className="p-5 flex flex-col gap-4">
        <h2 className="text-xl text-(--navy) mb-4 font-serif font-semibold flex ">
          Active Supervisor Accounts
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
              <TableHead className="text-center">Added At</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers
                .filter((user) => user.role === "admin")
                .map((user, index) => {
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
                              user.role === "admin" ? "supervisor" : user.role,
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {Departments.find(
                              (department) =>
                                department.id === user.department_id,
                            )?.name || "—"}
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
