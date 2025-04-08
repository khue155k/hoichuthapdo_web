import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TemplateResult } from './template-result.interface';

@Injectable({
  providedIn: 'root'
})
export class TinhNguyenVienService {

  private apiUrl = environment.apiUrl + '/TinhNguyenVien';

  constructor(private http: HttpClient) { }

  createTinhNguyenVien(tinhNguyenVien: any): Observable<TemplateResult<any>> {
    return this.http.post<TemplateResult<any>>(`${this.apiUrl}`, tinhNguyenVien);
  }

  getTinhNguyenVienByCCCD(cccd: string): Observable<TemplateResult<any>> {
    return this.http.get<TemplateResult<any>>(`${this.apiUrl}/cccd/${cccd}`);
  }
}
