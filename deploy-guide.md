# دليل رفع المشروع على VPS

## الخطوات:

### 1. رفع الكود على GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### 2. الاتصال بالـ VPS
```bash
ssh root@72.62.152.113
# Password: WYABr/&2T5s-U0TV
```

### 3. سحب الكود
```bash
cd /var/www  # أو المجلد اللي تختاره
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

### 4. إعداد ملف .env
```bash
nano .env
# انسخ محتويات .env من جهازك المحلي
```

### 5. تشغيل المشروع
```bash
docker compose up -d
```

### 6. التحقق من التشغيل
```bash
docker compose ps
docker compose logs -f
```

## إعداد Nginx (إذا لم يكن موجود)

### إنشاء ملف إعداد Nginx
```bash
nano /etc/nginx/sites-available/your-domain.com
```

### محتوى الملف:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### تفعيل الإعداد
```bash
ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## أوامر مفيدة

### إيقاف المشروع
```bash
docker compose down
```

### إعادة بناء وتشغيل
```bash
docker compose up -d --build
```

### عرض السجلات
```bash
docker compose logs -f
```

### تحديث الكود
```bash
git pull
docker compose up -d --build
```

## ملاحظات أمنية مهمة

1. ✅ المنفذ 3000 مقيد على 127.0.0.1 فقط
2. ✅ الوصول يتم عبر Nginx فقط
3. ⚠️ تأكد من تغيير SESSION_SECRET في .env
4. ⚠️ لا ترفع ملف .env على GitHub
5. ⚠️ استخدم SSL/HTTPS في الإنتاج (Certbot)

## إضافة SSL مجاني (اختياري)
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```
