# CampusAI — Intelligent Hyperlocal Campus Assistant
> *"Navigate. Discover. Connect. Experience Campus."*

An enterprise-grade, full-stack consumer AI web platform built for university campuses. CampusAI unifies conversational intelligence, interactive indoor/outdoor GIS navigation, AI-powered lost & found semantic matching, budget-aware cafeteria recommendations, 5-dimensional roommate compatibility matching, and personalized event discovery into one seamless application.

---

## 🌟 How CampusAI Solves the "AI for Campus Life / Hyperlocal Innovation" Challenge

Traditional university software consists of fragmented, outdated CRUD portals—separate portals for hostel allotments, notice boards on bulletin boards, isolated cafeteria menus, and disorganized WhatsApp groups for lost items.

**CampusAI acts as a single intelligent campus operating system:**
1. **Hyperlocal Intelligence:** The AI understands campus-specific jargon (e.g. *"CS Block"*, *"Kalam Library"*, *"Anna Food Court"*, *"Kaveri Hostel"*) with verified knowledge grounding that prevents hallucinations.
2. **Intent-Driven Architecture:** Instead of forcing students to navigate complex nested menus, natural language queries like *"I lost my black wallet near the cafeteria"* or *"Find healthy lunch under ₹80"* automatically route to the corresponding engine and return structured, actionable UI cards.
3. **5-Dimensional Lifestyle Synergy:** Eliminates hostel room conflict by calculating compatibility across sleep cycles, study habits, cleanliness, budget, and social preferences.
4. **Safety & Privacy Preserving:** Students connect safely through in-app channels without publicly exposing phone numbers or private details.

---

## 🚀 Live Demo Credentials

The platform is pre-loaded with realistic Indian college campus data (Apex Institute of Technology & Science / Bangalore Campus). Quick 1-click login buttons are provided on the login page:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@college.edu` | `password123` | Alex Sharma (CS & Engg, 3rd Year) |
| **Faculty / Staff** | `faculty@college.edu` | `password123` | Dr. Rajesh Iyer (Professor of AI / Robotics Advisor) |
| **Administrator** | `admin@college.edu` | `admin123` | Vikram Malhotra (Chief Campus Administrator) |

---

## ⏱️ 3–5 Minute Judge Demonstration Flow

Follow this rapid demonstration flow for competition evaluations:

### Step 1: Instant Authentication (30s)
1. Open `http://localhost:5173/login`.
2. Click the **"Student (Alex)"** 1-click button to log in.
3. Arrive at the personalized Dashboard featuring a time-aware hero greeting (*"Good evening, Alex 👋"*), active campus telemetry counters, and recommendation cards.

### Step 2: Conversational AI Event Discovery (45s)
1. Navigate to `/assistant` or click any quick prompt.
2. Ask: **"What's happening on campus today?"**
3. Notice how the AI classifies the query into `EVENT_DISCOVERY`, calls `search_events()`, and returns formatted event cards (e.g., *HackCampus 2026*, *Keynote on Next-Gen Agentic AI*) with direct RSVP buttons.

### Step 3: Smart Cafeteria & Dietary Discovery (45s)
1. Ask the AI: **"Find the nearest cafeteria with food under ₹100."**
2. Notice how the AI detects `FOOD_RECOMMENDATION`, extracts the budget (`₹100`), queries `find_food()`, and displays food recommendation cards with **"Why this recommendation?"** rationale pills (e.g. *Special Masala Dosa ₹60*, *Comfort Rajma Chawal Bowl ₹75*).
3. Click into `/food` to explore full menus and toggle the **"Pure Veg"** or **"Healthy"** filters.

### Step 4: Lost & Found AI Semantic Matching (45s)
1. Navigate to `/lost-found`.
2. View the **"AI Potential Matches"** tab showing a **89% confidence match** between a reported lost *Black JBL Wireless Headphone* and a found *Black Wireless Over-Ear Headphone* turned into Anna Food Court.
3. Click **"Report Lost Item"**, fill in a test item, and watch the system instantly evaluate semantic similarity against all registered found items.

### Step 5: 5-Dimensional AI Roommate Matcher (45s)
1. Navigate to `/roommate`.
2. View high-compatibility candidates (e.g. *Kabir Nair — 94% Match*).
3. Click **"View 5-Dimension Compatibility Scores"** to reveal the breakdown:
   - Sleep Schedule: 90%
   - Study Habits: 95%
   - Cleanliness: 94%
   - Budget: 88%
   - Lifestyle: 91%
