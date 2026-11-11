import { formatDate, GetInitials } from "@/helper/functions";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../ui/item";
import { Button } from "../ui/button";
import type { Booking } from "@/types/booking";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import CoursesDisplayList from "../CoursesDisplayList";
import { useState } from "react";
import { Spinner } from "../ui/spinner";

type BookingListCardProps = {
  booking: Booking;
  IsSubmiting: boolean;
  handleUpdateBookingStatus: (
    bookingId: Booking["id"],
    status: Booking["status"],
  ) => Promise<void>;
};

export default function BookingListCard({
  booking,
  IsSubmiting,
  handleUpdateBookingStatus,
}: BookingListCardProps) {
  const [IsOpen, setIsOpen] = useState<boolean>(false);

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
          <Button className="btn-primary" onClick={() => setIsOpen(true)}>
            View
          </Button>
        </ItemActions>
      </Item>

      <Dialog
        open={IsOpen}
        as="div"
        className="relative z-9999999 focus:outline-none"
        onClose={() => setIsOpen(false)}
      >
        <div className="fixed inset-0 z-9999999 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogBackdrop className="fixed inset-0 bg-black/15" />
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white dark:bg-card p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
              <Card className="ring-0!">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-4">
                    <Avatar size="lg">
                      <AvatarFallback>
                        {GetInitials(booking.name)}
                      </AvatarFallback>
                    </Avatar>
                    <DialogTitle>{booking.name}</DialogTitle>
                  </CardTitle>
                  <CardDescription className="text-[16px]">
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
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
