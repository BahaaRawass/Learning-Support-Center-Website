import BookingGrid from "@/components/Bookings/BookingGrid";
import BookingList from "@/components/Bookings/BookingList";
import ErrorCard from "@/components/error-card";
import LoadingCard from "@/components/loading-card";
import NavigateToLogin from "@/components/NavigateToLogin";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { SetErrorMessage } from "@/helper/errorhelpers";
import { useAuth } from "@/hooks/useAuth";
import useBooking from "@/hooks/useBooking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { Booking } from "@/types/booking";
import { GridIcon, LayoutListIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Bookings() {
  useDocumentTitle("Bookings");

  const {
    Session,
    Loading: AuthLoading,
    Error: AuthError,
    SendEmail,
  } = useAuth();
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

    const booking = Bookings!.find((booking) => booking.id === bookingId);

    if (booking?.status !== "WAITING")
      return alert(
        "Booking status can only be updated if it is in WAITING status.",
      );

    await UpdateBookingStatus(bookingId, status, {
      onSuccess: async () =>
        await SendEmail(
          booking.email,
          import.meta.env.VITE_RESEND_FROM_EMAIL,
          "Booking Status Updated",
          `Your booking status has been updated to ${status.toLowerCase()}`
        ),
      onError: (error) =>
        alert(`Failed to update booking status: ${SetErrorMessage(error)}`),
    });

    setIsSubmiting(false);
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
            className={`${DisplayStyle === "list" ? "btn-primary text-white" : ""} `}
            onClick={() => setDisplayStyle("list")}
          >
            <LayoutListIcon />
          </Button>
        </ButtonGroup>
      </div>

      {DisplayStyle === "grid" ? (
        <BookingGrid
          Bookings={Bookings}
          IsSubmiting={IsSubmiting}
          handleUpdateBookingStatus={handleUpdateBookingStatus}
        />
      ) : (
        <BookingList
          Bookings={Bookings}
          IsSubmiting={IsSubmiting}
          handleUpdateBookingStatus={handleUpdateBookingStatus}
        />
      )}
    </>
  );
}
