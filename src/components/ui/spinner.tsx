import type { ComponentProps } from "react";
import { Loader2Icon } from "lucide-react";

function Spinner({ className = "", ...props }: ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={`size-4 animate-spin ${className}`}
      {...props}
    />
  );
}

export { Spinner };