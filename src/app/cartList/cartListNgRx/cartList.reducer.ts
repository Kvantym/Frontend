import { createReducer, on } from '@ngrx/store';
import * as CartListActions from './cartList.actions';
import { ActivityCartListResponse } from '../../services/list-cart.service';

export interface CartListState {
  cartList: any | null;
  loading: boolean;
  error: any;
  activities: ActivityCartListResponse[];
}
export const initialState: CartListState = {
  cartList: null,
  loading: false,
  error: null,
  activities: [],
};

export const cartListReducer = createReducer(
  initialState,
  on(CartListActions.loadCartList, (state) => ({ ...state, loading: true })),
  on(CartListActions.loadCartListSuccess, (state, { cartList }) => ({
    ...state,
    cartList,
    loading: false,
  })),
  on(CartListActions.loadCartListFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(CartListActions.loadActivities, (state) => ({ ...state, loading: true })),
  on(CartListActions.loadActivitiesSuccess, (state, { activities }) => ({
    ...state,
    activities: activities,
    loading: false,
  })),
  on(CartListActions.loadActivitiesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(CartListActions.updateCartList, (state) => ({ ...state, loading: true })),
  on(CartListActions.updateCartListSuccess, (state, { cartList }) => ({
    ...state,
    cartList,
    loading: false,
  })),
  on(CartListActions.updateCartListFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(CartListActions.createCartList, (state) => ({ ...state, loading: true })),
  on(CartListActions.createCartListSuccess, (state, { cartList }) => ({
    ...state,
    cartList: Array.isArray(state.cartList)
      ? [...state.cartList, cartList]
      : [cartList],
    loading: false,
  })),

  on(CartListActions.createCartListFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(CartListActions.deleteCartList, (state) => ({ ...state, loading: true })),
  on(CartListActions.deleteCartListSuccess, (state, { cartListId }) => ({
    ...state,
    cartList: Array.isArray(state.cartList)
      ? state.cartList.filter((cl) => cl.id !== cartListId)
      : [],
    loading: false,
  })),

  on(CartListActions.deleteCartListFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  }))
);
