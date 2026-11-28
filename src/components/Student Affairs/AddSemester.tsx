import { ValidateSemesterInput } from "@/helper/validation";
import { useSemesters } from "@/hooks/student_affairs/useSemesters";
import type {
  SemesterInput,
  SemesterTerm,
} from "@/types/Student Affiars/semesters";
import { Fragment, useState, type SubmitEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { InfoIcon, PlusCircleIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { updateFields } from "@/helper/functions";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import ErrorCard from "../error-card";
import { SetErrorMessage } from "@/helper/errorhelpers";

export default function AddSemester() {
  const { Loading, Error, AddSemester } = useSemesters();

  const InitialInput: SemesterInput = {
    term: "Fall",
    year: new Date().getFullYear(),
    start_date: "",
    end_date: "",
  };

  const [SemesterInput, setSemesterInput] =
    useState<SemesterInput>(InitialInput);
  const [IsSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [LocalError, setLocalError] = useState<string>("");

  if (Loading) return <LoadingCard message="Loading semesters data" />;

  if (Error) return <ErrorCard message={SetErrorMessage(Error)} />;

  const SemesterTerms: SemesterTerm[] = ["Fall", "Spring", "Summer"];

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (IsSubmitting) return;
    setIsSubmitting(true);

    const validationError = ValidateSemesterInput(SemesterInput);
    if (validationError) {
      setIsSubmitting(false);
      setLocalError(validationError);
      return;
    }

    await AddSemester(SemesterInput, {
      onSettled: () => {
        setIsSubmitting(false);
        setSemesterInput(InitialInput);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit}>
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
            <LoadingCard message="Adding semester" className="min-h-auto!" />
          ) : (
            <>
              <FormSection icon={<InfoIcon />} title="Semester Details">
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 grid-rows-2">
                  <Field>
                    <FieldLabel>Semester Term</FieldLabel>
                    <FieldContent>
                      <Select
                        value={SemesterInput.term}
                        onValueChange={(value: SemesterTerm) =>
                          updateFields({ term: value }, setSemesterInput)
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
                            { year: Number(e.target.value) },
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
                  <Field>
                    <FieldLabel>Semester Start Date</FieldLabel>
                    <FieldContent>
                      <Input
                        type="date"
                        value={SemesterInput.start_date}
                        onChange={(event) =>
                          updateFields(
                            { start_date: event.target.value },
                            setSemesterInput,
                          )
                        }
                        required
                        aria-invalid={LocalError.includes("start_date")}
                        disabled={IsSubmitting}
                      />
                      <FieldDescription>
                        Enter the start date for the semester
                      </FieldDescription>
                      {LocalError.includes("start_date") && (
                        <FieldError> {LocalError}</FieldError>
                      )}
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>Semester End Date</FieldLabel>
                    <FieldContent>
                      <Input
                        type="date"
                        value={SemesterInput.end_date}
                        onChange={(event) =>
                          updateFields(
                            { end_date: event.target.value },
                            setSemesterInput,
                          )
                        }
                        required
                        aria-invalid={LocalError.includes("end_date")}
                        disabled={IsSubmitting}
                      />
                      <FieldDescription>
                        Enter the end date for the semester
                      </FieldDescription>
                      {LocalError.includes("end_date") && (
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
            onClick={() => setSemesterInput(InitialInput)}
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
  );
}
