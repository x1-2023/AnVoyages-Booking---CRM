import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "relative",
        months: "flex flex-col gap-5 sm:flex-row",
        month: "w-full space-y-3",
        month_caption: "relative flex h-9 items-center justify-center",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 rounded-full p-0 text-foreground hover:bg-muted",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 rounded-full p-0 text-foreground hover:bg-muted",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "border-0",
        weekday: "h-9 w-9 text-center text-xs font-semibold text-muted-foreground",
        week: "border-0",
        day: cn(
          "h-9 w-9 p-0 text-center text-sm",
          "[&:has([aria-selected])]:bg-primary/10",
          "first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 rounded-full p-0 font-normal hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary",
        ),
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        range_start: "rounded-l-full bg-primary text-primary-foreground",
        range_end: "rounded-r-full bg-primary text-primary-foreground",
        range_middle: "bg-primary/10 text-foreground [&>button]:rounded-none [&>button]:bg-transparent [&>button]:text-foreground",
        today: "text-primary [&>button]:font-bold",
        outside: "text-muted-foreground/45",
        disabled: "pointer-events-none text-muted-foreground/35 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
