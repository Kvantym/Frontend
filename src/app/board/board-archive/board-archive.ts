import {Component, OnInit} from '@angular/core';
import {BoardService} from '../../services/board.service';
import {CommonModule} from '@angular/common';
import {ShowBoardInformationComponent} from '../showinformitionboard/showinformitionboard.component';
import {UpdateBoardComponent} from '../updateboard/updateboard.component';
import {Router} from '@angular/router';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-board-archive',
  imports: [CommonModule, ShowBoardInformationComponent, UpdateBoardComponent, TranslatePipe],
  templateUrl: './board-archive.html',
  styleUrl: './board-archive.scss'
})
export class BoardArchive implements OnInit {
  boards: any[] = [];

  showUpdateBoardForm = false;
  selectedBoard: any = null;
  showBoardInfoForm = false;
  selectedBoardId: string | null = null;

  constructor(
    public boardService: BoardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getBoardIfIsArchived();

  }

  getBoardIfIsArchived() {
    this.boardService.getBoardIfIsArchived().subscribe({
      next: (data) => this.boards = data,
      error: (err) => console.error(err)
    });
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
    this.getBoardIfIsArchived();
  }

  openShowBoardInformation(boardId: string) {
    this.selectedBoardId = boardId;
    this.showBoardInfoForm = true;
  }

  closeShowBoardInformation() {
    this.showBoardInfoForm = false;
    this.selectedBoardId = null;
    this.getBoardIfIsArchived();
  }

  onBoardUpdated() {
    this.getBoardIfIsArchived();
  }

  searchBoardByName(boardName: string, isArchive: boolean): void {
    this.boardService.searchBoardByName(boardName, isArchive).subscribe({
      next: (data) => this.boards = data,
      error: (err) => console.error(err)
    });
  }
}
