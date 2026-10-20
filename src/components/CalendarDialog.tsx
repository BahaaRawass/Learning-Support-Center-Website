import type { UpdaterFunction } from "@/types/types";
import type { User } from "@/types/users";

type CalendarDialogProps = {
  Isopen: boolean;
  setIsopen: UpdaterFunction<boolean>;
  user: User | undefined;
};

export default function CalendarDialog({
  Isopen,
  setIsopen,
  user,
}: CalendarDialogProps) {
  if (!user) return <h5>No User Found</h5>;

  return <div>User</div>
}
