import {
  addBooking,
  deleteBooking,
  fetchBookings,
  updateBookingStatus,
} from "@/services/Bookingservice";
import type { Booking, BookingInsert, BookingStatus } from "@/types/booking";
import type { MutationOptions } from "@/types/types";
import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function useBooking() {
  const queryClient = useQueryClient();

  const [Loading, setLoading] = useState<boolean>(false);
  const [Error, setError] = useState<PostgrestError | null>(null);

  const {
    data: Bookings,
    isLoading,
    error: QueryError,
  } = useQuery<Booking[], PostgrestError>({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  });

  const AddBookingMutation = useMutation<
    Booking,
    PostgrestError,
    BookingInsert
  >({
    mutationFn: addBooking,
    onMutate: () => setLoading(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onSettled: (_data, error) => {
      if (error) setError(error);
      setLoading(false);
    },
  });

  const UpdateBookingStatusMutation = useMutation<
    Booking,
    PostgrestError,
    { bookingId: Booking["id"]; status: BookingStatus }
  >({
    mutationFn: updateBookingStatus,
    onMutate: () => setLoading(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onSettled: (_data, error) => {
      if (error) setError(error);
      setLoading(false);
    },
  });

  const DeleteBookingMutation = useMutation<
    boolean,
    PostgrestError,
    Booking["id"]
  >({
    mutationFn: deleteBooking,
    onMutate: () => setLoading(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onSettled: (_data, error) => {
      if (error) setError(error);
      setLoading(false);
    },
  });

  async function AddBooking(
    booking: BookingInsert,
    options?: MutationOptions<Booking, BookingInsert>,
  ) {
    const { isSuccess, data, mutateAsync } = AddBookingMutation;

    await mutateAsync(booking, options);

    return isSuccess ? data : null;
  }

  async function UpdateBookingStatus(
    bookingId: Booking["id"],
    status: BookingStatus,
    options?: MutationOptions<
      Booking,
      { bookingId: Booking["id"]; status: BookingStatus }
    >,
  ) {
    const { isSuccess, data, mutateAsync } = UpdateBookingStatusMutation;

    await mutateAsync({ bookingId, status }, options);

    return isSuccess ? data : null;
  }

  async function DeleteBooking(
    bookingId: Booking["id"],
    options?: MutationOptions<boolean, Booking["id"]>,
  ) {
    const { isSuccess, data, mutateAsync } = DeleteBookingMutation;

    await mutateAsync(bookingId, options);

    return isSuccess ? data : null;
  }

  return {
    Bookings,
    Loading: isLoading || Loading,
    Error: QueryError || Error,
    AddBooking,
    UpdateBookingStatus,
    DeleteBooking,
  };
}
