import CoursesComboboxMultiple from "@/components/CoursesComboboxMultiple";
import { DateTimePicker } from "@/components/DateTimePicker";
import ErrorCard from "@/components/error-card";
import FormSection from "@/components/FormSection";
import LoadingCard from "@/components/loading-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { SetErrorMessage } from "@/helper/errorhelpers";
import { useCourses } from "@/hooks/useCourses";
import { useDepartments } from "@/hooks/useDepartments";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { Department } from "@/types/department";
import type { NewRegisteredStudent } from "@/types/student-affairs";
import {
  BookOpenIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  UserRoundIcon,
} from "lucide-react";
import { useState, type SubmitEvent } from "react";

export default function RegisterWorkstudy() {
  useDocumentTitle("Register for WorkStudy Program");

  const InitialInput: NewRegisteredStudent = {
    name: "",
    rhu_id: NaN,
    courses: [],
    department_id: NaN,
    credits_earned: NaN,
    email: "",
    gpa: NaN,
    major: "",
    mobile_number: NaN,
  };

  const [IsSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [RegisterInput, setRegisterInput] =
    useState<NewRegisteredStudent>(InitialInput);
  const [LocalError, setLocalError] = useState<string>("");

  function UpdateFields(fields: Partial<NewRegisteredStudent>) {
    setRegisterInput((prev) => ({ ...prev, ...fields }));
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  const {
    Departments,
    Error: DepartmentsError,
    Loading: DepartmentsLoading,
  } = useDepartments();

  const {
    Courses,
    Error: CoursesError,
    Loading: CoursesLoading,
  } = useCourses();

  const loading = DepartmentsLoading || CoursesLoading;
  const error = DepartmentsError || CoursesError;

  if (loading) return <LoadingCard message="Loading data" />;

  if (error) return <ErrorCard message={SetErrorMessage(error)} />;

  const data = Departments && Courses;

  if (!data) return <ErrorCard message="Failed to load required data." />;

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
              <UserPlusIcon className="size-8 text-primary" />
              <div>
                <CardTitle>Register for WorkStudy Program</CardTitle>
                <CardDescription>
                  Register for the WorkStudy program by filling out the form
                  below.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {IsSubmitting ? (
              <LoadingCard
                message="Registering to the program"
                className="min-h-auto!"
              />
            ) : (
              <>
                <FormSection
                  icon={<UserRoundIcon />}
                  title="Student Information"
                  disableCollapse={IsSubmitting}
                >
                  <FieldGroup className="grid grid-cols-1 md:grid-cols-2 grid-rows-2">
                    <Field>
                      <FieldLabel>
                        Full Name <span className="text-destructive">*</span>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          type="text"
                          value={RegisterInput.name}
                          onChange={(event) =>
                            UpdateFields({ name: event.target.value })
                          }
                          required
                          aria-invalid={LocalError.includes("name")}
                          disabled={IsSubmitting}
                          placeholder="e.g John Doe"
                        />
                        <FieldDescription>
                          Enter your full name <br />
                          {!RegisterInput.name && (
                            <span className="text-destructive">Required</span>
                          )}
                        </FieldDescription>
                        {LocalError.includes("name") && (
                          <FieldError>{LocalError}</FieldError>
                        )}
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>
                        RHU ID <span className="text-destructive">*</span>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          type="number"
                          value={RegisterInput.rhu_id || ""}
                          onChange={(event) =>
                            UpdateFields({
                              rhu_id: Number(event.target.value),
                            })
                          }
                          required
                          aria-invalid={LocalError.includes("ID")}
                          disabled={IsSubmitting}
                          placeholder="e.g 123456"
                        />
                        <FieldDescription>
                          Enter your RHU ID
                          <br />
                          {!RegisterInput.rhu_id && (
                            <span className="text-destructive">Required</span>
                          )}
                        </FieldDescription>
                        {LocalError.includes("ID") && (
                          <FieldError>{LocalError}</FieldError>
                        )}
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>
                        Email <span className="text-destructive">*</span>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          type="email"
                          value={RegisterInput.email || ""}
                          onChange={(event) =>
                            UpdateFields({ email: event.target.value })
                          }
                          required
                          aria-invalid={LocalError.includes("Invalid email")}
                          disabled={IsSubmitting}
                          placeholder="e.g john.doe@students.rhu.edu.lb"
                        />
                        <FieldDescription>
                          Enter the Student's RHU email address
                          <br />
                          {!RegisterInput.rhu_id && (
                            <span className="text-destructive">Required</span>
                          )}
                        </FieldDescription>
                        {LocalError.includes("Invalid email") && (
                          <FieldError>{LocalError}</FieldError>
                        )}
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>
                        Department <span className="text-destructive">*</span>
                      </FieldLabel>
                      <FieldContent>
                        <Select
                          value={
                            RegisterInput.department_id
                              ? String(RegisterInput.department_id)
                              : undefined
                          }
                          onValueChange={(value) =>
                            UpdateFields({ department_id: Number(value) })
                          }
                        >
                          <SelectTrigger
                            className="w-full"
                            aria-invalid={LocalError.toLowerCase().includes(
                              "department",
                            )}
                          >
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Departments</SelectLabel>
                              {Departments.map((department, index) => (
                                <SelectItem
                                  key={index}
                                  value={String(department.id)}
                                >
                                  {department.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          Select the Student's department
                        </FieldDescription>
                        {LocalError.toLowerCase().includes("department") && (
                          <FieldError>{LocalError}</FieldError>
                        )}
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                </FormSection>
                <FormSection
                  icon={<BookOpenIcon />}
                  title="Courses To Assist With"
                  disableCollapse={IsSubmitting}
                >
                  <Field>
                    <FieldLabel>
                      Courses <span className="text-destructive">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <CoursesComboboxMultiple
                        courses={Courses}
                        value={RegisterInput.courses}
                        onValueChange={(value) =>
                          UpdateFields({ courses: value })
                        }
                        placeholder="Select courses"
                      />
                      <FieldDescription>
                        Select the courses that you want to assist students
                        with. You can select multiple courses.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FormSection>
              </>
            )}
          </CardContent>
          <CardFooter className="justify-end gap-3">
            <CardAction>
              <Button
                type="reset"
                variant="outline"
                onClick={() => setRegisterInput(InitialInput)}
                disabled={IsSubmitting}
              >
                Clear
              </Button>
            </CardAction>
            <CardAction>
              <Button
                type="submit"
                className="btn-primary w-37.5"
                disabled={IsSubmitting}
              >
                {IsSubmitting ? (
                  <>
                    <Spinner /> Registering for the program...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </CardAction>
          </CardFooter>
        </Card>
      </form>
    </>
  );
}