4. Click **"Connect Request"** to send a safe in-app roommate pairing invitation.

### Step 6: Campus GIS Navigation (45s)
1. Navigate to `/navigation`.
2. Select Origin: *Kaveri Boys Hostel* and Destination: *Ramanujan Computing Center*.
3. Click **"Calculate Walking Route"** or toggle **"Ramps Only (Accessible)"**.
4. Observe the interactive Leaflet map rendering the dashed path, estimated walking time (5 mins), route distance (420m), and turn-by-turn waypoints.

### Step 7: Admin Control Center & Grounded Knowledge Base (30s)
1. Log in as `admin@college.edu` (`admin123`) or switch roles.
2. Navigate to `/admin`.
3. Review platform KPIs (total students, active queries, lost & found match rate), daily active user trend bars, and AI intent distributions.
4. Switch to the **"AI Knowledge Base"** tab to view or add verified campus facts (timings, clinic hotlines, rules) that prevent LLM hallucination.

---

## 🏛️ High-Level System Architecture

```
Frontend (React 18 + TypeScript + Vite + Tailwind CSS + Leaflet)
   │
   │ REST API / WebSocket
   ▼
Backend API (Node.js + Express + TypeScript)
   ├── Authentication Middleware (JWT + bcryptjs + Role Guards)
   ├── AI Orchestration Layer (Intent Classifier + Entity Extraction)
   │     ├── IBM watsonx.ai Provider (IBM Granite-13b Foundation Model)
   │     └── Heuristic Semantic NLP Provider (Offline Zero-Latency Engine)
   ├── Controlled AI Backend Tools:
   │     ├── search_events()
   │     ├── find_nearby_locations()
   │     ├── find_food()
   │     ├── search_lost_found()
   │     ├── find_roommates()
   │     └── get_campus_information()
   ├── Navigation Service (Dijkstra Shortest-Path & Waypoint Synthesizer)
   ├── Matching Engine (Multi-Attribute Semantic Item & 5D Vector Similarity)
   └── Analytics Aggregation Service
   │
   ▼
Database Layer (Prisma ORM)
   ├── PostgreSQL 16 (Docker Production Deployment)
   └── SQLite (Instant Local Development Zero-Config Engine)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet, React-Leaflet, Canvas-Confetti, Axios |
| **Backend** | Node.js, Express.js, TypeScript, tsx, Vitest |
| **ORM & DB** | Prisma ORM, PostgreSQL 16 (Docker) / SQLite (Local) |
| **Security** | JWT (JSON Web Tokens), bcryptjs password hashing, Role-Based Access Control (RBAC), CORS, Input Sanitization |
| **AI Layer** | IBM watsonx.ai REST integration (`ibm/granite-13b-chat-v2`), IBM IAM Bearer Authentication, Fallback Heuristic NLP Classifier |
| **DevOps** | Docker, Docker Compose, Multi-stage Dockerfiles, Nginx |

---

## ⚙️ Quickstart & Local Setup

### Prerequisites
- Node.js (v18 or higher; v22 recommended)
- npm (v9 or higher)

### 1. Clone & Install Dependencies
```bash
# Backend installation
cd backend
npm install

# Push database schema & seed realistic campus data
npm run prisma:push
npm run prisma:seed

# Frontend installation
cd ../frontend
npm install
```

### 2. Run the Application Locally
In two separate terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 (Frontend Web App):**
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

Now open **`http://localhost:5173`** in your browser!

### 3. Run Automated Tests
```bash
cd backend
npm test
```
All 13 unit tests verify:
- Intent classification across 10 campus intents
- Entity extraction for budgets (`under ₹100`), locations, colors, and diets
- Lost & Found multi-attribute semantic similarity scoring
- 5-dimensional vector roommate compatibility formulas
- Campus route calculation and waypoint generation
- AI service tool orchestration

---

## 🐳 Docker Deployment

The application is fully containerized with PostgreSQL 16, Node.js Backend, and Nginx Frontend:

```bash
docker compose up --build
```
- Frontend: `http://localhost` or `http://localhost:5173`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

---

