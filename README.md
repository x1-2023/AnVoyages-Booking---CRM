# 🌍 Globe Wanderer - Travel Booking Management System

Full-stack travel booking platform với frontend React và backend NestJS.

## 📖 Tổng quan Project

Globe Wanderer là hệ thống quản lý đặt chỗ du lịch hoàn chỉnh, hỗ trợ quản lý:
- 🏨 Hotels & Homestays
- 🚢 Cruises
- 🗺️ Tours
- 📍 Multiple Locations
- 💰 Revenue Tracking
- 📊 Analytics Dashboard
- 📧 Automated Notifications

## 🏗️ Kiến trúc

```
globe-wanderer/
├── backend/              # NestJS API Server
│   ├── src/             # Source code
│   ├── prisma/          # Database schema & migrations
│   └── ...
├── src/                 # React Frontend
│   ├── components/      # UI Components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities
│   └── ...
└── public/             # Static assets
```

## 🚀 Quick Start

> **✅ TESTED & WORKING!** See [TEST_RESULTS.md](./TEST_RESULTS.md) for full test report.

### Super Quick (1 Command) - RECOMMENDED ⭐

```bash
# First time - Setup everything
npm run setup

# Then - Run both Frontend + Backend
npm run dev:all
```

**That's it!** Opens:
- Frontend: http://localhost:5173
- API Docs: http://localhost:3000/api/docs

📖 More options: [RUN_NOW.md](./RUN_NOW.md) | [START_HERE.md](./START_HERE.md)

---

### Manual Setup

#### Frontend (React + Vite)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Frontend sẽ chạy tại: http://localhost:5173

#### Backend (NestJS + Prisma)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup database
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# Start development server
npm run start:dev
```

Backend sẽ chạy tại: http://localhost:3000

API Documentation (Swagger): http://localhost:3000/api/docs

## 🔑 Default Admin Credentials

```
Email: admin@globewanderer.com
Password: Admin@123456
```

**⚠️ IMPORTANT**: Đổi mật khẩu ngay sau lần đăng nhập đầu tiên!

## 📚 Documentation

### Quick Guides
- [**QUICKSTART.md**](./QUICKSTART.md) - Chạy backend trong 5 phút
- [**INTEGRATION_GUIDE.md**](./INTEGRATION_GUIDE.md) - Tích hợp Frontend với Backend

### Backend Documentation
- [**backend/README.md**](./backend/README.md) - Backend overview
- [**backend/SETUP_GUIDE.md**](./backend/SETUP_GUIDE.md) - Chi tiết setup backend
- [**backend/DEPLOYMENT.md**](./backend/DEPLOYMENT.md) - Hướng dẫn deploy
- [**backend/API_EXAMPLES.http**](./backend/API_EXAMPLES.http) - API testing examples
- [**BACKEND_COMPLETE.md**](./BACKEND_COMPLETE.md) - Tổng kết backend features

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React 18** - UI Library
- 📘 **TypeScript** - Type safety
- ⚡ **Vite** - Build tool
- 🎨 **Tailwind CSS** - Styling
- 🧩 **shadcn/ui** - UI Components
- 🔄 **React Query** - Data fetching
- 🧭 **React Router** - Navigation
- 📊 **Recharts** - Data visualization
- 🌐 **i18next** - Internationalization
- 🎭 **Framer Motion** - Animations

### Backend
- 🚀 **NestJS 10** - Node.js framework
- 🗄️ **Prisma** - ORM
- 💾 **SQLite** - Database (upgradable to PostgreSQL)
- 🔐 **JWT** - Authentication
- 📧 **Nodemailer** - Email service
- 💬 **Telegram Bot API** - Notifications
- 📝 **Swagger** - API documentation
- ✅ **class-validator** - Validation
- 🔒 **bcrypt** - Password hashing
- 🛡️ **Passport** - Auth strategies

## ✨ Features

### Frontend Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/Light theme
- ✅ Multi-language support (EN/VI)
- ✅ Interactive UI components
- ✅ Form validation
- ✅ Loading states & error handling
- ✅ Toast notifications
- ✅ Admin dashboard
- ✅ Booking management interface

### Backend Features (60+ API Endpoints)

#### 🔐 Authentication & Authorization
- JWT-based authentication
- Admin login & profile management
- Password change functionality
- Protected routes with guards

#### 📍 Location Management
- CRUD operations
- SEO-friendly slugs
- Active/Inactive status
- Image & description support

#### 🏨 Property Management
- Support for hotels, homestays, tours, cruises
- Rich media (images, amenities)
- Price management
- Capacity tracking

#### 📋 Booking System
- **Public booking creation** (no auth required)
- **Status workflow**: pending → contacted → confirmed → paid → completed
- Payment tracking (partial & full)
- Customer & admin notes
- Automatic notifications

#### 📊 Dashboard & Analytics
- Overview statistics
- Revenue tracking (completed bookings only)
- Revenue by location & property
- Monthly revenue breakdown
- Top performing properties
- Recent bookings

#### 🔔 Notifications
- **Telegram Bot** integration
- **Email notifications** (HTML templates)
- New booking alerts
- Status update notifications
- Automatic admin notifications

## 🗄️ Database Schema

### Main Entities

**AdminUser**
- Authentication & authorization for admins

**Location**
- Travel destinations with SEO metadata

**Property**
- Hotels, homestays, tours, cruises
- Linked to locations
- Rich media support (images, amenities)

**Booking**
- Customer bookings with journey tracking
- Status management
- Payment tracking

See [backend/prisma/schema.prisma](./backend/prisma/schema.prisma) for full schema.

## 📊 Business Logic

### Booking Workflow

```
1. Customer submits booking → pending
2. Admin contacts customer → contacted
3. Booking confirmed → confirmed
4. Payment received → paid
5. Service completed → completed ✅ (counted in revenue)
```

### Revenue Rules
- ✅ Only `completed` bookings count as revenue
- ❌ `pending` and `cancelled` excluded
- 💰 Support partial payments
- 📈 Detailed analytics by location, property, time

## 🔌 API Integration Example

```typescript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@globewanderer.com',
    password: 'Admin@123456'
  })
});

