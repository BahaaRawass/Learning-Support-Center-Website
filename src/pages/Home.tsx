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
} from "@/helper/calendar";

export default function Home() {
  useDocumentTitle("Home");

  // const [CalendarDialogInfo, setCalendarDialogInfo] = useState<CalendarDialogInfo>({ Isopen: false });

  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();

  const {
    Users,
    Loading: UsersLoading,
    Error: UsersError,
  } = useUsers(Session?.user);

  const loading = AuthLoading || UsersLoading;
  const error = AuthError || UsersError;

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

  if (!Users) {
    return <ErrorCard message="No users found" />;
  }

  const events = CreateCalendarEvents(Users, "2026-09-01", "2026-12-10");

  function handleEventCLick(info: EventClickInfo) {
    const userId = info.event.extendedProps.userId;

    const user = Users!.find((u) => u.id === userId);

    // setCalendarDialogInfo({ Isopen: true, user });
    alert(user?.display_name);
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
    </>
  );
}
