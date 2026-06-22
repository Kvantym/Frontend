import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CommentResponse {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
  cartId: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comment`;

  constructor(private http: HttpClient) {}

  AddComent(cartId: string, content: string) {
    return this.http.post(`${this.apiUrl}/add-comment/${cartId}`, { content: content });
  }

  GetComments(cartId: string) {
    return this.http.get<CommentResponse[]>(`${this.apiUrl}/comments-by-cart/${cartId}`);
  }

  DeleteComment(commentId: string) {
    return this.http.delete(`${this.apiUrl}/${commentId}`);
  }
}
