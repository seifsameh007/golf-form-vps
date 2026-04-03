# استخدام Node.js 18 كصورة أساسية
FROM node:18-alpine

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت المكتبات
RUN npm ci --only=production

# نسخ باقي الملفات
COPY . .

# تعريف المنفذ
EXPOSE 3000

# تشغيل التطبيق
CMD ["npm", "start"]
