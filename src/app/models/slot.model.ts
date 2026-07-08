export interface Slot {
  id?: string;
  date: string;       // Format: YYYY-MM-DD
  time: string;       // Format: HH:MM
  capacity: number;
  booked: number;
}
