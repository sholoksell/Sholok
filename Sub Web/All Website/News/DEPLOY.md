# Sholok News Portal — Deployment Guide

## Overview

| Path | Description |
|------|-------------|
| `sholok.com/news/` | Public news frontend (served from `/var/www/sholok/news/`) |
| `sholok.com/news/admin328/` | Admin panel (served from `/var/www/sholok/news/admin328/`) |
| `sholok.com/news-api/` | Backend API (Node.js on port 5002, proxied by Nginx) |
| `sholok.com/news/news-uploads/` | Uploaded images (served from disk) |

---

## Step 1 — Nginx config additions

Add these blocks to `/etc/nginx/sites-available/sholok.com` **inside** the `server {}` block:

```nginx
# News API backend
location /news-api/ {
    proxy_pass http://127.0.0.1:5002/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# News uploaded images
location /news/news-uploads/ {
    alias /var/www/sholok/news/news-uploads/;
    expires 30d;
    access_log off;
}

# News admin panel (SPA)
location /news/admin328/ {
    alias /var/www/sholok/news/admin328/;
    try_files $uri $uri/ /news/admin328/index.html;
    expires -1;
}

# Public news frontend (SPA) — must come AFTER /news/admin328/
location /news/ {
    alias /var/www/sholok/news/;
    try_files $uri $uri/ /news/index.html;
    expires -1;
}
```

Test and reload:
```bash
nginx -t && systemctl reload nginx
```

---

## Step 2 — Create MySQL database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS sholok_news CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Then run the setup SQL:
```bash
mysql -u root -p sholok_news < /root/Sholok/Sub\ Web/All\ Website/News/admin/backend/setup.sql
```

---

## Step 3 — Backend setup on VPS

```bash
cd /root/Sholok/Sub\ Web/All\ Website/News/admin/backend
npm install
cp .env.example .env
nano .env   # fill in real DB password, JWT_SECRET, UPLOAD_DIR
mkdir -p /var/www/sholok/news/news-uploads
```

Start with PM2:
```bash
pm2 start server.js --name sholok-news-api
pm2 save
```

---

## Step 4 — Build and deploy admin frontend

On local machine (or VPS):
```bash
cd "Sub Web/All Website/News/admin/frontend"
npm install
npm run build
```

Deploy dist:
```bash
rsync -av dist/ root@162.0.213.197:/var/www/sholok/news/admin328/
```

---

## Step 5 — Build and deploy public news frontend

```bash
cd "Sub Web/All Website/News"
npm install
npm run build
```

Deploy:
```bash
rsync -av dist/ root@162.0.213.197:/var/www/sholok/news/
```

---

## Step 6 — Verify

- Public site: `https://sholok.com/news/`
- Admin login: `https://sholok.com/news/admin328/`
  - Email: `admin@sholok.com`
  - Password: `sholok@admin2024`
- API health: `https://sholok.com/news-api/health`

---

## Notes

- Change admin password immediately after first login
- Upload directory must be writable by Node process: `chown www-data:www-data /var/www/sholok/news/news-uploads`
- Never commit `.env` to git
