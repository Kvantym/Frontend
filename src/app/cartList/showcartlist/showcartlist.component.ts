import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ListCartService,
  ActivityCartListResponse,
} from '../../services/list-cart.service';
import { UpdateCartListComponent } from '../updateCartList/updatecartlist.component';
import { Store } from '@ngrx/store';
import {
  selectCartList,
  selectCartListActivities,
} from '../cartListNgRx/cartList.selectors';
import * as CartListActions from '../cartListNgRx/cartList.actions';
import { CartListState } from '../cartListNgRx/cartList.reducer';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LocalizationService } from '../../services/localization.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-cartList-showcartlist',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UpdateCartListComponent, TranslatePipe],
  templateUrl: './showcartlist.component.html',
  styleUrls: ['./showcartlist.component.scss'],
})
export class ShowCartListComponent implements OnInit {
  @Input() cartListId!: string;
  @Output() closeModal = new EventEmitter<void>();
  @Output() cartListUpdated = new EventEmitter<void>();

  showCartListForm: FormGroup;
  errorMessage: string | null = null;

  selectedCartList: any = null;
  selectedCartListData: any = null;
  isUpdateCartListModalOpen = false;

  activities: ActivityCartListResponse[] = [];
  displayedActivities: ActivityCartListResponse[] = [];
  activitiesBatch = 10;
  currentIndex = 0;

  cartList$!: Observable<any>;
  cartListLoadingActivities$!: Observable<ActivityCartListResponse[]>;

  constructor(
    private fb: FormBuilder,
    private store: Store<{ cartList: CartListState }>,
    private listCartService: ListCartService,
    private localization: LocalizationService
  ) {
    this.showCartListForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit() {
    this.cartList$ = this.store.select(selectCartList);
    this.cartListLoadingActivities$ = this.store.select(
      selectCartListActivities
    );

    this.cartList$
      .pipe(filter((cartList) => !!cartList))
      .subscribe((cartList) => {
        this.showCartListForm.patchValue(cartList);
        this.selectedCartListData = cartList;
      });

    this.cartListLoadingActivities$
      .pipe(filter((data) => !!data))
      .subscribe((activities) => {
        this.activities = activities;
        this.displayedActivities = this.activities.slice(
          0,
          this.activitiesBatch
        );
        this.currentIndex = this.displayedActivities.length;
      });

    if (this.cartListId) this.loadCartList();
  }

  loadCartList() {
    this.store.dispatch(
      CartListActions.loadCartList({ cartListId: this.cartListId })
    );
    this.loadActivities();
  }

  loadActivities() {
    this.store.dispatch(
      CartListActions.loadActivities({ cartListId: this.cartListId })
    );
  }

  loadMoreActivities() {
    const nextIndex = this.currentIndex + this.activitiesBatch;
    this.displayedActivities = this.activities.slice(0, nextIndex);
    this.currentIndex = Math.min(nextIndex, this.activities.length);
  }

  openUpdateListCartForm(cartlist: any) {
    this.selectedCartList = cartlist;
    this.isUpdateCartListModalOpen = true;
  }

  closeUpdateListCartModal() {
    this.selectedCartList = null;
    this.isUpdateCartListModalOpen = false;
    this.cartListUpdated.emit();
  }

  deleteListCard() {
    if (!confirm(this.localization.translate('list.confirmDelete'))) return;

    this.listCartService.deleteCartList(this.cartListId).subscribe({
      next: () => this.cancel(),
      error: (err) => console.error('Error while deleting card:', err),
    });
  }

  cancel() {
    this.closeModal.emit();
    this.cartListUpdated.emit();
  }

  onUpdateModalClose() {
    this.closeUpdateListCartModal();
    this.loadCartList();
    this.loadActivities();
  }
}
