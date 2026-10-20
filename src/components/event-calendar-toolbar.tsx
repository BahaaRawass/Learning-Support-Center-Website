import { CalendarController } from "@fullcalendar/react";
import {
  EventCalendarNextIcon,
  EventCalendarPrevIcon,
} from "@/components/event-calendar-icons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { MouseEvent } from "react";

export interface EventCalendarToolbarProps {
  className?: string;
  controller: CalendarController;
  availableViews: string[];
  addButton?: {
    isPrimary?: boolean;
    text?: string;
    hint?: string;
    click?: (ev: MouseEvent<HTMLButtonElement>) => void;
  };
}

// Explicit labels prevent missing text during initial rendering.
const viewLabels: Record<string, string> = {
  dayGridMonth: "Month",
  timeGridWeek: "Week",
  timeGridDay: "Day",
  listWeek: "List",
  listDay: "List",
};

export function EventCalendarToolbar({
  className,
  controller,
  availableViews,
  addButton,
}: EventCalendarToolbarProps) {
  const buttons = controller.getButtonState();

  return (
    <div
      className={cn(
        "flex items-center justify-between flex-wrap gap-3",
        className,
      )}
    >
      <div className="flex items-center shrink-0 gap-3">
        {addButton && (
          <Button
            onClick={addButton.click as any}
            aria-label={addButton.hint ?? addButton.text}
          >
            {addButton.text}
          </Button>
        )}

        <Button
          onClick={() => controller.today()}
          aria-label={buttons.today.hint ?? "Today"}
          variant="outline"
          className="text-black"
        >
          Today
        </Button>

        <div className="flex items-center">
          <Button
            onClick={() => controller.prev()}
            disabled={buttons.prev.isDisabled}
            aria-label={buttons.prev.hint}
            variant="ghost"
            size="icon"
          >
            <EventCalendarPrevIcon />
          </Button>

          <Button
            onClick={() => controller.next()}
            disabled={buttons.next.isDisabled}
            aria-label={buttons.next.hint}
            variant="ghost"
            size="icon"
          >
            <EventCalendarNextIcon />
          </Button>
        </div>

        <div className="text-xl">{controller.view?.title}</div>
      </div>

      <Tabs value={controller.view?.type ?? availableViews[0]}>
        <TabsList>
          {availableViews.map((availableView) => {
            const label =
              viewLabels[availableView] ??
              buttons[availableView]?.text ??
              availableView;

            return (
              <TabsTrigger
                key={availableView}
                value={availableView}
                onClick={() => controller.changeView(availableView)}
                aria-label={buttons[availableView]?.hint ?? label}
              >
                {label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
