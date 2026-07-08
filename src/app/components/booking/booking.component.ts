import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SlotService } from '../../services/slot.service';
import { BookingService } from '../../services/booking.service';
import { Slot } from '../../models/slot.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit, OnDestroy {
  slots: Slot[] = [];
  futureSlots: Slot[] = [];
  displayedSlots: Slot[] = [];
  selectedSlot: Slot | null = null;
  slotSearch: string = '';
  
  bookingForm: FormGroup;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  
  private subscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private slotService: SlotService,
    private bookingService: BookingService
  ) {
    this.bookingForm = this.fb.group({
      name: ['', Validators.required],
      contact: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.subscription = this.slotService.getSlots().subscribe({
      next: (slots) => {
        this.slots = slots;
        this.filterFutureSlots();
        this.filterSlots();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching slots for booking page:', err);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  filterFutureSlots(): void {
    const now = new Date();
    this.futureSlots = this.slots.filter((slot) => {
      try {
        const slotDateTime = new Date(`${slot.date}T${slot.time}`);
        return isNaN(slotDateTime.getTime()) || slotDateTime >= now;
      } catch (e) {
        return true;
      }
    });

    if (this.selectedSlot) {
      const stillExists = this.futureSlots.find((s) => s.id === this.selectedSlot?.id);
      if (!stillExists || stillExists.booked >= stillExists.capacity) {
        this.selectedSlot = null;
        this.bookingForm.reset();
      } else {
        this.selectedSlot = stillExists;
      }
    }
  }

  filterSlots(): void {
    const q = this.slotSearch.toLowerCase().trim();
    if (!q) {
      this.displayedSlots = [...this.futureSlots];
    } else {
      this.displayedSlots = this.futureSlots.filter(s =>
        s.date.toLowerCase().includes(q) || s.time.toLowerCase().includes(q)
      );
    }
  }

  getOccupancy(slot: Slot): number {
    if (slot.capacity === 0) return 0;
    return Math.round((slot.booked / slot.capacity) * 100);
  }

  selectSlot(slot: Slot): void {
    if (slot.booked >= slot.capacity) {
      return;
    }
    this.selectedSlot = slot;
    this.successMessage = '';
    this.errorMessage = '';
    this.bookingForm.reset();
  }

  reset(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.selectedSlot = null;
    this.bookingForm.reset();
  }

  onSubmit(): void {
    if (this.bookingForm.invalid || !this.selectedSlot?.id) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { name, contact } = this.bookingForm.value;

    this.bookingService.createBooking({
      slotId: this.selectedSlot.id,
      name,
      contact
    })
    .then(() => {
      this.isSubmitting = false;
      this.successMessage = `Your appointment is confirmed for ${this.selectedSlot?.date} at ${this.selectedSlot?.time}.`;
      this.selectedSlot = null;
      this.bookingForm.reset();
    })
    .catch((err: any) => {
      this.isSubmitting = false;
      console.error(err);
      this.errorMessage = err.message || 'An error occurred. Please verify capacity or try again.';
    });
  }
}
