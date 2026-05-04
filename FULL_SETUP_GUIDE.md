# 🚀 Hướng Dẫn Chạy Full-Stack Globe Wanderer

Hướng dẫn đầy đủ để chạy cả Frontend và Backend cùng lúc.

## 📋 Yêu Cầu Hệ Thống

- ✅ Node.js 18.x hoặc cao hơn
- ✅ npm hoặc yarn
- ✅ Git (nếu clone từ repository)

Kiểm tra version:
```bash
node --version  # v18.x hoặc cao hơn
npm --version   # 9.x hoặc cao hơn
```

## 🎯 Quick Start - Chạy Trong 10 Phút

### Option 1: Chạy Tuần Tự (Recommended cho lần đầu)

#### Bước 1: Setup và Chạy Backend (5 phút)

```bash
# Mở Terminal 1
cd backend

# Cài đặt dependencies
npm install

# Khởi tạo database
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# Chạy backend
npm run start:dev
```

✅ Backend đang chạy tại: **http://localhost:3000**
✅ API Docs: **http://localhost:3000/api/docs**

**Giữ nguyên terminal này!**

#### Bước 2: Setup và Chạy Frontend (5 phút)

```bash
# Mở Terminal 2 MỚI (giữ Terminal 1 chạy backend)
# Quay về thư mục gốc
cd ..

# Cài đặt dependencies (nếu chưa cài)
npm install

# Chạy frontend
npm run dev
```

✅ Frontend đang chạy tại: **http://localhost:5173**

**Bây giờ bạn có 2 terminal đang chạy:**
- Terminal 1: Backend (port 3000)
- Terminal 2: Frontend (port 5173)

### Option 2: Chạy Song Song (Nhanh hơn)

```bash
# Terminal 1: Backend
cd backend && npm install && npm run prisma:generate && npm run prisma:push && npm run prisma:seed && npm run start:dev

# Terminal 2: Frontend (terminal mới)
npm install && npm run dev
```

## 📦 Chi Tiết Từng Bước

### PHẦN 1: BACKEND SETUP

#### 1.1. Cài Đặt Backend Dependencies

```bash
cd backend
npm install
```

**Thời gian:** ~2-3 phút (tùy tốc độ internet)

#### 1.2. Cấu Hình Environment

File `.env` đã có sẵn với cấu hình mặc định. Bạn có thể giữ nguyên hoặc tùy chỉnh:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="globe-wanderer-super-secret-jwt-key-2025"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# CORS - Cho phép frontend kết nối
CORS_ORIGIN="http://localhost:5173"

# Email & Telegram (Optional - có thể bỏ qua lần đầu)
SMTP_HOST=""
SMTP_USER=""
SMTP_PASS=""
TELEGRAM_BOT_TOKEN=""
TELEGRAM_ADMIN_CHAT_ID=""
```

#### 1.3. Khởi Tạo Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Tạo database và tables
npm run prisma:push

# Thêm dữ liệu mẫu (admin user, locations, properties)
npm run prisma:seed
```

**Kết quả mong đợi:**
```
✔ Generated Prisma Client
✔ Database pushed
✔ Seed completed successfully!
```

Dữ liệu mẫu đã được thêm:
- ✅ 1 Admin user
- ✅ 2 Locations (Hà Nội, Hạ Long)
- ✅ 2 Properties (Khách sạn, Du thuyền)
- ✅ 1 Sample booking

#### 1.4. Chạy Backend Server

```bash
npm run start:dev
```

**Kết quả mong đợi:**
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [RoutesResolver] Mapped {/api/auth/login, POST} route

