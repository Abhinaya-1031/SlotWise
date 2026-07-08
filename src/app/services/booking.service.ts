import { Injectable } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  runTransaction,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Booking, BookingStatus } from '../models/booking.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private db;

  constructor() {
    const app = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();
    this.db = getFirestore(app);
  }

  getBookings(): Observable<Booking[]> {
    return new Observable<Booking[]>((observer) => {
      const bookingsRef = collection(this.db, 'bookings');
      
      const unsubscribe = onSnapshot(bookingsRef, (snapshot) => {
        const bookings: Booking[] = [];
        snapshot.forEach((doc) => {
          bookings.push({ id: doc.id, ...doc.data() } as Booking);
        });
        observer.next(bookings);
      }, (error) => {
        observer.error(error);
      });

      return { unsubscribe };
    });
  }

  async createBooking(booking: Omit<Booking, 'id' | 'status'>): Promise<void> {
    const slotDocRef = doc(this.db, 'slots', booking.slotId);
    const bookingsCollRef = collection(this.db, 'bookings');
    const newBookingDocRef = doc(bookingsCollRef);

    await runTransaction(this.db, async (transaction) => {
      const slotSnapshot = await transaction.get(slotDocRef);
      if (!slotSnapshot.exists()) {
        throw new Error('Slot does not exist.');
      }

      const slotData = slotSnapshot.data();
      const currentBooked = slotData['booked'] || 0;
      const capacity = slotData['capacity'] || 0;

      if (currentBooked >= capacity) {
        throw new Error('This slot is already fully booked.');
      }

      transaction.update(slotDocRef, { booked: currentBooked + 1 });
      transaction.set(newBookingDocRef, {
        slotId: booking.slotId,
        name: booking.name,
        contact: booking.contact,
        status: 'Pending'
      });
    });
  }

  updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
    const bookingDocRef = doc(this.db, 'bookings', id);
    return updateDoc(bookingDocRef, { status });
  }
}
