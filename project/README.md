# Campus Gardening Management System

A modern, standalone web application built with **HTML5, Vanilla CSS, and JavaScript**. Features a rich interactive user interface with dark/light theme support, automated stat counters, data table pagination, sorting, search, filtering, modal dialogs, and a full in-memory data store for seamless local execution and cloud hosting without requiring external servers or databases.

## Quick Start
Open frontend/login.html or frontend/index.html directly in any modern browser!
```

Open login.html** in your browser. Sign in with the demo credentials:
- **Username**: `admin`
- **Password**: `admin123`

---

## Directory Structure

```
project/
├── frontend/                  Static Web Application (HTML, CSS, JS)
│   ├── css/                   Modular stylesheets & dark/light theme variables
│   │   ├── style.css          Core layout & components
│   │   └── *.css              Page-specific custom styles
│   ├── js/                    JavaScript logic & data layer
│   │   ├── data.js            Central in-memory database store
│   │   ├── api.js             Resource API wrappers & mock engine
│   │   ├── auth-guard.js      Route guard, session manager & user topbar
│   │   ├── main.js            Core UI engine (DataTable, Theme, Modal, Toast)
│   │   └── *.js               Page-specific view controllers
│   └── *.html                 Interactive dashboard & management views
└── database/
    └── garden.sql             SQL schema reference definition
```

---

## Features & Modules

- **Dashboard**: High-level overview cards, plants per section charts, task status breakdown, recent plantings, and urgent action items.
- **Plants Management**: Filter, search, sort, and manage campus flora with caretakers and irrigation tracking.
- **Garden Sections**: Manage physical garden plots, sqft area dimensions, signboards, and security assignments.
- **Staff & Workers**: Track gardening team roles, schedules, salaries, and assigned plots.
- **Equipment & Inventory**: Keep inventory of tools, warranties, vendor suppliers, and material types.
- **Fertilizers & Pest Control**: Track organic nutrients, stock levels, expiry dates, and pest treatment logs.
- **Maintenance & Tasks**: Manage maintenance schedules, priority levels, and task queues.
- **Irrigation & Climate**: Monitor watering system types, water usage metrics, and daily climate sensor logs.
- **Visitors & Security**: System for visitor entry passes, family/student cards, and security group shifts.
- **SQL Simulator**: In-browser SQL query tool for experimenting with sample queries directly against the schema.

---

## Technical Architecture

- **Zero External Dependencies**: Pure Vanilla JS, native HTML5, and CSS3. No heavy frameworks or build steps required.
- **Responsive & Dynamic Design**: Tailored CSS variable system with seamless light & dark mode switching.
- **Re-usable DataTable Engine**: Unified search, sort, filter, and pagination implementation across all data views.
- **In-Memory Persistence**: Reactive client-side data store (`data.js` & `api.js`) providing instant responsiveness.
