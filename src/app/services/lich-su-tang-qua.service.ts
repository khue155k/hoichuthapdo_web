import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TemplateResult, PaginatedResult } from './template-result.interface';

@Injectable({
  providedIn: 'root'
})
export class LichSuTangQuaService {
  private baseUrl = environment.apiUrl + '/LichSuTangQua';

  constructor(private http: HttpClient) { }

  search(
    string_tim_kiem: string = "Nội dung tìm kiếm",
    pageSize: number = 10,
    currentPage: number = 1
  ): Observable<TemplateResult<PaginatedResult<LichSuTangQua>>> {
    let params = new HttpParams()
      .set('string_tim_kiem', string_tim_kiem)
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString());

    return this.http.get<TemplateResult<PaginatedResult<LichSuTangQua>>>(this.baseUrl + '/search', { params });
  }

  createLSTQ(lichSuTangQua: any): Observable<TemplateResult<any>> {
    return this.http.post<TemplateResult<any>>(`${this.baseUrl}/createLSTQ`, lichSuTangQua);
  }

  updateLSTQ(cccd: string, maQua: number, lichSuTangQua: any) {
    return this.http.put<TemplateResult<any>>(`${this.baseUrl}/updateLSTQ?cccd=${cccd}&maQua=${maQua}`, lichSuTangQua);
  }

  deleteLSTQ(cccd: string, maQua: number) {
    return this.http.delete<TemplateResult<any>>(`${this.baseUrl}/deleteLSTQ?cccd=${cccd}&maQua=${maQua}`);
  }

  getLSTQ(cccd: string, maQua: number): Observable<TemplateResult<any>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}?cccd=${cccd}&maQua=${maQua}`);
  }

  getLSTQs(): Observable<TemplateResult<any[]>> {
    return this.http.get<TemplateResult<any[]>>(`${this.baseUrl}`);
  }

  getAllLSTQPaginated(pageSize: number, currentPage: number): Observable<TemplateResult<any>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/getLSTQsPaginated?pageSize=${pageSize}&currentPage=${currentPage}`);
  }
}

export interface LichSuTangQua {
  cccd: number;
  maQua: string;
  noiDung: string;
}