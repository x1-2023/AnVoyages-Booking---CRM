# Payment TODO - Sepay Review

Ngày ghi chú: 2026-05-03

## Hiện trạng đã làm

- Đã thêm cấu hình Sepay trong Admin Settings:
  - bật/tắt Sepay
  - sandbox/production
  - merchant id
  - merchant secret key
  - IPN secret key
  - payment method
  - currency
  - prefix mã booking
  - % cọc mặc định
  - template nội dung chuyển khoản
  - success/error/cancel URL
- Public settings không trả secret key.
- Booking mới có thể tạo checkout bằng SDK `sepay-pg-node`.
- Public endpoint checkout:
  - `POST /api/bookings/:id/sepay-checkout`
  - xác thực bằng `phone`, có thể kèm `bookingCode`
- IPN endpoint:
  - `POST /api/bookings/sepay/ipn`
  - kiểm tra `X-Secret-Key`
  - có xử lý idempotent để tránh ghi trùng payment.
- Frontend có các trang:
  - `/payment/success`
  - `/payment/error`
  - `/payment/cancel`

## Cần rà soát sau

- Test sandbox bằng merchant thật của Sepay.
- Test các case IPN:
  - `ORDER_PAID`
  - sai `X-Secret-Key`
  - duplicate IPN
  - thanh toán thiếu
  - thanh toán đủ
  - thanh toán nhiều lần cho cùng booking
- Chốt mapping payload IPN thực tế của Sepay với dữ liệu đang xử lý.
- Thêm payment log/audit log riêng nếu cần đối soát kế toán.
- Chốt domain production cho:
  - success URL
  - error URL
  - cancel URL
  - IPN URL
- Đảm bảo IPN production dùng HTTPS:
  - `https://your-domain.vn/api/bookings/sepay/ipn`
- Sau khi có merchant thật, test end-to-end:
  - khách tạo booking
  - redirect Sepay
  - payment success/cancel/error
  - IPN cập nhật booking trong admin

## Ghi chú rủi ro

- Không bật production khi chưa test sandbox thật.
- Không lưu hoặc copy merchant secret vào tài liệu public.
- Sales/admin thường không nên có quyền sửa payment secret khi phân quyền hoàn thiện.
