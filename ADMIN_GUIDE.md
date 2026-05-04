# Hướng Dẫn Sử Dụng Admin Panel

## 🚀 Khởi Động Hệ Thống

### Cách 1: Chạy tất cả cùng lúc
```bash
npm run dev:all
```

### Cách 2: Chạy riêng từng phần
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
npm run dev
```

## 🔐 Đăng Nhập

**Tài khoản admin mặc định:**
- Email: `admin@globewanderer.com`
- Password: `Admin123!`

**Lưu ý:** Hiện tại chưa có trang login UI, cần login qua API:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@globewanderer.com","password":"Admin123!"}'
```

Sau đó copy `access_token` và lưu vào localStorage trong browser console:
```javascript
localStorage.setItem('access_token', 'YOUR_TOKEN_HERE')
```

Hoặc tạo trang login riêng theo nhu cầu.

## 📊 Admin Dashboard (`/admin`)

Trang tổng quan hiển thị:
- **Tổng đặt phòng** - Số lượng bookings và pending
- **Doanh thu** - Tổng revenue từ bookings
- **Bất động sản** - Tổng properties và số lượng active
- **Địa điểm** - Tổng locations

### Quick Actions:
- Quản lý đặt phòng
- Quản lý bất động sản
- Quản lý địa điểm
- Cài đặt website

## 📅 Quản Lý Đặt Phòng (`/admin/bookings`)

### Chức năng:
- ✅ **Xem tất cả đặt phòng** - Hiển thị danh sách từ database
- ✅ **Filter** - Lọc theo trạng thái (All, Pending, Confirmed, Completed, Cancelled)
- ✅ **Search** - Tìm kiếm theo tên, số điện thoại, email
- ✅ **Xác nhận** - Chuyển booking từ Pending → Confirmed
- ✅ **Hoàn thành** - Chuyển booking từ Confirmed → Completed
- ✅ **Hủy** - Hủy booking bất kỳ
- ✅ **Xóa** - Xóa booking khỏi database

### Stats hiển thị:
- Tổng đặt phòng
- Số lượng chờ xử lý
- Số lượng đã xác nhận
- Tổng doanh thu

### Responsive:
- **Desktop**: Bảng table đầy đủ thông tin
- **Mobile**: Card view dễ sử dụng

## 🏠 Quản Lý Bất Động Sản (`/admin/properties`)

### Chức năng:
- ✅ **Xem tất cả properties** - Hotels, Homestays, Tours, Cruises
- ✅ **Filter** - Lọc theo trạng thái (All, Active, Inactive)
- ✅ **Search** - Tìm theo tên property hoặc địa điểm
- ✅ **Toggle Active** - Kích hoạt/Vô hiệu hóa property
- ✅ **Xóa** - Xóa property khỏi database

### Thông tin hiển thị:
- Tên bất động sản
- Địa điểm (location)
- Loại (Hotel, Homestay, Tour, Cruise)
- Giá/đêm
- Số khách/phòng
- Trạng thái (Active/Inactive)

### Stats:
- Tổng bất động sản
- Số lượng hoạt động
- Số lượng Khách sạn
- Số lượng Homestay

### Future Enhancement:
- Nút "Thêm bất động sản" (cần tạo form)
- Nút "Chỉnh sửa" (cần tạo form)

## 📍 Quản Lý Địa Điểm (`/admin/locations`)

### Chức năng:
- ✅ **Xem tất cả locations** - Danh sách địa điểm du lịch
- ✅ **Search** - Tìm theo tên hoặc quốc gia
- ✅ **Toggle Featured** - Đánh dấu/Bỏ đánh dấu nổi bật
- ✅ **Xóa** - Xóa location

### Thông tin hiển thị:
- Tên địa điểm
- Quốc gia
- Số lượng bất động sản tại địa điểm
- Trạng thái Featured

### Stats:
- Tổng địa điểm
- Số địa điểm nổi bật
- Số quốc gia

### Future Enhancement:
- Nút "Thêm địa điểm" (cần tạo form)
- Nút "Chỉnh sửa" (cần tạo form)

## ⚙️ Cài Đặt Website (`/admin/settings`)

### Chức năng:
Admin có thể tùy chỉnh giao diện frontend mà KHÔNG cần code!

### Site Information:
- **Site Name** - Tên website (hiển thị navbar/footer)
- **Site Tagline** - Slogan (hiển thị footer)

