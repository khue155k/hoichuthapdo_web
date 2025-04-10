import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Quà tặng',
      roles: ['all']
    },
    children: [
      {
        path: '', 
        redirectTo: 'quan-ly-qua-tang',
        pathMatch: 'full',
      },
      {
        path: 'quan-ly-qua-tang',
        loadComponent: () => import('./quan-ly-qua-tang/quan-ly-qua-tang.component').then(m => m.QuaTangComponent),
        data: {
          title: 'Quản lý quà tặng',
          roles: ['all'],
        }
      },
      {
        path: 'tang-qua',
        loadComponent: () => import('./tang-qua/tang-qua.component').then(m => m.TangQuaComponent),
        data: {
          title: 'Tặng quà',
          roles: ['all'],
        }
      },
    ]
  }
];


