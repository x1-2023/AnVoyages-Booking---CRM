# 🚀 How to Run - Globe Wanderer Full Stack

## 📝 TL;DR - Chạy Nhanh Nhất

```bash
# Bước 1: Setup (chỉ lần đầu)
npm run setup

# Bước 2: Chạy app
npm run dev:all

# Mở browser: http://localhost:5173
```

**Xong!** 🎉

---

## 📚 Chi Tiết 3 Cách Chạy

### 🌟 Cách 1: NPM Scripts (RECOMMENDED)

#### Lần Đầu Tiên:
```bash
# Clone hoặc download project
git clone <repository-url>
cd globe-wanderer

# Setup tất cả (frontend + backend + database)
npm run setup
```

Lệnh `npm run setup` sẽ:
1. Cài dependencies cho frontend
2. Cài dependencies cho backend
3. Generate Prisma client
4. Tạo database
5. Seed data mẫu

#### Mỗi Lần Chạy:
```bash
# Chạy cả Frontend và Backend
npm run dev:all
```

**Output sẽ như thế này:**
```
[backend] [Nest] Server is running on http://localhost:3000
[frontend] VITE ready in 1234 ms
[frontend] Local: http://localhost:5173
```

**Để dừng:** `Ctrl+C` trong terminal

#### Các Lệnh Khác:
```bash
# Chỉ chạy frontend
npm run dev

# Chỉ chạy backend
npm run dev:backend

# Build cả hai
npm run build:all

# Mở Prisma Studio (Database GUI)
npm run backend:prisma:studio
```

---

### 🎯 Cách 2: Script Files

#### Windows:
```bash
# Double-click hoặc run:
start-dev.bat
```

#### Mac/Linux:
```bash
# Lần đầu, cấp quyền execute:
chmod +x start-dev.sh

# Chạy:
./start-dev.sh
```

**Script tự động:**
- ✅ Check Node.js installed
- ✅ Install dependencies (nếu cần)
- ✅ Setup database (nếu cần)
- ✅ Start backend server
- ✅ Start frontend server
- ✅ Open browser

**Để dừng:** `Ctrl+C` trong mỗi cửa sổ terminal

---

### 📋 Cách 3: Manual (2 Terminals Riêng)

#### Terminal 1: Backend

```bash
# Navigate to backend
cd backend

# Install (lần đầu)
npm install

# Setup database (lần đầu)
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# Start server
npm run start:dev
```

**Backend chạy tại:** http://localhost:3000
**API Docs:** http://localhost:3000/api/docs

#### Terminal 2: Frontend

```bash
# Ở thư mục gốc (không phải /backend)
# Mở terminal MỚI

# Install (lần đầu)
npm install

# Start server
npm run dev
```

**Frontend chạy tại:** http://localhost:5173

---

## ✅ Kiểm Tra Hệ Thống

### 1. Check URLs

Mở browser và test các URL sau:

| URL | Expected | Status |
|-----|----------|--------|
| http://localhost:5173 | Frontend website | ✅ |
| http://localhost:3000/api/docs | Swagger API docs | ✅ |
| http://localhost:3000/api/locations | JSON data | ✅ |

### 2. Check Console

**Backend Terminal:** Không có error, thấy logs như:
```
[Nest] Server is running on: http://localhost:3000
```

**Frontend Terminal:** Không có error, thấy:
```
VITE ready in XXX ms
Local: http://localhost:5173
```

**Browser Console (F12):** Không có CORS errors

### 3. Test Login

1. Navigate to admin login page
2. Use credentials:
   ```
   Email: admin@globewanderer.com
   Password: Admin@123456
   ```
3. Should login successfully ✅

---

## 🔧 Troubleshooting

### Port Already in Use

#### Backend (Port 3000):
```bash
# Edit backend/.env
PORT=3001

# Update frontend API URL if needed
VITE_API_URL=http://localhost:3001/api
```

#### Frontend (Port 5173):
Vite tự động chọn port khác (5174, 5175...)

### CORS Error

Check `backend/.env`:
```env
CORS_ORIGIN="http://localhost:5173"
```

Nếu frontend chạy port khác, update CORS_ORIGIN.

