# 🚀 Quick Start - Globe Wanderer Backend

## Chạy Backend trong 5 phút!

### Bước 1: Cài đặt Dependencies (2 phút)

```bash
cd backend
npm install
```

### Bước 2: Khởi tạo Database (1 phút)

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### Bước 3: Chạy Server (1 phút)

```bash
npm run start:dev
```

### Bước 4: Kiểm tra (1 phút)

Mở trình duyệt:
- API Docs: http://localhost:3000/api/docs
- Test API ngay trên Swagger UI!

## 🔑 Login Credentials

```
Email: admin@globewanderer.com
Password: Admin@123456
```

## 📝 Test API Nhanh

### 1. Login để lấy token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@globewanderer.com",
    "password": "Admin@123456"
  }'
```

Copy `access_token` từ response.

### 2. Test API với token

```bash
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## ✅ Checklist

- [ ] Backend đã chạy tại port 3000
- [ ] Swagger docs mở được
- [ ] Login thành công
- [ ] Có thể gọi API

## 🎯 Endpoints Chính

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/login` | Login admin | ❌ |
| GET | `/api/locations` | Danh sách địa điểm | ❌ |
| GET | `/api/properties` | Danh sách dịch vụ | ❌ |
| POST | `/api/bookings` | Tạo booking (public) | ❌ |
| GET | `/api/bookings` | Quản lý booking | ✅ |
| GET | `/api/dashboard/overview` | Dashboard | ✅ |

## 📊 Sample Data Đã Có Sẵn

Sau khi seed database, bạn có:

✅ 1 Admin user
✅ 2 Locations (Hà Nội, Hạ Long)
✅ 2 Properties (Hotel & Cruise)
✅ 1 Sample booking

## 🔧 Troubleshooting

### Port 3000 đã được sử dụng?

Đổi port trong `.env`:
```env
PORT=3001
```

### Lỗi Prisma?

```bash
npm run prisma:generate
```

### Reset database?

```bash
rm prisma/dev.db
npm run prisma:push
npm run prisma:seed
```

## 📚 Documentation

- `README.md` - Tổng quan project
- `SETUP_GUIDE.md` - Hướng dẫn setup chi tiết
- `API_EXAMPLES.http` - Ví dụ API calls
- `INTEGRATION_GUIDE.md` - Tích hợp frontend
- `DEPLOYMENT.md` - Deploy production

## 🎨 Prisma Studio (Database GUI)

Muốn xem database trực quan?

```bash
npm run prisma:studio
```

Mở: http://localhost:5555

## 🚀 Next Steps

1. ✅ Backend chạy thành công
2. 🔄 Test API trên Swagger
3. 🔄 Tích hợp với Frontend
4. 🔄 Cấu hình Email & Telegram (optional)
5. 🔄 Deploy lên production

---

**Chúc mừng! Backend của bạn đã sẵn sàng! 🎉**

Truy cập http://localhost:3000/api/docs để khám phá tất cả API endpoints.
