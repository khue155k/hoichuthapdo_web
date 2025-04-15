import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TableDirective,
}
  from '@coreui/angular';

import { CustomValidators, AuthService } from '../../services';

@Component({
  selector: 'app-create-admin',
  standalone: true,
  imports: [
    TableDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './create-admin.component.html',
  styleUrl: './create-admin.component.css'
})
export class TaoAdminComponent implements OnInit {
  constructor(private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.taoAdminForm = this.fb.group({
      tenQTV: ['', Validators.required],
      boPhan: ['', Validators.required],
      chucVu: ['', Validators.required],
      email: ['', Validators.required],
      soDienThoai: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', [Validators.required, CustomValidators.strongPassword()]],
      passwordConfirm: ['', Validators.required]
    }, { validators: CustomValidators.passwordMatch() });
    
  }

  ngOnInit(): void {
  }

  taoAdminForm: FormGroup;

  AddAdmin() {
    if (this.taoAdminForm.valid) {
      const taoAdmindata = {
        tenQTV: this.taoAdminForm.value.tenQTV,
        userName: this.taoAdminForm.value.userName,
        password: this.taoAdminForm.value.password,
        boPhan: this.taoAdminForm.value.boPhan,
        chucVu: this.taoAdminForm.value.chucVu,
        email: this.taoAdminForm.value.email,
        soDienThoai: this.taoAdminForm.value.soDienThoai,
      }

      this.authService.createAdmin(taoAdmindata).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.taoAdminForm.reset();
            alert('Tạo tài khoản admin thành công.');
          }
          if (response.code === 400 || response.code === 404) {
            alert(response.message);
          }
        },
        error: (err) => {
          alert('Tạo tài khoản admin không thành công, vui lòng thử lại.')
        }
      });
    } else {
      this.taoAdminForm.markAllAsTouched();
    }
  }
}
