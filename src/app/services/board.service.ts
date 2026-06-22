import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import {UserInfo} from 'node:os';

export interface ActivityBoardResponse {
  action: string;
  activityInformation: string;
  activityTime: string;
}
export interface BoardResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isArchive: boolean;
}


@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private apiUrl = `${environment.apiUrl}/board`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  createBoard(data: { name: string }) {
    return this.http.post(
      `${this.apiUrl}/create-board`,
      data,
      this.authService.getAuthHeaders()
    );
  }

  updateBoard(boardId: string, data: any) {
    return this.http.put(`${this.apiUrl}/${boardId}`, data);
  }

  deleteBoard(boardId: string) {
    return this.http.delete(`${this.apiUrl}/${boardId}`);
  }

  getBoardById(boardId: string) {
    return this.http.get<any>(`${this.apiUrl}/board-by-id/${boardId}`);
  }

  getBoardsByUser() {
    const token = localStorage.getItem('authToken');
    return this.http.get(`${this.apiUrl}/board-by-user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getBoardActivityByBoardId(boardId: string) {
    return this.http.get<ActivityBoardResponse[]>(
      `${this.apiUrl}/get-activity-board/${boardId}`
    );
  }

  addCollaborator(boardId: string, identifier: string) {
    // identifier передаємо як Query параметр через ?, бо в контролері [FromQuery]
    return this.http.post(`${this.apiUrl}/add-collaborator/${boardId}?identifier=${identifier}`, {});
  }

  getAllCollaborators(boardId: string) {
    // Додаємо тип <any[]> або створи інтерфейс UserResponse[]
    return this.http.get<any[]>(`${this.apiUrl}/get-collaborators/${boardId}`);
  }

  deleteCollaborator(boardId: string , collaboratorName:string) {
    return this.http.delete(`${this.apiUrl}/delete-collaborator/${boardId}/${collaboratorName}`);
  }

  removeCollaborator(boardId: string) {
    return this.http.delete(`${this.apiUrl}/remove-collaborator/${boardId}`)
  }

  addToArchiveBoard(boardId: string) {
     return this.http.post(`${this.apiUrl}/archive-board/${boardId}`, {});
  }

  removeFromArchiveBoard(boardId: string) {
    return this.http.post(`${this.apiUrl}/unarchive-board/${boardId}`, {});
  }

  getBoardIfIsArchived() {
    return this.http.get<any>(`${this.apiUrl}/board-by-user-if-isArchive-true`);
  }

  searchBoardByName(boardName: string, isArchive : boolean) {
    // HttpParams автоматично підготує рядок типу ?userId=...&boardName=...
    const params = new HttpParams()
      .set('searchName', boardName)
    .set('isArchive', isArchive);

    return this.http.get<BoardResponse[]>(`${this.apiUrl}/get-search-board`, { params });
  }
}
