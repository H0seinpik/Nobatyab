export type SlotStatus = "available" | "booked" | "past" | "inactive";

export interface SlotDto {
  startAt: string;
  endAt: string;
  status?: SlotStatus;
}

export interface AvailableDaysDto {
  dates: string[];
}
