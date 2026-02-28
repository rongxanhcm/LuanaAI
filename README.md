# DocGen VN — Hướng dẫn Deploy lên Vercel

## Cấu trúc project

```
docgen-vn/
├── api/
│   └── generate.js     ← Serverless function (giữ API key an toàn)
├── public/
│   └── index.html      ← Frontend
├── vercel.json         ← Config Vercel
└── README.md
```

---

## Deploy lần đầu (15 phút)

### Bước 1 — Tạo tài khoản Vercel
Vào https://vercel.com → Sign up bằng GitHub (miễn phí)

### Bước 2 — Push code lên GitHub
```bash
# Trong thư mục docgen-vn/
git init
git add .
git commit -m "first commit"

# Tạo repo mới trên github.com, sau đó:
git remote add origin https://github.com/TEN_BAN/docgen-vn.git
git push -u origin main
```

### Bước 3 — Import vào Vercel
1. Vào https://vercel.com/new
2. Chọn "Import Git Repository"
3. Chọn repo `docgen-vn` vừa tạo
4. Bấm **Deploy** (chưa cần làm gì thêm)

### Bước 4 — Thêm API Key (QUAN TRỌNG)
Sau khi deploy xong:
1. Vào **Project Settings** → **Environment Variables**
2. Thêm variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (key của bạn từ console.anthropic.com)
3. Bấm **Save**
4. Vào **Deployments** → Bấm **Redeploy** để apply key

### Bước 5 — Lấy API Key Anthropic
1. Vào https://console.anthropic.com
2. Đăng ký tài khoản (có free credit $5 để test)
3. Vào **API Keys** → **Create Key**
4. Copy key dán vào Vercel ở bước 4

---

## Sau khi deploy
- URL của bạn sẽ là: `https://docgen-vn.vercel.app` (hoặc tên khác)
- Mỗi lần push code mới lên GitHub → Vercel tự động redeploy
- API key **không bao giờ** lộ ra ngoài — nằm hoàn toàn trong Vercel server

---

## Chi phí

| Thứ | Chi phí |
|-----|---------|
| Vercel hosting | Miễn phí (Hobby plan) |
| Anthropic API | ~$0.003 per request (rất rẻ) |
| Domain riêng (tùy chọn) | ~$10/năm |

---

## Nếu bị lỗi

**Lỗi 401** → API key sai hoặc chưa redeploy sau khi thêm key

**Lỗi 500** → Xem logs trong Vercel Dashboard → Functions → generate

**Blank page** → Mở DevTools (F12) → Console xem lỗi gì
