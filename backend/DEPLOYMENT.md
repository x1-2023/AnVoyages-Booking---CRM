# Deployment Guide - Globe Wanderer Backend

Hướng dẫn deploy backend lên production.

## Option 1: Deploy với VPS (Ubuntu/Debian)

### 1. Chuẩn bị VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install nginx
sudo apt install -y nginx
```

### 2. Upload Code

```bash
# Clone repository hoặc upload code
git clone https://github.com/your-repo/globe-wanderer.git
cd globe-wanderer/backend

# Install dependencies
npm install

# Build project
npm run build
```

### 3. Cấu hình Environment

```bash
# Tạo file .env cho production
nano .env
```

Cập nhật các giá trị production:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET="your-strong-secret-key-here"
DATABASE_URL="file:./prod.db"
CORS_ORIGIN="https://yourdomain.com"
```

### 4. Setup Database

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 5. Chạy với PM2

```bash
# Start application
pm2 start dist/main.js --name globe-wanderer-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 6. Cấu hình Nginx

```bash
sudo nano /etc/nginx/sites-available/globe-wanderer-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
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

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/globe-wanderer-api /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 7. Setup SSL với Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is configured automatically
```

## Option 2: Deploy với Railway

### 1. Chuẩn bị Project

Tạo file `Procfile`:
```
web: node dist/main.js
```

Tạo file `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build && npx prisma generate && npx prisma db push"
  },
  "deploy": {
    "startCommand": "node dist/main.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. Deploy

1. Tạo tài khoản tại [Railway.app](https://railway.app)
2. Tạo New Project → Deploy from GitHub
3. Chọn repository
4. Thêm Environment Variables:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `JWT_SECRET=your-secret`
   - `DATABASE_URL=file:./prod.db`
   - etc.
5. Deploy

## Option 3: Deploy với Render

### 1. Chuẩn bị

Tạo file `render.yaml`:
```yaml
services:
  - type: web
    name: globe-wanderer-api
    env: node
    buildCommand: npm install && npm run build && npx prisma generate && npx prisma db push
    startCommand: node dist/main.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
```

### 2. Deploy

1. Tạo tài khoản tại [Render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Configure environment variables
5. Deploy

## Option 4: Deploy với Heroku

### 1. Chuẩn bị

Tạo file `Procfile`:
```
web: node dist/main.js
release: npx prisma generate && npx prisma db push
```

### 2. Deploy

```bash
# Login to Heroku
heroku login

# Create app
heroku create globe-wanderer-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma db push
```

## Database Considerations

### SQLite in Production

SQLite phù hợp cho:
- Ứng dụng nhỏ và vừa
- Traffic thấp đến trung bình
- Single-server deployment

**Lưu ý:**
- Backup database thường xuyên
- SQLite file cần persistent storage
- Không phù hợp cho multi-server setup

### Migrate to PostgreSQL (Recommended for Scale)

1. Update `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update environment:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

3. Run migration:
```bash
npx prisma migrate dev
```

## Post-Deployment Checklist

- [ ] Đổi JWT_SECRET
- [ ] Đổi admin password
- [ ] Setup database backups
- [ ] Configure CORS properly
- [ ] Setup monitoring (PM2, New Relic, etc.)
- [ ] Configure logging
- [ ] Setup error tracking (Sentry)
- [ ] Test all endpoints
- [ ] Setup health check endpoint
- [ ] Configure rate limiting
- [ ] Setup firewall rules
- [ ] Enable HTTPS
- [ ] Test notifications (Email, Telegram)

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs globe-wanderer-api

# Monitor resources
pm2 monit

# Restart app
pm2 restart globe-wanderer-api

# View app info
pm2 info globe-wanderer-api
```

### Setup PM2 Plus (Optional)

```bash
pm2 link <secret-key> <public-key>
```

## Backup Strategy

### Database Backup Script

Create `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
DB_FILE="/path/to/globe-wanderer/backend/prisma/prod.db"

# Create backup
cp $DB_FILE $BACKUP_DIR/backup_$DATE.db

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.db" -mtime +30 -delete
```

### Automate with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

## Scaling Considerations

### Horizontal Scaling

Để scale horizontally (multiple servers):
1. Migrate to PostgreSQL/MySQL
2. Use Redis for session storage
3. Setup load balancer
4. Use cloud storage for uploads

### Performance Optimization

1. Enable compression:
```typescript
// main.ts
import compression from 'compression';
app.use(compression());
```

2. Add caching:
```bash
npm install @nestjs/cache-manager cache-manager
```

3. Database connection pooling
4. CDN for static assets

## Troubleshooting

### App won't start

```bash
# Check logs
pm2 logs globe-wanderer-api --err

# Check node version
node --version

# Rebuild
npm run build
```

### Database errors

```bash
# Regenerate Prisma client
npx prisma generate

# Check database file permissions
ls -la prisma/prod.db
```

### CORS issues

Update CORS origin in `.env`:
```env
CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"
```

## Security Best Practices

1. Use environment variables for secrets
2. Enable rate limiting
3. Use helmet.js for security headers
4. Keep dependencies updated
5. Use HTTPS only
6. Implement API key authentication for external integrations
7. Regular security audits
8. Monitor for suspicious activities

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)
- [Nginx Documentation](https://nginx.org/en/docs)
