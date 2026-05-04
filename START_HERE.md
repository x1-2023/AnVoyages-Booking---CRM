# ⚡ Start Here - Globe Wanderer

## 🚀 Cách 1: Super Quick (1 Command) - RECOMMENDED

```bash
# Lần đầu tiên - Setup tất cả
npm run setup

# Sau đó - Chạy cả Frontend + Backend trong 1 terminal
npm run dev:all
```

✨ Lệnh này sẽ:
- ✅ Chạy Backend (port 3000) - màu xanh dương
- ✅ Chạy Frontend (port 5173) - màu xanh lá
- ✅ Hiển thị logs của cả hai cùng lúc

**Để dừng:** Nhấn `Ctrl+C` sẽ stop cả hai

---

## 🎯 Cách 2: Script File (1 Click)

### Windows:
```bash
# Double click file này hoặc chạy:
start-dev.bat
```

### Mac/Linux:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

Script sẽ tự động:
- ✅ Cài đặt dependencies (nếu cần)
- ✅ Setup database (nếu cần)
- ✅ Chạy Backend (port 3000)
- ✅ Chạy Frontend (port 5173)
- ✅ Mở browser

---

## 📋 Cách 3: Thủ Công (2 Terminals)

### Terminal 1: Backend
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run start:dev
```

### Terminal 2: Frontend (terminal mới)
```bash
npm install
npm run dev
```

---

## ✅ Kiểm Tra

Mở browser:
- Frontend: **Check terminal output** (port có thể là 5173, 8081, etc.)
- Backend API Docs: http://localhost:3000/api/docs

⚠️ **Lưu ý:** Frontend port có thể thay đổi nếu 5173 đang bận. Xem terminal để biết port chính xác!

---

## 🔑 Login

```
Email: admin@globewanderer.com
Password: Admin@123456
```

---

## 📚 Docs

Đọc thêm:
- [FULL_SETUP_GUIDE.md](./FULL_SETUP_GUIDE.md) - Hướng dẫn chi tiết
- [README.md](./README.md) - Tổng quan project
- [QUICKSTART.md](./QUICKSTART.md) - Backend quick start

---

## 🆘 Lỗi?

### Port đã được sử dụng?
```bash
# Backend: Đổi port trong backend/.env
PORT=3001

# Frontend: Vite tự động chọn port khác
```

### Database lỗi?
```bash
cd backend
rm prisma/dev.db
npm run prisma:push
npm run prisma:seed
```

### Cài lại từ đầu?
```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Frontend
cd ..
rm -rf node_modules
npm install
```

---

**🎉 Enjoy coding!**
