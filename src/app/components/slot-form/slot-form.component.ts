import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SlotService } from '../../services/slot.service';
import { Slot } from '../../models/slot.model';

@Component({
  selector: 'app-slot-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './slot-form.component.html',
  styleUrls: ['./slot-form.component.css']
})
export class SlotFormComponent implements OnInit, OnChanges {
  @Input() slot: Slot | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>(); // emits success message

  slotForm: FormGroup;
  isEditMode: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private slotService: SlotService) {
    this.slotForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void { this.syncForm(); }
  ngOnChanges(changes: SimpleChanges): void { if (changes['slot']) this.syncForm(); }

  private syncForm(): void {
    if (this.slot) {
      this.isEditMode = true;
      this.slotForm.patchValue({ date: this.slot.date, time: this.slot.time, capacity: this.slot.capacity });
    } else {
      this.isEditMode = false;
      this.slotForm.reset({ date: '', time: '', capacity: '' });
    }
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.slotForm.invalid) {
      this.slotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const { date, time, capacity } = this.slotForm.value;
    const slotData = { date: date as string, time: time as string, capacity: Number(capacity) };

    if (this.isEditMode && this.slot?.id) {
      if (slotData.capacity < this.slot.booked) {
        this.isLoading = false;
        this.errorMessage = `Capacity cannot be less than the current number of bookings (${this.slot.booked}).`;
        return;
      }
      this.slotService.updateSlot(this.slot.id, slotData)
        .then(() => {
          this.isLoading = false;
          this.saved.emit(`Slot on ${slotData.date} at ${slotData.time} was updated successfully.`);
        })
        .catch(err => {
          this.isLoading = false;
          this.errorMessage = 'Failed to update slot. Please try again.';
          console.error(err);
        });
    } else {
      this.slotService.createSlot(slotData)
        .then(() => {
          this.isLoading = false;
          this.saved.emit(`New slot on ${slotData.date} at ${slotData.time} was created successfully.`);
        })
        .catch(err => {
          this.isLoading = false;
          this.errorMessage = 'Failed to create slot. Please try again.';
          console.error(err);
        });
    }
  }

  onCancel(): void { this.close.emit(); }
}
