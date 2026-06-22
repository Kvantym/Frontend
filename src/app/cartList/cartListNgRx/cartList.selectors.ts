import { createSelector, createFeatureSelector } from '@ngrx/store';
import { CartListState } from './cartList.reducer';

export const selectCartListState =
  createFeatureSelector<CartListState>('cartList');

export const selectCartList = createSelector(
  selectCartListState,
  (state) => state.cartList
);

export const selectCartListActivities = createSelector(
  selectCartListState,
  (state) => state.activities
);

export const selectCartListUpdate = createSelector(
  selectCartListState,
  (state) => state.loading
);

export const selectCreateCartList = createSelector(
  selectCartListState,
  (state) => state.loading
);

export const selectDeleteCartList = createSelector(
  selectCartListState,
  (state) => state.loading
);
