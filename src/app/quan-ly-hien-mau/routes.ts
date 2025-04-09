import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Quản lý hiến máu',
      roles: ['all']
    },
    children: [
      {
        path: '', 
        redirectTo: 'danh-sach-hien-mau',
        pathMatch: 'full',
      },
      {
        path: 'danh-sach-hien-mau',
        loadComponent: () => import('./ds-hien-mau/ds-hien-mau.component').then(m => m.TTHienMauComponent),
        data: {
          title: 'Danh sách hiến máu',
          roles: ['all'],
        }
      },
      {
        path: 'dot-hien-mau',
        loadComponent: () => import('./dot-hien-mau/dot-hien-mau.component').then(m => m.DotHienMauComponent),
        data: {
          title: 'Đợt hiến máu',
          roles: ['all'],
        }
      },
    ]
  }
];


