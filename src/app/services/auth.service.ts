import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { jwtDecode } from "jwt-decode";
import { TemplateResult } from './template-result.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/Login';

  constructor(private http: HttpClient, private router: Router) { 
  }

  login(username: string, password: string): Observable<boolean> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { username, password };

    return this.http.post<{ message: string; data: any }>(this.apiUrl, body, { headers }).pipe(
      map((response) => {
        console.log(response);
        if (response.message === 'Login complete!') {
          localStorage.setItem('token', response.data.token);
          return true;
        } else {
          return false;
        }
      }),
      catchError((error) => {
        console.error('Login failed', error);
        return throwError(error);
      })
    );
  }
  // getRole(): string | null {
  //   var userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  //   return userInfo.role;
  // }

  // hasRole(role: string): boolean {
  //   const userRoles = this.getRole()?.split(',') || [];
  //   return userRoles.includes(role);
  // }

  public redirectBasedOnRole() {
    // const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    // const roles = userInfo.role?.split(',').map((r: string) => r.trim()) || [];

    // if (roles.includes('tao_phieu')) {
    //   this.router.navigate(['/tao-phieu-nghi-phep']);
    // } else if (roles.includes('xu_ly')) {
    //   this.router.navigate(['/xu-ly-phieu-nghi']);
    // } else if (roles.includes('bao_cao')) {
    //   this.router.navigate(['/bao-cao']);
    // } else if (roles.includes('admin')) {
    //   this.router.navigate(['/quan-ly-nhan-vien']);
    // } else {
    //   this.router.navigate(['/thong-tin-ca-nhan']);
    // }
    this.router.navigate(['/quan-ly-hien-mau']);
  }

  changePassword(username: string, oldPassword: string, newPassword: string): Observable<boolean> {
    const body = { username, oldPassword, newPassword };

    return this.http.post<TemplateResult<any>>(`${this.apiUrl}/ChangePassword`, body).pipe(
      map((response) => {
        return response.message === 'Đổi mật khẩu thành công!';
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return throwError(() => error);
        }
        return of(false);
      })
    );
  }
  resetPassword(ma_nv: string, newPassword: string): Observable<boolean> {
    const body = { ma_nv, newPassword };

    return this.http.post<TemplateResult<any>>(`${this.apiUrl}/ResetPassword`, body).pipe(
      map((response) => {
        return response.message === 'Đặt lại mật khẩu thành công!';
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Đổi mật khẩu không thành công.', error);
        return of(false);
      })
    );
  }

  getDecodedToken(): any {
    const token = localStorage.getItem('token');
    if (!token) this.logout();
    return jwtDecode<any>(token!);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
  
    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
  
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        this.logout();
        return false;
      }
  
      return true;
    } catch (error) {
      console.error('Token không hợp lệ:', error);
      this.logout();
      return false;
    }
  }  

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('')
  }
}
