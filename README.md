# ⚡ Universal Video Speed & Seek Controller

<p align="center">
  <img src="icons/icon128.png" alt="Logo" width="96" height="96">
</p>

<p align="center">
  <b>Tiện ích mở rộng (Browser Extension) giúp tua nhanh/lùi và điều chỉnh tốc độ phát mượt mà trên mọi video HTML5.</b><br>
  Tương thích hoàn hảo với <b>YouTube, Netflix, Facebook, TikTok, Bilibili, FPT Play, TV360</b> và tất cả các web xem phim trực tuyến.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue.svg?style=flat-square" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Version-2.0-success.svg?style=flat-square" alt="Version 2.0">
  <img src="https://img.shields.io/badge/License-MIT-orange.svg?style=flat-square" alt="License MIT">
  <img src="https://img.shields.io/badge/Supports-Chrome%20|%20Edge%20|%20C%E1%BB%91c%20C%E1%BB%91c%20|%20Brave-brightgreen.svg?style=flat-square" alt="Browsers">
</p>

---

## ✨ Tính năng nổi bật

* ⏩ **Tua video linh hoạt**: Tua tới hoặc lùi 5 giây (hoặc 10 giây khi giữ Shift).
* ⚡ **Điều chỉnh tốc độ không giới hạn**: Chỉnh tốc độ từ `0.1x` đến `16.0x` (bước nhảy `0.25x` hoặc tùy biến).
* 🛡️ **Bảo vệ phím tắt hệ thống 100%**: Không bao giờ xung đột với `Ctrl + C`, `Ctrl + V`, `Ctrl + Z`, `Ctrl + R` và tự động tạm dừng khi bạn gõ bình luận (comment) hay chat.
* 🖥️ **Hiển thị OSD Kính mờ (Glassmorphism)**: Thông báo tốc độ và thời gian trực quan, **hiển thị chuẩn xác ngay cả khi xem Fullscreen (Toàn màn hình)**.
* 🎛️ **Thanh điều khiển nổi (Floating HUD)**: Xuất hiện tinh tế ở góc video khi rê chuột vào, hỗ trợ điều khiển bằng chuột khi đang nằm xem phim.
* 📱 **Popup Extension hiện đại**: Kéo thanh trượt tốc độ (Slider), chọn nhanh các mốc tốc độ phổ biến (`0.5x`, `0.75x`, `1.0x`, `1.25x`, `1.5x`, `1.75x`, `2.0x`, `2.5x`).
* 💾 **Ghi nhớ tốc độ**: Tự động áp dụng tốc độ bạn ưa thích cho các tập phim hoặc video tiếp theo mà không cần chỉnh lại.
* 🌐 **Hỗ trợ video lồng trong `iframe` & Shadow DOM**: Bắt được video trên hầu hết mọi trình phát hiện đại.

---

## ⌨️ Bảng phím tắt mặc định

Bạn có thể bấm trực tiếp các phím sau khi đang xem video (khi không ở trong ô nhập văn bản):

| Phím tắt | Hành động | Chi tiết |
| :---: | :--- | :--- |
| <kbd>Z</kbd> | **Tua lùi 5 giây** | Giữ <kbd>Shift + Z</kbd> để tua lùi 10 giây |
| <kbd>X</kbd> | **Tua tới 5 giây** | Giữ <kbd>Shift + X</kbd> để tua tới 10 giây |
| <kbd>C</kbd> hoặc <kbd>[</kbd> | **Giảm tốc độ phát** | Giảm `-0.25x` mỗi lần bấm (tối thiểu `0.1x`) |
| <kbd>V</kbd> hoặc <kbd>]</kbd> | **Tăng tốc độ phát** | Tăng `+0.25x` mỗi lần bấm (tối đa `16.0x`) |
| <kbd>R</kbd> | **Đặt lại tốc độ chuẩn** | Trở về ngay mốc `1.00x` |
| <kbd>G</kbd> | **Chuyển nhanh (Quick Toggle)** | Chuyển đổi qua lại giữa `1.0x` ↔ `2.0x` |
| <kbd>B</kbd> | **Bật / Tắt thanh nút nổi** | Ẩn hoặc hiện thanh công cụ trên video |

