import type { Booking } from "@/types/booking";
import BookingListCard from "./BookingListCard";

type BookingListProps = {
  Bookings: Booking[];
  IsSubmiting: boolean;
  handleUpdateBookingStatus: (
    bookingId: Booking["id"],
    status: Booking["status"],
  ) => Promise<void>;
};

export default function BookingList({
  Bookings,
  IsSubmiting,
  handleUpdateBookingStatus,
}: BookingListProps) {
  return (
    <ul className="space-y-4">
      {Bookings.map((booking) => (
        <BookingListCard
          key={booking.id}
          booking={booking}
          IsSubmiting={IsSubmiting}
          handleUpdateBookingStatus={handleUpdateBookingStatus}
        />
      ))}
    </ul>
  );
}
