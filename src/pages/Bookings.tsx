import CoursesDisplayList from "@/components/CoursesDisplayList";
import ErrorCard from "@/components/error-card";
import LoadingCard from "@/components/loading-card";
import NavigateToLogin from "@/components/NavigateToLogin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { SetErrorMessage } from "@/helper/errorhelpers";
import { formatDate, GetInitials } from "@/helper/functions";
import { useAuth } from "@/hooks/useAuth";
import useBooking from "@/hooks/useBooking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { Booking } from "@/types/booking";
import { GridIcon, LayoutListIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Bookings() {
  useDocumentTitle("Bookings");

  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();
  const {
    Bookings,
    Loading: BookingsLoading,
    Error: BookingsError,
    UpdateBookingStatus,
  } = useBooking();
  const navigate = useNavigate();

  const [DisplayStyle, setDisplayStyle] = useState<"grid" | "list">("grid");
  const [IsSubmiting, setIsSubmiting] = useState<boolean>(false);

  const loading = AuthLoading || BookingsLoading;
  const error = AuthError || BookingsError;

  if (loading)
    return (
      <LoadingCard
        message={AuthLoading ? "Checking authentication" : "Loading bookings"}
      />
    );

  if (!Session) return <NavigateToLogin />;

  if (Session.user.is_anonymous)
    return (
      <ErrorCard
        message="You do not have permission to view this page."
        actionLabel="Go to Home"
        onAction={() => navigate("/")}
      />
    );

  if (error) return <ErrorCard message={SetErrorMessage(error)} />;

  if (!Bookings)
    return <ErrorCard message="Failed to load student bookings." />;

  async function handleUpdateBookingStatus(
    bookingId: Booking["id"],
    status: Booking["status"],
  ) {
    if (IsSubmiting) return;
    setIsSubmiting(true);

    const ok = await UpdateBookingStatus(bookingId, status);
    if (!ok) alert("Failed to update booking status.");
    setIsSubmiting(false);
  }

  function GetStatusColor(status: Booking["status"]) {
    switch (status) {
      case "WAITING":
        return "text-gray-600";
      case "ACCEPTED":
        return "text-green-500";
      case "REJECTED":
        return "text-red-500";
    }
  }

  return (
    <>
      <h1 className="page-title">Student Bookings</h1>
      <p className="page-desc">
        View All Student Bookings here. You can filter by name, RHU ID, email,
        booking status, and courses.
      </p>
      <div className="flex justify-end mb-5">
        <ButtonGroup>
          <Button
            variant={DisplayStyle === "grid" ? "default" : "outline"}
            className={`${DisplayStyle === "grid" ? "btn-primary text-white" : ""}`}
            onClick={() => setDisplayStyle("grid")}
          >
            <GridIcon />
          </Button>
          <Button
            variant={DisplayStyle === "list" ? "default" : "outline"}
            className={`${DisplayStyle === "list" ? "btn-primary text-white" : ""}`}
            onClick={() => setDisplayStyle("list")}
          >
            <LayoutListIcon />
          </Button>
        </ButtonGroup>
      </div>

      <div
        className={`grid ${DisplayStyle === "grid" ? "grid-cols-1 lg:grid-cols-4 grid-rows-4" : "grid-cols-1 grid-rows-[auto]"} gap-4`}
      >
        {Bookings.map((booking) => {
          if (DisplayStyle === "list")
            return (
              <Item variant="muted">
                <ItemMedia>
                  <Avatar size="lg" className="size-10">
                    <AvatarFallback>{GetInitials(booking.name)}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{booking.name}</ItemTitle>
                  <ItemDescription>
                    booked at:{" "}
                    <span className="font-semibold">
                      {formatDate(booking.booked_at)}
                    </span>
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button className="btn-primary">View</Button>
                </ItemActions>
              </Item>
            );

          return (
            <Card>
              <CardHeader>
                <Avatar size="lg">
                  <AvatarFallback>{GetInitials(booking.name)}</AvatarFallback>
                </Avatar>
                <CardTitle>{booking.name}</CardTitle>
                <CardDescription>
                  Booked at:{" "}
                  <span className="font-semibold">
                    {formatDate(booking.booked_at)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>RHU ID: {booking.rhuId}</p>
                <Separator className="mt-2 mb-2" />
                <p>Email: {booking.email}</p>
                <Separator className="mt-2 mb-2" />
                <p>
                  Booking Status:{" "}
                  <span className={`${GetStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </p>
                <Separator className="mt-2 mb-2" />
                <div className="flex items-center">
                  <p>Courses:</p>
                  <CoursesDisplayList
                    selectedCourseCodes={booking.courses}
                    maxVisible={5}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col justify-center items-center gap-5 border-t border-(--navy-light)">
                <Button
                  className="btn-primary w-full"
                  onClick={async () =>
                    await handleUpdateBookingStatus(booking.id, "ACCEPTED")
                  }
                >
                  Accept Booking
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={async () =>
                    await handleUpdateBookingStatus(booking.id, "REJECTED")
                  }
                >
                  Reject Booking
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
