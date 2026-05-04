# Setup Guide - Globe Wanderer Backend

Hướng dẫn thiết lập và chạy backend cho hệ thống Globe Wanderer.

## Bước 1: Cài đặt Dependencies

```bash
cd backend
npm install
```

## Bước 2: Cấu hình Environment

File `.env` đã được tạo sẵn với các cấu hình mặc định. Bạn cần cập nhật các thông tin sau:

### Email Notifications (Tùy chọn)

Nếu muốn gửi email tự động cho khách hàng:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

**Lưu ý cho Gmail:**
- Bạn cần tạo App Password thay vì dùng password thường
- Truy cập: Google Account → Security → 2-Step Verification → App passwords
- Tạo app password và dán vào `SMTP_PASS`

### Telegram Notifications (Tùy chọn)

Nếu muốn nhận thông báo qua Telegram:

1. Tạo bot mới với @BotFather trên Telegram
2. Lấy token của bot
3. Lấy Chat ID của bạn (dùng @userinfobot)
4. Cập nhật vào `.env`:

```env
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_ADMIN_CHAT_ID="your-chat-id"
```

## Bước 3: Khởi tạo Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Tạo database và tables
npm run prisma:push

# Seed dữ liệu mẫu (admin user, locations, properties)
npm run prisma:seed
```

## Bước 4: Chạy Backend

### Development Mode (với hot reload)
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

Server sẽ chạy tại:
- API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/api/docs

## Bước 5: Login vào Admin

Sau khi seed database, bạn có tài khoản admin mặc định:

- **Email**: admin@globewanderer.com
- **Password**: Admin@123456

**QUAN TRỌNG**: Đổi mật khẩu ngay sau lần đăng nhập đầu tiên!

## Bước 6: Test API

### 1. Login để lấy token

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@globewanderer.com",
  "password": "Admin@123456"
}
```

Response sẽ trả về `access_token`.

### 2. Sử dụng token trong các request khác

```bash
GET http://localhost:3000/api/bookings
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Bước 7: Kiểm tra Swagger Documentation

Truy cập http://localhost:3000/api/docs để xem và test tất cả API endpoints.

## Các Tools Hữu Ích

### Prisma Studio (Database GUI)

```bash
npm run prisma:studio
```

Mở giao diện web để xem và chỉnh sửa database trực tiếp tại http://localhost:5555

### Reset Database

Nếu muốn reset database về trạng thái ban đầu:

```bash
# Xóa database
rm prisma/dev.db

# Tạo lại database
npm run prisma:push

# Seed lại dữ liệu
npm run prisma:seed
```

## Kết nối với Frontend

Sau khi backend chạy thành công, cập nhật API URL trong frontend:

1. Tạo file `.env` trong thư mục frontend (nếu chưa có)
2. Thêm:
```env
VITE_API_URL=http://localhost:3000/api
```

3. Trong frontend code, sử dụng:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

## Troubleshooting

### Lỗi "Port 3000 already in use"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

Hoặc đổi port trong `.env`:
```env
PORT=3001
```

### Lỗi Prisma Client

```bash
npm run prisma:generate
```

### Email không gửi được

- Kiểm tra SMTP credentials
- Với Gmail, đảm bảo đã bật App Password
- Kiểm tra logs để xem chi tiết lỗi

### Telegram không hoạt động

- Kiểm tra bot token có đúng không
- Đảm bảo đã chat với bot trước (gửi /start)
- Kiểm tra chat ID có đúng không

## Cấu trúc API Response

### Success Response
```json
{
  "id": "uuid",
  "name": "Location Name",
  ...
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

## Best Practices

1. **Luôn sử dụng HTTPS trong production**
2. **Đổi JWT_SECRET trong production**
3. **Đổi password admin mặc định**
4. **Backup database thường xuyên**
5. **Monitor logs để phát hiện lỗi**
6. **Rate limiting cho public endpoints**
7. **Validation cho tất cả input**

## Next Steps

1. Tích hợp payment gateway (VNPay, Stripe, etc.)
2. Thêm role-based access control (RBAC)
3. Implement caching (Redis)
4. Add request rate limiting
5. Setup monitoring và logging
6. Deploy lên production server

## Support

Nếu gặp vấn đề, kiểm tra:
1. Logs của server
2. Prisma Studio để xem database
3. Swagger docs để test API
4. GitHub Issues
