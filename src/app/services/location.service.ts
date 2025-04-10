import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProvinces(): Observable<any> {
    return this.http.get<any>(`${this.api}/Address/provinces`);
  }

  getDistricts(provinceId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/Address/districts/provinceId?provinceId=${provinceId}`);
  }

  getWards(districtId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/Address/wards/districtId?districtId=${districtId}`);
  }

  getProvince(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/Address/province?provinceId=${id}`);
  }

  getDistrict(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/Address/district?districtId=${id}`);
  }

  getWard(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/Address/ward?wardId=${id}`);
  }
}
