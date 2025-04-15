import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Tài khoản',
      roles: ['all']
    },
    children: [
      {
        path: '', 
        redirectTo: 'thong-tin-ca-nhan',
        pathMatch: 'full',
      },
      {
        path: 'thong-tin-ca-nhan',
        loadComponent: () => import('./user-info/user-info.component').then(m => m.UserInfoComponent),
        data: {
          title: 'Thông tin cá nhân',
          roles: ['all'],
        }
      },
      {
        path: 'doi-mat-khau',
        loadComponent: () => import('./change-password/change-password.component').then(m => m.ChangePasswordComponent),
        data: {
          title: 'Đổi mật khẩu',
          roles: ['all'],
        }
      },
      {
        path: 'create-admin',
        loadComponent: () => import('./create-admin/create-admin.component').then(m => m.TaoAdminComponent),
        data: {
          title: 'Tạo quản trị viên',
          roles: ['all'],
        }
      },
      {
        path: 'dat-lai-mat-khau',
        loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        data: {
          title: 'Đặt lại mật khẩu',
          roles: ['all'],
        }
      },
    ]
  }
];


