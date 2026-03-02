# Luana AI — SVG Icons

Bộ icon đồng nhất cho ứng dụng Luana AI - Trợ lý viết văn bản học thuật.

## 📦 Các file icon:

### 1. **icon.svg** (Main Logo - 200x200)
- Dùng cho: Header logo, branding lớn
- Kích thước: 200x200px
- Style: Với background circle gold border
- Hiệu ứng: Animated sparkle effect

**Cách dùng:**
```html
<img src="/icon.svg" alt="Luana AI" style="width: 80px; height: 80px;">
<!-- Hoặc -->
<svg width="80" height="80">
  <use href="/icon.svg#icon"></use>
</svg>
```

### 2. **icon-favicon.svg** (Favicon - 64x64)
- Dùng cho: Browser tab icon
- Kích thước: 64x64px (được scale tự động)
- Style: Đơn giản, rõ ràng
- Đã được set làm favicon trong `<head>` của index.html

**Tự động dùng trong:**
```html
<link rel="icon" href="/icon-favicon.svg" type="image/svg+xml">
```

### 3. **icon-logo.svg** (Full Logo - 200x200)
- Dùng cho: Social media, presentations
- Kích thước: 200x200px
- Style: Monochrome design với text lines
- Hiệu ứng: Shimmer animation

**Cách dùng:**
```html
<img src="/icon-logo.svg" alt="Luana Logo">
```

---

## 🎨 Design Details

**Màu sắc:**
- Background: `#141414` (dark)
- Document: `#EDE9E2` (light cream)
- Accent/Spark: `#C8A96E` (gold)

**Thành phần:**
- Document page (biểu tượng cho document generation)
- Text lines (biểu tượng cho writing content)
- AI Spark (✨ biểu tượng cho AI/automation)

---

## 💡 Sử dụng thực tế

### Thay logo trong header:
```html
<div class="logo">
  <img src="/icon-favicon.svg" alt="Luana" style="width: 32px; height: 32px; margin-right: 8px; vertical-align: middle;">
  Doc<span>Gen</span> VN
</div>
```

### Thêm vào OG metag (Social):
```html
<meta property="og:image" content="https://luana-ai.vercel.app/icon-logo.svg">
```

### PWA manifest:
```json
{
  "icons": [
    {
      "src": "/icon-favicon.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "/icon-logo.svg",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ]
}
```

---

## 🔧 Customization

Nếu muốn thay đổi:
1. **Màu sắc**: Tìm `#C8A96E` (gold), `#EDE9E2` (text), `#141414` (bg)
2. **Kích thước**: Thay `viewBox="0 0 200 200"` và `width="200" height="200"`
3. **Hiệu ứng**: Tìm `@keyframes` để chỉnh animation

Enjoy! 🎉
