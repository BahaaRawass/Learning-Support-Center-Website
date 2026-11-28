import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAuth } from "@/hooks/useAuth";
import ErrorCard from "@/components/error-card";
import LoadingCard from "@/components/loading-card";
import { SetErrorMessage } from "@/helper/errorhelpers";
import NavigateToLogin from "@/components/NavigateToLogin";
import { EventCalendar } from "@/components/event-calendar";
import type { EventClickInfo } from "@fullcalendar/react";
import { useUsers } from "@/hooks/useUsers";
import { CreateCalendarEvents } from "@/helper/calendar";
import { useState } from "react";
import { useDepartments } from "@/hooks/useDepartments";
import { useCourses } from "@/hooks/useCourses";
import CalendarDialog from "@/components/CalendarDialog";
import type { CalendarDialogInfo } from "@/types/booking";
import { useSemesters } from "@/hooks/student_affairs/useSemesters";

export default function Home() {
  useDocumentTitle("Home");

  const [CalendarDialogInfo, setCalendarDialogInfo] =
    useState<CalendarDialogInfo>({ Isopen: false });

  const {
    Session,
    Loading: AuthLoading,
    Error: AuthError,
    SendEmail,
  } = useAuth();

  const {
    Users,
    Loading: UsersLoading,
    Error: UsersError,
  } = useUsers(Session?.user);

  const {
    Departments,
    Error: DepartemtsError,
    Loading: DepartmentsLoading,
  } = useDepartments();

  const {
    Courses,
    Error: CoursesError,
    Loading: CoursesLoading,
  } = useCourses();

  const {
    Semesters,
    Loading: SemestersLoading,
    Error: SemestersError,
  } = useSemesters();

  const loading =
    AuthLoading ||
    UsersLoading ||
    DepartmentsLoading ||
    CoursesLoading ||
    SemestersLoading;
  const error =
    AuthError ||
    UsersError ||
    DepartemtsError ||
    CoursesError ||
    SemestersError;
  const data = Users && Departments && Courses && Semesters;

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

  if (error) {
    return <ErrorCard message={SetErrorMessage(error)} />;
  }

  if (!data) {
    return <ErrorCard message="Failed to load required data." />;
  }

  const Semster_Start_Date = new Date(Semesters[0].start_date)
    .toISOString()
    .split("T")[0];

  const Semster_End_Date = new Date(Semesters[0].end_date)
    .toISOString()
    .split("T")[0];

  const events = CreateCalendarEvents(
    Users,
    Semster_Start_Date,
    Semster_End_Date,
  );

  function handleEventCLick(info: EventClickInfo) {
    const event = info.event;

    const userId = event.extendedProps.userId;

    if (!event.start) return;

    const date = event.start.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    const startTime = event.start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const endTime = event.end
      ? event.end.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "No end time";

    const timeslot = `${date}: ${startTime} - ${endTime}`;

    const user = Users?.find((user) => user.id === userId);

    setCalendarDialogInfo({ Isopen: true, user, timeslot });
  }

  return (
    <>
      <h1 className="page-title">Home</h1>
      <p className="page-desc">
        Overview of support center activity and staff statistics.
      </p>
      <EventCalendar
        availableViews={["dayGridMonth", "timeGridWeek", "listWeek"]}
        events={events}
        weekends={false}
        eventClick={handleEventCLick}
      />

      <CalendarDialog
        Departments={Departments}
        Isopen={CalendarDialogInfo.Isopen}
        setIsopen={setCalendarDialogInfo}
        user={CalendarDialogInfo.user}
        timeslot={CalendarDialogInfo.timeslot}
        sendEmail={SendEmail}
      />
    </>
  );
}
