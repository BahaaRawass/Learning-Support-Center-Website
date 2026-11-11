import type { Booking } from "@/types/booking";
import BookingGridCard from "./BookingGridCard";

type BookingGridProps = {
  Bookings: Booking[];
  IsSubmiting: boolean;
  handleUpdateBookingStatus: (
    bookingId: Booking["id"],
    status: Booking["status"],
  ) => Promise<void>;
};

export default function BookingGrid({
  Bookings,
  IsSubmiting,
  handleUpdateBookingStatus,
}: BookingGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      {Bookings.map((booking) => (
        <BookingGridCard
          key={booking.id}
          booking={booking}
          IsSubmiting={IsSubmiting}
          handleUpdateBookingStatus={handleUpdateBookingStatus}
        />
      ))}
    </div>
  );
}