🚀 Server is running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/api/docs
```

#### 1.5. Kiểm Tra Backend

Mở trình duyệt và truy cập:

1. **API Docs (Swagger UI):** http://localhost:3000/api/docs
   - Xem tất cả API endpoints
   - Test API trực tiếp

2. **Health Check:** http://localhost:3000/api/locations
   - Nếu thấy danh sách locations → Backend OK! ✅

### PHẦN 2: FRONTEND SETUP

#### 2.1. Mở Terminal Mới

**QUAN TRỌNG:** Giữ nguyên terminal backend đang chạy, mở terminal MỚI!

```bash
# Từ thư mục gốc project (không phải trong /backend)
# Nếu đang ở /backend, quay lại:
cd ..
```

#### 2.2. Cài Đặt Frontend Dependencies

```bash
npm install
```

**Thời gian:** ~2-3 phút

#### 2.3. Cấu Hình Frontend Environment (Optional)

Tạo file `.env` trong thư mục gốc (nếu muốn custom):

```env
VITE_API_URL=http://localhost:3000/api
```

**Lưu ý:** Frontend đã được cấu hình sẵn để kết nối với backend tại localhost:3000, nên bước này có thể bỏ qua.

#### 2.4. Chạy Frontend Server

```bash
npm run dev
```

**Kết quả mong đợi:**
```
VITE v5.4.19  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

#### 2.5. Kiểm Tra Frontend

Mở trình duyệt và truy cập: **http://localhost:5173**

Bạn sẽ thấy trang web Globe Wanderer! 🎉

## ✅ Xác Nhận Hệ Thống Hoạt Động

### Checklist Hoàn Chỉnh

- [ ] Backend chạy tại http://localhost:3000
- [ ] Frontend chạy tại http://localhost:5173
- [ ] Swagger docs mở được: http://localhost:3000/api/docs
- [ ] Website frontend hiển thị bình thường
- [ ] Không có lỗi CORS trong console
- [ ] 2 terminals đang chạy song song

### Test Kết Nối Frontend - Backend

#### Test 1: API Locations (Public)

1. Mở http://localhost:5173
2. Mở Browser DevTools (F12) → Network tab
3. Reload trang
4. Tìm request đến `/api/locations`
5. Check status: **200 OK** ✅

#### Test 2: Admin Login

1. Truy cập trang admin login (nếu có trong frontend)
2. Hoặc test trực tiếp trên Swagger: http://localhost:3000/api/docs
3. Login với credentials:
   ```
   Email: admin@globewanderer.com
   Password: Admin@123456
   ```
4. Nhận được `access_token` ✅

## 🎨 Cấu Trúc Terminals

Sau khi setup xong, bạn sẽ có:

```
┌─────────────────────────────────────────┐
│  Terminal 1: Backend (Port 3000)        │
│  $ cd backend                           │
│  $ npm run start:dev                    │
│  [Nest] Server is running...           │
│  ✅ Giữ terminal này mở                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Terminal 2: Frontend (Port 5173)       │
│  $ npm run dev                          │
│  VITE ready in XXX ms                   │
│  ✅ Giữ terminal này mở                  │
└─────────────────────────────────────────┘
```

## 🔧 Các Lệnh Hữu Ích

### Backend Commands

```bash
# Development
npm run start:dev      # Chạy với hot reload

# Database
npm run prisma:studio  # Mở database GUI (port 5555)
npm run prisma:push    # Push schema changes
npm run prisma:seed    # Seed lại data

# Build & Production
npm run build          # Build
npm run start:prod     # Chạy production
```

### Frontend Commands

```bash
# Development
npm run dev            # Chạy dev server

# Build
npm run build          # Build production
npm run preview        # Preview build

# Linting
npm run lint           # Check code quality
```

## 🐛 Troubleshooting

### Lỗi: Port 3000 đã được sử dụng

**Backend:**
```bash
# Thay đổi port trong backend/.env
PORT=3001
```

**Frontend:** Cập nhật API URL nếu đổi port backend
```env
VITE_API_URL=http://localhost:3001/api
```

### Lỗi: Port 5173 đã được sử dụng

