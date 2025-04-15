import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginatedResult, TemplateResult } from './template-result.interface';

@Injectable({
    providedIn: 'root'
})
export class TaiKhoanService {
    constructor(private http: HttpClient) { }
    private baseUrl = environment.apiUrl + '/TaiKhoan';

    searchTaiKhoans(string_tim_kiem: string, pageSize: number = 10, currentPage: number = 1): Observable<TemplateResult<PaginatedResult<any>>> {
        return this.http.get<TemplateResult<PaginatedResult<any>>>(`${this.baseUrl}/search?string_tim_kiem=${string_tim_kiem}&pageSize=${pageSize}&currentPage=${currentPage}`);
    }

    resetPassword(id: string): Observable<TemplateResult<any>> {
        return this.http.put<TemplateResult<any>>(`${this.baseUrl}/resetPassword/${id}`, {});
    }

    getTTQTV(id: string): Observable<TemplateResult<any>> {
        return this.http.get<TemplateResult<any>>(`${this.baseUrl}/TTQTV?id=${id}`);
    }

    updateQTV(id: string, quanTriVien: any) {
        return this.http.put<TemplateResult<any>>(`${this.baseUrl}/updateQTV/${id}`, quanTriVien);
    }

    createAdmin(admin: any): Observable<TemplateResult<any>> {
        return this.http.post<TemplateResult<any>>(`${this.baseUrl}/CreateAdmin`, admin);
      }
}
