import { INavData } from '@coreui/angular';

export interface INavDataExtended extends INavData {
  roles?: string[];
}

export const navItems: INavDataExtended[] = [
  {
    name: 'Thống kê',
    url: '/thong_ke',
    iconComponent: { name: 'cil-speedometer' },
    roles: ['all'],
  },
  {
    name: 'Quản lý hiến máu',
    url: '/quan-ly-hien-mau',
    iconComponent: { name: 'cil-drop' },
    roles: ['all'],
    children:[
      {
        name: 'Danh sách hiến máu',
        url: '/quan-ly-hien-mau/danh-sach-hien-mau',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Đợt hiến máu',
        url: '/quan-ly-hien-mau/dot-hien-mau',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Đơn vị',
        url: '/quan-ly-hien-mau/don-vi',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Tình nguyện viên',
        url: '/quan-ly-hien-mau/tinh-nguyen-vien',
        icon: 'nav-icon-bullet',
      },
    ]
  },
  {
    name: 'Quà tặng',
    url: '/qua-tang',
    iconComponent: { name: 'cil-gift' },
    roles: ['all'],
    children:[
      {
        name: 'Quản lý quà tặng',
        url: '/qua-tang/quan-ly-qua-tang',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Tặng quà',
        url: '/qua-tang/tang-qua',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Lịch sử tặng quà',
        url: '/qua-tang/lich-su-tang-qua',
        icon: 'nav-icon-bullet',
      },
    ]
  },
  {
    name: 'Thông báo',
    url: '/thong-bao',
    iconComponent: { name: 'cil-bell' },
    roles: ['all'],
  },
  {
    name: 'Tài khoản',
    url: '/tai-khoan',
    iconComponent: { name: 'cil-user' },
    roles: ['all'],
    children:[
      {
        name: 'Thông tin cá nhân',
        url: '/tai-khoan/thong-tin-ca-nhan',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Đổi mật khẩu',
        url: '/tai-khoan/doi-mat-khau',
        icon: 'nav-icon-bullet',
        // iconComponent: { name: 'cil-lock-locked' },
      },
      {
        name: 'Tạo quản trị viên',
        url: '/tai-khoan/create-admin',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Đặt lại mật khẩu',
        url: '/tai-khoan/dat-lai-mat-khau',
        icon: 'nav-icon-bullet',
      },
    ]
  },

];
export const navItems1: INavDataExtended[] = [
  {
    name: 'Đăng xuất',
    url: '#',
    iconComponent: { name: 'cil-account-logout' },
    roles: ['all'],
  }
];
