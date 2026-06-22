import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface ListCart {
  id: string;
  name: string;
  boardId: string;
  carts: any[];
  activityListCarts: any[];
}
export interface ActivityCartListResponse {
  action: string;
  activityInformation: string;
  activityTime: string;
}

@Injectable({
  providedIn: 'root',
})
export class ListCartService {
  private apiUrl = `${environment.apiUrl}/list-cart`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  private getAuthHeaders(): { headers: HttpHeaders } {
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      } else {
        console.warn('No token found in localStorage');
      }
    }
    return { headers };
  }

  createCartList(
    boardId: string,
    data: { name: string }
  ): Observable<ListCart> {
    return this.http.post<ListCart>(
      `${this.apiUrl}/create-list-cart/${boardId}`,
      data,
      this.getAuthHeaders()
    );
  }

  updateCartList(
    listCartId: string,
    data: Partial<ListCart>
  ): Observable<ListCart> {
    return this.http.put<ListCart>(
      `${this.apiUrl}/${listCartId}`,
      data,
      this.getAuthHeaders()
    );
  }

  deleteCartList(listCartId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${listCartId}`,
      this.getAuthHeaders()
    );
  }

  getListCartByBoardId(boardId: string): Observable<ListCart[]> {
    return this.http.get<ListCart[]>(
      `${this.apiUrl}/list-cart-by-boardid/${boardId}`,
      this.getAuthHeaders()
    );
  }

  getListCartByUser(): Observable<ListCart[]> {
    return this.http.get<ListCart[]>(
      `${this.apiUrl}/list-cart-by-user`,
      this.getAuthHeaders()
    );
  }

  moveToBoard(listCartId: string, boardId: string): Observable<void> {
    return this.http.get<void>(
      `${this.apiUrl}/move-to-board/${boardId}`,
      this.getAuthHeaders()
    );
  }
  getListCartActivityByListId(listCartId: string) {
    return this.http.get<ActivityCartListResponse[]>(
      `${this.apiUrl}/get-activity-listcart/${listCartId}`,
      this.getAuthHeaders()
    );
  }

  getListCartById(listCartId: string): Observable<ListCart> {
    return this.http.get<ListCart>(
      `${this.apiUrl}/list-cart-by-id/${listCartId}`,
      this.getAuthHeaders()
    );
  }

  getArchiveListCart(boardId:string){
    return this.http.get<ListCart[]>(`${this.apiUrl}/list-cart-by-boardid-if-archive/${boardId}`)
  }
  removeListCartFromArchive(listCartId:string){
 return this.http.put(`${this.apiUrl}/remove-cartList-from-archive/${listCartId}`, {});
  }
  addListCartToArchive(listCartId:string){
    return this.http.put(`${this.apiUrl}/add-cartList-to-archive/${listCartId}`, {});
  }
  searchListCart(cartName: string, boardId: string,isArchive : boolean): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search-listcart-by-name`, {
      params: { cartName, boardId, isArchive },
    });
  }
}
