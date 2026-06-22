import { createAction, props } from '@ngrx/store';
import { ActivityCartListResponse } from '../../services/list-cart.service';
import e from 'express';

export const loadCartList = createAction(
  '[CartList] Load Cart List',
  props<{ cartListId: string }>()
);
export const loadCartListSuccess = createAction(
  '[CartList] Load Cart List Success',
  props<{ cartList: any }>()
);
export const loadCartListFailure = createAction(
  '[CartList] Load Cart List Failure',
  props<{ error: any }>()
);

export const loadActivities = createAction(
  '[CartList] Load Activities',
  props<{ cartListId: string }>()
);
export const loadActivitiesSuccess = createAction(
  '[CartList] Load Activities Success',
  props<{ activities: ActivityCartListResponse[] }>()
);
export const loadActivitiesFailure = createAction(
  '[CartList] Load Activities Failure',
  props<{ error: any }>()
);

export const updateCartList = createAction(
  '[CartList] Update Cart List',
  props<{ cartListId: string; updatedData: string }>()
);
export const updateCartListSuccess = createAction(
  '[CartList] Update Cart List Success',
  props<{ cartList: any }>()
);
export const updateCartListFailure = createAction(
  '[CartList] Update Cart List Failure',
  props<{ error: any }>()
);

export const createCartList = createAction(
  '[CartList] Create Cart List',
  props<{ boardId: string; name: string }>()
);
export const createCartListSuccess = createAction(
  '[CartList] Create Cart List Success',
  props<{ cartList: any }>()
);
export const createCartListFailure = createAction(
  '[CartList] Create Cart List Failure',
  props<{ error: any }>()
);

export const deleteCartList = createAction(
  '[CartList] Delete Cart List',
  props<{ cartListId: string }>()
);
export const deleteCartListSuccess = createAction(
  '[CartList] Delete Cart List Success',
  props<{ cartListId: string }>()
);
export const deleteCartListFailure = createAction(
  '[CartList] Delete Cart List Failure',
  props<{ error: any }>()
);