### Database Error

```bash
cd backend
rm prisma/dev.db
npm run prisma:push
npm run prisma:seed
```

### Dependencies Error

```bash
# Reinstall backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Reinstall frontend
cd ..
rm -rf node_modules package-lock.json
npm install
```

### Cannot Find Module

```bash
# Backend
cd backend
npm run prisma:generate

# Frontend
cd ..
npm install
```

### Script Permission Denied (Mac/Linux)

```bash
chmod +x start-dev.sh
```

---

## 🎨 Development Workflow

### Daily Workflow

```bash
# 1. Start servers
npm run dev:all

# 2. Code trong IDE
# - Edit files
# - Auto reload

# 3. Test trong browser
# - Frontend: http://localhost:5173
# - API: http://localhost:3000/api/docs

# 4. Commit changes
git add .
git commit -m "Your message"
git push

# 5. Stop servers
Ctrl+C
```

### Database Changes

```bash
# 1. Edit backend/prisma/schema.prisma

# 2. Push changes
cd backend
npm run prisma:push

# 3. Restart backend (trong Terminal 1)
Ctrl+C
npm run start:dev
```

### View Database

```bash
# Option 1: Prisma Studio
npm run backend:prisma:studio
# Opens http://localhost:5555

# Option 2: SQLite browser tool
# Use any SQLite GUI to open backend/prisma/dev.db
```

---

## 📊 Ports Summary

| Service | Port | URL |
|---------|------|-----|
| Frontend Dev Server | 5173 | http://localhost:5173 |
| Backend API Server | 3000 | http://localhost:3000/api |
| Swagger UI | 3000 | http://localhost:3000/api/docs |
| Prisma Studio | 5555 | http://localhost:5555 |

---

## 🔑 Default Credentials

```
Admin Login:
Email: admin@globewanderer.com
Password: Admin@123456
```

**⚠️ SECURITY:** Đổi password ngay sau lần login đầu tiên!

---

## 📦 Sample Data

Sau khi seed, database có:

- ✅ **1 Admin User**
  - Email: admin@globewanderer.com

- ✅ **2 Locations**
  - Hà Nội
  - Hạ Long

- ✅ **2 Properties**
  - Khách sạn Sofitel (Hà Nội)
  - Du thuyền Paradise (Hạ Long)

- ✅ **1 Sample Booking**
  - Status: pending
  - Customer: Nguyễn Văn A

---

## 🚦 Production Build

```bash
# Build cả frontend và backend
npm run build:all

# Hoặc riêng lẻ:
npm run build              # Frontend only
cd backend && npm run build # Backend only
```

**Output:**
- Frontend: `dist/` folder
- Backend: `backend/dist/` folder

---

## 📚 Documentation Links

- [START_HERE.md](./START_HERE.md) - Quick start guide
- [FULL_SETUP_GUIDE.md](./FULL_SETUP_GUIDE.md) - Detailed setup guide
- [README.md](./README.md) - Project overview
- [backend/README.md](./backend/README.md) - Backend docs
- [backend/SETUP_GUIDE.md](./backend/SETUP_GUIDE.md) - Backend setup
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Frontend-Backend integration

---

## 🎯 Quick Command Reference

```bash
# Setup (first time only)
npm run setup

# Development
npm run dev:all              # Run both frontend + backend
npm run dev                  # Frontend only
npm run dev:backend          # Backend only

# Database
npm run backend:prisma:studio   # Open database GUI

# Build
npm run build:all            # Build both
npm run build                # Build frontend

# Utilities
cd backend && npm run prisma:push  # Update database schema
cd backend && npm run prisma:seed  # Reseed database
```

---

## ✨ Tips

1. **Use `npm run dev:all`** - Tiện nhất, 1 terminal
2. **Check API Docs** - http://localhost:3000/api/docs
3. **Use Prisma Studio** - View/Edit database visually
4. **Check Console** - F12 để debug
5. **Read Logs** - Terminal output rất hữu ích

---

**Happy Coding! 🚀**

Nếu gặp vấn đề, check [FULL_SETUP_GUIDE.md](./FULL_SETUP_GUIDE.md) để biết chi tiết hơn!
