import { Component, EventEmitter, Output, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Store } from '@ngrx/store';
import * as CartListActions from '../cartListNgRx/cartList.actions';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-cartList-updateCartList',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './updatecartlist.component.html',
  styleUrls: ['./updatecartlist.component.scss'],
})
export class UpdateCartListComponent {
  @Input() cartList: any;
  @Output() closeModal = new EventEmitter<void>();

  updateCartListForm: FormGroup;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private store: Store) {
    this.updateCartListForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnChanges() {
    if (this.cartList) {
      this.updateCartListForm.patchValue({
        name: this.cartList.name,
      });
    }
  }

  onSubmit() {
    if (!this.updateCartListForm.valid || !this.cartList) return;

    this.store.dispatch(
      CartListActions.updateCartList({
        cartListId: this.cartList.listCartId,
        updatedData: this.updateCartListForm.value.name,
      })
    );
    this.closeModal.emit();
  }

  onCancel() {
    this.closeModal.emit();
  }
}