const { access_token } = await response.json();

// Get bookings
const bookings = await fetch('http://localhost:3000/api/bookings', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});
```

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for complete integration examples.

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### API Testing

1. **Swagger UI**: http://localhost:3000/api/docs
2. **VS Code REST Client**: Use [API_EXAMPLES.http](./backend/API_EXAMPLES.http)
3. **Prisma Studio**: `npm run prisma:studio` (http://localhost:5555)

## 🚀 Deployment

### Frontend Deployment

**Vercel/Netlify:**
```bash
npm run build
# Deploy dist/ folder
```

**Environment Variables:**
```env
VITE_API_URL=https://your-api-domain.com/api
```

### Backend Deployment

See [backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md) for detailed guides:
- VPS (Ubuntu/Debian)
- Railway.app
- Render.com
- Heroku

**Quick Deploy to Railway:**
```bash
cd backend
# Connect to Railway
railway login
railway init
railway up
```

## 🔧 Configuration

### Backend Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:5173"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Telegram (Optional)
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_ADMIN_CHAT_ID="your-chat-id"
```

See [backend/.env.example](./backend/.env.example) for full configuration.

## 📈 Future Extensions

The system is designed to support:
- [ ] Online payment integration (VNPay, Stripe, PayPal)
- [ ] Affiliate tracking system
- [ ] Customer portal
- [ ] Mobile app (React Native)
- [ ] Review & rating system
- [ ] Loyalty program
- [ ] Coupon & discount system
- [ ] Multi-currency support
- [ ] Real-time chat support
- [ ] Advanced analytics & reporting

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support & Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Change PORT in backend/.env
PORT=3001
```

**Database errors:**
```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

**CORS errors:**
```env
# backend/.env
CORS_ORIGIN="http://localhost:5173"
```

### Get Help

1. 📚 Check documentation files
2. 🔍 Search existing issues
3. 💬 Create new issue with details
4. 📧 Contact support

## 📞 Contact

- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: See `/backend` folder for API docs
- **API Docs**: http://localhost:3000/api/docs (when server is running)

---

## 🎯 Project Status

- ✅ Backend API - **100% Complete**
- ✅ Database Schema - **100% Complete**
- ✅ Authentication - **100% Complete**
- ✅ Booking System - **100% Complete**
- ✅ Dashboard Analytics - **100% Complete**
- ✅ Notifications - **100% Complete**
- 🔄 Frontend Integration - **In Progress**
- 🔄 Testing - **In Progress**
- 🔄 Production Deployment - **Pending**

---

**Built with ❤️ for efficient travel booking management**

Start exploring: http://localhost:3000/api/docs 🚀
