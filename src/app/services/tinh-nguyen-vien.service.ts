import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TemplateResult, PaginatedResult } from './template-result.interface';

@Injectable({
  providedIn: 'root'
})
export class TinhNguyenVienService {

  private baseUrl = environment.apiUrl + '/TinhNguyenVien';

  constructor(private http: HttpClient) { }

  search(
      string_tim_kiem: string = "Nội dung tìm kiếm",
      pageSize: number = 10,
      currentPage: number = 1
    ): Observable<TemplateResult<PaginatedResult<TinhNguyenVien>>> {
      let params = new HttpParams()
        .set('string_tim_kiem', string_tim_kiem)
        .set('pageSize', pageSize.toString())
        .set('currentPage', currentPage.toString());
  
      return this.http.get<TemplateResult<PaginatedResult<TinhNguyenVien>>>(this.baseUrl + '/search', { params });
    }
  
    createTinhNguyenVien(tinhNguyenVien: any): Observable<TemplateResult<any>> {
      return this.http.post<TemplateResult<any>>(`${this.baseUrl}/createTNV`, tinhNguyenVien);
    }
  
    updateTinhNguyenVien(id : number, donVi: any){
      return this.http.put<TemplateResult<any>>(`${this.baseUrl}/updateTNV/${id}`, donVi);
    }
  
    deleteTinhNguyenVien(id : number){
      return this.http.delete<TemplateResult<any>>(`${this.baseUrl}/deleteTNV/${id}`);
    }

    getTinhNguyenVienByCCCD(cccd: string): Observable<TemplateResult<any>> {
      return this.http.get<TemplateResult<any>>(`${this.baseUrl}/cccd/${cccd}`);
    }
  
    getAllTinhNguyenVienPaginated(pageSize: number, currentPage: number): Observable<TemplateResult<any>> {
      return this.http.get<TemplateResult<any>>(`${this.baseUrl}/getTNVsPaginated?pageSize=${pageSize}&currentPage=${currentPage}`);
    }
}
export interface TinhNguyenVien {
  cccd: number;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  soDienThoai: string;
  email: string;
  soLanHien: string;
}