export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export interface Booking {
  id?: string;
  slotId: string;
  name: string;
  contact: string;
  status: BookingStatus;
  
  // Optional client-side joined fields for UI display
  slotDate?: string;
  slotTime?: string;
}