### Hero Section:
- **Hero Background Image** - URL ảnh nền (với preview)
- **Hero Title** - Tiêu đề chính trang chủ
- **Hero Subtitle** - Phụ đề trang chủ

### Contact Information:
- **Contact Email** - Email liên hệ
- **Contact Phone** - Số điện thoại

### Brand Colors:
- **Primary Color** - Màu chủ đạo (với color picker)
- **Secondary Color** - Màu phụ (với color picker)

### Footer:
- **Footer Text** - Text hiển thị cuối trang

### Actions:
- **Initialize Defaults** - Khôi phục về cài đặt mặc định
- **Save All Changes** - Lưu tất cả thay đổi

**QUAN TRỌNG**: Changes apply NGAY LẬP TỨC sau khi save!

## 🎨 Upload Ảnh

Hiện tại hệ thống chấp nhận **URL** của ảnh.

**Khuyến nghị services upload ảnh miễn phí:**
- [Imgur](https://imgur.com) - Upload và lấy direct link
- [Cloudinary](https://cloudinary.com) - Free tier generous
- [Unsplash](https://unsplash.com) - Stock photos chất lượng cao

**Cách dùng:**
1. Upload ảnh lên service
2. Copy direct URL (ví dụ: `https://i.imgur.com/abc123.jpg`)
3. Paste vào field trong Settings
4. Click Save

## 🔄 Workflow Điển Hình

### 1. Quản lý đặt phòng mới:
1. Truy cập `/admin/bookings`
2. Xem danh sách "Chờ xử lý" (filter = Pending)
3. Click menu 3 chấm → Xác nhận
4. Booking chuyển sang trạng thái "Đã xác nhận"

### 2. Thay đổi ảnh nền homepage:
1. Upload ảnh lên Imgur/Cloudinary
2. Copy URL
3. Truy cập `/admin/settings`
4. Paste vào "Hero Background Image URL"
5. Click "Save All Changes"
6. Mở homepage → Thấy ảnh nền mới ngay lập tức!

### 3. Vô hiệu hóa bất động sản:
1. Truy cập `/admin/properties`
2. Tìm property cần vô hiệu hóa
3. Click menu 3 chấm → "Vô hiệu hóa"
4. Property chuyển sang trạng thái "Không hoạt động"

## 📱 Mobile Usage

Tất cả trang admin đều responsive:
- **Sidebar** - Thu gọn thành hamburger menu
- **Tables** - Chuyển thành card view dễ đọc
- **Stats** - Grid responsive
- **Forms** - Tối ưu cho màn hình nhỏ

## 🐛 Troubleshooting

### Không thể đăng nhập admin:
1. Kiểm tra backend đang chạy: `http://localhost:3000/api`
2. Check database đã seed: `npm --prefix backend run prisma:seed`
3. Verify token trong localStorage

### Không tải được data:
1. Check console browser xem có lỗi API
2. Verify backend running: `curl http://localhost:3000/api/dashboard/stats`
3. Check CORS settings trong backend/.env

### Changes không apply:
1. Hard refresh browser (Ctrl+F5)
2. Clear localStorage và login lại
3. Check Network tab xem API call có success

## 🎯 Best Practices

1. **Backup database** trước khi xóa nhiều data:
   ```bash
   cp backend/prisma/dev.db backend/prisma/dev.db.backup
   ```

2. **Test trên staging** trước khi apply changes quan trọng

3. **Sử dụng descriptive names** cho properties/locations để dễ quản lý

4. **Regularly check Pending bookings** để không bỏ lỡ khách hàng

5. **Optimize images** trước khi upload (khuyến nghị < 500KB cho hero images)

## 🚀 Next Steps

Để system hoàn thiện hơn, cần thêm:

1. **Login Page** - UI form đăng nhập thay vì manual
2. **Create/Edit Forms** - UI tạo/sửa properties và locations
3. **Image Upload** - Direct upload thay vì chỉ URL
4. **Protected Routes** - Auto-redirect nếu chưa login
5. **User Management** - Quản lý nhiều admin users
6. **Activity Logs** - Track ai làm gì, khi nào

## 📞 Support

Nếu gặp vấn đề:
1. Check [PRODUCT_STATUS.md](PRODUCT_STATUS.md) - Danh sách features
2. Check browser console cho errors
3. Check backend logs
4. Review API documentation tại `http://localhost:3000/api-docs` (nếu có Swagger)
