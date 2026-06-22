import { createAction, props } from '@ngrx/store';

interface Board {
  id: string;
  name: string;
  userId: string;
}

export const loadBoard = createAction(
  '[Board] Load Board',
  props<{ boardId: string }>()
);

export const loadBoardSuccess = createAction(
  '[Board] Load Board Success',
  props<{ board: any }>()
);

export const loadBoardFailure = createAction(
  '[Board] Load Board Failure',
  props<{ error: any }>()
);

export const loadLists = createAction(
  '[Board] Load Lists',
  props<{ boardId: string }>()
);

export const loadListsSuccess = createAction(
  '[Board] Load Lists Success',
  props<{ lists: any[] }>()
);

export const loadListsFailure = createAction(
  '[Board] Load Lists Failure',
  props<{ error: any }>()
);
export const LoadCarts = createAction(
  '[Board] Load Carts',
  props<{ listId: string }>()
);
export const LoadCartsSuccess = createAction(
  '[Board] Load Carts Success',
  props<{ listId: string; carts: any[] }>()
);

export const LoadCartsFailure = createAction(
  '[Board] Load Carts Failure',
  props<{ error: any }>()
);

export const moveCart = createAction(
  '[Board] Move Cart',
  props<{ cartId: string; cartListId: string }>()
);
export const moveCartSuccess = createAction(
  '[Board] Move Cart Success',
  props<{ cartId: string; cartListId: string }>()
);
export const moveCartFailure = createAction(
  '[Board] Move Cart Failure',
  props<{ error: any }>()
);

export const createBoard = createAction(
  '[Board] Create Board',
  props<{ name: string }>()
);
export const createBoardSuccess = createAction(
  '[Board] Create Board Success',
  props<{ board: any }>()
);
export const createBoardFailure = createAction(
  '[Board] Create Board Failure',
  props<{ error: any }>()
);

export const openCreateBoardModal = createAction(
  '[Board] Open Create Board Modal'
);
export const closeCreateBoardModal = createAction(
  '[Board] Close Create Board Modal'
);

export const loadBoards = createAction('[Board] Load Boards');
export const loadBoardsSuccess = createAction(
  '[Board] Load Boards Success',
  props<{ boards: any[] }>()
);

export const loadBoardsFailure = createAction(
  '[Board] Load Boards Failure',
  props<{ error: any }>()
);
