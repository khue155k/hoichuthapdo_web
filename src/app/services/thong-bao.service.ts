import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TemplateResult, PaginatedResult } from './template-result.interface';

@Injectable({
  providedIn: 'root'
})
export class ThongBaoService {
  private baseUrl = environment.apiUrl + '/ThongBao';

  constructor(private http: HttpClient) { }

  search(
    string_tim_kiem: string = "Nội dung tìm kiếm",
    pageSize: number = 10,
    currentPage: number = 1
  ): Observable<TemplateResult<PaginatedResult<ThongBao>>> {
    let params = new HttpParams()
      .set('string_tim_kiem', string_tim_kiem)
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString());

    return this.http.get<TemplateResult<PaginatedResult<ThongBao>>>(this.baseUrl + '/search', { params });
  }

  createThongBao(quaTang: any): Observable<TemplateResult<any>> {
    return this.http.post<TemplateResult<any>>(`${this.baseUrl}/createThongBao`, quaTang);
  }

  updateThongBao(id : number, quaTang: any){
    return this.http.put<TemplateResult<any>>(`${this.baseUrl}/updateThongBao/${id}`, quaTang);
  }

  deleteThongBao(id : number){
    return this.http.delete<TemplateResult<any>>(`${this.baseUrl}/deleteThongBao/${id}`);
  }

  getThongBao(id: number): Observable<TemplateResult<any>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/${id}`);
  }

  getThongBaos(): Observable<TemplateResult<any[]>> {
    return this.http.get<TemplateResult<any[]>>(`${environment.apiUrl}/ThongBao`);
  }

  getAllThongBaoPaginated(pageSize: number, currentPage: number): Observable<TemplateResult<any>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/getThongBaosPaginated?pageSize=${pageSize}&currentPage=${currentPage}`);
  }

}

export interface ThongBao {
  maTB: number;
  tieuDe: string;
  noiDung: string;
  thoiGianGui: string;
}