```bash
# Vite tự động tìm port khác (5174, 5175...)
# Hoặc kill process đang dùng port:

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

### Lỗi: CORS Error

Kiểm tra `backend/.env`:
```env
CORS_ORIGIN="http://localhost:5173"
```

Nếu frontend chạy ở port khác, update CORS_ORIGIN.

### Lỗi: Cannot connect to backend

1. **Check backend đang chạy:**
   ```bash
   curl http://localhost:3000/api/locations
   ```

2. **Check .env frontend:**
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Restart cả 2 servers**

### Lỗi: Database locked

```bash
cd backend
rm prisma/dev.db
npm run prisma:push
npm run prisma:seed
```

### Lỗi: Prisma Client không tìm thấy

```bash
cd backend
npm run prisma:generate
```

### Lỗi: Module not found

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ..
rm -rf node_modules package-lock.json
npm install
```

## 🔄 Restart Toàn Bộ Hệ Thống

### Quick Restart

```bash
# Terminal 1 (Backend)
Ctrl+C  # Stop server
npm run start:dev

# Terminal 2 (Frontend)
Ctrl+C  # Stop server
npm run dev
```

### Full Restart (Nếu có vấn đề)

```bash
# Terminal 1: Backend
Ctrl+C
cd backend
rm -rf node_modules
npm install
npm run prisma:generate
npm run start:dev

# Terminal 2: Frontend
Ctrl+C
rm -rf node_modules
npm install
npm run dev
```

## 📊 Monitoring

### Backend Logs

Terminal backend sẽ hiển thị:
- ✅ Request logs (GET, POST, etc.)
- ✅ Database queries
- ❌ Errors (nếu có)

### Frontend Logs

Terminal frontend sẽ hiển thị:
- ✅ File changes (hot reload)
- ✅ Build warnings
- ❌ Errors (nếu có)

### Browser Console

F12 → Console tab:
- ✅ API calls
- ✅ React warnings
- ❌ JavaScript errors

## 🎯 Workflow Phát Triển

### 1. Start Development

```bash
# Mỗi sáng/mỗi lần code:

# Terminal 1
cd backend && npm run start:dev

# Terminal 2
npm run dev
```

### 2. Coding

- Edit code trong IDE
- Backend/Frontend tự động reload
- Test trên browser

### 3. Database Changes

```bash
# Terminal 3 (riêng)
cd backend

# 1. Edit schema.prisma
# 2. Push changes
npm run prisma:push

# 3. Restart backend (Terminal 1)
Ctrl+C
npm run start:dev
```

### 4. End of Day

```bash
# Stop servers
Ctrl+C (cả 2 terminals)

# Commit code
git add .
git commit -m "Your message"
git push
```

## 🌐 URLs Tóm Tắt

| Service | URL | Mô tả |
|---------|-----|-------|
| Frontend | http://localhost:5173 | Website chính |
| Backend API | http://localhost:3000/api | API base URL |
| Swagger Docs | http://localhost:3000/api/docs | API documentation |
| Prisma Studio | http://localhost:5555 | Database GUI |

## 🔑 Login Credentials

```
Admin Account:
Email: admin@globewanderer.com
Password: Admin@123456

⚠️ Đổi password sau lần login đầu!
```

## 📚 Next Steps

Sau khi hệ thống chạy thành công:

1. ✅ Test API trên Swagger
2. ✅ Khám phá frontend UI
3. ✅ Test tạo booking
4. ✅ Test admin dashboard
5. 🔄 Tích hợp frontend với API
6. 🔄 Thêm features mới
7. 🔄 Deploy lên production

## 🎉 Hoàn Thành!

Nếu cả frontend và backend đều chạy thành công:

```
✅ Backend: http://localhost:3000
✅ Frontend: http://localhost:5173
✅ API Docs: http://localhost:3000/api/docs

🎊 Chúc mừng! Full-stack app đã sẵn sàng! 🎊
```

---

**Cần trợ giúp?**
- 📚 Xem [README.md](./README.md)
- 📝 Check [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- 🔧 Backend docs: [backend/SETUP_GUIDE.md](./backend/SETUP_GUIDE.md)
