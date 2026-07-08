import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlotService } from '../../services/slot.service';
import { Slot } from '../../models/slot.model';
import { Subscription } from 'rxjs';

interface ToastEvent { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-slot-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slot-list.component.html',
  styleUrls: ['./slot-list.component.css']
})
export class SlotListComponent implements OnInit, OnDestroy {
  slots: Slot[] = [];
  filteredSlots: Slot[] = [];
  searchQuery: string = '';
  isLoading: boolean = true;
  deletingId: string | null = null;

  @Output() edit = new EventEmitter<Slot>();
  @Output() toastNotify = new EventEmitter<ToastEvent>();

  private subscription?: Subscription;

  constructor(private slotService: SlotService) {}

  ngOnInit(): void {
    this.subscription = this.slotService.getSlots().subscribe({
      next: (slots) => {
        this.slots = slots;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching slots:', err);
        this.toastNotify.emit({ message: 'Failed to load slots. Check Firebase configuration.', type: 'error' });
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredSlots = !q ? [...this.slots] : this.slots.filter(s =>
      s.date.includes(q) || s.time.includes(q)
    );
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  onEdit(slot: Slot): void {
    this.edit.emit(slot);
  }

  onDelete(id: string, date: string, time: string): void {
    const confirmed = confirm(`Delete slot on ${date} at ${time}?\n\nThis action cannot be undone.`);
    if (!confirmed) return;

    this.deletingId = id;
    this.slotService.deleteSlot(id)
      .then(() => {
        this.toastNotify.emit({ message: `Slot on ${date} at ${time} was deleted.`, type: 'success' });
      })
      .catch((err) => {
        console.error('Delete failed:', err);
        this.toastNotify.emit({ message: 'Failed to delete slot. Please try again.', type: 'error' });
      })
      .finally(() => {
        this.deletingId = null;
      });
  }

  getOccupancy(slot: Slot): number {
    if (slot.capacity === 0) return 0;
    return Math.round((slot.booked / slot.capacity) * 100);
  }
}
