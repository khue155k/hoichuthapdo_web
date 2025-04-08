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

  /**
   * Lấy danh sách tỉnh/thành phố
   */
  getProvinces(): Observable<any> {
    return this.http.get<any>(`${this.api}/Address/provinces`);
  }

  /**
   * Lấy danh sách quận/huyện theo mã tỉnh
   * @param provinceId Mã tỉnh/thành phố
   */
  getDistricts(provinceId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/Address/districts/provinceId?provinceId=${provinceId}`);
  }

  /**
   * Lấy danh sách phường/xã theo mã quận
   * @param districtId Mã quận/huyện
   */
  getWards(districtId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/Address/wards/districtId?districtId=${districtId}`);
  }
}
