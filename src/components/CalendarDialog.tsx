import type { CalendarDialogInfo } from "@/helper/calendar";
import type { UpdaterFunction } from "@/types/types";
import type { User } from "@/types/users";
import { Dialog } from "@headlessui/react";

type CalendarDialogProps = {
  Isopen: boolean;
  setIsopen: UpdaterFunction<CalendarDialogInfo>;
  user: User | undefined;
};

export default function CalendarDialog({
  Isopen,
  setIsopen,
  user,
}: CalendarDialogProps) {
  if (!user) return <h5>No User Found</h5>;

  return (
    <Dialog open={Isopen} onClose={() => setIsopen({ Isopen: false })}>
      User
    </Dialog>
  );
}
