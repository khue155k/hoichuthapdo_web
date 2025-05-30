import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TemplateResult, PaginatedResult } from './template-result.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TTHienMauService {

  private apiUrl = environment.apiUrl + '/TTHienMau'

  constructor(private http: HttpClient) { }

  search(
    string_tim_kiem: string = "Nội dung tìm kiếm",
    string_ketQua: string = "Nội dung tìm kiếm",
    maDot: number = 0,
    pageSize: number = 10,
    currentPage: number = 1
  ): Observable<TemplateResult<PaginatedResult<TTHienMau>>> {
    let params = new HttpParams()
      .set('string_tim_kiem', string_tim_kiem)
      .set('string_ketQua', string_ketQua)
      .set('maDot', maDot.toString())
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString());

    return this.http.get<TemplateResult<PaginatedResult<TTHienMau>>>(this.apiUrl + '/search', { params });
  }

  createTTHienMau(TTHienMau: any): Observable<TemplateResult<any>> {
    return this.http.post<TemplateResult<any>>(`${this.apiUrl}/createTTHienMau`, TTHienMau, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }
  getTTHienMauById(id: number): Observable<TemplateResult<TTHienMauDto>> {
    return this.http.get<TemplateResult<TTHienMauDto>>(`${this.apiUrl}/${id}`);
  }
  updateTTHienMau(id: number, updatedEntry: any): Observable<TemplateResult<any>> {
    return this.http.put<TemplateResult<TTHienMau>>(`${this.apiUrl}/update/${id}`, updatedEntry);
  }
  updateStatus(id: number, ketQuaMoi: string): Observable<TemplateResult<TTHienMau>> {
    return this.http.put<TemplateResult<TTHienMau>>(`${this.apiUrl}/updateStatus/${id}?ketQua=${ketQuaMoi}`,{});
  }
  updateListStatus(ketQuaMoi: string, selectedItemList: Set<number>): Observable<TemplateResult<any>> {
    return this.http.put<TemplateResult<any>>(`${this.apiUrl}/updateListStatus?ketQua=${ketQuaMoi}`, Array.from(selectedItemList));
  }
}
export interface TTHienMau {
  maTT: number;
  maDot: number;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string | null;
  ngheNghiep: string | null;
  maDV: number;
  cccd: string;
  soDienThoai: string;
  email: string | null;
  noiO: string | null;
  soLanHien: number;
  maTheTich: number;
  ketQua: string;
  tinhThanh: string | null;
  quanHuyen: string | null;
  phuongXa: string | null;
}

export interface TTHienMauDto {
  maTT: number;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string | null;
  ngheNghiep: string | null;
  cccd: string;
  soDienThoai: string;
  email: string | null;
  noiO: string | null;
  soLanHien: number;
  ketQua: string;
  tinhThanh: string | null;
  quanHuyen: string | null;
  phuongXa: string | null;
  tenDot: string | null;
  tenDonVi: string | null;
  theTich: number | null;
}



