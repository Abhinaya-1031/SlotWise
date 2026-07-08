import { Injectable } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Slot } from '../models/slot.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SlotService {
  private db;

  constructor() {
    const app = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();
    this.db = getFirestore(app);
  }

  getSlots(): Observable<Slot[]> {
    return new Observable<Slot[]>((observer) => {
      const slotsRef = collection(this.db, 'slots');
      
      const unsubscribe = onSnapshot(slotsRef, (snapshot) => {
        const slots: Slot[] = [];
        snapshot.forEach((doc) => {
          slots.push({ id: doc.id, ...doc.data() } as Slot);
        });
        
        // Sort client-side by Date and Time combined to avoid Firestore composite index requirement
        slots.sort((a, b) => {
          const dateTimeA = `${a.date}T${a.time}`;
          const dateTimeB = `${b.date}T${b.time}`;
          return dateTimeA.localeCompare(dateTimeB);
        });
        
        observer.next(slots);
      }, (error) => {
        observer.error(error);
      });

      return { unsubscribe };
    });
  }

  createSlot(slot: Omit<Slot, 'id' | 'booked'>): Promise<any> {
    const slotsRef = collection(this.db, 'slots');
    return addDoc(slotsRef, {
      ...slot,
      booked: 0
    });
  }

  updateSlot(id: string, slot: Partial<Slot>): Promise<void> {
    const slotDocRef = doc(this.db, 'slots', id);
    return updateDoc(slotDocRef, slot);
  }

  deleteSlot(id: string): Promise<void> {
    const slotDocRef = doc(this.db, 'slots', id);
    return deleteDoc(slotDocRef);
  }
}
