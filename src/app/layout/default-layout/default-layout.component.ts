import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';

import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { navItems, navItems1, INavDataExtended } from './_nav';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  standalone: true,
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    RouterLink,
    IconDirective,
    NgScrollbar,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    DefaultHeaderComponent,
    ShadowOnScrollDirective,
    ContainerComponent,
    RouterOutlet,
    DefaultFooterComponent
  ]
})
export class DefaultLayoutComponent {
  public navItems: INavDataExtended[] = [];
  public navItems1 = navItems1;

  constructor(private router: Router, private authService: AuthService) {
    this.navItems = this.filterNavItemsByRole();
  }

  private filterNavItemsByRole(): INavDataExtended[] {
    const userInfo = this.authService.getDecodedToken();
    const userRoles = userInfo.role ? userInfo.role.split(',') : [];

    return navItems.filter(item => {
      return item.roles?.some(role => role === 'all' || userRoles.includes(role));
    });
  }

  onScrollbarUpdate($event: any) {
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('password')
    this.router.navigate(['/login']);
  }
}
