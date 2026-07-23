# 🌿 Campus Gardening Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.19-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-336791.svg)](https://www.postgresql.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

A comprehensive, full-stack **Campus Gardening & Botanical Management System** built with a **Node.js/Express REST API backend**, a **PostgreSQL relational database**, and a dynamic, modern **HTML5/CSS3/Vanilla JS frontend**. 

The system features **Dual-Mode Architecture**: seamlessly connecting to a live PostgreSQL backend while automatically falling back to an in-memory `LocalStorage` engine if the backend database is offline.

---

## 📸 Key Features & Modules

- 📊 **Interactive Dashboard**: Real-time summary statistics, plants-per-section visual breakdown, task status tracking, low-stock inventory alerts, and urgent action items.
- 🌱 **Plant Catalog**: Full CRUD operations for managing campus flora, care requirements, category tagging, section assignment, and growth status tracking.
- 🏞️ **Garden Sections**: Zone dimension tracking, signboard availability, plot area management, and guard assignment.
- 👥 **Staff & Worker Directory**: Role management, salary tracking, work shifts, assigned garden sections, and contact records.
- 🛠️ **Equipment & Inventory**: Track gardening tools, equipment status, stock levels, vendor suppliers, and warranty dates.
- 💧 **Irrigation & Water Systems**: Water usage monitoring, sensor metrics, irrigation type configuration (Drip, Sprinkler, Manual), and schedule logs.
- 🐛 **Pest Control & Fertilizers**: Log chemical and organic pesticide treatments, treatment dates, target pests, stock expiry, and safety protocols.
- 🗓️ **Maintenance Schedules**: Task queues, priority badges (Urgent, High, Medium, Low), status workflows, and worker task assignments.
- 🎫 **Visitors & Security Pass**: Manage visitor entries, family/student cards, security group shifts, and campus security logs.
- 💻 **In-Browser SQL Simulator**: Live SQL console allowing users to write and execute queries directly against the mock and relational schema.
- 🌓 **Dark / Light Theme**: Built-in dynamic theme switcher with persistent CSS custom variables.

---

## 🏗️ Architecture & Dual-Mode System

```
                      +-----------------------------+
                      |   Frontend (HTML/CSS/JS)    |
                      +--------------+--------------+
                                     |
                          +----------+----------+
                          |  js/api-client.js   |
                          +----+-----------+----+
                               |           |
            (Backend Connected)|           |(Fallback / Offline)
                               v           v
            +--------------------+       +--------------------+
            | Node.js / Express  |       | LocalStorage       |
            | REST API (Port 3000|       | GardenData Engine  |
            +---------+----------+       +--------------------+
                      |
                      v
            +--------------------+
            | PostgreSQL Database|
            | (23 Relational 3NF |
            |  Database Tables)  |
            +--------------------+
```

---

## 📂 Project Structure

```
.
└── project/
    ├── server.js                   # Express REST API backend server & PostgreSQL connection pool
    ├── package.json                # Node.js dependencies (express, pg, cors, dotenv)
    ├── API_DOCUMENTATION.md        # Full REST API endpoint reference
    ├── README.md                   # System documentation & setup guide
    ├── .env                        # Environment configuration (DB credentials & Port)
    ├── database/
    │   └── garden.sql              # Normalized 3NF PostgreSQL relational schema & sample data
    └── frontend/                   # Client-side single/multi-page web application
        ├── index.html              # Main dashboard view
        ├── plants.html             # Plant management view
        ├── sections.html           # Garden sections view
        ├── staff.html              # Staff directory view
        ├── equipment.html          # Equipment & inventory view
        ├── maintenance.html        # Maintenance schedules view
        ├── visitors.html           # Visitor & security management
        ├── login.html              # Authentication & login screen
        ├── css/                    # Modular design system & theme variables
        │   ├── style.css           # Core layout, CSS variables & component styles
        │   └── *.css               # Page-specific custom styles
        └── js/                     # Application logic & client controllers
            ├── api-client.js       # Dual-mode API client (Fetch + LocalStorage fallback)
            ├── data.js             # Initial mock dataset & local table storage
            ├── auth-guard.js       # Session control & page security guard
            ├── main.js             # DataTable engine, modals, theme switcher & toast notifications
            └── *.js                # Page-specific UI controller scripts
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **PostgreSQL** (v14 or higher - *optional for LocalStorage mode*)

---

### 2. Environment Setup

Clone the repository and navigate into the `project` directory:

```bash
cd project
npm install
```

Create or edit the `.env` file in `project/`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Garden_section
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

---

### 3. Database Setup (PostgreSQL)

If using PostgreSQL, create the database and run the schema script:

```bash
# Create database in PostgreSQL
createdb -U postgres Garden_section

# Execute the 3NF schema script
psql -U postgres -d Garden_section -f database/garden.sql
```

---

### 4. Running the Application

#### Option A: Running with Node.js & PostgreSQL Backend
Start the Express server:

```bash
npm start
```
- The REST API will run at: `http://localhost:3000/api`
- The Web App frontend will be served at: `http://localhost:3000`

#### Option B: Standalone Static / LocalStorage Mode
No server installation required! Simply open `project/frontend/login.html` or `project/frontend/index.html` directly in any web browser. The `api-client.js` will automatically detect that the backend is offline and switch to **LocalStorage Mode**.

---

## 🔑 Demo Credentials

| Role | Username | Password |
|---|---|---|
| Administrator | `admin` | `admin123` |

---

## 📊 Database Schema Summary (23 Tables)

The system manages 23 relational database tables normalized to **3NF**:

1. `users` — System user credentials & roles
2. `garden_areas` / `sections` — Plot areas, locations, signboards & square footage
3. `plants` — Plant species, category, planting date, health status
4. `workers` / `staff` — Team members, roles, contact details & salaries
5. `equipment` — Inventory, serial numbers, vendor links, working condition
6. `maintenance_schedules` — Scheduled garden upkeep, task priority & assignments
7. `irrigation_systems` & `irrigation_types` — Automated watering setups & flow rates
8. `pest_control` — Pesticide treatments, schedules & target pests
9. `workshops` — Educational gardening events, hosts & attendee counts
10. `vendors` — Suppliers for plants, tools, and fertilizers
11. `visitors` & `visitor_cards` — Gate passes, visitor logs & access cards
12. `security_groups` — Guard shifts, security zones & patrol assignments
*...and additional lookup & relationship mapping tables.*

---

## 🌐 REST API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check PostgreSQL database connection status |
| `GET` | `/api/plants` | Fetch all plants from database |
| `DELETE` | `/api/plants/:id` | Remove plant entry by ID |
| `PUT` | `/api/plants/:id` | Update plant entry details |
| `GET` | `/api/sections` | Fetch garden sections |
| `GET` | `/api/staff` | Fetch staff directory |
| `GET` | `/api/equipment` | Fetch equipment inventory |
| `GET` | `/api/maintenance` | Fetch maintenance schedule queue |

*(See [API_DOCUMENTATION.md](file:///e:/campus-gardening-management-system%20%281%29/project/API_DOCUMENTATION.md) for the complete API reference).*

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
