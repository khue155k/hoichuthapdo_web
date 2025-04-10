import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, TaiKhoanService } from '../../services';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TableDirective,
}
  from '@coreui/angular';
@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [    
      TableDirective,
      CommonModule,
      ReactiveFormsModule,
      FormsModule
    ],
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css'],
})
export class UserInfoComponent implements OnInit {
  constructor(private fb: FormBuilder, private taiKhoanService: TaiKhoanService,
    private authService: AuthService
  ) {
    this.userInfo = this.authService.getDecodedToken();

    this.QTVForm = this.fb.group({
      maQTV: [''],
      tenQTV: ['', Validators.required],
      boPhan: ['', Validators.required],
      chucVu: ['', Validators.required],
      email: ['', Validators.required],
      soDienThoai: ['', Validators.required],
      tenTaiKhoan: [''],
    });
  }

  TTQTV: any;
  userInfo: any;

  QTVForm: FormGroup;

  isEditModalOpen: boolean = false;
  isEdit: boolean = false;

  ngOnInit(): void {
    this.loadTTQTV();
  }

  loadTTQTV() {
    this.taiKhoanService.getTTQTV(1).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.TTQTV = response.data;
          console.log(response.data);
        }
        if (response.code === 404 || response.code === 400) {
          alert(response.message)
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải thông tin quản trị viên:', error);
      }
    });
  }

  OpenEditModal() {
    this.isEdit = true;
    this.isEditModalOpen = true;
    this.QTVForm.patchValue({
      maQTV: this.TTQTV.maQTV,
      tenQTV: this.TTQTV.tenQTV,
      boPhan: this.TTQTV.boPhan,
      chucVu: this.TTQTV.chucVu,
      email: this.TTQTV.email,
      soDienThoai: this.TTQTV.soDienThoai,
      tenTaiKhoan: this.userInfo.unique_name
    });
  }

  closeEditModal() {
    this.isEdit = false
    this.isEditModalOpen = false;
    this.QTVForm.reset();
  }

  saveChanges() {
    if (this.QTVForm.valid) {
      const updatedData = {
        maQTV: this.QTVForm.value.maQTV,
        tenQTV: this.QTVForm.value.tenQTV,
        boPhan: this.QTVForm.value.boPhan,
        chucVu: this.QTVForm.value.chucVu,
        email: this.QTVForm.value.email,
        soDienThoai: this.QTVForm.value.soDienThoai,
      };
      this.taiKhoanService.updateQTV(this.TTQTV.maQTV, updatedData).subscribe({
        next: (response) => {
          if (response.code == 200) {
            this.isEditModalOpen = false;
            this.QTVForm.reset();
            this.loadTTQTV();
            this.isEdit = false
            alert('Cập nhật thông tin thành công!')
          }
          if (response.code === 404 || response.code === 400) {
            alert(response.message);
          }
        },
        error: (err) => {
          alert('Có lỗi xảy ra khi cập nhật thông tin.');
          console.error('Lỗi khi cập nhật:', err);
        },
      });
    }
    else {
      this.QTVForm.markAllAsTouched();
    }
  }
}
