# 🌿 Campus Gardening Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.19-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-336791.svg)](https://www.postgresql.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

A web-based **Campus Gardening & Botanical Management System** designed for managing campus garden zones, flora cataloging, staff assignments, equipment inventory, maintenance operations, and visitor access control. 

The project features a **Dual-Mode Architecture**: it seamlessly connects to a **Node.js/Express REST API** backed by a **PostgreSQL relational database** (with 23 normalized 3NF tables), while automatically falling back to an in-memory **LocalStorage engine** when running offline without a database server.

---

## 🖥️ User Interface & Modules

The web frontend includes 6 primary interactive management views:

1. 📊 **Dashboard Overview (`index.html`)**: Real-time stats (total plants, garden sections, active staff, equipment items), urgent maintenance task alerts, and connection status badge.
2. 🌱 **Cultivation & Plants (`plants.html`)**: Track plant species (`Plant_ID`, `Name`, `Section_ID`, `Staff_ID`, `System_ID`, `Date_Planted`, `Status`) with full search, sorting, pagination, and CRUD modal controls.
3. 🏞️ **Garden Sections & Plots (`sections.html`)**: Manage physical garden plots (`Section_ID`, `Name`, `Area` in sqft, `sign_board` indicator, and assigned `Security_ID`).
4. 👥 **Staff Directory & Roles (`staff.html`)**: Manage gardening team members (`Staff_ID`, `Name`, `role`, `DOB`, `contact`, `salary`) and duty assignments.
5. 🛠️ **Equipment & Vendors (`equipment.html`)**: Track tools and machinery (`Equipment_ID`, `Name`, `material`, `warranty`, `cost`, `Vendor_ID`).
6. 🗓️ **Operations & Maintenance Tasks (`maintenance.html`)**: Work order management (`Schedule_ID`, `Staff_ID`, `Task_Type`, `Frequency`, `Priority`, `Status`).
7. 🎫 **Visitors & Access Pass (`visitors.html`)**: Visitor records (`Visitor_ID`, `Name`, `contact`, `Entry_Time`), student/faculty cards, and security group shifts.
8. 🔑 **Authentication (`login.html`)**: Session access guard with demo credentials (`admin` / `admin123`).

---

## 🏗️ Architecture & Dual-Mode Engine

```
                      +---------------------------------------+
                      |       Frontend Web Application        |
                      | (HTML5, Vanilla CSS, JS Controllers)  |
                      +-------------------+-------------------+
                                          |
                                          v
                               +---------------------+
                               |  js/api-client.js   |
                               +---+-------------+---+
                                   |             |
                (Backend Available)|             |(Backend Offline)
                                   v             v
             +-----------------------+         +-----------------------+
             | Node.js / Express     |         | LocalStorage Engine   |
             | REST API (Port 3000)  |         | (js/data.js)          |
             +-----------+-----------+         +-----------------------+
                         |
                         v
             +-----------------------+
             | PostgreSQL Database   |
             | (23 Normalized Tables)|
             +-----------------------+
```

---

## 📂 Project Structure

```
DBMS_PROJECT/
├── README.md                      # Primary repository documentation
└── project/                       # Core application codebase
    ├── server.js                  # Express REST API backend & PostgreSQL pool
    ├── package.json               # Node.js dependencies (express, pg, cors, dotenv)
    ├── .env                       # Environment config (Port, DB credentials)
    ├── API_DOCUMENTATION.md       # API endpoint documentation
    ├── database/
    │   └── garden.sql             # PostgreSQL 3NF schema, functions & sample data
    └── frontend/                  # Responsive web interface
        ├── index.html             # Dashboard overview view
        ├── plants.html            # Cultivation / Plant catalog view
        ├── sections.html          # Garden sections / Plot view
        ├── staff.html             # Staff directory view
        ├── equipment.html         # Equipment & tools inventory view
        ├── maintenance.html       # Maintenance operations view
        ├── visitors.html          # Visitors & access pass view
        ├── login.html             # Login screen
        ├── css/
        │   └── style.css          # Core design system & theme variables
        └── js/
            ├── api-client.js      # Dual-mode API client (Fetch API + LocalStorage fallback)
            ├── data.js            # Initial mock dataset (23 tables) & LocalStorage store
            ├── auth-guard.js      # Authentication session guard
            ├── main.js            # Table pagination, sorting, search & modal handlers
            └── *.js               # View-specific controllers (plants.js, staff.js, etc.)
```

---

## ⚡ Quick Start & Setup Guide

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** (v14+ optional for database backend mode)

---

### 2. Installation & Configuration

1. Open your terminal and navigate to the `project` directory:
   ```bash
   cd project
   npm install
   ```

2. Configure environment variables in `project/.env`:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=Garden_section
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   ```

---

### 3. Database Setup (Optional for PostgreSQL Mode)

To use PostgreSQL, create the `Garden_section` database and run the schema file:

```bash
# Create PostgreSQL database
createdb -U postgres Garden_section

# Populate schema and 23 tables
psql -U postgres -d Garden_section -f database/garden.sql
```

---

### 4. Running the Application

#### Option A: Node.js + PostgreSQL Mode
Start the API backend server:

```bash
npm start
```
- Server API runs at: `http://localhost:3000/api`
- Frontend is served at: `http://localhost:3000`

#### Option B: Standalone / Offline LocalStorage Mode
No server setup needed! Simply double-click `project/frontend/login.html` or `project/frontend/index.html` to run directly in any web browser. The frontend auto-detects if the Express server is offline and switches to **LocalStorage Mode**.

---

## 🔑 Demo Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |

---

## 📊 Database Relational Model (23 Tables)

The underlying relational schema ([garden.sql](file:///e:/campus-gardening-management-system%20%281%29/project/database/garden.sql)) contains 23 normalized (3NF) tables:

- **Core Entities**: `plant`, `garden_section`, `staff`, `equipment`, `fertilizer`, `irrigation_system`, `irrigation_type`, `vendor`, `workshop`, `pest_control`, `maintenance_schedule`, `visitor`, `visitor_card`, `security_group`.
- **Logs & Audit**: `dead_plant_record`, `compost_bin`, `climate_log`.
- **Relationships & Mapping**: `attends`, `applies_fertilizer`, `applies_pest`, `uses`, `equip_maintain_by`, `visitor_access`.

---

## 🌐 API Endpoints Summary

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Check PostgreSQL database connection |
| `GET` | `/api/plants` | Fetch all plant records |
| `POST` | `/api/plants` | Create new plant record |
| `PUT` | `/api/plants/:id` | Update plant by ID |
| `DELETE` | `/api/plants/:id` | Delete plant by ID |
| `GET` | `/api/sections` | Fetch garden sections |
| `GET` | `/api/staff` | Fetch staff directory |
| `GET` | `/api/equipment` | Fetch equipment inventory |
| `GET` | `/api/maintenance` | Fetch maintenance schedule |
| `GET` | `/api/visitors` | Fetch visitor logs |

*(See [API_DOCUMENTATION.md](file:///e:/campus-gardening-management-system%20%281%29/project/API_DOCUMENTATION.md) for full endpoint specifications).*

---

## 📜 License

Distributed under the [MIT License](LICENSE).
