import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule, FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  BoardService,
  ActivityBoardResponse,
} from '../../services/board.service';
import { NgZone } from '@angular/core';
import { UpdateBoardComponent } from '../updateboard/updateboard.component';
import { ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import * as BoardActions from '../boardNgRx/board.actions';
import {AuthService} from '../../services/auth.service';
import {userInfo} from 'node:os';
import { LocalizationService } from '../../services/localization.service';
import { TranslatePipe } from '../../shared/translate.pipe';


interface Collaborator {
  userName: string;
  email: string;
}

@Component({
  selector: 'app-board-showinformitionboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UpdateBoardComponent, FormsModule, TranslatePipe],
  templateUrl: './showinformitionboard.component.html',
  styleUrls: ['./showinformitionboard.component.scss'],
})
export class ShowBoardInformationComponent implements OnInit {
  @Input() boardId!: string;
  @Output() closeModal = new EventEmitter<void>();
  @Output() boardUpdated = new EventEmitter<void>();

  showBoardForm: FormGroup;
  errorMessage: string | null = null;

  selectedBoard: any = null;
  isUpdateBoardModalOpen = false;
  selectedBoardData: any = null;

  activities: ActivityBoardResponse[] = [];
  displayedActivities: ActivityBoardResponse[] = [];
  activitiesBatch = 10;
  currentIndex = 0;
  collaborators: Collaborator[] = [];
  identifier: string = '';
  board : any;
  currentUser:any;

  currentUserId: string | undefined = ''
  currentUserEmail: string | undefined = ''



  constructor(
    private fb: FormBuilder,
    private boardService: BoardService,
    private ngZone: NgZone,
    private store: Store,
    private cd: ChangeDetectorRef,
    private  authService : AuthService,
    private localization: LocalizationService,
  ) {
    this.showBoardForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit() {
    const token = localStorage.getItem('authToken'); // Перевір, чи ключ називається 'token' чи 'authToken'
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Мапимо поля (враховуємо специфіку Microsoft Claims)
        this.currentUserId = payload.sub || payload.nameid || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        this.currentUserEmail = payload.email || payload.unique_name;

        console.log("✅ Поточний користувач:", this.currentUserEmail, this.currentUserId);
      } catch (e) {
        console.error('Помилка парсингу токена:', e);
      }
    }


    if (this.boardId) {
      this.getAllCollaborators(this.boardId);
      this.boardService.getBoardById(this.boardId).subscribe({
        next: (data) => {
          this.showBoardForm.patchValue(data);
          this.selectedBoardData = { ...data, id: this.boardId };
          this.board = data;
          console.log(this.board)
          this.loadActivities();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = this.localization.translate('board.loadError');
        },
      });
    }

  }
  loadActivities() {
    this.boardService.getBoardActivityByBoardId(this.boardId).subscribe({
      next: (data) => {
        this.activities = data.sort(
          (a, b) =>
            new Date(b.activityTime).getTime() -
            new Date(a.activityTime).getTime()
        );
        this.displayedActivities = this.activities.slice(
          0,
          this.activitiesBatch
        );
        this.currentIndex = this.activitiesBatch;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = this.localization.translate('board.loadHistoryError');
      },
    });
  }

  loadMoreActivities() {
    const nextIndex = this.currentIndex + this.activitiesBatch;
    this.displayedActivities = this.activities.slice(0, nextIndex);
    this.currentIndex = nextIndex;
  }

  private loadBoardData(boardId: string) {
    this.boardService.getBoardById(boardId).subscribe({
      next: (data) => {
        this.showBoardForm.patchValue(data);
        this.selectedBoardData = { ...data, id: boardId };

        this.boardService.getBoardActivityByBoardId(boardId).subscribe({
          next: (activities) => {
            this.activities = activities;
            this.ngZone.run(() => {
              this.cd.markForCheck();
            });
          },
          error: (err) => {
            console.error(err);
            this.errorMessage = this.localization.translate('board.loadActivityError');
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = this.localization.translate('board.loadError');
      },
    });
  }
  reloadBoard() {
    if (!this.boardId) return;

    this.boardService.getBoardById(this.boardId).subscribe({
      next: (boardData) => {
        this.showBoardForm.patchValue(boardData);
        this.selectedBoardData = { ...boardData, id: this.boardId };
        this.loadActivities();
      },
      error: (err) => console.error('Error loading list:', err),
    });
  }

  deleteBoard(boardId: string): void {
    if (!confirm(this.localization.translate('board.confirmDelete'))) return;

    this.boardService.deleteBoard(this.boardId).subscribe({
      next: () => {
        this.onCancel();
      },
      error: (err) => console.error('Error while deleting card:', err),
    });
    this.store.dispatch(BoardActions.loadBoards());
  }

  onSubmit(boardId: string) {
    if (!this.showBoardForm.valid) return;

    const updatedBoard = this.showBoardForm.value;

    this.boardService.updateBoard(boardId, updatedBoard).subscribe({
      next: () => {
        console.log('Board updated successfully');

        this.loadBoardData(boardId);

        this.onCancel();
      },
      error: (err) => {
        console.error('Error updating card:', err);
        this.errorMessage = this.localization.translate('board.updateError');
      },
    });
  }

  onCancel() {
    this.closeModal.emit();
    this.boardUpdated.emit();
  }

  openUpdateBoardForm(board: any) {
    console.log('clicked open board with id', board);
    this.selectedBoard = board;
    this.isUpdateBoardModalOpen = true;
  }

  closeUpdateBoardModal() {
    this.selectedBoard = null;
    this.isUpdateBoardModalOpen = false;
  }
  colabUser : any;


  getAllCollaborators(boardId: string) {


    this.boardService.getAllCollaborators(boardId).subscribe({
      next: (data) => {
        this.collaborators = data;

        this.currentUser = this.authService.getCurrentUserEmail();
        console.log("Loaded coloborant:",this.collaborators);
        console.log("Current User Email:",this.currentUserEmail);


      },
      error: (err) => {
        console.error(err);
      }
    });

  }
  addColoborator() {
    this.boardService.addCollaborator(this.boardId, this.identifier).subscribe({
      next: (data) => {
       this.getAllCollaborators(this.boardId);
       this.identifier = '';
        this.loadActivities();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onDeleteCollaborator(coloboratorName:string) {
    if(confirm(this.localization.translate('board.confirmDeleteMember'))){
      this.boardService.deleteCollaborator(this.boardId, coloboratorName).subscribe({
        next:(response)=>{
        console.log('User deleted:', response);

        this.getAllCollaborators(this.boardId);
        this.loadActivities();
      },
        error: (err) => {
          console.error(err);
        }
      });
    }

  }

  onLeaveColoboration(coloboratorid: string | undefined) {
    if(confirm(this.localization.translate('board.confirmLeave'))){
      if (coloboratorid != null) {
        this.boardService.removeCollaborator(this.boardId).subscribe({
          next: (response) => {
            console.log('User deleted:', response);
            this.loadActivities();
            this.getAllCollaborators(this.boardId);
          },
          error: (err) => {
            console.error(err);
          }
        });
      }
    }
    this.onCancel();
    this.store.dispatch(BoardActions.loadBoards());
  }
  addToArchiveBoard(boardId: string) {
    if(confirm(this.localization.translate('board.confirmArchive'))){
      this.boardService.addToArchiveBoard(boardId).subscribe({
        next: () => {
          console.log('Board wath is archived successfully');
          this.loadActivities();
          this.onCancel();
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }

  removeFromArchiveBoard(boardId: string) {
    if(confirm(this.localization.translate('board.confirmRestore'))){
      this.boardService.removeFromArchiveBoard(boardId).subscribe({
        next: () => {
          console.log('Board wath is archived successfully');
          this.loadActivities();
          this.onCancel();
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }

}
