# CampusAI — Production Deployment Guide
> Comprehensive architectural and operations guide for deploying CampusAI to production environments.

---

## 📑 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & Server Sizing](#2-prerequisites--server-sizing)
3. [Method 1: Docker Compose Deployment (Recommended for VPS / AWS / DigitalOcean)](#3-method-1-docker-compose-deployment-recommended)
4. [Method 2: Cloud PaaS Deployment (Vercel + Render/Railway + Managed Postgres)](#4-method-2-cloud-paas-deployment)
5. [Method 3: Native Ubuntu/Debian Server (Nginx + PM2 + PostgreSQL)](#5-method-3-native-ubuntudebian-server)
6. [Production Environment Variables Checklist](#6-production-environment-variables-checklist)
7. [Database Migration & Seeding](#7-database-migration--seeding)
8. [SSL / HTTPS Configuration (Let's Encrypt)](#8-ssl--https-configuration)
9. [CI/CD Pipeline (GitHub Actions)](#9-cicd-pipeline-github-actions)
10. [Health Checks & Verification](#10-health-checks--verification)
11. [Backups & Disaster Recovery](#11-backups--disaster-recovery)
12. [Security & Performance Hardening](#12-security--performance-hardening)

---

## 1. Architecture Overview

In production, CampusAI operates as a high-performance decoupled multi-tier system:

```
[ Internet / Clients ]
         │
         │ HTTPS (Port 443)
         ▼
[ Nginx Reverse Proxy / Load Balancer ]
         │
         ├───► /api/*       ───► [ Node.js Express API (Port 5000) ]
         │                               │
         │                               ├───► [ PostgreSQL 16 (Port 5432) ]
         │                               └───► [ IBM watsonx.ai REST / IAM ]
         │
         └───► /* (SPA)     ───► [ Static React SPA (Vite / Nginx) ]
```

---

## 2. Prerequisites & Server Sizing

### Recommended Minimum Hardware Specs (VPS / Cloud VM)
- **CPU:** 2 vCPU cores
- **RAM:** 2 GB (4 GB recommended for concurrent AI queries and builds)
- **Disk:** 20 GB SSD (NVMe preferred)
- **OS:** Ubuntu 22.04 LTS or 24.04 LTS (x86_64)

### Software Requirements
- **Docker:** Engine 24+ and Docker Compose v2+ (For Containerized Deployment)
- **OR Node.js:** v20.x or v22.x LTS (For Native Deployment)
- **Domain Name:** DNS `A` record pointing to the server public IP

---

## 3. Method 1: Docker Compose Deployment (Recommended)

Docker Compose provides an isolated, reproducible stack with PostgreSQL 16, backend API, and Nginx-powered frontend.

### Step 1: Clone Repository on the Server
```bash
git clone https://github.com/your-org/campusai.git /opt/campusai
cd /opt/campusai
```

### Step 2: Configure Production Environment Variables
Create `/opt/campusai/.env`:
```bash
cp .env.example .env
nano .env
```
Fill in the production parameters:
```ini
NODE_ENV=production
PORT=5000

# PostgreSQL credentials (matches docker-compose.yml)
POSTGRES_USER=campusai_user
POSTGRES_PASSWORD=generate_a_strong_random_password_here_32chars
POSTGRES_DB=campusai_db
DATABASE_URL=postgresql://campusai_user:generate_a_strong_random_password_here_32chars@postgres:5432/campusai_db?schema=public

# Security
JWT_SECRET=generate_a_cryptographically_secure_jwt_secret_64chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://campusai.yourcollege.edu

# IBM watsonx.ai (Optional: leave blank for built-in high-speed heuristic provider)
IBM_API_KEY=
IBM_PROJECT_ID=
IBM_URL=https://us-south.ml.cloud.ibm.com
```

### Step 3: Build & Launch Containers
```bash
docker compose up -d --build
```

### Step 4: Run Database Migrations & Initial Seed
```bash
# Push Prisma schema to PostgreSQL
docker compose exec backend npx prisma db push --schema=prisma/schema.postgres.prisma

# Seed realistic campus buildings, cafeteria items, events, and demo accounts
docker compose exec backend npx tsx prisma/seed.ts
```

### Step 5: Verify Running Containers
```bash
docker compose ps
docker compose logs -f backend
```

---

## 4. Method 2: Cloud PaaS Deployment

If deploying to managed serverless/PaaS providers without managing a Linux server:

### A. Managed Database (Supabase, Neon, or Railway)
1. Create a PostgreSQL 16 project on **Neon.tech** or **Supabase.com**.
2. Copy the pooled connection string:
   ```
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
   ```

### B. Backend Deployment (Render or Railway)
1. Connect your GitHub repository to **Render** or **Railway**.
2. Select the `backend` directory as Root Directory.
3. Configure:
   - **Build Command:** `npm install && npx prisma generate --schema=prisma/schema.postgres.prisma && npm run build`
   - **Start Command:** `npm run start`
4. Set Environment Variables:
   - `DATABASE_URL`: *(Your Supabase/Neon connection string)*
   - `JWT_SECRET`: *(Your random secure 64-char key)*
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: `https://your-frontend.vercel.app`
5. Run the database seed once via Render SSH shell or local terminal:
   ```bash
   DATABASE_URL="..." npx tsx prisma/seed.ts
   ```

### C. Frontend Deployment (Vercel or Netlify)
1. Import repository on **Vercel**.
2. Select `frontend` as Root Directory.
3. Build Settings:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Create a `vercel.json` in `frontend/` to handle client-side routing & API proxy:
   ```json
   {
     "rewrites": [
       { "source": "/api/:match*", "destination": "https://your-backend.onrender.com/api/:match*" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## 5. Method 3: Native Ubuntu/Debian Server

For maximum bare-metal speed on Ubuntu 22.04 / 24.04:

### Step 1: Install Node.js 22 & PostgreSQL 16
```bash
# Update repositories
sudo apt update && sudo apt upgrade -y

# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx git build-essential

# Install PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib

# Verify versions
node -v && npm -v && psql --version
```

### Step 2: Configure PostgreSQL Database & User
```bash
sudo -u postgres psql
```
Inside the PostgreSQL prompt:
```sql
CREATE USER campusai WITH PASSWORD 'strong_production_password_2026';
CREATE DATABASE campusai_db OWNER campusai;
GRANT ALL PRIVILEGES ON DATABASE campusai_db TO campusai;
\q
```

### Step 3: Install PM2 Process Manager
```bash
sudo npm install -g pm2
```

### Step 4: Deploy Backend
```bash
cd /opt/campusai/backend
npm install
npm run build

# Push schema to PostgreSQL and seed
npx prisma db push --schema=prisma/schema.postgres.prisma
npx tsx prisma/seed.ts

# Start with PM2
pm2 start dist/server.js --name "campusai-backend" -i max
pm2 save
pm2 startup
```

### Step 5: Build Frontend & Configure Nginx
```bash
cd /opt/campusai/frontend
npm install
npm run build
```

Configure Nginx `/etc/nginx/sites-available/campusai`:
```nginx
server {
    listen 80;
    server_name campusai.yourcollege.edu;

    # Static Frontend SPA
    root /opt/campusai/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse Proxy to Node.js Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Enable site & test:
```bash
sudo ln -s /etc/nginx/sites-available/campusai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Production Environment Variables Checklist

| Variable | Description | Production Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | API listen port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?schema=public` |
| `JWT_SECRET` | Secret key for JWT signing | `64-char random hex string` |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `CORS_ORIGIN` | Allowed web origin | `https://campusai.yourcollege.edu` |
| `IBM_API_KEY` | *(Optional)* IBM watsonx Cloud API key | `apikey-xxxxxxxxxxxx` |
| `IBM_PROJECT_ID` | *(Optional)* IBM watsonx Project ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `IBM_URL` | *(Optional)* IBM watsonx Region URL | `https://us-south.ml.cloud.ibm.com` |

> [!TIP]
> Generate a strong 64-character JWT secret in bash:
> ```bash
> openssl rand -hex 32
> ```

---

## 7. Database Migration & Seeding

For production deployments, always use:

```bash
# Push PostgreSQL schema
npx prisma db push --schema=prisma/schema.postgres.prisma

# Seed realistic initial data (Admin, Faculty, Student, 10+ Buildings, 20+ Cafeteria Items, Events)
npx tsx prisma/seed.ts
```

---

## 8. SSL / HTTPS Configuration

Secure your domain with free Let's Encrypt TLS certificates:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d campusai.yourcollege.edu
```

Verify auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## 9. CI/CD Pipeline (GitHub Actions)

Save as `.github/workflows/deploy.yml`:

```yaml
name: Production CI/CD

on:
  push:
    branches: [ main ]

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install & Test Backend
        run: |
          cd backend
          npm ci
          npx prisma generate
          npm test

      - name: Build Frontend
        run: |
          cd frontend
          npm ci
          npm run build

  deploy:
    needs: test-and-build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy via SSH to VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/campusai
            git pull origin main
            docker compose up -d --build
            docker compose exec backend npx prisma db push --schema=prisma/schema.postgres.prisma
```

---

## 10. Health Checks & Verification

After deployment, perform smoke testing:

1. **API Health Endpoint:**
   ```bash
   curl -i https://campusai.yourcollege.edu/api/health
   # Expected: HTTP 200 {"status":"healthy","service":"CampusAI Core API Engine","version":"1.0.0"}
   ```

2. **AI Intent Classification Test:**
   ```bash
   curl -X POST https://campusai.yourcollege.edu/api/ai/classify-intent \
     -H "Content-Type: application/json" \
     -d '{"text":"Where is the computer science block?"}'
   # Expected: {"intent":"CAMPUS_NAVIGATION", ...}
   ```

3. **Locations Endpoint:**
   ```bash
   curl -s https://campusai.yourcollege.edu/api/locations | grep "Dr. A.P.J. Abdul Kalam"
   ```

---

## 11. Backups & Disaster Recovery

Configure automated daily PostgreSQL database backups:

Create `/opt/campusai/scripts/backup-db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/campusai"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

docker compose -f /opt/campusai/docker-compose.yml exec -T postgres \
  pg_dump -U campusai_user campusai_db | gzip > "$BACKUP_DIR/campusai_db_$TIMESTAMP.sql.gz"

# Retain only last 14 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -delete
```

Add cron job (`crontab -e`):
```cron
0 2 * * * /opt/campusai/scripts/backup-db.sh > /dev/null 2>&1
```

---

## 12. Security & Performance Hardening

1. **Firewall (UFW):**
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
2. **Fail2ban (Brute-force protection):**
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban && sudo systemctl start fail2ban
   ```
3. **Database Security:**
   - Never expose port `5432` to the public internet. Keep bound to `127.0.0.1` or the Docker bridge network.
4. **Content Security Policy & Headers:**
   - Nginx handles TLS 1.2/1.3 with HSTS enabled automatically via Certbot.
