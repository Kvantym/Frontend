// app.state.ts
import { BoardState } from './board/boardNgRx/board.reducer';

export interface AppState {
  board: BoardState;
}
