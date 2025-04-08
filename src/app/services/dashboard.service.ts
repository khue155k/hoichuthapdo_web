import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TemplateResult } from './template-result.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) { }
  private baseUrl = environment.apiUrl;

  ttHMTheoDot(year: number): Observable<TemplateResult<any[]>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/DsHienMau/ttHMTheoDot?year=${year}`);
  }

  ttHMTheoThang(year: number): Observable<TemplateResult<any[]>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/DsHienMau/ttHMTheoThang?year=${year}`);
  }

  getNamHMs(): Observable<TemplateResult<any[]>> {
    return this.http.get<TemplateResult<any>>(`${this.baseUrl}/DotHienMau/getNamHMs`);
  }
}