## 🔑 Environment Variables Reference

Create a `.env` file in `backend/` (or configure via root `.env.example`):

```ini
PORT=5000
NODE_ENV=production
DATABASE_URL="file:./campusai.db"
JWT_SECRET="campusai_super_secret_jwt_key_2026_production_grade"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"

# Optional: IBM watsonx.ai Live Cloud Integration
# Leave blank to automatically use the high-performance local heuristic NLP engine
IBM_API_KEY=""
IBM_PROJECT_ID=""
IBM_URL="https://us-south.ml.cloud.ibm.com"
```

---

## 📚 API Endpoints Overview

### Authentication
- `POST /api/auth/register` — Register student/faculty with college email validation
- `POST /api/auth/login` — Sign in and obtain JWT
- `GET /api/auth/me` — Authenticated user profile and unread counts
- `PUT /api/auth/profile` — Update department, year, bio

### AI Assistant
- `POST /api/ai/chat` — Conversational natural language chat with structured card output
- `POST /api/ai/classify-intent` — Query intent classification & entity extraction
- `GET /api/ai/conversations` — User conversation history
- `GET /api/ai/conversations/:id` — Conversation messages

### Navigation
- `GET /api/locations` — All campus locations with category/search filters
- `GET /api/locations/search?q=...` — Global omni-search
- `GET /api/navigation/route?originId=...&destinationId=...&accessibleMode=true` — Shortest path routing

### Lost & Found
- `GET /api/lost-found` — List active lost and found items
- `POST /api/lost-found/lost` — Submit lost report & trigger AI matching
- `POST /api/lost-found/found` — Turn in found item & trigger AI matching
- `GET /api/lost-found/matches` — List high-confidence item pairings

### Smart Cafeteria
- `GET /api/cafeterias` — List cafeterias, ratings, and operating hours
- `GET /api/food/recommendations?maxBudget=100&diet=veg` — Budget & dietary recommendations with AI rationale

### Roommate Matcher
- `GET /api/roommates/profile` — Current user's lifestyle questionnaire
- `POST /api/roommates/profile` — Save 12-factor questionnaire
- `GET /api/roommates/matches` — 5-factor vector compatibility ranking
- `POST /api/roommates/connect` — Send connection request

### Events
- `GET /api/events` — Campus events calendar
- `POST /api/events` — Create event notice (Faculty/Admin)
- `POST /api/events/:id/rsvp` — RSVP for event

### Admin
- `GET /api/admin/analytics` — Platform usage KPIs and chart data
- `GET /api/admin/users` — User directory
- `POST /api/admin/knowledge-base` — Add verified campus grounding record

---

## 🏆 Final Feature Verification Checklist

- [x] **Brand & Typography:** Poppins font used throughout, consumer AI product styling, modern light palette with deep navy accents.
- [x] **Conversational AI Assistant:** 3-column workspace with conversation history, structured UI cards, entity extraction, and intent classification.
- [x] **IBM watsonx Abstraction:** Decoupled AI service provider supporting live IBM Cloud foundation models and instant local heuristic fallback.
- [x] **Campus Navigation AI:** Interactive Leaflet GIS map with 10+ buildings, 20+ facilities, turn-by-turn routing, and accessible ramps mode.
- [x] **Lost & Found AI:** Multi-attribute semantic similarity matching engine with confidence % scoring and safe claim workflows.
- [x] **Smart Cafeteria:** Menus, open/closed timings, budget filters (under ₹50, under ₹80, under ₹120), veg/vegan badges, and *"Why this recommendation?"* AI rationale.
- [x] **Roommate Matcher:** 12-factor lifestyle questionnaire, 5-dimensional compatibility scoring, breakdown graphs, and private connection requests.
- [x] **Event Discovery:** Categorized events, RSVP tracking with celebratory confetti, and faculty creation modals.
- [x] **Admin Center:** Live telemetry KPIs, visual activity bar charts, user role management, and verified AI Knowledge Base editor.
- [x] **Responsive Mobile Layout:** Collapsible sidebar on tablets and dedicated bottom navigation bar on mobile devices.
- [x] **Automated Testing:** 13 unit tests verifying routing, matching, AI classification, and entity extraction.
- [x] **Docker Containerization:** Docker Compose with PostgreSQL 16, backend, and Nginx frontend.
