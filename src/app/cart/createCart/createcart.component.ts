import { Component, EventEmitter, Output, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { NgZone } from '@angular/core';
import { LocalizationService } from '../../services/localization.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-createCart-createCart',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './createcart.component.html',
  styleUrls: ['./createcart.component.scss'],
})
export class CreateCartComponent {
  createCartForm: FormGroup;
  errorMessage: string | null = null;

  @Input() cartListId!: string;
  @Output() closeModal = new EventEmitter<void>();
  @Output() cartCreated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private ngZone: NgZone,
    private localization: LocalizationService
  ) {
    this.createCartForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      dueDate: [''],
      priorityNote: [0, Validators.required],
      statusNote: [0, Validators.required],
    });
  }

  onSubmit() {
    if (!this.createCartForm.valid) return;

    const newCart = {
      ...this.createCartForm.value,
      dueDate: this.createCartForm.value.dueDate
        ? new Date(this.createCartForm.value.dueDate).toISOString()
        : null,
      priorityNote: Number(this.createCartForm.value.priorityNote),
      statusNote: Number(this.createCartForm.value.statusNote),
    };

    this.cartService.createCart(this.cartListId, newCart).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.onCancel();
          this.cartCreated.emit();
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = this.localization.translate('card.createError');
      },
    });
  }

  onCancel() {
    this.closeModal.emit();
    this.cartCreated.emit();
  }
}
