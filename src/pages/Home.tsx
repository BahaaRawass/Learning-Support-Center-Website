import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAuth } from "@/hooks/useAuth";
import ErrorCard from "@/components/error-card";
import LoadingCard from "@/components/loading-card";
import { SetErrorMessage } from "@/helper/errorhelpers";
import NavigateToLogin from "@/components/NavigateToLogin";
import { EventCalendar } from "@/components/event-calendar";
import type { EventClickInfo } from "@fullcalendar/react";
import { useUsers } from "@/hooks/useUsers";
import {
  CreateCalendarEvents,
  type CalendarDialogInfo,
} from "@/helper/calendar";
import { useState } from "react";
import { useDepartments } from "@/hooks/useDepartments";
import { useCourses } from "@/hooks/useCourses";
import CalendarDialog from "@/components/CalendarDialog";

export default function Home() {
  useDocumentTitle("Home");

  const [CalendarDialogInfo, setCalendarDialogInfo] =
    useState<CalendarDialogInfo>({ Isopen: false });

  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();

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

  const loading =
    AuthLoading || UsersLoading || DepartmentsLoading || CoursesLoading;
  const error = AuthError || UsersError || DepartemtsError || CoursesError;
  const data = Users && Departments && Courses;

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

  const events = CreateCalendarEvents(Users, "2026-09-01", "2026-12-10");

  function handleEventCLick(info: EventClickInfo) {
    const event = info.event;

    const userId = event.extendedProps.userId;

    if (!event.start) return;

    const day = event.start.toLocaleDateString("en-LB", {
      weekday: "long",
    });

    const startTime = event.start.toLocaleTimeString("en-LB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const endTime = event.end
      ? event.end.toLocaleTimeString("en-LB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

    const timeslot = endTime
      ? `${day}: ${startTime} - ${endTime}`
      : `${day}: ${startTime}`;

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
        Courses={Courses}
        Departments={Departments}
        Isopen={CalendarDialogInfo.Isopen}
        setIsopen={setCalendarDialogInfo}
        user={CalendarDialogInfo.user}
        timeslot={CalendarDialogInfo.timeslot}
      />
    </>
  );
}
