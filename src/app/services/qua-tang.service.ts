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

  createQuaTang(donVi: any): Observable<TemplateResult<any>> {
    return this.http.post<TemplateResult<any>>(`${this.baseUrl}/createQuaTang`, donVi);
  }

  updateQuaTang(id : number, donVi: any){
    return this.http.put<TemplateResult<any>>(`${this.baseUrl}/updateQuaTang/${id}`, donVi);
  }

  deleteQuaTang(id : number){
    return this.http.delete<TemplateResult<any>>(`${this.baseUrl}/deleteQuaTang/${id}`);
  }

  getQuaTang(maDV: number): Observable<TemplateResult<any>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/${maDV}`);
  }

  getQuaTangs(): Observable<TemplateResult<any[]>> {
    return this.http.get<TemplateResult<any[]>>(`${environment.apiUrl}/QuaTang`);
  }

  getAllQuaTangPaginated(pageSize: number, currentPage: number): Observable<TemplateResult<any>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/getQuaTangsPaginated?pageSize=${pageSize}&currentPage=${currentPage}`);
  }
}

export interface QuaTang {
  maDV: number;
  tenDV: string;
  soDienThoai: string;
  Email: string
}