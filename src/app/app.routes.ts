import { RouterModule, Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { AuthGuard } from './services/auth.guard';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'quan-ly-hien-mau',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dang-ky-hien-mau',
    loadComponent: () => import('./dang-ky-hien-mau/dang-ky-hien-mau.component').then(m => m.DangKyHienMauComponent)
  },
  {
    path: 'dang-ky-hien-mau/:maDot',
    loadComponent: () => import('./dang-ky-hien-mau/dang-ky-hien-mau.component').then(m => m.DangKyHienMauComponent)
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home',
      roles: ['']
    },
    canActivate: [AuthGuard],
    children: [
      {
        path: 'thong_ke',
        canActivate: [AuthGuard],
        loadChildren: () => import('./dashboard/routes').then((m) => m.routes),
        data:{
          title: 'Thống kê',
          roles: ['']
        }
      },
      {
        path: 'quan-ly-hien-mau',
        canActivate: [AuthGuard],
        loadChildren: () => import('./quan-ly-hien-mau/routes').then((m) => m.routes),
        data:{
          roles: ['']
        }
      },
      {
        path: 'qua-tang',
        canActivate: [AuthGuard],
        loadChildren: () => import('./qua-tang/routes').then((m) => m.routes),
        data:{
          roles: ['']
        }
      },
      {
        path: 'tai-khoan',
        canActivate: [AuthGuard],
        loadChildren: () => import('./tai-khoan/routes').then((m) => m.routes),
        data: {
          roles: ['']
        }
      },
    ]
  },
  {
    path: '404',
    loadComponent: () => import('../views/pages/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    loadComponent: () => import('../views/pages/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 500'
    }
  },
  { path: '**', redirectTo: '404' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule {
  static routes = routes;
}
