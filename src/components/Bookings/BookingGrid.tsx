import type { Booking } from "@/types/booking";
import BookingGridCard from "./BookingGridCard";
import type { Department } from "@/types/department";

type BookingGridProps = {
  Bookings: Booking[];
  IsSubmiting: boolean;
  Departments: Department[];
  handleUpdateBookingStatus: (
    bookingId: Booking["id"],
    status: Booking["status"],
  ) => Promise<void>;
};

export default function BookingGrid({
  Bookings,
  IsSubmiting,
  Departments,
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
          Departments={Departments}
        />
      ))}
    </div>
  );
}
