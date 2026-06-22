import { Component, DestroyRef, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as BoardActions from '../../board/boardNgRx/board.actions';
import {
  selectBoard,
  selectBoardLoading,
  selectCarts,
  selectLists,
} from '../../board/boardNgRx/board.selectors';

import { AuthService } from '../../services/auth.service';

import { CreateCartListComponent } from '../../cartList/createCartList/createcartlist.component';
import { CreateCartComponent } from '../../cart/createCart/createcart.component';
import { ShowCartComponent } from '../../cart/showCart/showcart.component';
import { ShowCartListComponent } from '../../cartList/showcartlist/showcartlist.component';
import {routes} from '../../app.routes';
import {ListCartService} from '../../services/list-cart.service';
import {CartService} from '../../services/cart.service';
import { LocalizationService } from '../../services/localization.service';
import { EnumLabelPipe } from '../../shared/enum-label.pipe';
import { TranslatePipe } from '../../shared/translate.pipe';
import { ProjectRefreshService } from '../../services/project-refresh.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface ListCart {
  id: string;
  name: string;
  boardId: string;
  carts: any[];
}

@Component({
  selector: 'app-board',
  templateUrl: './showboard.component.html',
  styleUrls: ['./showboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CreateCartListComponent,
    CreateCartComponent,
    ShowCartComponent,
    ShowCartListComponent,
    TranslatePipe,
    EnumLabelPipe,
  ],
})
export class ShowBoardComponent implements OnInit {
  boardId!: string;
  cartListId!: string;

  board$!: Observable<any>;
  loading$!: Observable<boolean>;
  lists$!: Observable<ListCart[]>;
  carts$!: Observable<any[]>;

  showCartId!: string;
  showCartListId!: string;

  isCreateCartListOpen = false;
  isCreateCartOpen = false;
  showCartModalOpen = false;
  showCartListModalOpen = false;

  selectedCartListIds: { [cartId: string]: string } = {};
  currentUserId: string | null = null;

  searchCartsResults: { [listId: string]: any[] } = {};
  searchListCartsResults: { [listId: string]: any[] } = {};

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private store: Store,
    private routes: Router,
    private cartService: CartService,
    private listCartService: ListCartService,
    private localization: LocalizationService,
    private projectRefreshService: ProjectRefreshService,
    private destroyRef: DestroyRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.boardId = this.route.snapshot.paramMap.get('id') ?? '';

    const user = this.authService.getCurrentUserLocal();
    if (!user) {
      console.error('User is not authorized!');
      return;
    }

    this.currentUserId = user.id;

    this.board$ = this.store.select(selectBoard);
    this.loading$ = this.store.select(selectBoardLoading);
    this.lists$ = this.store.select(selectLists);
    this.carts$ = this.store.select(selectCarts);

    if (this.boardId) {
      this.storeLoad();
    }

    this.authService.currentUser$.subscribe((user) => {
      if (user?.id && user.id !== this.currentUserId) {
        this.currentUserId = user.id;
        if (this.boardId) {
          this.storeLoad();
        }
      }
    });

    this.projectRefreshService.refresh$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (
          (event.type === 'list-created' || event.type === 'card-created') &&
          event.boardId === this.boardId
        ) {
          this.searchCartsResults = {};
          this.searchListCartsResults = {};
          this.storeLoad();
        }
      });
  }

  addList(): void {
    this.isCreateCartListOpen = true;
  }

  closeCreateCartListModal(): void {
    this.isCreateCartListOpen = false;
    this.storeLoad();
  }

  addCard(listId: string): void {
    this.cartListId = listId;
    this.isCreateCartOpen = true;
  }

  closeCreateCartModal(): void {
    this.isCreateCartOpen = false;
    this.storeLoad();
  }

  public storeLoad(): void {
    this.store.dispatch(BoardActions.loadBoard({boardId: this.boardId}));
    this.store.dispatch(BoardActions.loadLists({boardId: this.boardId}));
  }

  moveCartToCartList(cartId: string): void {
    const cartListId = this.selectedCartListIds[cartId];
    if (!cartListId) {
      console.warn('No new list selected for card', cartId);
      return;
    }

    this.store.dispatch(BoardActions.moveCart({cartId, cartListId}));
  }

  openShowCarForm(cartId: string): void {
    this.showCartId = cartId;
    this.showCartModalOpen = true;
  }

  closeShowCartModal(): void {
    this.showCartId = '';
    this.showCartModalOpen = false;
    this.storeLoad();
  }

  openShowListCarForm(cartListId: string): void {
    this.showCartListId = cartListId;
    this.showCartListModalOpen = true;
  }

  closeShowListCartModal(): void {
    this.showCartListId = '';
    this.showCartListModalOpen = false;
    this.storeLoad();
  }

  goToArchiveCartList() {
    this.routes.navigate(['/archive-cart-list', this.boardId]);
  }

  addListCartToArchive(listCartId: string): void {
    if (confirm(this.localization.translate('board.confirmArchiveList'))) {
      this.listCartService.addListCartToArchive(listCartId).subscribe({
        next: () => {
          console.log('Add listCartFromArchive');
          this.storeLoad();
        },
        error: (error) => {
          console.error('Error remove listCartFromArchive');
        }
      });
    }

  }

  goToCartArchive(listCartId: string): void {
    this.routes.navigate(['/archive-cart', listCartId]);
  }

  addCartToArchive(cartId: string) {
    if (confirm(this.localization.translate('board.confirmArchiveCard'))) {
      this.cartService.addCartToArchive(cartId).subscribe({
        next: () => {
          console.log(cartId);
          console.log('Successfully added cart in archive');
          this.storeLoad();
        },
        error: err => {
          console.log(err);
        }
      });
    }
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
