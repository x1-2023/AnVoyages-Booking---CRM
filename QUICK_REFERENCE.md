# ⚡ Quick Reference - Globe Wanderer

## 🚀 Start Commands

```bash
# Backend only
cd backend && npm run start:dev

# Frontend only
npm run dev

# Both (if concurrently works)
npm run dev:all
```

---

## 🌐 URLs

| Service | URL | Notes |
|---------|-----|-------|
| **Backend API** | http://localhost:3000/api | Always port 3000 |
| **Swagger Docs** | http://localhost:3000/api/docs | Test API here |
| **Frontend** | http://localhost:XXXX | **Check terminal!** |
| **Prisma Studio** | http://localhost:5555 | Run: `npm run backend:prisma:studio` |

⚠️ **Frontend port varies!** Check terminal output.

---

## 🔑 Login

```
Email: admin@globewanderer.com
Password: Admin@123456
```

---

## 📋 Quick Checks

### Is Backend Running?

```bash
curl http://localhost:3000/api/locations
```

Should return JSON data ✅

### Is Database OK?

```bash
cd backend
npm run prisma:studio
```

Opens GUI at http://localhost:5555

---

## 🔧 Common Commands

```bash
# View database
npm run backend:prisma:studio

# Rebuild backend
cd backend && npm run build

# Reset database
cd backend
rm prisma/dev.db
npm run prisma:push
npm run prisma:seed

# Reinstall all
npm install && cd backend && npm install
```

---

## 🐛 Quick Fixes

### CORS Error?
Edit `backend/.env`:
```env
CORS_ORIGIN="http://localhost:XXXX"  # frontend port
```

### Port in use?
Vite auto-selects new port. Just use that!

### Module not found?
```bash
npm install
cd backend && npm install
```

---

## 📊 Check Status

```bash
# Backend health
curl http://localhost:3000/api/locations

# Frontend (check browser)
# Open http://localhost:XXXX (from terminal)

# Database
cd backend && npm run prisma:studio
```

---

## 🎯 Recommended Setup

**2 Terminals:**

```
Terminal 1: cd backend && npm run start:dev
Terminal 2: npm run dev
```

**Why?**
- ✅ Clear logs
- ✅ Easy to restart
- ✅ No port confusion
- ✅ Works everywhere

---

## 📚 Full Docs

- [START_HERE.md](./START_HERE.md) - Getting started
- [FIXED_ISSUES.md](./FIXED_ISSUES.md) - Known issues & fixes
- [TEST_RESULTS.md](./TEST_RESULTS.md) - Test report

---

**🎉 Everything tested and working!**
