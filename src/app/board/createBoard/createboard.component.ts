import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Store } from '@ngrx/store';
import * as BoardActions from '../boardNgRx/board.actions';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-board-createboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './createboard.component.html',
  styleUrls: ['./createboard.component.scss'],
})
export class CreateBoardComponent {
  createBoardForm: FormGroup;
  errorMessage: string | null = null;
  boards: any[] = [];

  @Output() closeModal = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private store: Store) {
    this.createBoardForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  onSubmit() {
    if (!this.createBoardForm.valid) return;

    const { name } = this.createBoardForm.value;
    this.store.dispatch(BoardActions.createBoard({ name }));
    this.onCancel();
  }

  onCancel() {
    this.store.dispatch(BoardActions.closeCreateBoardModal());
  }
}
