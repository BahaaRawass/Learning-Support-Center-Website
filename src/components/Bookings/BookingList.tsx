import type { Booking } from "@/types/booking";
import BookingListCard from "./BookingListCard";
import type { Department } from "@/types/department";

type BookingListProps = {
  Bookings: Booking[];
  IsSubmiting: boolean;
  Departments: Department[];
  handleUpdateBookingStatus: (
    bookingId: Booking["id"],
    status: Booking["status"],
  ) => Promise<void>;
};

export default function BookingList({
  Bookings,
  IsSubmiting,
  Departments,
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
          Departments={Departments}
        />
      ))}
    </ul>
  );
}
