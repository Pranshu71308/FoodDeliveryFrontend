import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookMarkService {
  private apiurl = environment.apiurl;
  private InsertBookMark = `${this.apiurl}/Food/InsertBookmark`;
  private GetBookMark= `${this.apiurl}/Food/GetBookmarkedRestaurants`;
  private ToggleBookMark= `${this.apiurl}/Food/ToggleBookmark`;
  constructor( private http:HttpClient) {}
  addBookmark(userId: number | null, restaurantId: string | undefined): Observable<any> {
    const body = { userId, restaurantId };
    return this.http.post(`${this.InsertBookMark}`, body);
  }
  getBookmarks(userId: number): Observable<any> {
    console.log("book");
    return this.http.get(`${this.GetBookMark}/${userId}`);
  }
}
