import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TemplateResult, PaginatedResult } from './template-result.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DsHienMauService {

  private apiUrl = environment.apiUrl + '/TTHienMau'

  constructor(private http: HttpClient) { }

  search(
    string_tim_kiem: string = "Nội dung tìm kiếm",
    string_ket_qua: string = "Nội dung tìm kiếm",
    dot_hien_mau_id: number = 0,
    pageSize: number = 10,
    currentPage: number = 1
  ): Observable<TemplateResult<PaginatedResult<TTHienMau>>> {
    let params = new HttpParams()
      .set('string_tim_kiem', string_tim_kiem)
      .set('string_ket_qua', string_ket_qua)
      .set('dot_hien_mau_id', dot_hien_mau_id.toString())
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString());

    return this.http.get<TemplateResult<PaginatedResult<TTHienMau>>>(this.apiUrl + '/search', { params });
  }

  createTTHienMau(TTHienMau: any): Observable<TemplateResult<any>> {
    return this.http.post<TemplateResult<any>>(`${this.apiUrl}`, TTHienMau, {
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
    console.log(selectedItemList);
    return this.http.put<TemplateResult<any>>(`${this.apiUrl}/updateListStatus?ketQua=${ketQuaMoi}`, Array.from(selectedItemList));
  }
}
export interface TTHienMau {
  MaTT: number;
  MaDot: number;
  HoTen: string;
  NgaySinh: string;
  GioiTinh: string | null;
  NgheNghiep: string | null;
  MaDV: number;
  CCCD: string;
  SoDienThoai: string;
  Email: string | null;
  NoiO: string | null;
  SoLanHien: number;
  MaTheTich: number;
  KetQua: string;
  TinhThanh: string | null;
  QuanHuyen: string | null;
  PhuongXa: string | null;
}
export interface TTHienMauDto {
  MaTT: number;
  HoTen: string;
  NgaySinh: string;
  GioiTinh: string | null;
  NgheNghiep: string | null;
  CCCD: string;
  SoDienThoai: string;
  Email: string | null;
  NoiO: string | null;
  SoLanHien: number;
  KetQua: string;
  TinhThanh: string | null;
  QuanHuyen: string | null;
  PhuongXa: string | null;
  TenDot: string | null;
  TenDonVi: string | null;
  TheTich: number | null;
}


