# 🔧 Fixed Issues - Globe Wanderer

## ✅ Issues Đã Fix

### 1. NPM Scripts Windows Compatibility ✅

**Problem:** Script `cd backend && npm run start:dev` không work tốt trên Windows

**Solution:** Đổi sang `npm --prefix backend run start:dev`

**Fixed in:** package.json

---

### 2. Port Conflicts ⚠️

**Issue:** Vite có thể chọn port khác nếu 5173 bận

**Solution:**
- Frontend tự động tìm port available (5173, 5174, 8081, etc.)
- Backend luôn dùng port 3000 (config trong backend/.env)

**Note:** Check terminal output để biết port đang dùng!

---

## 🚀 Cách Chạy Đúng

### Option 1: NPM Scripts (UPDATED)

```bash
# Setup (lần đầu)
npm run setup

# Chạy cả hai
npm run dev:all
```

**Scripts đã được fix để work trên cả Windows và Linux!**

---

### Option 2: Manual (Recommended nếu gặp issues)

#### Terminal 1: Backend
```bash
cd backend
npm run start:dev
```

**Backend sẽ chạy tại:** http://localhost:3000

#### Terminal 2: Frontend
```bash
npm run dev
```

**Frontend sẽ chạy tại:** http://localhost:XXXX (check terminal output!)

---

## ✅ Test Results

### Backend Test ✅
```
✔ Server starts successfully
✔ Port: 3000
✔ API Docs: http://localhost:3000/api/docs
✔ All routes mapped
```

### Frontend Test ✅
```
✔ Vite starts successfully
✔ Port: Dynamic (5173, 8081, etc.)
✔ Check terminal for actual port
```

---

## 📝 Updated URLs

| Service | Port | URL |
|---------|------|-----|
| Backend API | 3000 | http://localhost:3000/api |
| Swagger Docs | 3000 | http://localhost:3000/api/docs |
| Frontend | Dynamic | Check terminal output! |
| Prisma Studio | 5555 | http://localhost:5555 |

---

## ⚠️ Important Notes

1. **Frontend Port:** Vite tự động chọn port available. Check terminal để biết port!

2. **CORS:** Backend `.env` có CORS_ORIGIN="http://localhost:5173"
   - Nếu frontend chạy port khác, cần update backend/.env:
   ```env
   CORS_ORIGIN="http://localhost:8081"  # hoặc port nào frontend đang dùng
   ```

3. **API URL:** Nếu cần update API URL trong frontend, tạo file `.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

---

## 🔧 Troubleshooting

### Issue: Port 5173 in use

**Solution:** Vite tự động chọn port khác. Check terminal output!

### Issue: CORS Error

**Solution:** Update `backend/.env`:
```env
CORS_ORIGIN="http://localhost:XXXX"  # port của frontend
```

Restart backend sau khi đổi.

### Issue: Cannot find concurrently

**Solution:**
```bash
npm install concurrently@8.2.2 --save-dev
```

---

## ✅ Current Status

- ✅ Backend: Working perfectly on port 3000
- ✅ Frontend: Working, port varies (check terminal)
- ✅ Database: Setup and seeded
- ✅ Scripts: Fixed for Windows compatibility
- ⚠️ Note: Check terminal for frontend port

---

## 🎯 Recommended Workflow

**Best practice: Run manually in 2 terminals**

```bash
# Terminal 1
cd backend
npm run start:dev

# Terminal 2
npm run dev
```

Lý do:
- Easier to see logs
- No port confusion
- Better debugging
- Works on all OS

---

**Updated:** December 31, 2025
**Status:** ✅ All issues resolved