---

## 📥 Hướng dẫn tải về và cài đặt (Dành cho người dùng)

Chỉ mất khoảng **30 giây** để cài đặt vào các trình duyệt Chromium (Google Chrome, Microsoft Edge, Cốc Cốc, Brave, Opera,...):

### Cách 1: Tải file ZIP từ GitHub (Đơn giản nhất)

1. **Tải mã nguồn về máy**:
   * Nhấn vào nút xanh **`Code`** ở đầu trang GitHub này ➔ Chọn **`Download ZIP`**.
   * Hoặc tải file `universal-video-controller.zip` tại mục **[Releases](https://github.com/quydat2004/etx_video_controller/releases)**.
2. **Giải nén**:
   * Giải nén file `.zip` vừa tải về vào một thư mục bất kỳ trên máy tính của bạn (ví dụ: `etx_video_controller` hoặc `video_controller`).
3. **Mở trang quản lý Tiện ích trên trình duyệt**:
   * **Chrome / Cốc Cốc**: Truy cập địa chỉ `chrome://extensions`
   * **Microsoft Edge**: Truy cập địa chỉ `edge://extensions`
4. **Bật Chế độ nhà phát triển (Developer mode)**:
   * Gạt công tắc **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải màn hình sang trạng thái **BẬT (ON)**.
5. **Cài đặt tiện ích**:
   * Bấm vào nút **"Tải tiện ích đã giải nén"** (hoặc **Load unpacked**) ở góc trên bên trái.
   * Chọn đúng thư mục chứa tiện ích vừa giải nén (thư mục chứa file `manifest.json`).
6. **Hoàn tất**:
   * Bấm vào biểu tượng mảnh ghép 🧩 trên thanh địa chỉ trình duyệt, nhấn ghim 📌 **Universal Video Controller** ra ngoài để dễ sử dụng!

---

### Cách 2: Dành cho lập trình viên (Git Clone)

```bash
# Clone repository về máy
git clone https://github.com/quydat2004/etx_video_controller.git

# Mở chrome://extensions trên trình duyệt, bật Developer Mode và chọn "Load unpacked" trỏ vào thư mục vừa clone.
```

---

## 📦 Cách tự đóng gói tiện ích thành file ZIP

Nếu bạn muốn đóng gói tiện ích thành 1 file ZIP duy nhất để chia sẻ cho người khác:

* Trên Windows: Chỉ cần **nhấp đúp chuột vào file [`build.bat`](file:///D:/Nhap/Exten/video_controller/build.bat)**.
* Script sẽ tự động gom các file cần thiết thành file `universal-video-controller.zip` chỉ trong 1 giây!

---

## 🛠️ Cấu trúc thư mục

```
etx_video_controller/
├── .github/
│   └── workflows/
│       └── release.yml     # Tự động đóng gói ZIP khi tạo GitHub Release
├── icons/                  # Bộ biểu tượng chuẩn cho tiện ích (16, 48, 128px)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json           # Cấu hình Manifest V3 của Extension
├── content.js              # Script chính xử lý video, hotkey, HUD & OSD
├── content.css             # Giao diện thông báo OSD và Floating HUD
├── popup.html              # Giao diện Popup mở rộng
├── popup.css               # Styling dark mode cho Popup
├── popup.js                # Xử lý tương tác trong Popup
├── build.bat               # Công cụ 1-click đóng gói ZIP cho Windows
├── LICENSE                 # Giấy phép mã nguồn mở MIT
└── README.md               # Hướng dẫn chi tiết
```

---

## 📄 Giấy phép (License)

Dự án được phân phối dưới giấy phép [MIT License](LICENSE). Bạn hoàn toàn có thể tự do sử dụng, chỉnh sửa và chia sẻ.
