# DU LỊCH BIỂN ĐẢO BẮC BỘ — WEB & CRM TECHNICAL PLAN

> Ngày tách: 02/05/2026
> Nguồn: travel-business-plan.md
> Phạm vi: Website public, CRM, database, admin panel, booking flow, tech stack, timeline triển khai

---

## 8. CRM System — Technical Design

### Yêu cầu chức năng

1. **Dashboard**: Tổng quan booking, doanh thu, lead mới
2. **Quản lý Leads**: Kanban board (new → contacted → quoted → confirmed)
3. **Quản lý Booking**: CRUD, trạng thái, thanh toán
4. **Quản lý Tour/Sản phẩm**: CRUD, upload ảnh, giá vốn vs giá bán
5. **Quản lý Nhà cung cấp**: Danh sách, contact, deal giá
6. **Quản lý Khách hàng**: Profile, lịch sử booking, liên lạc
7. **Báo cáo**: Doanh thu theo tháng, lợi nhuận theo tour, nguồn khách
8. **Tự động nhắc nhở**: Email/SMS trước ngày đi

### Quy tắc thiết kế

- Không dùng Google Sheets hay phần mềm thứ 3
- Tự build, tích hợp vào website
- Giao diện đơn giản, dễ dùng trên mobile
- Tiếng Việt 100%

---

---

## 9. Database Schema

### Bảng customers (Khách hàng)

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    source VARCHAR(50),          -- facebook, zalo, google, referral, walk-in
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Bảng leads (Tiềm năng)

