import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BoardService } from './board.service';
import { CartService } from './cart.service';
import { ListCart, ListCartService } from './list-cart.service';

interface ProjectCartListContext {
  id: string;
  name: string;
  isArchive: boolean;
  boardId: string;
  raw: ListCart;
  carts: any[];
}

interface ProjectBoardContext {
  id: string;
  name: string;
  isArchive: boolean;
  raw: any;
  lists: ProjectCartListContext[];
}

@Injectable({
  providedIn: 'root',
})
export class AiProjectContextService {
  constructor(
    private boardService: BoardService,
    private listCartService: ListCartService,
    private cartService: CartService
  ) {}

  getProjectContext(): Observable<{ generatedAt: string; boards: ProjectBoardContext[] }> {
    return forkJoin({
      activeBoards: this.safeArray(this.boardService.getBoardsByUser()),
      archivedBoards: this.safeArray(this.boardService.getBoardIfIsArchived()),
    }).pipe(
      switchMap(({ activeBoards, archivedBoards }) => {
        const boards = this.mergeById([...activeBoards, ...archivedBoards]);

        if (!boards.length) {
          return of({ generatedAt: new Date().toISOString(), boards: [] });
        }

        return forkJoin(boards.map((board) => this.getBoardContext(board))).pipe(
          map((boardContexts) => ({
            generatedAt: new Date().toISOString(),
            boards: boardContexts,
          }))
        );
      })
    );
  }

  private getBoardContext(board: any): Observable<ProjectBoardContext> {
    return forkJoin({
      activeLists: this.safeArray(this.listCartService.getListCartByBoardId(board.id)),
      archivedLists: this.safeArray(this.listCartService.getArchiveListCart(board.id)),
    }).pipe(
      switchMap(({ activeLists, archivedLists }) => {
        const lists = this.mergeById([...activeLists, ...archivedLists]);

        if (!lists.length) {
          return of({
            id: board.id,
            name: board.name,
            isArchive: Boolean(board.isArchive),
            raw: board,
            lists: [],
          });
        }

        return forkJoin(lists.map((list) => this.getListContext(list))).pipe(
          map((listContexts) => ({
            id: board.id,
            name: board.name,
            isArchive: Boolean(board.isArchive),
            raw: board,
            lists: listContexts,
          }))
        );
      })
    );
  }

  private getListContext(list: ListCart): Observable<ProjectCartListContext> {
    return forkJoin({
      activeCarts: this.safeArray(this.cartService.getCartsByCartListId(list.id)),
      archivedCarts: this.safeArray(this.cartService.getArchivedCart(list.id)),
    }).pipe(
      map(({ activeCarts, archivedCarts }) => ({
        id: list.id,
        name: list.name,
        isArchive: Boolean((list as any).isArchive),
        boardId: list.boardId,
        raw: list,
        carts: this.mergeById([...activeCarts, ...archivedCarts]).map((cart) => ({
          ...cart,
          boardId: list.boardId,
          listCartId: cart.listCartId ?? list.id,
          listCartName: list.name,
        })),
      }))
    );
  }

  private safeArray<T>(source: Observable<T>): Observable<any[]> {
    return source.pipe(
      map((value: any) => Array.isArray(value) ? value : []),
      catchError(() => of([]))
    );
  }

  private mergeById(items: any[]): any[] {
    const mapById = new Map<string, any>();

    items.forEach((item) => {
      if (item?.id) {
        mapById.set(item.id, { ...mapById.get(item.id), ...item });
      }
    });

    return Array.from(mapById.values());
  }
}
