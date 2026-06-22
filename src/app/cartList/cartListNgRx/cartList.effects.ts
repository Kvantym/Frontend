import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import * as CartListActions from './cartList.actions';

import { ListCartService } from '../../services/list-cart.service';

@Injectable()
export class CartListEffects {
  loadCartList$;
  loadCartListActivities$;
  updateCartList$;
  createCartList$;
  deleteCartList$;

  constructor(
    private actions$: Actions,
    private listCartService: ListCartService
  ) {
    this.loadCartList$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CartListActions.loadCartList),
        mergeMap(({ cartListId }) =>
          this.listCartService.getListCartById(cartListId).pipe(
            map((cartList) =>
              CartListActions.loadCartListSuccess({ cartList })
            ),
            catchError((error) =>
              of(CartListActions.loadCartListFailure({ error }))
            )
          )
        )
      )
    );
    this.loadCartListActivities$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CartListActions.loadActivities),
        mergeMap(({ cartListId }) =>
          this.listCartService.getListCartActivityByListId(cartListId).pipe(
            map((activities) => {
              const sortedActivities = activities.sort(
                (a, b) =>
                  new Date(b.activityTime).getTime() -
                  new Date(a.activityTime).getTime()
              );
              return CartListActions.loadActivitiesSuccess({
                activities: sortedActivities,
              });
            }),
            catchError((error) =>
              of(CartListActions.loadActivitiesFailure({ error }))
            )
          )
        )
      )
    );
    this.updateCartList$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CartListActions.updateCartList),
        mergeMap(({ cartListId, updatedData }) =>
          this.listCartService
            .updateCartList(cartListId, { name: updatedData })
            .pipe(
              map((cartList) =>
                CartListActions.updateCartListSuccess({ cartList })
              ),
              catchError((error) =>
                of(CartListActions.updateCartListFailure({ error }))
              )
            )
        )
      )
    );

    this.createCartList$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CartListActions.createCartList),
        mergeMap(({ boardId, name }) =>
          this.listCartService.createCartList(boardId, { name }).pipe(
            map((cartList) =>
              CartListActions.createCartListSuccess({ cartList })
            ),
            catchError((error) =>
              of(CartListActions.createCartListFailure({ error }))
            )
          )
        )
      )
    );
    this.deleteCartList$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CartListActions.deleteCartList),
        mergeMap(({ cartListId }) =>
          this.listCartService.deleteCartList(cartListId).pipe(
            map(() => CartListActions.deleteCartListSuccess({ cartListId })),
            catchError((error) =>
              of(CartListActions.deleteCartListFailure({ error }))
            )
          )
        )
      )
    );
  }
}
