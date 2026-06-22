import { createSelector, createFeatureSelector } from '@ngrx/store';
import { BoardState } from './board.reducer';

export const selectBoardState = createFeatureSelector<BoardState>('board');

export const selectBoard = createSelector(
  selectBoardState,
  (state) => state.board
);

export const selectLists = createSelector(
  selectBoardState,
  (state) => state.lists
);

export const selectBoardLoading = createSelector(
  selectBoardState,
  (state) => state.loading
);

export const selectCarts = createSelector(
  selectBoardState,
  (state) => state.lists
);
export const selectBoards = createSelector(
  selectBoardState,
  (state) => state.boards
);
export const selectIsCreateBoardOpen = createSelector(
  selectBoardState,
  (state) => state.isCreateBoardOpen
);
export const loadBoards = createSelector(
  selectBoardState,
  (state) => state.boards
);
export const selectCurrentBoardId = createSelector(
  selectBoardState,
  (state) => state.board.id
);
