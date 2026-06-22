import { Component, OnInit } from '@angular/core';
import { ListCart, ListCartService } from '../../services/list-cart.service';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DatePipe, NgForOf, NgIf, SlicePipe, CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ShowBoardComponent} from '../../board/showboard/showboard.component';
import {Observable} from 'rxjs';
import {ShowCartListComponent} from '../showcartlist/showcartlist.component';
import {ShowCartComponent} from '../../cart/showCart/showcart.component';
import {CartService} from '../../services/cart.service';
import { LocalizationService } from '../../services/localization.service';
import { EnumLabelPipe } from '../../shared/enum-label.pipe';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-cart-list-archive',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    DatePipe,
    ReactiveFormsModule,
    FormsModule,
    SlicePipe,
    ShowBoardComponent,
    ShowCartListComponent,
    ShowCartComponent,
    TranslatePipe,
    EnumLabelPipe,
  ],
  templateUrl: './cart-list-archive.html',
  styleUrl: './cart-list-archive.scss',

})
export class CartListArchive implements OnInit {
  listCarts: ListCart[] = [];
  boardId: string = '';

  lists$!: Observable<any[]>;
  selectedCartListIds: { [cartId: string]: string } = {};

  showCartId: string = '';
  showCartListId: string = '';
  showCartModalOpen = false;
  showCartListModalOpen = false;


  searchCartsResults: { [listId: string]: any[] } = {};
  searchListCartsResults: { [listId: string]: any[] } = {};

  constructor(
    private listCartService: ListCartService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private localization: LocalizationService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.boardId = idParam;
      console.log('Board ID loaded from URL:', this.boardId);
      this.getArcivedCartList(this.boardId);
      console.log(this.listCarts);
    } else {
      console.warn('Board ID not found in URL. Check your router configuration.');
    }
  }

  getArcivedCartList(boardId: string): void {
    this.listCartService.getArchiveListCart(boardId).subscribe({
      next: (data: ListCart[]) => {
        this.listCarts = data;
        console.log('Archived Lists:', this.listCarts);
      },
      error: (error) => {
        console.error('Error fetching archive:', error);
      }
    });
  }
  openShowCarForm(cartId: string): void {
    this.showCartId = cartId;
    this.showCartModalOpen = true;
  }

  openShowListCarForm(cartListId: string): void {
    this.showCartListId = cartListId;
    this.showCartListModalOpen = true;
  }

  removeListCartFromArchive(listCartId: string): void {
    if(confirm(this.localization.translate('list.confirmRestore'))) {
      this.listCartService.removeListCartFromArchive(listCartId).subscribe({
        next: () => {
          console.log('Remove listCartFromArchive');
          this.getArcivedCartList(this.boardId);
        },
        error: (error) => {
          console.error('Error remove listCartFromArchive');
        }
      });
    }
  }
  closeShowListCartModal(): void {
    this.showCartListId = '';
    this.showCartListModalOpen = false;
  }

  closeShowCartModal(): void {
    this.showCartId = '';
    this.showCartModalOpen = false;

  }

  filters: { [listId: string]: any } = {};

  searchCart(
    listCartId: string,
    isArchive: boolean,
    name?: string,
    priority?: any,
    status?: any,
    dueDate?: string | null,
    createdAt?: string | null
  ): void {

    const parsedPriority = (priority === 'null' || priority === undefined) ? null : Number(priority);
    const parsedStatus = (status === 'null' || status === undefined) ? null : Number(status);

    this.filters[listCartId] = {
      name: name ?? this.filters[listCartId]?.name ?? '',
      priority: priority !== undefined ? parsedPriority : this.filters[listCartId]?.priority,
      status: status !== undefined ? parsedStatus : this.filters[listCartId]?.status,
      dueDate: dueDate !== undefined ? dueDate : this.filters[listCartId]?.dueDate,
      createdAt: createdAt !== undefined ? createdAt : this.filters[listCartId]?.createdAt // Зберігаємо нову дату
    };

    const f = this.filters[listCartId];

    const hasActiveFilters = f.name.trim() !== '' || f.priority !== null || f.status !== null || f.dueDate || f.createdAt;

    if (!hasActiveFilters) {
      delete this.searchCartsResults[listCartId];
      return;
    }

    this.cartService.searchCartWithFilter(
      f.name,
      listCartId,
      isArchive,
      f.priority ?? undefined,
      f.status ?? undefined,
      f.dueDate ?? undefined,
      f.createdAt ?? undefined
    ).subscribe({
      next: (data) => {
        this.searchCartsResults = { ...this.searchCartsResults, [listCartId]: data };
      },
      error: (err) => console.error('Помилка фільтрації:', err)
    });
  }
  searchListCart(cartName: string, boardId: string, isArchive:boolean): void {
    const query = cartName.trim();

    if (!query) {
      delete this.searchListCartsResults[boardId];
      return;
    }

    this.listCartService.searchListCart(query, boardId, isArchive).subscribe({
      next: (data: any[]) => {
        console.log('Результати пошуку:', data);
        this.searchListCartsResults[boardId] = data;
      },
      error: (err) => {
        console.error('Помилка при пошуку карток:', err);
      }
    });
  }


}
