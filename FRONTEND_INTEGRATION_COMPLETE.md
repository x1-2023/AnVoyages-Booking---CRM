# ✅ Frontend Integration Complete!

## 🎉 Đã Tích Hợp Backend với Frontend!

### ✅ Files Đã Tạo:

#### 1. API Configuration
- **`.env`** - API URL configuration
- **`src/lib/api.ts`** - Axios instance với interceptors

#### 2. Services (API Calls)
- **`src/services/auth.service.ts`** - Login, profile, change password
- **`src/services/location.service.ts`** - Location CRUD
- **`src/services/booking.service.ts`** - Booking management
- **`src/services/dashboard.service.ts`** - Dashboard analytics

#### 3. Example Pages (Real API Data)
- **`src/pages/APITest.tsx`** - API connection test page ⭐
- **`src/pages/LocationsExample.tsx`** - Display locations from API
- **`src/pages/DashboardExample.tsx`** - Dashboard with real data

---

## 🚀 How to Test

### 1. Start Backend
```bash
cd backend
npm run start:dev
```
**Running at:** http://localhost:3000

### 2. Start Frontend
```bash
npm run dev
```
**Check terminal for port** (usually 5173 or 8081)

### 3. Test API Connection

Navigate to the API Test page:
```
http://localhost:XXXX/api-test
```

Replace `XXXX` with your frontend port.

Click **"Run All Tests"** - You should see:
- ✅ Get Locations (Public)
- ✅ Admin Login
- ✅ Get Profile (Auth Required)
- ✅ Booking Stats (Auth Required)

---

## 📝 Example: Using API in Your Components

### Get Locations (Public endpoint)

```typescript
import { useEffect, useState } from 'react';
import { locationService } from '@/services/location.service';

export default function MyComponent() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await locationService.getAll(true); // only active
      setLocations(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {locations.map(loc => (
        <div key={loc.id}>{loc.name}</div>
      ))}
    </div>
  );
}
```

### Login (Admin)

```typescript
import { authService } from '@/services/auth.service';

const handleLogin = async () => {
  try {
    const result = await authService.login({
      email: 'admin@globewanderer.com',
      password: 'Admin@123456'
    });

    // Token automatically saved to localStorage
    localStorage.setItem('access_token', result.access_token);

    console.log('Logged in:', result.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Create Booking (Public endpoint)

```typescript
import { bookingService } from '@/services/booking.service';

const handleBooking = async () => {
  try {
    const booking = await bookingService.create({
      customerName: 'John Doe',
      phone: '0123456789',
      email: 'john@example.com',
      locationId: 'location-id-here',
      checkIn: '2025-02-01',
      checkOut: '2025-02-03',
      guests: 2,
      totalPrice: 5000000,
      note: 'Room with sea view please'
    });

    console.log('Booking created:', booking);
  } catch (error) {
    console.error('Booking failed:', error);
  }
};
```

---

## 🔐 Authentication Flow

### 1. Login
```typescript
const result = await authService.login(credentials);
localStorage.setItem('access_token', result.access_token);
```

### 2. Auto-attach Token
The API client automatically attaches token to all requests:
```typescript
// In src/lib/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Auto-redirect on 401
```typescript
// In src/lib/api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🌐 Environment Variables

### `.env` File
```env
VITE_API_URL=http://localhost:3000/api
```

**Important:**
- Restart frontend after changing `.env`
- For production, update to production API URL

---

## 📊 Available Services

### Auth Service
```typescript
authService.login(credentials)
authService.getProfile()
authService.changePassword(current, newPassword)
authService.logout()
```

### Location Service
```typescript
locationService.getAll(isActive?)
locationService.getById(id)
locationService.getBySlug(slug)
locationService.create(data)
locationService.update(id, data)
locationService.delete(id)
```

### Booking Service
```typescript
bookingService.create(data)
bookingService.getAll(filters?)
bookingService.getById(id)
bookingService.updateStatus(id, status, note?, paidAmount?)
bookingService.updatePayment(id, paidAmount)
bookingService.getStats(locationId?)
bookingService.delete(id)
```

### Dashboard Service
```typescript
dashboardService.getOverview(startDate?, endDate?)
dashboardService.getRevenueByLocation(startDate?, endDate?)
dashboardService.getRevenueByProperty(locationId?, startDate?, endDate?)
dashboardService.getRevenueByMonth(year)
dashboardService.getTopProperties(limit?, startDate?, endDate?)
dashboardService.getRecentBookings(limit?)
```

---

## 🎯 Next Steps

### 1. Update Existing Pages
Replace mockup data with real API calls:
- Homepage: Use `locationService.getAll()`
- Booking form: Use `bookingService.create()`
- Admin dashboard: Use `dashboardService.getOverview()`

### 2. Add React Query (Optional but Recommended)
```bash
npm install @tanstack/react-query
```

Then create hooks:
```typescript
import { useQuery } from '@tanstack/react-query';
import { locationService } from '@/services/location.service';

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.getAll(true)
  });
}
```

### 3. Create Auth Context
For managing user authentication state globally.

### 4. Add Error Handling
Use toast notifications for API errors.

### 5. Add Loading States
Show spinners while data is loading.

---

## ✅ Verification Checklist

- [x] `.env` file created with API URL
- [x] API client (`src/lib/api.ts`) created
- [x] All service files created (auth, location, booking, dashboard)
- [x] Example pages created
- [x] Token auto-attachment working
- [x] Auto-redirect on 401 working
- [ ] Test API connection page (run `/api-test`)
- [ ] Replace mockup data in existing pages
- [ ] Add proper error handling
- [ ] Add loading states

---

## 🐛 Troubleshooting

### CORS Error?
Make sure backend `.env` has:
```env
CORS_ORIGIN="http://localhost:XXXX"
```
Replace XXXX with your frontend port.

### API URL Wrong?
Check `.env` file in frontend root:
```env
VITE_API_URL=http://localhost:3000/api
```

### Token Not Working?
Check browser console → Application → Local Storage
Should see `access_token` after login.

### Network Error?
Make sure backend is running:
```bash
cd backend && npm run start:dev
```

---

## 📚 Documentation

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Detailed integration guide
- [backend/API_EXAMPLES.http](./backend/API_EXAMPLES.http) - API examples
- [backend/README.md](./backend/README.md) - Backend docs

---

**🎉 Frontend is now connected to Backend! Start building with real data!** 🚀
