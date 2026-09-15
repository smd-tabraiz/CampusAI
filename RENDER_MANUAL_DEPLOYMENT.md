# Render Manual Deployment Guide (with MongoDB Atlas)
> Complete step-by-step manual deployment instructions for **CampusAI** on Render using MongoDB Atlas.

---

## 🌟 Why MongoDB Atlas on Render is the Best Choice
1. **Permanent Free Database:** Unlike Render's free PostgreSQL (which expires after 30 days), your MongoDB Atlas cluster (`cluster0.31mtvlo.mongodb.net`) never expires.
2. **Simplified Stack:** You only need to create **2 services** on Render:
   - 1 Backend Web Service (Node.js API)
   - 1 Frontend Static Site (React 18 SPA)
3. **No Blueprint Errors:** Manually creating the services in the Render Dashboard avoids Blueprint schema validation issues completely.

---

## 📋 Database Connection Details
- **Provider:** MongoDB Atlas
- **Cluster:** `cluster0.31mtvlo.mongodb.net`
- **Database Name:** `campusai`
- **Full Production Connection String:**
  ```
  mongodb+srv://tabraizsmd_db_user:M3EcmHNdVHln8Utf@cluster0.31mtvlo.mongodb.net/campusai?retryWrites=true&w=majority&appName=Cluster0
  ```

---

## 🛠️ Step 1: Deploy Backend Web Service on Render

1. Go to **[dashboard.render.com](https://dashboard.render.com/)**.
2. Click **New +** (top right) ➔ Select **Web Service**.
3. Choose **"Build and deploy from a Git repository"** ➔ Connect your GitHub repository.
4. Fill in the service configuration:

| Field | Value | Notes |
| :--- | :--- | :--- |
| **Name** | `campusai-backend` | Will create `https://campusai-backend.onrender.com` |
| **Region** | `Oregon (US West)` | Or closest to your location |
| **Branch** | `main` | Production branch |
| **Root Directory** | `backend` | **Important:** Set to `backend` |
| **Runtime** | `Node` | Node.js environment |
| **Build Command** | `npm install && npm run build` | Installs deps, generates Prisma, compiles TypeScript |
| **Start Command** | `npm run start` | Runs `node dist/server.js` |
| **Instance Type** | `Free` | Free tier |

5. Scroll down to **Environment Variables** and click **Add Environment Variable**:

| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | `mongodb+srv://tabraizsmd_db_user:M3EcmHNdVHln8Utf@cluster0.31mtvlo.mongodb.net/campusai?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `campusai_super_secret_jwt_key_2026_production_grade` |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | `*` |

6. Expand **Advanced** and set **Health Check Path** to:
   ```
   /api/health
   ```
7. Click **Create Web Service**.
8. Render will start building the backend. Wait ~2–3 minutes until it says **"Live"**.

---

## 🌱 Step 2: Seed the MongoDB Database

Once the backend service shows **Live**:

1. In the Render Dashboard, open your **`campusai-backend`** service.
2. Click the **Shell** tab on the left navigation menu.
3. Run the following command inside the shell:
   ```bash
   npx tsx prisma/seed.ts
   ```
4. You will see:
   ```
   🌱 Seeding CampusAI database with realistic campus data...
   ✅ CampusAI database seeded successfully!
   Demo Accounts:
     Student: student@college.edu / password123
     Faculty: faculty@college.edu / password123
     Admin:   admin@college.edu / admin123
   ```

---

## 💻 Step 3: Deploy Frontend Static Site on Render

1. In the Render Dashboard, click **New +** ➔ Select **Static Site**.
2. Connect your GitHub repository.
3. Fill in the frontend configuration:

| Field | Value | Notes |
| :--- | :--- | :--- |
| **Name** | `campusai-frontend` | Will create `https://campusai-frontend.onrender.com` |
| **Branch** | `main` | Production branch |
| **Root Directory** | `frontend` | **Important:** Set to `frontend` |
| **Build Command** | `npm install && npm run build` | Builds the Vite React SPA |
| **Publish Directory**| `dist` | Built static folder |

4. Under **Environment Variables**, add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://campusai-backend.onrender.com` *(Replace with your actual backend Render URL)*

5. Scroll down to **Redirects / Rewrites** and click **Add Rule**:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
   *(This enables React client-side routing so refreshing `/dashboard` or `/assistant` does not return 404)*

6. Click **Create Static Site**.
7. Wait ~1–2 minutes until the status shows **"Live"**.

---

## 🔍 Step 4: Verification & Smoke Test

1. **Verify Backend Health:**
   ```bash
   curl -i https://campusai-backend.onrender.com/api/health
   ```
   *Expected response: HTTP 200 `{"status":"healthy","service":"CampusAI Core API Engine","version":"1.0.0"}`*

2. **Open Frontend Web Application:**
   - Open `https://campusai-frontend.onrender.com` in your browser.
   - Click the **"Student (Alex)"** 1-click demo button to log in.
   - Test asking the AI: *"What's happening on campus today?"*
   - Test campus navigation and smart cafeteria recommendations.

---

## 🔒 MongoDB Atlas Network Access Note

Make sure your MongoDB Atlas cluster allows incoming connections from Render:
1. Open **[cloud.mongodb.com](https://cloud.mongodb.com/)**.
2. Go to **Network Access** under Security on the left sidebar.
3. Verify that IP Address `0.0.0.0/0` (Allow Access from Anywhere) is added to the IP Access List.
