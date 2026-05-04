# Integration Guide - Frontend & Backend

Hướng dẫn tích hợp Frontend React với Backend NestJS cho Globe Wanderer.

## Tổng quan Kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Browser                       │
│                    (React + TypeScript)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP/HTTPS + JWT
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     Backend API Server                       │
│                    (NestJS + Prisma)                         │
│  ┌────────────┬────────────┬────────────┬────────────┐     │
│  │   Auth     │  Locations │ Properties │  Bookings  │     │
│  └────────────┴────────────┴────────────┴────────────┘     │
│  ┌────────────┬────────────────────────────────────┐       │
│  │ Dashboard  │        Notifications               │       │
│  └────────────┴────────────────────────────────────┘       │
└──────────────────────────┬──────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
    ┌───────▼────┐  ┌─────▼─────┐  ┌────▼────┐
    │   SQLite   │  │  Telegram │  │  Email  │
    │  Database  │  │    Bot    │  │  SMTP   │
    └────────────┘  └───────────┘  └─────────┘
```

## Bước 1: Setup Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run start:dev
```

Backend sẽ chạy tại: `http://localhost:3000`

## Bước 2: Setup Frontend API Integration

### 2.1 Cấu hình Environment

Tạo file `.env` trong thư mục root (frontend):

```env
VITE_API_URL=http://localhost:3000/api
```

### 2.2 Tạo API Client

Tạo file `src/lib/api.ts`:

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
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

### 2.3 Tạo API Services

Tạo file `src/services/auth.service.ts`:

```typescript
import { api } from '@/lib/api';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authService = {
  async login(data: LoginDto): Promise<LoginResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    window.location.href = '/admin/login';
  },
};
```

Tạo file `src/services/booking.service.ts`:

```typescript
import { api } from '@/lib/api';

export interface CreateBookingDto {
  customerName: string;
  phone: string;
  email?: string;
  locationId: string;
  propertyId?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  note?: string;
}

export const bookingService = {
  async create(data: CreateBookingDto) {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  async getAll(params?: {
    status?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async updateStatus(id: string, status: string, adminNote?: string) {
    const response = await api.patch(`/bookings/${id}/status`, {
      status,
      adminNote,
    });
    return response.data;
  },

  async updatePayment(id: string, paidAmount: number) {
    const response = await api.patch(`/bookings/${id}/payment`, {
      paidAmount,
    });
    return response.data;
  },

  async getStats(locationId?: string) {
    const response = await api.get('/bookings/stats', {
      params: { locationId },
    });
    return response.data;
  },
};
```

Tạo file `src/services/location.service.ts`:

```typescript
import { api } from '@/lib/api';

export const locationService = {
  async getAll(isActive?: boolean) {
    const response = await api.get('/locations', {
      params: { isActive },
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await api.get(`/locations/slug/${slug}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/locations', data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.patch(`/locations/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  },
};
```

Tạo file `src/services/dashboard.service.ts`:

```typescript
import { api } from '@/lib/api';

export const dashboardService = {
  async getOverview(startDate?: string, endDate?: string) {
    const response = await api.get('/dashboard/overview', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getRevenueByLocation(startDate?: string, endDate?: string) {
    const response = await api.get('/dashboard/revenue/by-location', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getRevenueByMonth(year: number) {
    const response = await api.get('/dashboard/revenue/by-month', {
      params: { year },
    });
    return response.data;
  },

  async getTopProperties(limit = 10) {
    const response = await api.get('/dashboard/top-properties', {
      params: { limit },
    });
    return response.data;
  },

  async getRecentBookings(limit = 10) {
    const response = await api.get('/dashboard/recent-bookings', {
      params: { limit },
    });
    return response.data;
  },
};
```

## Bước 3: Implement React Query (Recommended)

### 3.1 Install React Query

```bash
npm install @tanstack/react-query
```

### 3.2 Setup Query Client

Update `src/main.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

### 3.3 Create Custom Hooks

Tạo file `src/hooks/useBookings.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';

export function useBookings(params?: any) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingService.getAll(params),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, adminNote }: any) =>
      bookingService.updateStatus(id, status, adminNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
```

## Bước 4: Implement Auth Context

Tạo file `src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, LoginDto } from '@/services/auth.service';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('access_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginDto) => {
    const response = await authService.login(data);
    localStorage.setItem('access_token', response.access_token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## Bước 5: Protected Routes

Tạo file `src/components/ProtectedRoute.tsx`:

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
```

## Bước 6: Example Usage in Components

### Login Page

```typescript
// src/pages/admin/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email, password });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="text-red-500">{error}</div>}
      <Button type="submit">Login</Button>
    </form>
  );
}
```

### Bookings Page

```typescript
// src/pages/admin/Bookings.tsx
import { useBookings, useUpdateBookingStatus } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';

export function BookingsPage() {
  const { data: bookings, isLoading } = useBookings();
  const updateStatus = useUpdateBookingStatus();

  if (isLoading) return <div>Loading...</div>;

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <div>
      <h1>Bookings</h1>
      {bookings?.map((booking: any) => (
        <div key={booking.id}>
          <p>{booking.customerName}</p>
          <p>{booking.status}</p>
          <Button onClick={() => handleStatusUpdate(booking.id, 'confirmed')}>
            Confirm
          </Button>
        </div>
      ))}
    </div>
  );
}
```

### Public Booking Form

```typescript
// src/pages/BookingForm.tsx
import { useCreateBooking } from '@/hooks/useBookings';
import { useForm } from 'react-hook-form';

export function BookingForm() {
  const { register, handleSubmit } = useForm();
  const createBooking = useCreateBooking();

  const onSubmit = async (data: any) => {
    try {
      await createBooking.mutateAsync(data);
      alert('Booking created successfully!');
    } catch (error) {
      alert('Failed to create booking');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('customerName')} placeholder="Name" required />
      <input {...register('phone')} placeholder="Phone" required />
      <input {...register('email')} placeholder="Email" type="email" />
      {/* More fields */}
      <button type="submit">Submit Booking</button>
    </form>
  );
}
```

## Bước 7: Update App Routes

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/admin/Login';
import { DashboardPage } from '@/pages/admin/Dashboard';
import { BookingsPage } from '@/pages/admin/Bookings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## Bước 8: Testing the Integration

1. Start backend: `cd backend && npm run start:dev`
2. Start frontend: `cd .. && npm run dev`
3. Open browser: `http://localhost:5173`
4. Test login with: `admin@globewanderer.com` / `Admin@123456`

## Common Issues & Solutions

### CORS Errors

Backend `.env`:
```env
CORS_ORIGIN="http://localhost:5173"
```

### 401 Unauthorized

Check if token is being sent in headers. Use browser DevTools → Network tab.

### API not found

Verify `VITE_API_URL` in frontend `.env` matches backend URL.

## Production Deployment

1. Build frontend: `npm run build`
2. Deploy frontend to Vercel/Netlify
3. Deploy backend to VPS/Railway/Render
4. Update frontend `VITE_API_URL` to production backend URL
5. Update backend `CORS_ORIGIN` to production frontend URL

## Next Steps

- [ ] Implement error boundaries
- [ ] Add loading states
- [ ] Implement toast notifications
- [ ] Add form validation
- [ ] Implement file upload for images
- [ ] Add pagination for lists
- [ ] Implement search and filters
- [ ] Add real-time updates (WebSocket)
- [ ] Implement offline support
- [ ] Add analytics tracking
