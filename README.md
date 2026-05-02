# 🏢 FOLKS HUB - Internal Management System

**FOLKS HUB** is a modern, data-driven internal management platform dedicated for **UKM FOLKS (Foreign Language ITK Society)**. Built with the hope of improving organizational efficiency, it centralizes all management tasks—members, tasks, finances, and real-time alerts—into one unified place.

---

## 🚀 Tech Stack

- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Package Manager:** [Bun](https://bun.sh/) (Extremely fast)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Backend-as-a-Service:** [Supabase](https://supabase.com/) (Auth, Database, RLS)
- **Containerization:** [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

---

## ✨ Features

- **📊 Dynamic Dashboard:** Real-time statistics, monthly cashflow charts, and unit performance tracking.
- **👥 Member Management:** Full CRUD for organizational profiles with role-based badges and batch filtering.
- **📋 Task Kanban Board:** Interactive drag-and-drop system to manage division programs.
- **💰 Finance Ledger:** Comprehensive tracking of income and expenses with approval workflows.
- **🔔 Notifications System:** Real-time alerts for every organizational action (Create, Update, Delete).
- **🔐 Secure Auth:** Integrated Supabase Authentication with Row Level Security (RLS).

---

## 🛠️ Getting Started

### Prerequisites
- **Windows:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.
- **Linux:** [Docker Engine](https://docs.docker.com/engine/install/) & [Docker Compose](https://docs.docker.com/compose/install/) installed.
- A [Supabase](https://supabase.com/) project (URL and Anon Key).

### 1. Setup Environment

#### **🪟 Windows (PowerShell)**
```powershell
copy .env.example .env
```

#### **🐧 Linux / macOS (Bash)**
```bash
cp .env.example .env
```
*After creating `.env`, fill in your Supabase credentials and Gemini API key.*

### 2. Database Setup
A unified SQL setup script is provided in the root directory. Execute the following in your **Supabase SQL Editor**:
1. Copy the contents of `supabase_setup.sql`.
2. Paste and run it in your Supabase SQL Editor. This will generate all the required tables (profiles, tasks, split_bills, transactions, monthly_cash) and set up the necessary Row Level Security (RLS) policies.

### 3. Running with Docker (Recommended)

#### **🛠️ Development Mode (with Hot-Reload)**
*Best for active coding. Local file changes reflect instantly.*

**Windows (CMD/PowerShell/Git Bash):**
```bash
docker compose -f docker-compose.dev.yml up --build
```

**Linux (Sudo might be required):**
```bash
sudo docker compose -f docker-compose.dev.yml up --build
```
Access at: `http://localhost:3000`

#### **🚢 Production Mode**
*Optimized build served via Nginx.*

**Windows:**
```bash
docker compose up --build -d
```

**Linux:**
```bash
sudo docker compose up --build -d
```
Access at: `http://localhost:8080`

---

## 📂 Project Structure

```text
folks-hub/
├── src/
│   ├── components/     # Reusable UI & Layout components
│   ├── lib/            # Utilities, constants, and API clients
│   ├── pages/          # Main application views/screens
│   ├── store/          # Zustand state management
│   └── App.tsx         # Main application entry & routing
├── Dockerfile          # Production build configuration
├── docker-compose.yml  # Production orchestration
├── docker-compose.dev.yml # Development orchestration
├── supabase_setup.sql  # Unified Supabase DB setup script
└── nginx.conf          # Nginx configuration for SPA routing
```

---

## 📝 Local Development (Non-Docker)

If you prefer running the application locally without Docker, you can use either **Bun** (Recommended) or **Node.js**.

### **Option A: Using Bun (Fastest)**
- `bun install`: Install dependencies
- `bun run dev`: Start development server at `localhost:3000`
- `bun run build`: Build for production

### **Option B: Using Node.js (npm)**
- `npm install`: Install dependencies
- `npm run dev`: Start development server at `localhost:3000`
- `npm run build`: Build for production

---

## 👥 Development Team

This platform is developed and maintained by the **Executive Leadership of Creative Media & Finance**:

- **Akmal Falah Maulana** ([@shirotenma](https://github.com/shirotenma))  
  *Lead of Creative Media 2025/2026*  
  NIM: 11231006 | Cohort 2023
  
- **Ansellma Tita Pakartiwuri Putri** ([@secretceremony](https://github.com/secretceremony))  
  *Treasurer 2025/2026*  
  NIM: 10231017 | Cohort 2023

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Made with dedication to make FOLKS better.
