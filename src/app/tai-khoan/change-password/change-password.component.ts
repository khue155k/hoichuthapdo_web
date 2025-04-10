import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services';
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  username: string = '';
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  error: string = '';
  userInfo: any;

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {
    this.userInfo = this.authService.getDecodedToken();
    this.username = this.userInfo.unique_name;
  }

  changePassword(event: Event): void {
    if (this.oldPassword === '' || this.newPassword === '' || this.confirmPassword === '') {
      this.error = 'Vui lòng nhập đủ thông tin.';
      this.message = '';
      return;
    } else if (this.newPassword !== this.confirmPassword) {
      this.error = 'Mật khẩu mới và xác nhận mật khẩu không khớp.';
      this.message = '';
      return;
    } else if (this.oldPassword === this.newPassword) {
      this.error = 'Mật khẩu mới không được trùng với mật khẩu cũ.'
      this.message = '';
      return;
    }

    this.authService.changePassword(this.username, this.oldPassword, this.newPassword).subscribe(success => {
      if (success) {
        this.message = 'Đổi mật khẩu thành công!';
        this.error = '';
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      } else {
        this.error = 'Đổi mật khẩu không thành công.';
        this.message = '';
      }
    },
      (error: HttpErrorResponse) => {
        if (error.status === 401) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          this.router.navigate(['/login']);
        } else {
          console.error('Đổi mật khẩu không thành công', error);
          this.error = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
        }
      }
    );
  }

  onOldPasswordChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.oldPassword = input.value;
  }

  onNewPasswordChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newPassword = input.value;
  }

  onConfirmPasswordChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.confirmPassword = input.value;
  }
}
