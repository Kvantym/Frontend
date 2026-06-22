import {Component, DestroyRef, Inject, PLATFORM_ID, OnInit} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';

import { CreateBoardComponent } from '../board/createBoard/createboard.component';
import { UpdateBoardComponent } from '../board/updateboard/updateboard.component';
import { ShowBoardInformationComponent } from '../board/showinformitionboard/showinformitionboard.component';

import * as BoardSelectors from '../board/boardNgRx/board.selectors';
import * as BoardActions from '../board/boardNgRx/board.actions';
import {BoardService} from '../services/board.service';

import {Subscription, of } from 'rxjs';
import { TranslatePipe } from '../shared/translate.pipe';
import { ProjectRefreshService } from '../services/project-refresh.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatPanelService } from '../services/chat-panel.service';

@Component({
  selector: 'app-dashboard',

  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CreateBoardComponent,
    UpdateBoardComponent,
    ShowBoardInformationComponent,
    TranslatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  userName: string = 'Користувач';
  boards$: Observable<any[]>;
  isCreateBoardOpen$: Observable<boolean>;

  showUpdateBoardForm = false;
  selectedBoard: any = null;
  showBoardInfoForm = false;
  selectedBoardId: string | null = null;

  isUserMenuOpen = false;
  userMenuTimeout: any;



  private searchSubscription?: Subscription;

  constructor(
    private router: Router,
    private store: Store,
    private boardService: BoardService,
    private projectRefreshService: ProjectRefreshService,
    private chatPanelService: ChatPanelService,
    private destroyRef: DestroyRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.boards$ = this.store.pipe(select(BoardSelectors.loadBoards));
    this.isCreateBoardOpen$ = this.store.pipe(
      select(BoardSelectors.selectIsCreateBoardOpen)
    );
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.store.dispatch(BoardActions.loadBoards());
      this.loadUserNameFromToken();
    }

    this.projectRefreshService.refresh$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.type === 'board-created') {
          this.boards$ = this.store.pipe(select(BoardSelectors.loadBoards));
          this.store.dispatch(BoardActions.loadBoards());
        }
      });
  }

  private loadUserNameFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userName = payload.unique_name || payload.email || 'Користувач';
    } catch (e) {
      console.error('Error parsing token:', e);
      this.userName = 'Користувач';
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen) this.startUserMenuTimeout();
    else this.clearUserMenuTimeout();
  }

  startUserMenuTimeout() {
    this.clearUserMenuTimeout();
    this.userMenuTimeout = setTimeout(
      () => (this.isUserMenuOpen = false),
      5000
    );
  }

  clearUserMenuTimeout() {
    if (this.userMenuTimeout) {
      clearTimeout(this.userMenuTimeout);
      this.userMenuTimeout = null;
    }
  }

  onUserMenuMouseEnter() {
    this.clearUserMenuTimeout();
  }
  onUserMenuMouseLeave() {
    this.startUserMenuTimeout();
  }

  openProfile() {
    this.router.navigate(['/profil']);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.clear();
    }
    this.router.navigate(['/login']);
  }

  openCreateBoardForm() {
    this.store.dispatch(BoardActions.openCreateBoardModal());
  }
  closeCreateBoardForm() {
    this.store.dispatch(BoardActions.closeCreateBoardModal());
  }
  openBoard(board: any) {
    if (board?.id) this.router.navigate(['/boards', board.id]);
  }
  openUpdateBoardForm(board: any) {
    this.selectedBoard = board;
    this.showUpdateBoardForm = true;
  }
  closeUpdateBoardForm() {
    this.showUpdateBoardForm = false;
    this.selectedBoard = null;
  }
  openShowBoardInformation(boardId: string) {
    this.selectedBoardId = boardId;
    this.showBoardInfoForm = true;
  }
  closeShowBoardInformation() {
    this.showBoardInfoForm = false;
    this.selectedBoardId = null;
    this.store.dispatch(BoardActions.loadBoards());
  }


  goToArchive(){
    this.router.navigate(['/archive']);
  }

  public searchBoard(boardName: string, isArchive: boolean): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    const query = boardName.trim();

    if (!query) {
      this.boards$ = this.store.pipe(select(BoardSelectors.loadBoards));
      return;
    }

    this.searchSubscription = this.boardService
      .searchBoardByName(query, isArchive)
      .subscribe({
        next: (results) => {
          this.boards$ = of(results);
        },
        error: (err) => {
          console.error('Search failed', err);
          this.boards$ = this.store.pipe(select(BoardSelectors.loadBoards));
        }
      });
  }
  openChat() {
    this.chatPanelService.toggle();
  }
}
