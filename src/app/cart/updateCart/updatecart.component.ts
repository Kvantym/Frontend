import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { LocalizationService } from '../../services/localization.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-cart-updateCart',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './updatecart.component.html',
  styleUrls: ['./updatecart.component.scss'],
})
export class UpdateCartComponent implements OnChanges {
  @Input() cart: any;
  @Output() closeModal = new EventEmitter<void>();
  @Output() cartUpdated = new EventEmitter<void>();

  updateCartForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private localization: LocalizationService
  ) {
    this.updateCartForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      dueDate: [''],
      listCartId: ['', Validators.required],
      priorityNote: [0, Validators.required],
      statusNote: [0, Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cart'] && this.cart) {
      this.updateCartForm.patchValue({
        name: this.cart.name ?? '',
        description: this.cart.description ?? '',
        dueDate: this.cart.dueDate ? this.cart.dueDate.substring(0, 16) : '',
        listCartId: this.cart.listCartId ?? '',
      });
    }
  }

  onSubmit() {
    if (!this.updateCartForm.valid || !this.cart) return;

    const formValue = this.updateCartForm.value;
    const payload = {
      ...formValue,
      dueDate: formValue.dueDate ? new Date(formValue.dueDate).toISOString() : null,
      priorityNote: Number(formValue.priorityNote),
      statusNote: Number(formValue.statusNote),
    };

    this.cartService.updateCart(this.cart.id, payload).subscribe({
      next: () => {
        this.cartUpdated.emit();
        this.onCancel();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = this.localization.translate('card.updateError');
      },
    });
  }

  onCancel() {
    this.closeModal.emit();
  }
}
