"use client";

import { Button } from "@/apps/web/components/ui/button";
import { Calendar } from "@/apps/web/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/apps/web/components/ui/popover";
import { ScrollArea } from "@/apps/web/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/apps/web/components/ui/select";
import { cn } from "@/apps/web/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface DateTimePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
}

export function DateTimePicker({
  date,
  onDateChange,
  onTimeChange,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const now = new Date();
  const defaultTimeString = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  // Initialize time state with current time if no date provided
  const [time, setTime] = useState(defaultTimeString);
  console.log(time);

  // Set initial date and time when component mounts
  useEffect(() => {
    if (!date) {
      const initialDate = new Date();
      const [hours, minutes] = defaultTimeString.split(":");
      initialDate.setHours(parseInt(hours), parseInt(minutes));
      onDateChange(initialDate);
      onTimeChange(defaultTimeString);
    }
  }, []);

  // Update time when date changes
  useEffect(() => {
    if (date && time) {
      const [hours, minutes] = time.split(":");
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      onDateChange(newDate);
    }
  }, [time, date, onDateChange]);

  return (
    <div className="flex w-full gap-4">
      <div className="flex-1">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full font-normal justify-start text-left",
                !date && "text-muted-foreground"
              )}
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={date}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  const [hours, minutes] = time.split(":");
                  selectedDate.setHours(parseInt(hours), parseInt(minutes));
                }
                onDateChange(selectedDate);
                setIsOpen(false);
              }}
              fromYear={2000}
              toYear={new Date().getFullYear() + 1}
              defaultMonth={date || new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Select
          value={time}
          onValueChange={(newTime) => {
            setTime(newTime);
            onTimeChange(newTime);
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue defaultValue={time}>{time}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[180px]">
              {Array.from({ length: 96 }).map((_, i) => {
                const hour = Math.floor(i / 4)
                  .toString()
                  .padStart(2, "0");
                const minute = ((i % 4) * 15).toString().padStart(2, "0");
                const timeString = `${hour}:${minute}`;
                return (
                  <SelectItem key={i} value={timeString}>
                    {timeString}
                  </SelectItem>
                );
              })}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
