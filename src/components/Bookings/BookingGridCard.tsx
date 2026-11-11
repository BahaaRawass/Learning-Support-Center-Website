import { formatDate, GetInitials } from "@/helper/functions";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import type { Booking } from "@/types/booking";
import CoursesDisplayList from "../CoursesDisplayList";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

type BookingGridCardProps = {
  booking: Booking;
  IsSubmiting: boolean;
  handleUpdateBookingStatus: (
    bookingId: Booking["id"],
    status: Booking["status"],
  ) => Promise<void>;
};

export default function BookingGridCard({
  booking,
  IsSubmiting,
  handleUpdateBookingStatus,
}: BookingGridCardProps) {
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
    <Card>
      <CardHeader>
        <Avatar size="lg">
          <AvatarFallback>{GetInitials(booking.name)}</AvatarFallback>
        </Avatar>
        <CardTitle>{booking.name}</CardTitle>
        <CardDescription>
          Booked at:{" "}
          <span className="font-semibold">{formatDate(booking.booked_at)}</span>
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
          <CoursesDisplayList selectedCourseCodes={booking.courses} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col justify-center items-center gap-5 border-t border-(--navy-light)">
        <Button
          className="btn-primary w-full disabled:cursor-not-allowed"
          onClick={async () =>
            await handleUpdateBookingStatus(booking.id, "ACCEPTED")
          }
          disabled={booking.status !== "WAITING" || IsSubmiting}
        >
          {IsSubmiting ? (
            <>
              <Spinner />
              Accepting booking...
            </>
          ) : (
            "Accept Booking"
          )}
        </Button>
        <Button
          variant="destructive"
          className="w-full disabled:cursor-not-allowed"
          onClick={async () =>
            await handleUpdateBookingStatus(booking.id, "REJECTED")
          }
          disabled={booking.status !== "WAITING" || IsSubmiting}
        >
          {IsSubmiting ? (
            <>
              <Spinner />
              Rejecting booking...
            </>
          ) : (
            "Reject Booking"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
