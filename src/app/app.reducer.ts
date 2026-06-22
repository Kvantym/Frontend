// app.reducer.ts
import { ActionReducerMap } from '@ngrx/store';
import { AppState } from './app.state';
import { boardReducer } from './board/boardNgRx/board.reducer';

export const appReducers: ActionReducerMap<AppState> = {
  board: boardReducer,
};
