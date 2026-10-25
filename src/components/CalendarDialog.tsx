import type { BookingInput, CalendarDialogInfo } from "@/helper/calendar";
import type { UpdaterFunction } from "@/types/types";
import type { User } from "@/types/users";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
} from "./ui/field";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState } from "react";
import type { Department } from "@/types/department";
import type { Course } from "@/types/courses";
import CoursesMenu from "./CoursesMenu";
import { Button } from "./ui/button";
import { ValidateBooking } from "@/helper/validation";
import { titleCase } from "title-case";

type CalendarDialogProps = {
  Isopen: boolean;
  setIsopen: UpdaterFunction<CalendarDialogInfo>;
  user: User | undefined;
  timeslot: string | undefined;
  Departments: Department[];
  Courses: Course[];
};

export default function CalendarDialog({
  Isopen,
  setIsopen,
  user,
  timeslot,
  Departments,
}: CalendarDialogProps) {
  const InitialInput: BookingInput = {
    name: "",
    email: "",
    department_id: NaN,
    rhuId: NaN,
    courses: [],
  };

  const [BookingInput, setBookingInput] = useState<BookingInput>(InitialInput);
  const [LocalError, setLocalError] = useState<string>("");
  const [IsSubmitting, setIsSubmitting] = useState<boolean>(false);

  function updateLocalErorr(error: string) {
    setLocalError(error);

    setTimeout(() => {
      setLocalError("");
    }, 1500);
  }

  function updateFields(fields: Partial<BookingInput>) {
    setBookingInput((prev) => ({ ...prev, ...fields }));
  }

  async function AddBooking() {
    if (IsSubmitting) return;
    setIsSubmitting(true);

    const validationError = ValidateBooking(BookingInput);

    if (validationError) {
      updateLocalErorr(validationError);
      setIsSubmitting(false);
      return;
    }

    // TODO: Handle booking by sending email to the workstudy and if he/she accepts the booking, add it the the Student reacords table and send an email to the student with the booking status. if the booking is rejected, send an email to the student with the booking status.

    setIsSubmitting(false);
  }

  // TODO: Handle the case when user is undefined, maybe show an error message or a fallback UI.
  if (!user) return;

  return (
    <Dialog
      open={Isopen}
      as="div"
      className="relative z-300 focus:outline-none"
      onClose={() => setIsopen({ Isopen: false })}
    >
      <div className="fixed inset-0 z-300 w-full! overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogBackdrop className="fixed inset-0 bg-black/15" />
          <DialogPanel
            transition
            className="w-full max-w-3xl  rounded-xl bg-white dark:bg-card p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
          >
            <Card className="ring-0!">
              <CardHeader>
                <CardTitle className="text-2xl">
                  <DialogTitle>Book a Session</DialogTitle>
                </CardTitle>
                <CardDescription className="text-[16px]">
                  Fill out the form below to book a session with <br />
                  <span className="font-semibold">
                    {user.display_name}
                  </span> at <span className="font-semibold">{timeslot}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-[repeat(2,1fr)] gap-4">
                  <FieldSet className="col-[1/1] row-[1/1]">
                    <FieldGroup>
                      <Field>
                        <Label htmlFor="name">Name:</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="ex. John Doe"
                          value={BookingInput.name}
                          onChange={(event) =>
                            updateFields({ name: event.target.value })
                          }
                          disabled={IsSubmitting}
                          aria-invalid={LocalError.includes("name")}
                        />
                        <FieldDescription>
                          Enter your full name
                        </FieldDescription>
                        {LocalError.includes("name") && (
                          <FieldError>{titleCase(LocalError)}</FieldError>
                        )}
                      </Field>
                      <Field>
                        <Label htmlFor="email">Email:</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="ex. johndoe@example.com"
                          value={BookingInput.email}
                          onChange={(event) =>
                            updateFields({ email: event.target.value })
                          }
                          disabled={IsSubmitting}
                          aria-invalid={LocalError.includes("email")}
                        />
                        <FieldDescription>
                          Enter your rhu email address. This will be used to
                          send you an email with your booking status.
                        </FieldDescription>
                        {LocalError.includes("email") && (
                          <FieldError>{titleCase(LocalError)}</FieldError>
                        )}
                      </Field>
                      <Field>
                        <Label htmlFor="rhuID">RHU ID:</Label>
                        <Input
                          id="rhuID"
                          type="number"
                          placeholder="ex. 202400671"
                          value={String(BookingInput.rhuId)}
                          onChange={(event) =>
                            updateFields({ rhuId: Number(event.target.value) })
                          }
                          disabled={IsSubmitting}
                          aria-invalid={LocalError.includes("id")}
                        />
                        <FieldDescription>
                          Enter your rhu ID number.
                        </FieldDescription>
                        {LocalError.includes("id") && (
                          <FieldError>{titleCase(LocalError)}</FieldError>
                        )}
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                  <FieldSet className="col-[2/2] row-[1/1]">
                    <Field>
                      <Label htmlFor="filterDepartment">Department:</Label>
                      <Select
                        value={
                          BookingInput.department_id
                            ? String(BookingInput.department_id)
                            : undefined
                        }
                        onValueChange={(value) =>
                          updateFields({
                            department_id: parseInt(value) || undefined,
                          })
                        }
                        disabled={IsSubmitting}
                      >
                        <SelectTrigger
                          id="filterDepartment"
                          aria-invalid={LocalError.includes("department")}
                        >
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent className="z-301">
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
                        Select the Department you belong to.
                      </FieldDescription>
                      {LocalError.includes("department") && (
                        <FieldError>{titleCase(LocalError)}</FieldError>
                      )}
                    </Field>
                    <FieldGroup>
                      <Field>
                        <Label htmlFor="courses">Courses:</Label>
                        <CoursesMenu
                          selectedCourseCodes={BookingInput.courses}
                          onSelectionChange={(askedCourses) =>
                            updateFields({ courses: askedCourses })
                          }
                          buttonLabel="Open Courses Menu"
                          disabled={IsSubmitting}
                          aria_invalid={LocalError.includes("course")}
                        />
                        <FieldDescription>
                          Select the cvourses you want to ask about. You can
                          select multiple courses.
                        </FieldDescription>
                        {LocalError.includes("course") && (
                          <FieldError>{titleCase(LocalError)}</FieldError>
                        )}
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                </div>
              </CardContent>
              <CardFooter className="bg-transparent">
                <CardAction className="size-full flex justify-center items-center gap-5">
                  <Button
                    onClick={AddBooking}
                    className=" size-1/2 py-2 text-lg"
                  >
                    Book Session
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setIsopen({ Isopen: false })}
                    className=" size-1/2 py-2 text-lg"
                  >
                    Close
                  </Button>
                </CardAction>
              </CardFooter>
            </Card>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
