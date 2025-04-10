import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TemplateResult, PaginatedResult } from './template-result.interface';

@Injectable({
  providedIn: 'root'
})
export class QuaTangService {
  private baseUrl = environment.apiUrl + '/QuaTang';

  constructor(private http: HttpClient) { }

  search(
    string_tim_kiem: string = "Nội dung tìm kiếm",
    pageSize: number = 10,
    currentPage: number = 1
  ): Observable<TemplateResult<PaginatedResult<QuaTang>>> {
    let params = new HttpParams()
      .set('string_tim_kiem', string_tim_kiem)
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString());

    return this.http.get<TemplateResult<PaginatedResult<QuaTang>>>(this.baseUrl + '/search', { params });
  }

  createQuaTang(quaTang: any): Observable<TemplateResult<any>> {
    return this.http.post<TemplateResult<any>>(`${this.baseUrl}/createQuaTang`, quaTang);
  }

  updateQuaTang(id : number, quaTang: any){
    return this.http.put<TemplateResult<any>>(`${this.baseUrl}/updateQuaTang/${id}`, quaTang);
  }

  deleteQuaTang(id : number){
    return this.http.delete<TemplateResult<any>>(`${this.baseUrl}/deleteQuaTang/${id}`);
  }

  getQuaTang(id: number): Observable<TemplateResult<any>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/${id}`);
  }

  getQuaTangs(): Observable<TemplateResult<any[]>> {
    return this.http.get<TemplateResult<any[]>>(`${environment.apiUrl}/QuaTang`);
  }

  getAllQuaTangPaginated(pageSize: number, currentPage: number): Observable<TemplateResult<any>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/getQuaTangsPaginated?pageSize=${pageSize}&currentPage=${currentPage}`);
  }

  tangQua(quaTang: any): Observable<TemplateResult<any>> {
    return this.http.post<TemplateResult<any>>(`${this.baseUrl}/tangQua`, quaTang);
  }

  searchTNV(
    string_tim_kiem: string = "Nội dung tìm kiếm",
    pageSize: number = 10,
    currentPage: number = 1
  ): Observable<TemplateResult<PaginatedResult<QuaTang>>> {
    let params = new HttpParams()
      .set('string_tim_kiem', string_tim_kiem)
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString());

    return this.http.get<TemplateResult<PaginatedResult<QuaTang>>>(this.baseUrl + '/searchTNV', { params });
  }
}

export interface QuaTang {
  maQua: number;
  tenQua: string;
  giaTri: string;
}