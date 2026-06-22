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
  selector: 'app-cartList-createCartList',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './createcartlist.component.html',
  styleUrls: ['./createcartlist.component.scss'],
})
export class CreateCartListComponent {
  createCartListForm: FormGroup;
  errorMessage: string | null = null;

  @Input() boardId!: string;
  @Output() closeModal = new EventEmitter<void>();
  @Output() cartListCreated = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private store: Store) {
    this.createCartListForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  onSubmit() {
    if (!this.createCartListForm.valid) return;

    this.store.dispatch(
      CartListActions.createCartList({
        boardId: this.boardId,
        name: this.createCartListForm.value.name,
      })
    );

    this.cartListCreated.emit();
    this.onCancel();
  }

  onCancel() {
    this.closeModal.emit();
  }
}
