# hoichuthapdo_web

## 📌 Giới thiệu

**hoichuthapdo_web** là một hệ thống web hỗ trợ Hội Chữ thập đỏ trong việc **quản lý và kết nối với tình nguyện viên** dễ dàng hơn. Hệ thống giúp tổ chức theo dõi hoạt động hiến máu, thông tin cá nhân, và tăng cường tương tác với cộng đồng tình nguyện viên.

## 🚀 Tính năng chính

- ✅ Xem thống kê hiến máu
- ✅ Quản lý thông tin tình nguyện viên  
- ✅ Quản lý đợt hiến máu, lịch sử hiến máu  
- ✅ Gửi thông báo đến người dùng (tích hợp OneSignal)  
- ✅ Quản lý đơn vị, quà tặng, tài khoản  
- ✅ Giao diện thân thiện, dễ sử dụng trên Angular  

## 🛠️ Công nghệ sử dụng

| Thành phần       | Công nghệ                  |
|------------------|----------------------------|
| Frontend         | Angular                    |
| Ngôn ngữ         | TypeScript, HTML, SCSS     |
| Quản lý gói      | npm                        |
| Thư viện phụ trợ | Bootstrap, OneSignal       |

## ⚙️ Cài đặt và chạy dự án

### 1. Clone dự án

```bash
git clone https://github.com/khue155k/hoichuthapdo_web.git
cd hoichuthapdo_web
```

### 2. Cài đặt các gói phụ thuộc

```bash
npm install
```

### 3. Cấu hình OneSignal (nếu cần)

Mở file `src/environments/environment.ts` và cập nhật `oneSignalAppId`:

```ts
export const environment = {
  production: false,
  oneSignalAppId: 'YOUR_ONESIGNAL_APP_ID'
};
```

### 4. Khởi chạy dự án

```bash
ng serve
```

Sau đó mở trình duyệt và truy cập:

```
http://localhost:4200
```

## 📄 Ghi chú

- Đảm bảo bạn đã cài đặt Angular CLI trước đó:

```bash
npm install -g @angular/cli
```

