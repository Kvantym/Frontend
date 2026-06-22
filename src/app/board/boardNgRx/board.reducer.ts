import { createReducer, on } from '@ngrx/store';
import * as BoardActions from './board.actions';

export interface BoardState {
  board: any | null;
  lists: any[];
  loading: boolean;
  error: any;
  boards: any[];
  isCreateBoardOpen: boolean;
}

export const initialState: BoardState = {
  board: null,
  lists: [],
  loading: false,
  error: null,
  boards: [],
  isCreateBoardOpen: false,
};

export const boardReducer = createReducer(
  initialState,

  on(BoardActions.loadBoard, (state) => ({ ...state, loading: true })),
  on(BoardActions.loadBoardSuccess, (state, { board }) => ({
    ...state,
    board,
    loading: false,
  })),
  on(BoardActions.loadBoardFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(BoardActions.loadLists, (state) => ({ ...state, loading: true })),
  on(BoardActions.loadListsSuccess, (state, { lists }) => ({
    ...state,
    lists,
    loading: false,
  })),
  on(BoardActions.loadListsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(BoardActions.LoadCarts, (state) => ({
    ...state,
    loading: true,
  })),

  on(BoardActions.LoadCartsSuccess, (state, { listId, carts }) => ({
    ...state,
    loading: false,
    lists: state.lists.map((list) =>
      list.id === listId ? { ...list, carts } : list
    ),
  })),

  on(BoardActions.LoadCartsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(BoardActions.moveCartSuccess, (state, { cartId, cartListId }) => {
    const lists = state.lists.map((list) => {
      const filteredCarts = list.carts.filter(
        (cart: any) => cart.id !== cartId
      );

      if (list.id === cartListId) {
        const movedCart = state.lists
          .flatMap((l) => l.carts)
          .find((c) => c.id === cartId);
        return { ...list, carts: [...filteredCarts, movedCart!] };
      }

      return { ...list, carts: filteredCarts };
    });

    return { ...state, lists };
  }),

  on(BoardActions.createBoard, (state) => ({
    ...state,
    loading: true,
  })),

  on(BoardActions.createBoardSuccess, (state, { board }) => ({
    ...state,
    loading: false,
    boards: [...state.boards, board],
  })),

  on(BoardActions.createBoardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(BoardActions.openCreateBoardModal, (state) => ({
    ...state,
    isCreateBoardOpen: true,
  })),
  on(BoardActions.closeCreateBoardModal, (state) => ({
    ...state,
    isCreateBoardOpen: false,
  })),

  on(BoardActions.loadBoardsSuccess, (state, { boards }) => ({
    ...state,
    boards,
  }))
);
