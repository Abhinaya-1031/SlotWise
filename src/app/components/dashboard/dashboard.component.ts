import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SlotService } from '../../services/slot.service';
import { BookingService } from '../../services/booking.service';
import { SlotListComponent } from '../slot-list/slot-list.component';
import { SlotFormComponent } from '../slot-form/slot-form.component';
import { Booking, BookingStatus } from '../../models/booking.model';
import { Slot } from '../../models/slot.model';
import { combineLatest, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SlotListComponent, SlotFormComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeTab: 'bookings' | 'slots' = 'bookings';

  // Raw data from Firestore
  bookings: Booking[] = [];
  slots: Slot[] = [];

  // Joined bookings for display
  joinedBookings: Booking[] = [];

  // Filter / search state
  bookingSearchQuery: string = '';
  bookingStatusFilter: string = 'All';

  // Slot form state
  editingSlot: Slot | null = null;
  showSlotForm: boolean = false;

  // Loading / error state
  isLoading: boolean = true;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  private dataSubscription?: Subscription;

  // Summary stats
  get totalSlots(): number { return this.slots.length; }
  get totalBookings(): number { return this.bookings.length; }
  get availableSlots(): number {
    return this.slots.filter(s => s.booked < s.capacity).length;
  }
  get confirmedBookings(): number {
    return this.bookings.filter(b => b.status === 'Confirmed').length;
  }

  // Filtered bookings displayed in table
  get filteredBookings(): Booking[] {
    return this.joinedBookings.filter(b => {
      const matchesStatus = this.bookingStatusFilter === 'All' || b.status === this.bookingStatusFilter;
      const q = this.bookingSearchQuery.toLowerCase();
      const matchesSearch = !q ||
        b.name.toLowerCase().includes(q) ||
        b.contact.toLowerCase().includes(q) ||
        (b.slotDate ?? '').includes(q) ||
        (b.slotTime ?? '').includes(q);
      return matchesStatus && matchesSearch;
    });
  }

  constructor(
    private authService: AuthService,
    private slotService: SlotService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dataSubscription = combineLatest([
      this.slotService.getSlots(),
      this.bookingService.getBookings()
    ]).subscribe({
      next: ([slots, bookings]) => {
        this.slots = slots;
        this.bookings = bookings;
        this.joinData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Dashboard data error:', err);
        this.showToast('Failed to load data. Check your Firebase configuration.', 'error');
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  joinData(): void {
    this.joinedBookings = this.bookings.map(booking => {
      const slot = this.slots.find(s => s.id === booking.slotId);
      return {
        ...booking,
        slotDate: slot ? slot.date : 'N/A',
        slotTime: slot ? slot.time : 'N/A'
      };
    }).sort((a, b) => {
      if (a.slotDate === 'N/A' || b.slotDate === 'N/A') return 0;
      return `${a.slotDate}T${a.slotTime}`.localeCompare(`${b.slotDate}T${b.slotTime}`);
    });
  }

  updateStatus(bookingId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as BookingStatus;
    this.bookingService.updateBookingStatus(bookingId, newStatus)
      .then(() => this.showToast(`Status updated to ${newStatus}.`, 'success'))
      .catch(err => {
        console.error(err);
        this.showToast('Failed to update status. Please try again.', 'error');
      });
  }

  logout(): void {
    this.authService.logout()
      .then(() => this.router.navigate(['/login']))
      .catch(err => console.error('Logout error:', err));
  }

  openCreateForm(): void {
    this.editingSlot = null;
    this.showSlotForm = true;
  }

  openEditForm(slot: Slot): void {
    this.editingSlot = { ...slot };
    this.showSlotForm = true;
  }

  closeForm(): void {
    this.showSlotForm = false;
    this.editingSlot = null;
  }

  onSlotSaved(message: string): void {
    this.closeForm();
    this.showToast(message, 'success');
  }

  showToast(message: string, type: string): void {
    this.toastMessage = message;
    this.toastType = type === 'error' ? 'error' : 'success';
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
    }, 3500);
  }

  closeOverlayOnBackdrop(event: MouseEvent, ref: HTMLElement): void {
    if (event.target === ref) {
      this.closeForm();
    }
  }
}
