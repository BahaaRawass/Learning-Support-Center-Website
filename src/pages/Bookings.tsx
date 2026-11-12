import BookingGrid from "@/components/Bookings/BookingGrid";
import BookingList from "@/components/Bookings/BookingList";
import BookingsFilter from "@/components/Bookings/BookingsFilter";
import ErrorCard from "@/components/error-card";
import LoadingCard from "@/components/loading-card";
import NavigateToLogin from "@/components/NavigateToLogin";

import { SetErrorMessage } from "@/helper/errorhelpers";
import { useAuth } from "@/hooks/useAuth";
import useBooking from "@/hooks/useBooking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type {
  Booking,
  CategorySelectType,
  DisplayStyle,
} from "@/types/booking";
import { useEffect, useState } from "react";
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

  const [DisplayStyle, setDisplayStyle] = useState<DisplayStyle>("grid");
  const [IsSubmiting, setIsSubmiting] = useState<boolean>(false);
  const [CategorySelect, setCategorySelect] =
    useState<CategorySelectType>("name");
  const [FilterValue, setFilterValue] = useState<string>("");
  const [FilteredBookings, setFilteredBookings] = useState<
    Booking[] | undefined
  >(Bookings);
  const [Results, setResults] = useState<number>(0);

  useEffect(() => {
    if (!FilterValue && Bookings) {
      setFilteredBookings(Bookings);
      setResults(Bookings.length);
      return;
    }

    let filtered: Booking[] | undefined;

    switch (CategorySelect) {
      case "name":
        filtered = Bookings?.filter((booking) =>
          booking.name.toLowerCase().includes(FilterValue.toLowerCase()),
        );
        break;
      case "id":
        filtered = Bookings?.filter((booking) =>
          booking.rhuId.toString().includes(FilterValue),
        );
        break;

      case "email":
        filtered = Bookings?.filter((booking) =>
          booking.email.toLowerCase().includes(FilterValue.toLowerCase()),
        );
        break;

      case "courses":
        filtered = Bookings?.filter((booking) =>
          booking.courses.some((course) =>
            course.toLowerCase().includes(FilterValue.toLowerCase()),
          ),
        );
        break;

      case "status":
        filtered = Bookings?.filter((booking) =>
          booking.status.toLowerCase().includes(FilterValue.toLowerCase()),
        );
        break;
    }

    setResults(filtered?.length || 0);
    setFilteredBookings(filtered);
  }, [CategorySelect, FilterValue, Bookings]);

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
          `Your booking status has been updated to ${status.toLowerCase()}`,
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

      <BookingsFilter
        DisplayStyle={DisplayStyle}
        setDisplayStyle={setDisplayStyle}
        CategorySelect={CategorySelect}
        setCategorySelect={setCategorySelect}
        FilterValue={FilterValue}
        setFilterValue={setFilterValue}
        Results={Results}
      />

      {DisplayStyle === "grid" ? (
        <BookingGrid
          Bookings={FilteredBookings ?? Bookings}
          IsSubmiting={IsSubmiting}
          handleUpdateBookingStatus={handleUpdateBookingStatus}
        />
      ) : (
        <BookingList
          Bookings={FilteredBookings ?? Bookings}
          IsSubmiting={IsSubmiting}
          handleUpdateBookingStatus={handleUpdateBookingStatus}
        />
      )}
    </>
  );
}
