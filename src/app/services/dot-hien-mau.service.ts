import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TemplateResult, PaginatedResult } from './template-result.interface';

@Injectable({
  providedIn: 'root'
})
export class DotHienMauService {
  private baseUrl = environment.apiUrl + '/DotHienMau';

  constructor(private http: HttpClient) { }

  search(
    string_tim_kiem: string = "Nội dung tìm kiếm",
    pageSize: number = 10,
    currentPage: number = 1
  ): Observable<TemplateResult<PaginatedResult<DotHienMau>>> {
    let params = new HttpParams()
      .set('string_tim_kiem', string_tim_kiem)
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString());

    return this.http.get<TemplateResult<PaginatedResult<DotHienMau>>>(this.baseUrl + '/search', { params });
  }

  createDotHienMau(dotHM: any): Observable<TemplateResult<any>> {
    return this.http.post<TemplateResult<any>>(`${this.baseUrl}/createDotHm`, dotHM);
  }

  updateDotHienMau(id : number, dotHM: any){
    return this.http.put<TemplateResult<any>>(`${this.baseUrl}/updateDotHm/${id}`, dotHM);
  }

  deleteDotHienMau(id : number){
    return this.http.delete<TemplateResult<any>>(`${this.baseUrl}/deleteDotHm/${id}`);
  }

  getDotHienMau(maDot: number): Observable<TemplateResult<any>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/${maDot}`);
  }

  getTheTichMauHien(): Observable<TemplateResult<any[]>> {
    return this.http.get<TemplateResult<any[]>>(`${this.baseUrl}/TheTichMH`);
  }
  getAllDotHienMau(): Observable<TemplateResult<any[]>> {
    return this.http.get<TemplateResult<any[]>>(`${this.baseUrl}`);
  }
  getAllDotHienMauPaginated(pageSize: number, currentPage: number): Observable<TemplateResult<any>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/getDotHMsPaginated?pageSize=${pageSize}&currentPage=${currentPage}`);
  }
}

export interface DotHienMau {
  maDot: number;
  tenDot: string;
  diaDiem: string;
  thoiGianBatDau: string
  thoiGianKetThuc: string
  donViMau: number;
}