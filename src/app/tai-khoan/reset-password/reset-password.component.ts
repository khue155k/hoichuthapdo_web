import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import {
  TableDirective,
  FormModule
}
  from '@coreui/angular';
import { TaiKhoanService } from '../../services';
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    TableDirective,
    FormModule,
    ReactiveFormsModule,
    TableDirective,
    FormsModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  constructor(private userService: TaiKhoanService,private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
    });
  }
  ngOnInit(): void {
    this.searchTaiKhoan();
  }
  searchForm: FormGroup;

  userList: any[] = [];

  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;

  searchTaiKhoanForm(){
    this.currentPage = 1;
    this.searchTaiKhoan();
  }

  searchTaiKhoan() {
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    this.userService.searchTaiKhoans(searchTerm, this.pageSize,this.currentPage).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.userList = response.data.items;
          this.totalCount = response.data.totalCount;

          console.log(this.userList);
        }
        if (response.code === 404 || response.code === 400) {
          alert(response.message)
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách tài khoản:', error);
      }
    })
  }

  resetPassword(user: any) {
    console.log(user);
    const confirmReset = window.confirm('Xác nhận đặt lại mật khẩu cho tài khoản ' + user.userName);
    if (confirmReset) {
      this.userService.resetPassword(user.id).subscribe({
        next: (response) => {
          if (response.code === 200) {
            const user1 = this.userList.find(u => u.id === user.id);
            if (user1) {
              user1.ketQua = "Đã đặt lại";
            }
            alert(`Mật khẩu mới của tài khoản: ${user.userName} là ${response.data}`);
          }
          if (response.code === 404 || response.code === 400) {
            alert(response.message)
          }
        },
        error: (error) => {
          console.error('Lỗi khi đặt lại mật khẩu tài khoản:', error);
        }
      })
    }
  }

  
  goToPage(page: number): void {
    this.currentPage = page;
    this.searchTaiKhoan();
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.searchTaiKhoan();
    }
  }

  prePage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.searchTaiKhoan();
    }
  }

  getLimitedPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      return pageNumbers;
    }

    let start = Math.max(1, this.currentPage - halfVisible);
    let end = Math.min(totalPages, this.currentPage + halfVisible);

    if (start === 1) {
      end = Math.min(maxVisiblePages, totalPages);
    } else if (end === totalPages) {
      start = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    return pageNumbers.slice(start - 1, end);
  }
}
