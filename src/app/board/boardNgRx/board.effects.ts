import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import * as BoardActions from './board.actions';
import { BoardService } from '../../services/board.service';
import { ListCartService } from '../../services/list-cart.service';
import { CartService } from '../../services/cart.service';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';

@Injectable()
export class BoardEffects {
  loadBoard$;
  loadLists$;
  loadCarts$;
  loadCartsAfterLists$;
  moveCart$;
  createBoard$;
  loadBoards$;

  constructor(
    private actions$: Actions,
    private boardService: BoardService,
    private listCartService: ListCartService,
    private cartService: CartService,
    private store: Store
  ) {
    this.loadBoard$ = createEffect(() =>
      this.actions$.pipe(
        ofType(BoardActions.loadBoard),
        mergeMap(({ boardId }) =>
          this.boardService.getBoardById(boardId).pipe(
            map((board) => BoardActions.loadBoardSuccess({ board })),
            catchError((error) => of(BoardActions.loadBoardFailure({ error })))
          )
        )
      )
    );

    this.loadLists$ = createEffect(() =>
      this.actions$.pipe(
        ofType(BoardActions.loadLists),
        mergeMap(({ boardId }) =>
          this.listCartService.getListCartByBoardId(boardId).pipe(
            map((lists) => BoardActions.loadListsSuccess({ lists })),
            catchError((error) => of(BoardActions.loadListsFailure({ error })))
          )
        )
      )
    );

    this.loadCarts$ = createEffect(() =>
      this.actions$.pipe(
        ofType(BoardActions.LoadCarts),
        mergeMap(({ listId }) =>
          this.cartService.getCartsByCartListId(listId).pipe(
            map((carts) => BoardActions.LoadCartsSuccess({ listId, carts })),
            catchError((error) => of(BoardActions.LoadCartsFailure({ error })))
          )
        )
      )
    );

    this.loadCartsAfterLists$ = createEffect(() =>
      this.actions$.pipe(
        ofType(BoardActions.loadListsSuccess),
        mergeMap(({ lists }) =>
          lists.map((list) => BoardActions.LoadCarts({ listId: list.id }))
        )
      )
    );

    this.moveCart$ = createEffect(() =>
      this.actions$.pipe(
        ofType(BoardActions.moveCart),
        mergeMap((action) =>
          this.cartService
            .moveToCartList(action.cartListId, action.cartId)
            .pipe(
              map(() =>
                BoardActions.moveCartSuccess({
                  cartId: action.cartId,
                  cartListId: action.cartListId,
                })
              ),
              catchError((error) => of(BoardActions.moveCartFailure({ error })))
            )
        )
      )
    );

    this.createBoard$ = createEffect(() =>
      this.actions$.pipe(
        ofType(BoardActions.createBoard),
        mergeMap(({ name }) =>
          this.boardService.createBoard({ name }).pipe(
            mergeMap(() =>
              this.boardService.getBoardsByUser().pipe(
                map((res: any) => {
                  const boards = res.data || res || [];
                  return BoardActions.loadBoardsSuccess({ boards });
                })
              )
            ),
            catchError((error) =>
              of(BoardActions.createBoardFailure({ error }))
            )
          )
        )
      )
    );

    this.loadBoards$ = createEffect(() =>
      this.actions$.pipe(
        ofType(BoardActions.loadBoards),
        mergeMap(() =>
          this.boardService.getBoardsByUser().pipe(
            tap((res: any) => console.log('Boards loaded from API:', res)),
            map((res: any) => {
              const boards = res.data || res || [];
              return BoardActions.loadBoardsSuccess({ boards });
            }),
            catchError((error) => of(BoardActions.loadBoardsFailure({ error })))
          )
        )
      )
    );
  }
}
