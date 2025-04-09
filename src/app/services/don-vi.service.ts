import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TemplateResult, PaginatedResult } from './template-result.interface';

@Injectable({
  providedIn: 'root'
})
export class DonViService {
  private baseUrl = environment.apiUrl + '/DonVi';

  constructor(private http: HttpClient) { }

  search(
    string_tim_kiem: string = "Nội dung tìm kiếm",
    pageSize: number = 10,
    currentPage: number = 1
  ): Observable<TemplateResult<PaginatedResult<DonVi>>> {
    let params = new HttpParams()
      .set('string_tim_kiem', string_tim_kiem)
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString());

    return this.http.get<TemplateResult<PaginatedResult<DonVi>>>(this.baseUrl + '/search', { params });
  }

  createDonVi(donVi: any): Observable<TemplateResult<any>> {
    return this.http.post<TemplateResult<any>>(`${this.baseUrl}/createDonVi`, donVi);
  }

  updateDonVi(id : number, donVi: any){
    return this.http.put<TemplateResult<any>>(`${this.baseUrl}/updateDonVi/${id}`, donVi);
  }

  deleteDonVi(id : number){
    return this.http.delete<TemplateResult<any>>(`${this.baseUrl}/deleteDonVi/${id}`);
  }

  getDonVi(maDV: number): Observable<TemplateResult<any>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/${maDV}`);
  }

  getDonVis(): Observable<TemplateResult<any[]>> {
    return this.http.get<TemplateResult<any[]>>(`${environment.apiUrl}/DonVi`);
  }

  getAllDonViPaginated(pageSize: number, currentPage: number): Observable<TemplateResult<any>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/getDonVisPaginated?pageSize=${pageSize}&currentPage=${currentPage}`);
  }
}

export interface DonVi {
  maDV: number;
  tenDV: string;
  soDienThoai: string;
  Email: string
}