```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    tour_id UUID REFERENCES tours(id),
    status VARCHAR(50) DEFAULT 'new',  -- new, contacted, quoted, confirmed, lost
    travel_date DATE,
    num_people INT,
    budget DECIMAL(12,2),
    notes TEXT,
    assigned_to VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Bảng tours (Sản phẩm)

```sql
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    destination VARCHAR(100),     -- Hạ Long, Cát Bà, Cô Tô, Quan Lạn
    type VARCHAR(50),             -- day_cruise, overnight, combo, team_building
    description TEXT,
    duration_days INT,
    cost_price DECIMAL(12,2),     -- giá mua từ NCC
    selling_price DECIMAL(12,2),  -- giá bán lẻ
    image_url TEXT,
    supplier_id UUID REFERENCES suppliers(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Bảng suppliers (Nhà cung cấp)

```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),             -- cruise, hotel, transport, tour_operator
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    contract_rate TEXT,           -- ghi chú deal giá
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Bảng bookings (Đơn hàng)

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(20) UNIQUE,  -- VV-20260501-001
    customer_id UUID REFERENCES customers(id),
    tour_id UUID REFERENCES tours(id),
    travel_date DATE,
    num_people INT,
    total_cost DECIMAL(12,2),     -- tổng giá vốn
    total_price DECIMAL(12,2),    -- tổng giá bán
    profit DECIMAL(12,2),         -- lợi nhuận
    status VARCHAR(50) DEFAULT 'pending',  -- pending, confirmed, completed, cancelled
    payment_status VARCHAR(50) DEFAULT 'unpaid',  -- unpaid, deposit, paid
    deposit_amount DECIMAL(12,2),
    paid_amount DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Bảng payments (Thanh toán)

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    amount DECIMAL(12,2),
    method VARCHAR(50),           -- bank_transfer, cash, momo, zalopay
    type VARCHAR(50),             -- deposit, final_payment, refund
    reference_code VARCHAR(100),  -- mã giao dịch ngân hàng
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Bảng communications (Lịch sử liên lạc)

```sql
CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    type VARCHAR(50),             -- call, zalo, facebook, email, sms
    content TEXT,
    direction VARCHAR(20),        -- inbound, outbound
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_travel_date ON bookings(travel_date);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_source ON customers(source);
```

---

---

## 10. Admin Panel Features

### 10.1 Dashboard

**Hiển thị:**
- Tổng booking tháng này
- Doanh thu tháng này
- Lợi nhuận tháng này
- Lead mới (chưa xử lý)
- Booking chờ xác nhận
- Booking quá hạn thanh toán
- Biểu đồ doanh thu theo tháng (12 tháng gần nhất)
- Top 5 tour bán chạy
- Booking gần đây (10 đơn mới nhất)

### 10.2 Lead Pipeline (Kanban)

**4 cột:**
- Mới (new) — khách vừa gửi form / inbox
- Đã liên hệ (contacted) — đã gọi/Zalo tư vấn
- Đã báo giá (quoted) — đã gửi bảng giá
- Đã chốt (confirmed) — khách đồng ý → chuyển thành Booking

**Mỗi lead card hiển thị:**
- Tên khách + SĐT
- Tour quan tâm
- Ngày đi dự kiến
- Số người
- Nguồn (FB/Google/Zalo)
- Ghi chú

**Thao tác:**
- Kéo thả giữa các cột
- Click để mở chi tiết
- Thêm ghi chú
- Tạo booking từ lead

### 10.3 Booking Management

**Danh sách booking:**
- Filter: trạng thái, ngày đi, tour, thanh toán
- Sort: ngày tạo, ngày đi, giá trị
- Search: mã booking, tên khách

**Chi tiết booking:**
- Thông tin khách hàng
- Tour + ngày đi + số người
- Giá vốn / Giá bán / Lợi nhuận
- Trạng thái thanh toán + nút ghi nhận thanh toán
- Nút chuyển trạng thái (confirmed, completed, cancelled)
- Nút in voucher
- Lịch sử thay đổi

### 10.4 Tour / Product Management

- CRUD tour
- Upload ảnh (multi-image)
- Set giá vốn vs giá bán → tự tính margin %
- Chọn nhà cung cấp
- Ẩn/hiện sản phẩm
- Preview như khách thấy

### 10.5 Supplier Management

- Danh sách NCC: cruise, hotel, nhà xe, tour operator
- Thông tin liên hệ
- Ghi chú deal giá / hợp đồng
- Link tới các tour sử dụng NCC này

### 10.6 Customer Management

- Danh sách khách hàng
- Profile: tên, SĐT, email, nguồn, ghi chú
- Lịch sử booking
- Lịch sử liên lạc (call, Zalo, FB, email)
- Tổng chi tiêu

### 10.7 Reports

- **Doanh thu theo tháng**: line chart
- **Lợi nhuận theo tour**: bar chart
- **Nguồn khách**: pie chart (FB, Google, Zalo, referral)
- **Tỷ lệ conversion**: lead → booking
- **Top khách hàng**: theo tổng chi tiêu
- **Booking theo điểm đến**: bar chart
- **Xuất Excel/CSV**

---

---

## 11. Booking Flow — Chi tiết

### Flow từ website

```
BƯỚC 1: Khách vào website
    ↓
BƯỚC 2: Xem tour → Click "Đặt tour" hoặc "Nhận tư vấn"
    ↓
BƯỚC 3: Form đặt tour
    - Họ tên *
    - Số điện thoại *
    - Email
    - Tour muốn đi (dropdown)
    - Ngày dự kiến
    - Số người
    - Ghi chú
    ↓
BƯỚC 4: Submit → Lưu vào DB
    - Tạo customer mới (hoặc link với customer cũ nếu trùng SĐT)
    - Tạo lead (status: new)
    ↓
BƯỚC 5: Admin nhận thông báo
    - Email notification
    - Zalo webhook (nếu có)
    ↓
BƯỚC 6: Admin tư vấn (qua Zalo / SĐT)
    - Cập nhật lead status → contacted
    - Thêm ghi chú
    ↓
BƯỚC 7: Admin báo giá
    - Cập nhật lead status → quoted
    - Gửi bảng giá qua Zalo/email
    ↓
BƯỚC 8: Khách confirm
    - Lead status → confirmed
    - Tạo booking từ lead
    - Booking status → pending
    - Gửi thông tin đặt cọc
    ↓
BƯỚC 9: Khách chuyển khoản cọc (50%)
    - Ghi nhận payment (type: deposit)
    - Booking payment_status → deposit
    - Booking status → confirmed
    - Xác nhận với NCC
    - Gửi voucher cho khách
    ↓
BƯỚC 10: Trước ngày đi 1 ngày
    - Nhắc nhở tự động (SMS/email)
    - Gửi thông tin chi tiết (điểm đón, giờ, liên hệ HDV)
    ↓
BƯỚC 11: Khách thanh toán phần còn lại
    - Ghi nhận payment (type: final_payment)
    - Booking payment_status → paid
    ↓
BƯỚC 12: Sau tour hoàn thành
    - Booking status → completed
    - Gửi email cảm ơn + yêu cầu review
    - Upsell tour tiếp theo
```

### Booking Code Format

```
VV-YYYYMMDD-XXX

Ví dụ: VV-20260502-001

VV = ViVu (hoặc viết tắt thương hiệu)
YYYYMMDD = ngày tạo
XXX = số thứ tự 3 chữ số
```

---

---

## 12. Tech Stack

| Layer | Technology | Lý do |
|---|---|---|
| Frontend | **Next.js 14+** (React) | SSR cho SEO, nhanh, dễ maintain |
| UI Library | **Tailwind CSS** + **shadcn/ui** | Nhanh, đẹp, tùy biến dễ |
| Backend | **Next.js API Routes** | Full-stack trong 1 codebase |
| Database | **PostgreSQL** | Mạnh, free trên Supabase |
| ORM | **Prisma** | Type-safe, migration dễ |
| Auth | **NextAuth.js** | Login admin đơn giản |
| File Upload | **Cloudinary** | Free 25GB, CDN toàn cầu |
| Hosting | **Vercel** (frontend) | Free tier, deploy tự động |
| Database Host | **Supabase** (PostgreSQL) | Free tier 500MB, dashboard sẵn |
| Email | **Resend** hoặc **Nodemailer** | Gửi thông báo booking |
| Analytics | **Google Analytics** + **Meta Pixel** | Track conversion |

### Project Structure

```
travel-crm/
├── app/
│   ├── (admin)/           # Admin panel
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── bookings/
│   │   ├── tours/
│   │   ├── suppliers/
│   │   ├── customers/
│   │   └── reports/
│   ├── (website)/         # Public website
│   │   ├── page.tsx       # Trang chủ
│   │   ├── tours/
│   │   ├── booking/
│   │   ├── about/
│   │   └── contact/
│   ├── api/               # API routes
│   │   ├── bookings/
│   │   ├── customers/
│   │   ├── leads/
│   │   ├── tours/
│   │   ├── suppliers/
│   │   ├── payments/
│   │   └── reports/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── admin/
│   ├── website/
│   └── shared/
├── lib/
│   ├── db.ts              # Prisma client
│   ├── auth.ts            # NextAuth config
│   └── utils.ts
├── prisma/
│   └── schema.prisma      # Database schema
├── public/
│   └── images/
├── .env
├── next.config.js
├── package.json
└── tailwind.config.js
```

---

---

## 13. Implementation Timeline

### Phase 1: Foundation (Tuần 1-4)

| Tuần | Task |
|---|---|
| 1 | Setup Next.js project, Prisma, PostgreSQL. Tạo database schema |
| 2 | Auth system (admin login). CRUD cho Tours + Suppliers |
| 3 | Customer management. Lead pipeline (Kanban board) |
| 4 | Booking system. Payment tracking |

### Phase 2: Admin Complete (Tuần 5-8)

| Tuần | Task |
|---|---|
| 5 | Dashboard với charts (doanh thu, lead, booking) |
| 6 | Reports (doanh thu theo tháng, lợi nhuận theo tour, nguồn khách) |
| 7 | Communication log. Notification system |
| 8 | Polish admin UI, mobile responsive |

### Phase 3: Public Website (Tuần 9-12)

| Tuần | Task |
|---|---|
| 9 | Trang chủ (hero, featured tours, CTA) |
| 10 | Trang danh sách tour + chi tiết tour |
| 11 | Form đặt tour → lưu vào CRM. Blog/Review section |
| 12 | SEO optimization, Meta Pixel, Google Analytics |

### Phase 4: Launch (Tuần 13-14)

| Tuần | Task |
|---|---|
| 13 | Test toàn bộ flow. Fix bugs |
| 14 | Deploy production. Setup domain + SSL |

### Phase 5: Enhancement (Tháng 4+)

- Email/SMS tự động nhắc nhở
- Export Excel/CSV
- Khách tự check booking status
- Tích hợp Zalo OA webhook
- Multi-language (English cho khách quốc tế)

---
