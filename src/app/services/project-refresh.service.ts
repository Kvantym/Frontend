import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ProjectRefreshEvent =
  | { type: 'board-created' }
  | { type: 'list-created'; boardId: string }
  | { type: 'card-created'; boardId: string; listId: string };

@Injectable({
  providedIn: 'root',
})
export class ProjectRefreshService {
  private readonly refreshSubject = new Subject<ProjectRefreshEvent>();
  readonly refresh$ = this.refreshSubject.asObservable();

  notify(event: ProjectRefreshEvent): void {
    this.refreshSubject.next(event);
  }
}
