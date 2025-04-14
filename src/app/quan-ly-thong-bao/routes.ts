import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./quan-ly-thong-bao.component').then(m => m.ThongBaoComponent),
    data: {
      title: 'Thông báo',
      roles: ['all'],
    },
  }
];

