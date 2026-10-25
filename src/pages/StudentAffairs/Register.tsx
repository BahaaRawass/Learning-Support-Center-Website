import CoursesComboboxMultiple from "@/components/CoursesComboboxMultiple";
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
import { ValidateRegisteration } from "@/helper/validation";
import { useCourses } from "@/hooks/useCourses";
import { useDepartments } from "@/hooks/useDepartments";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { NewRegisteredStudent } from "@/types/student-affairs";
import { BookOpenIcon, UserPlusIcon, UserRoundIcon } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { titleCase } from "title-case";

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

  function updateLocalErorr(error: string) {
    setLocalError(error);

    setTimeout(() => {
      setLocalError("");
    }, 1500);
  }

  function UpdateFields(fields: Partial<NewRegisteredStudent>) {
    setRegisterInput((prev) => ({ ...prev, ...fields }));
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    //TODO: Implement the submission logic here
    event.preventDefault();

    if (IsSubmitting) return;
    setIsSubmitting(true);

    const validationError = ValidateRegisteration(RegisterInput);

    if (validationError) {
      updateLocalErorr(validationError);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
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
  const data = Departments && Courses;

  if (loading) return <LoadingCard message="Loading data" />;

  if (error) return <ErrorCard message={SetErrorMessage(error)} />;

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
                      <FieldLabel htmlFor="name">Full Name</FieldLabel>
                      <FieldContent>
                        <Input
                          id="name"
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
                          Enter your full name
                        </FieldDescription>
                        {LocalError.includes("name") && (
                          <FieldError>{titleCase(LocalError)}</FieldError>
                        )}
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                      <FieldContent>
                        <Input
                          id="phone"
                          type="tel"
                          value={
                            isNaN(RegisterInput.mobile_number)
                              ? ""
                              : String(RegisterInput.mobile_number)
                          }
                          onChange={(event) =>
                            UpdateFields({
                              mobile_number: Number(event.target.value),
                            })
                          }
                          required
                          aria-invalid={LocalError.includes("mobile")}
                          disabled={IsSubmitting}
                          placeholder="e.g 123456"
                        />
                        <FieldDescription>
                          Enter your personal mobile number. This will be used
                          to contact you.
                        </FieldDescription>
                        {LocalError.includes("mobile") && (
                          <FieldError>{titleCase(LocalError)}</FieldError>
                        )}
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="id">RHU ID</FieldLabel>
                      <FieldContent>
                        <Input
                          id="id"
                          type="number"
                          value={String(RegisterInput.rhu_id)}
                          onChange={(event) =>
                            UpdateFields({
                              rhu_id: Number(event.target.value),
                            })
                          }
                          required
                          aria-invalid={LocalError.includes("id")}
                          disabled={IsSubmitting}
                          placeholder="e.g 123456"
                        />
                        <FieldDescription>Enter your RHU ID</FieldDescription>
                        {LocalError.includes("id") && (
                          <FieldError>{titleCase(LocalError)}</FieldError>
                        )}
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <FieldContent>
                        <Input
                          id="email"
                          type="email"
                          value={RegisterInput.email}
                          onChange={(event) =>
                            UpdateFields({ email: event.target.value })
                          }
                          required
                          aria-invalid={LocalError.includes("email")}
                          disabled={IsSubmitting}
                          placeholder="e.g john.doe@students.rhu.edu.lb"
                        />
                        <FieldDescription>
                          Enter the Student's RHU email address
                          <br />
                        </FieldDescription>
                        {LocalError.includes("email") && (
                          <FieldError>{titleCase(LocalError)}</FieldError>
                        )}
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="major">Major</FieldLabel>
                      <FieldContent>
                        <Input
                          id="major"
                          type="text"
                          value={RegisterInput.major}
                          onChange={(event) =>
                            UpdateFields({ major: event.target.value })
                          }
                          required
                          aria-invalid={LocalError.includes("major")}
                          disabled={IsSubmitting}
                          placeholder="e.g Computer Science"
                        />
                        <FieldDescription>Enter Your Major</FieldDescription>
                        {LocalError.includes("major") && (
                          <FieldError>{titleCase(LocalError)}</FieldError>
                        )}
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="gpa">GPA</FieldLabel>
                      <FieldContent>
                        <Input
                          id="gpa"
                          type="number"
                          value={String(RegisterInput.gpa)}
                          onChange={(event) =>
                            UpdateFields({ gpa: Number(event.target.value) })
                          }
                          required
                          aria-invalid={LocalError.includes("gpa")}
                          disabled={IsSubmitting}
                          placeholder="e.g 80"
                        />
                        <FieldDescription>
                          Enter Your GPA as of last semister. GPA must be
                          between 70 and 100.
                        </FieldDescription>
                        {LocalError.includes("gpa") && (
                          <FieldError>{titleCase(LocalError)}</FieldError>
                        )}
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="ceridts">Credits Earned</FieldLabel>
                      <FieldContent>
                        <Input
                          id="credits"
                          type="number"
                          value={String(RegisterInput.credits_earned)}
                          onChange={(event) =>
                            UpdateFields({
                              credits_earned: Number(event.target.value),
                            })
                          }
                          required
                          aria-invalid={LocalError.includes("credits")}
                          disabled={IsSubmitting}
                          placeholder="e.g 62"
                        />
                        <FieldDescription>
                          Enter The amount of credits you have earned so far.
                          Credits must be at least 30.
                        </FieldDescription>
                        {LocalError.includes("credits") && (
                          <FieldError>{titleCase(LocalError)}</FieldError>
                        )}
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>Department</FieldLabel>
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
                          required
                          disabled={IsSubmitting}
                        >
                          <SelectTrigger
                            className="w-full"
                            aria-invalid={LocalError.includes("department")}
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
                          Select the Student's department
                        </FieldDescription>
                        {LocalError.includes("department") && (
                          <FieldError>{titleCase(LocalError)}</FieldError>
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
                    <FieldLabel>Courses</FieldLabel>
                    <FieldContent>
                      <CoursesComboboxMultiple
                        courses={Courses}
                        value={RegisterInput.courses}
                        onValueChange={(value) =>
                          UpdateFields({ courses: value })
                        }
                        disabled={IsSubmitting}
                        aria_invalid={LocalError.includes("course")}
                        required
                      />
                      <FieldDescription>
                        Select the courses that you want to assist students
                        with. You can select multiple courses.
                      </FieldDescription>
                      {LocalError.includes("course") && (
                        <FieldError>{titleCase(LocalError)}</FieldError>
                      )}
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
