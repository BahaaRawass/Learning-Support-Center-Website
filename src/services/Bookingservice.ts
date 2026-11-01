import { supabaseClient } from "@/supabase-client";
import type { Booking, BookingInsert, BookingStatus } from "@/types/booking";
import type { Data } from "@/types/types";

export async function fetchBookings() {
  const { data, error } = (await supabaseClient
    .from("Bookings")
    .select("*")) as Data<Booking[]>;

  if (error) throw error;

  return data;
}

export async function addBooking(booking: BookingInsert) {
  const { data, error } = (await supabaseClient
    .from("Bookings")
    .insert(booking)
    .select()
    .single()) as Data<Booking>;

  if (error) throw error;
  return data;
}

export async function updateBookingStatus({
  bookingId,
  status,
}: {
  bookingId: Booking["id"];
  status: BookingStatus;
}) {
  const { data, error } = (await supabaseClient
    .from("Bookings")
    .update({ status })
    .eq("id", bookingId)
    .select()
    .single()) as Data<Booking>;

  if (error) throw error;
  return data;
}

export async function deleteBooking(bookingId: Booking["id"]) {
  const { error } = (await supabaseClient
    .from("Bookings")
    .delete()
    .eq("id", bookingId)
    .select()
    .single()) as Data<Booking>;

  if (error) throw error;
  return true;
}
