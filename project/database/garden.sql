-- ============================================================================
-- CAMPUS GARDENING MANAGEMENT SYSTEM — PostgreSQL Schema
-- ============================================================================
-- Normalized to 3NF. Run this file top-to-bottom on a fresh database:
--   psql -U postgres -d garden_db -f database/garden.sql
--
-- Sections in this file:
--   1. Extensions
--   2. Tables (with PK / FK / CHECK / NOT NULL / UNIQUE constraints)
--   3. Indexes
--   4. Views
--   5. Trigger functions + triggers
--   6. Stored functions / procedures
--   7. Sample data (INSERTs)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
-- Clean slate (safe to re-run during development)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- used for password hashing (crypt/gen_salt)

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- users — Admin / staff accounts that can log into the dashboard
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    user_id        SERIAL PRIMARY KEY,
    username       VARCHAR(50)  NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    full_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(120) UNIQUE,
    role           VARCHAR(20)  NOT NULL DEFAULT 'admin'
                       CHECK (role IN ('admin', 'manager', 'staff')),
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- garden_areas — Physical zones/sections of the campus garden
-- ---------------------------------------------------------------------------
CREATE TABLE garden_areas (
    area_id        SERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL UNIQUE,
    area_sqft      NUMERIC(10,2) NOT NULL CHECK (area_sqft > 0),
    has_signboard  BOOLEAN      NOT NULL DEFAULT FALSE,
    description    TEXT,
    created_at     TIMESTAMP    NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- plant_categories — Lookup table for plant taxonomy/grouping
-- ---------------------------------------------------------------------------
CREATE TABLE plant_categories (
    category_id    SERIAL PRIMARY KEY,
    name           VARCHAR(80) NOT NULL UNIQUE,
    description    TEXT
);

-- ---------------------------------------------------------------------------
-- vendors — Suppliers of tools and fertilizers (supporting lookup table,
-- required to keep tools/fertilizers normalized rather than storing vendor
-- details redundantly on every row)
-- ---------------------------------------------------------------------------
CREATE TABLE vendors (
    vendor_id           SERIAL PRIMARY KEY,
    name                VARCHAR(120) NOT NULL,
    contact_phone       VARCHAR(20),
    city                VARCHAR(80),
    performance_rating  NUMERIC(2,1) CHECK (performance_rating BETWEEN 0 AND 5),
    created_at          TIMESTAMP DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- workers — Staff and volunteers who work in the garden
-- ---------------------------------------------------------------------------
CREATE TABLE workers (
    worker_id       SERIAL PRIMARY KEY,
    full_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(50)  NOT NULL,
    is_volunteer    BOOLEAN      NOT NULL DEFAULT FALSE,
    date_of_birth   DATE,
    contact_phone   VARCHAR(20),
    email           VARCHAR(120) UNIQUE,
    salary          NUMERIC(10,2) CHECK (salary IS NULL OR salary >= 0),
    hire_date       DATE         NOT NULL DEFAULT CURRENT_DATE,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------------
-- irrigation_types — Lookup table for watering method + water usage level
-- ---------------------------------------------------------------------------
CREATE TABLE irrigation_types (
    irrigation_type_id  SERIAL PRIMARY KEY,
    type_name           VARCHAR(50) NOT NULL UNIQUE,
    water_usage_level   VARCHAR(10) NOT NULL
                             CHECK (water_usage_level IN ('Low', 'Medium', 'High'))
);

-- ---------------------------------------------------------------------------
-- plants — Individual plant records
-- ---------------------------------------------------------------------------
CREATE TABLE plants (
    plant_id            SERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    category_id         INT REFERENCES plant_categories(category_id) ON DELETE SET NULL,
    area_id             INT REFERENCES garden_areas(area_id) ON DELETE SET NULL,
    assigned_worker_id  INT REFERENCES workers(worker_id) ON DELETE SET NULL,
    irrigation_type_id  INT REFERENCES irrigation_types(irrigation_type_id) ON DELETE SET NULL,
    date_planted        DATE NOT NULL DEFAULT CURRENT_DATE,
    status              VARCHAR(20) NOT NULL DEFAULT 'Healthy'
                             CHECK (status IN ('Healthy', 'Needs Attention', 'Diseased', 'Dead')),
    created_at          TIMESTAMP DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- plant_inventory — Nursery stock counts per category, optionally per area
-- ---------------------------------------------------------------------------
CREATE TABLE plant_inventory (
    inventory_id    SERIAL PRIMARY KEY,
    category_id     INT NOT NULL REFERENCES plant_categories(category_id) ON DELETE CASCADE,
    area_id         INT REFERENCES garden_areas(area_id) ON DELETE SET NULL,
    quantity        INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit            VARCHAR(20) NOT NULL DEFAULT 'units',
    reorder_level   INT NOT NULL DEFAULT 5 CHECK (reorder_level >= 0),
    last_restocked  DATE,
    UNIQUE (category_id, area_id)
);

-- ---------------------------------------------------------------------------
-- tools — Garden equipment inventory
-- ---------------------------------------------------------------------------
CREATE TABLE tools (
    tool_id          SERIAL PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    material         VARCHAR(50),
    vendor_id        INT REFERENCES vendors(vendor_id) ON DELETE SET NULL,
    cost             NUMERIC(10,2) CHECK (cost IS NULL OR cost >= 0),
    warranty_months  INT DEFAULT 0 CHECK (warranty_months >= 0),
    purchase_date    DATE DEFAULT CURRENT_DATE,
    condition        VARCHAR(20) NOT NULL DEFAULT 'Good'
                          CHECK (condition IN ('Good', 'Needs Repair', 'Retired'))
);

-- ---------------------------------------------------------------------------
-- tool_assignments — Which worker currently holds which tool
-- ---------------------------------------------------------------------------
CREATE TABLE tool_assignments (
    assignment_id   SERIAL PRIMARY KEY,
    tool_id         INT NOT NULL REFERENCES tools(tool_id) ON DELETE CASCADE,
    worker_id       INT NOT NULL REFERENCES workers(worker_id) ON DELETE CASCADE,
    assigned_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    returned_date   DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'Assigned'
                        CHECK (status IN ('Assigned', 'Returned', 'Lost')),
    CHECK (returned_date IS NULL OR returned_date >= assigned_date)
);

-- ---------------------------------------------------------------------------
-- fertilizers — Fertilizer product catalog / stock
-- ---------------------------------------------------------------------------
CREATE TABLE fertilizers (
    fertilizer_id   SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    vendor_id       INT REFERENCES vendors(vendor_id) ON DELETE SET NULL,
    nutrient_type   VARCHAR(50),
    stock_level     INT NOT NULL DEFAULT 0 CHECK (stock_level >= 0),
    expiry_date     DATE
);

-- ---------------------------------------------------------------------------
-- watering_schedules — Recurring watering plan per plant
-- ---------------------------------------------------------------------------
CREATE TABLE watering_schedules (
    schedule_id     SERIAL PRIMARY KEY,
    plant_id        INT NOT NULL REFERENCES plants(plant_id) ON DELETE CASCADE,
    frequency_days  INT NOT NULL CHECK (frequency_days > 0),
    last_watered    DATE,
    next_due        DATE,
    notes           TEXT
);

-- ---------------------------------------------------------------------------
-- fertilizer_schedules — Fertilizer application history/plan per plant
-- ---------------------------------------------------------------------------
CREATE TABLE fertilizer_schedules (
    schedule_id     SERIAL PRIMARY KEY,
    plant_id        INT NOT NULL REFERENCES plants(plant_id) ON DELETE CASCADE,
    fertilizer_id   INT NOT NULL REFERENCES fertilizers(fertilizer_id) ON DELETE CASCADE,
    applied_by      INT REFERENCES workers(worker_id) ON DELETE SET NULL,
    applied_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    next_due_date   DATE
);

-- ---------------------------------------------------------------------------
-- gardening_tasks — General to-do / maintenance task board
-- ---------------------------------------------------------------------------
CREATE TABLE gardening_tasks (
    task_id             SERIAL PRIMARY KEY,
    title               VARCHAR(150) NOT NULL,
    description         TEXT,
    area_id             INT REFERENCES garden_areas(area_id) ON DELETE SET NULL,
    assigned_worker_id  INT REFERENCES workers(worker_id) ON DELETE SET NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'Pending'
                             CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Overdue')),
    priority            VARCHAR(10) NOT NULL DEFAULT 'Medium'
                             CHECK (priority IN ('Low', 'Medium', 'High')),
    due_date            DATE,
    created_at          TIMESTAMP DEFAULT now(),
    completed_at        TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- maintenance_logs — Historical record of completed maintenance actions
-- ---------------------------------------------------------------------------
CREATE TABLE maintenance_logs (
    log_id        SERIAL PRIMARY KEY,
    area_id       INT REFERENCES garden_areas(area_id) ON DELETE SET NULL,
    tool_id       INT REFERENCES tools(tool_id) ON DELETE SET NULL,
    worker_id     INT REFERENCES workers(worker_id) ON DELETE SET NULL,
    description   TEXT NOT NULL,
    log_date      DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ---------------------------------------------------------------------------
-- events — Public/staff garden events and workshops
-- ---------------------------------------------------------------------------
CREATE TABLE events (
    event_id        SERIAL PRIMARY KEY,
    title           VARCHAR(150) NOT NULL,
    description     TEXT,
    area_id         INT REFERENCES garden_areas(area_id) ON DELETE SET NULL,
    event_date      DATE NOT NULL,
    duration_hours  NUMERIC(4,1) CHECK (duration_hours IS NULL OR duration_hours > 0),
    fee             NUMERIC(8,2) DEFAULT 0 CHECK (fee >= 0),
    created_at      TIMESTAMP DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- plant_health_records — Time-series health checks per plant
-- ---------------------------------------------------------------------------
CREATE TABLE plant_health_records (
    record_id       SERIAL PRIMARY KEY,
    plant_id        INT NOT NULL REFERENCES plants(plant_id) ON DELETE CASCADE,
    recorded_by     INT REFERENCES workers(worker_id) ON DELETE SET NULL,
    check_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    health_status   VARCHAR(20) NOT NULL
                         CHECK (health_status IN ('Healthy', 'Needs Attention', 'Diseased', 'Dead')),
    notes           TEXT
);

-- ---------------------------------------------------------------------------
-- notifications — In-app notifications for users
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
    notification_id  SERIAL PRIMARY KEY,
    user_id          INT REFERENCES users(user_id) ON DELETE CASCADE,
    title            VARCHAR(150) NOT NULL,
    message          TEXT NOT NULL,
    type             VARCHAR(20) NOT NULL DEFAULT 'info'
                          CHECK (type IN ('info', 'warning', 'success', 'error')),
    is_read          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================
-- Foreign key columns (Postgres does not auto-index FKs)
CREATE INDEX idx_plants_category            ON plants(category_id);
CREATE INDEX idx_plants_area                ON plants(area_id);
CREATE INDEX idx_plants_worker              ON plants(assigned_worker_id);
CREATE INDEX idx_plants_irrigation          ON plants(irrigation_type_id);
CREATE INDEX idx_plants_status              ON plants(status);
CREATE INDEX idx_plants_name                ON plants(name);

CREATE INDEX idx_inventory_category         ON plant_inventory(category_id);
CREATE INDEX idx_inventory_area             ON plant_inventory(area_id);

CREATE INDEX idx_tools_vendor               ON tools(vendor_id);
CREATE INDEX idx_tools_condition            ON tools(condition);

CREATE INDEX idx_tool_assign_tool           ON tool_assignments(tool_id);
CREATE INDEX idx_tool_assign_worker         ON tool_assignments(worker_id);
CREATE INDEX idx_tool_assign_status         ON tool_assignments(status);

CREATE INDEX idx_fertilizers_vendor         ON fertilizers(vendor_id);

CREATE INDEX idx_watering_plant             ON watering_schedules(plant_id);
CREATE INDEX idx_watering_next_due          ON watering_schedules(next_due);

CREATE INDEX idx_fert_sched_plant           ON fertilizer_schedules(plant_id);
CREATE INDEX idx_fert_sched_fertilizer      ON fertilizer_schedules(fertilizer_id);

CREATE INDEX idx_tasks_area                 ON gardening_tasks(area_id);
CREATE INDEX idx_tasks_worker               ON gardening_tasks(assigned_worker_id);
CREATE INDEX idx_tasks_status               ON gardening_tasks(status);
CREATE INDEX idx_tasks_due_date             ON gardening_tasks(due_date);

CREATE INDEX idx_maint_logs_area            ON maintenance_logs(area_id);
CREATE INDEX idx_maint_logs_worker          ON maintenance_logs(worker_id);

CREATE INDEX idx_events_area                ON events(area_id);
CREATE INDEX idx_events_date                ON events(event_date);

CREATE INDEX idx_health_records_plant       ON plant_health_records(plant_id);

CREATE INDEX idx_notifications_user         ON notifications(user_id);
CREATE INDEX idx_notifications_unread       ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================================
-- 4. VIEWS
-- ============================================================================

-- Full plant detail, joined across category / area / worker / irrigation
CREATE VIEW v_plant_details AS
SELECT
    p.plant_id,
    p.name              AS plant_name,
    pc.name              AS category_name,
    ga.name              AS area_name,
    w.full_name          AS caretaker_name,
    it.type_name         AS irrigation_type,
    p.date_planted,
    p.status
FROM plants p
LEFT JOIN plant_categories pc ON p.category_id = pc.category_id
LEFT JOIN garden_areas ga     ON p.area_id = ga.area_id
LEFT JOIN workers w           ON p.assigned_worker_id = w.worker_id
LEFT JOIN irrigation_types it ON p.irrigation_type_id = it.irrigation_type_id;

-- Task board with resolved area/worker names
CREATE VIEW v_task_board AS
SELECT
    t.task_id,
    t.title,
    t.status,
    t.priority,
    t.due_date,
    ga.name        AS area_name,
    w.full_name    AS assigned_to
FROM gardening_tasks t
LEFT JOIN garden_areas ga ON t.area_id = ga.area_id
LEFT JOIN workers w       ON t.assigned_worker_id = w.worker_id;

-- Inventory items at or below their reorder level
CREATE VIEW v_low_stock_inventory AS
SELECT
    inv.inventory_id,
    pc.name        AS category_name,
    ga.name        AS area_name,
    inv.quantity,
    inv.reorder_level,
    inv.unit
FROM plant_inventory inv
JOIN plant_categories pc ON inv.category_id = pc.category_id
LEFT JOIN garden_areas ga ON inv.area_id = ga.area_id
WHERE inv.quantity <= inv.reorder_level;

-- Per-worker current workload (open tasks + tools currently assigned)
CREATE VIEW v_worker_workload AS
SELECT
    w.worker_id,
    w.full_name,
    w.role,
    COUNT(DISTINCT t.task_id)  FILTER (WHERE t.status IN ('Pending','In Progress','Overdue')) AS open_tasks,
    COUNT(DISTINCT ta.assignment_id) FILTER (WHERE ta.status = 'Assigned')                    AS tools_in_hand
FROM workers w
LEFT JOIN gardening_tasks t   ON t.assigned_worker_id = w.worker_id
LEFT JOIN tool_assignments ta ON ta.worker_id = w.worker_id
GROUP BY w.worker_id, w.full_name, w.role;

-- Watering due within the next 3 days
CREATE VIEW v_upcoming_watering AS
SELECT
    ws.schedule_id,
    p.name       AS plant_name,
    ga.name      AS area_name,
    ws.next_due,
    ws.frequency_days
FROM watering_schedules ws
JOIN plants p ON ws.plant_id = p.plant_id
LEFT JOIN garden_areas ga ON p.area_id = ga.area_id
WHERE ws.next_due <= CURRENT_DATE + INTERVAL '3 days';

-- ============================================================================
-- 5. TRIGGER FUNCTIONS + TRIGGERS
-- ============================================================================

-- Keep users.updated_at current on every UPDATE
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_updated_at();

-- When a plant_health_record is added, sync the plant's current status to it
CREATE OR REPLACE FUNCTION fn_sync_plant_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE plants
    SET status = NEW.health_status
    WHERE plant_id = NEW.plant_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_plant_health_sync
    AFTER INSERT ON plant_health_records
    FOR EACH ROW
    EXECUTE FUNCTION fn_sync_plant_status();

-- When inventory drops to/below reorder level, notify all admins
CREATE OR REPLACE FUNCTION fn_notify_low_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity <= NEW.reorder_level THEN
        INSERT INTO notifications (user_id, title, message, type)
        SELECT user_id,
               'Low Inventory Alert',
               'Stock for category ID ' || NEW.category_id || ' has dropped to ' || NEW.quantity || ' ' || NEW.unit || '.',
               'warning'
        FROM users
        WHERE role IN ('admin', 'manager') AND is_active = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inventory_low_stock
    AFTER INSERT OR UPDATE OF quantity ON plant_inventory
    FOR EACH ROW
    EXECUTE FUNCTION fn_notify_low_inventory();

-- When a task is assigned to a worker, log a notification for admins
CREATE OR REPLACE FUNCTION fn_notify_task_assigned()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.assigned_worker_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type)
        SELECT user_id,
               'Task Assigned',
               '"' || NEW.title || '" was assigned to worker ID ' || NEW.assigned_worker_id || '.',
               'info'
        FROM users
        WHERE role IN ('admin', 'manager') AND is_active = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_assigned_notify
    AFTER INSERT ON gardening_tasks
    FOR EACH ROW
    EXECUTE FUNCTION fn_notify_task_assigned();

-- Automatically stamp completed_at when a task's status changes to Completed
CREATE OR REPLACE FUNCTION fn_stamp_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Completed' AND OLD.status IS DISTINCT FROM 'Completed' THEN
        NEW.completed_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_completion_stamp
    BEFORE UPDATE OF status ON gardening_tasks
    FOR EACH ROW
    EXECUTE FUNCTION fn_stamp_task_completion();

-- ============================================================================
-- 6. STORED FUNCTIONS / PROCEDURES
-- ============================================================================

-- Returns the number of plants currently in a given garden area
CREATE OR REPLACE FUNCTION fn_plant_count_by_area(p_area_id INT)
RETURNS INT AS $$
    SELECT COUNT(*)::INT FROM plants WHERE area_id = p_area_id;
$$ LANGUAGE sql STABLE;

-- Returns all tasks that are overdue (due_date passed, not completed)
CREATE OR REPLACE FUNCTION fn_overdue_tasks()
RETURNS TABLE (
    task_id INT, title VARCHAR, area_name VARCHAR, assigned_to VARCHAR, due_date DATE
) AS $$
    SELECT t.task_id, t.title, ga.name, w.full_name, t.due_date
    FROM gardening_tasks t
    LEFT JOIN garden_areas ga ON t.area_id = ga.area_id
    LEFT JOIN workers w       ON t.assigned_worker_id = w.worker_id
    WHERE t.due_date < CURRENT_DATE AND t.status NOT IN ('Completed');
$$ LANGUAGE sql STABLE;

-- Procedure: assign a tool to a worker, automatically returning any tool
-- that worker previously had marked as 'Assigned' with the same tool_id.
CREATE OR REPLACE PROCEDURE sp_assign_tool(p_tool_id INT, p_worker_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE tool_assignments
    SET status = 'Returned', returned_date = CURRENT_DATE
    WHERE tool_id = p_tool_id AND status = 'Assigned';

    INSERT INTO tool_assignments (tool_id, worker_id, assigned_date, status)
    VALUES (p_tool_id, p_worker_id, CURRENT_DATE, 'Assigned');
END;
$$;

-- Function: dashboard summary counts in one round trip
CREATE OR REPLACE FUNCTION fn_dashboard_summary()
RETURNS TABLE (
    total_plants BIGINT,
    total_workers BIGINT,
    total_areas BIGINT,
    open_tasks BIGINT,
    low_stock_items BIGINT
) AS $$
    SELECT
        (SELECT COUNT(*) FROM plants),
        (SELECT COUNT(*) FROM workers WHERE is_active = TRUE),
        (SELECT COUNT(*) FROM garden_areas),
        (SELECT COUNT(*) FROM gardening_tasks WHERE status IN ('Pending','In Progress','Overdue')),
        (SELECT COUNT(*) FROM v_low_stock_inventory);
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- 7. SAMPLE DATA
-- ============================================================================

-- Users (password for both is "admin123" — hashed with pgcrypto's bcrypt)
INSERT INTO users (username, password_hash, full_name, email, role) VALUES
('admin',     crypt('admin123', gen_salt('bf')), 'Ravi Kumar',   'admin@campusgarden.edu',   'admin'),
('manager1',  crypt('admin123', gen_salt('bf')), 'Anjali Mehta', 'manager1@campusgarden.edu','manager');

-- Garden areas
INSERT INTO garden_areas (name, area_sqft, has_signboard, description) VALUES
('Rose Garden',        1200, TRUE,  'Ornamental rose collection near the main gate'),
('Herb Corner',        450,  TRUE,  'Culinary and medicinal herbs'),
('Bonsai Court',       300,  FALSE, 'Curated bonsai display'),
('Vegetable Patch',    900,  TRUE,  'Student-run vegetable plots'),
('Cactus & Succulent', 250,  TRUE,  'Drought-tolerant plant collection'),
('Fruit Orchard',      1600, TRUE,  'Campus fruit trees');

-- Plant categories
INSERT INTO plant_categories (name, description) VALUES
('Flowering',   'Ornamental flowering plants'),
('Herb',        'Culinary and medicinal herbs'),
('Succulent',   'Cacti and succulents'),
('Vegetable',   'Edible vegetable plants'),
('Tree',        'Fruit and shade trees'),
('Foliage',     'Decorative leaf plants');

-- Vendors
INSERT INTO vendors (name, contact_phone, city, performance_rating) VALUES
('GreenSupply Co.',      '040-23451101', 'Hyderabad', 4.6),
('AgroTech Traders',     '040-23451102', 'Bengaluru', 4.1),
('EarthWorks Supplies',  '040-23451104', 'Pune',      4.9);

-- Workers
INSERT INTO workers (full_name, role, is_volunteer, date_of_birth, contact_phone, email, salary, hire_date) VALUES
('Ravi Kumar',   'Head Gardener',  FALSE, '1985-03-12', '9876500001', 'ravi.kumar@campusgarden.edu',   42000, '2019-06-01'),
('Anjali Mehta', 'Horticulturist', FALSE, '1990-07-25', '9876500002', 'anjali.mehta@campusgarden.edu', 38000, '2020-02-15'),
('Suresh Naidu', 'Gardener',       FALSE, '1993-11-02', '9876500003', 'suresh.naidu@campusgarden.edu', 26000, '2021-08-10'),
('Priya Sharma', 'Botanist',       FALSE, '1988-01-19', '9876500004', 'priya.sharma@campusgarden.edu', 45000, '2018-11-01'),
('Arjun Das',    'Volunteer',      TRUE,  '2002-02-08', '9876500007', 'arjun.das@campusgarden.edu',    NULL,  '2023-09-01');

-- Irrigation types
INSERT INTO irrigation_types (type_name, water_usage_level) VALUES
('Drip',      'Low'),
('Sprinkler', 'Medium'),
('Flood',     'High'),
('Manual',    'Low');

-- Plants
INSERT INTO plants (name, category_id, area_id, assigned_worker_id, irrigation_type_id, date_planted, status) VALUES
('Red Rose',       1, 1, 1, 1, '2023-01-15', 'Healthy'),
('Yellow Rose',    1, 1, 2, 1, '2023-02-10', 'Healthy'),
('Basil',          2, 2, 3, 4, '2023-03-05', 'Needs Attention'),
('Juniper Bonsai', 6, 3, 4, 2, '2022-11-20', 'Healthy'),
('Tomato',         4, 4, 5, 3, '2023-06-01', 'Healthy'),
('Barrel Cactus',  3, 5, 5, 1, '2022-09-14', 'Healthy'),
('Mango Tree',     5, 6, 1, 2, '2021-07-19', 'Healthy');

-- Plant inventory
INSERT INTO plant_inventory (category_id, area_id, quantity, unit, reorder_level, last_restocked) VALUES
(1, 1, 40, 'saplings', 10, '2024-05-01'),
(2, 2, 15, 'pots',     10, '2024-05-10'),
(4, 4, 60, 'seedlings',20, '2024-06-01'),
(3, 5, 8,  'pots',     10, '2024-04-20');

-- Tools
INSERT INTO tools (name, material, vendor_id, cost, warranty_months, condition) VALUES
('Pruning Shears',  'Steel',   1, 850,  24, 'Good'),
('Wheelbarrow',     'Steel',   2, 3200, 12, 'Good'),
('Garden Hose 30m', 'Rubber',  1, 1450, 6,  'Needs Repair'),
('Leaf Blower',     'Plastic', 3, 5600, 24, 'Good');

-- Tool assignments
INSERT INTO tool_assignments (tool_id, worker_id, assigned_date, status) VALUES
(1, 1, '2024-06-01', 'Assigned'),
(2, 3, '2024-06-02', 'Assigned'),
(3, 3, '2024-05-01', 'Returned');
UPDATE tool_assignments SET returned_date = '2024-05-20' WHERE tool_id = 3 AND status = 'Returned';

-- Fertilizers
INSERT INTO fertilizers (name, vendor_id, nutrient_type, stock_level, expiry_date) VALUES
('Bloom Boost',   3, 'Phosphorus', 120, '2025-08-01'),
('GreenGrow NPK', 1, 'NPK Mix',    80,  '2025-05-15'),
('Compost Plus',  2, 'Organic',    200, '2026-01-01');

-- Watering schedules
INSERT INTO watering_schedules (plant_id, frequency_days, last_watered, next_due, notes) VALUES
(1, 2, '2024-06-13', '2024-06-15', 'Morning watering preferred'),
(3, 1, '2024-06-14', '2024-06-15', 'Keep soil consistently moist'),
(6, 14, '2024-06-01', '2024-06-15', 'Drought tolerant — water sparingly');

-- Fertilizer schedules
INSERT INTO fertilizer_schedules (plant_id, fertilizer_id, applied_by, applied_date, next_due_date) VALUES
(1, 1, 1, '2024-05-01', '2024-07-01'),
(5, 3, 5, '2024-05-10', '2024-06-10');

-- Gardening tasks
INSERT INTO gardening_tasks (title, description, area_id, assigned_worker_id, status, priority, due_date) VALUES
('Prune rose bushes',            'Seasonal pruning for the rose garden',   1, 1, 'Completed',   'Medium', '2024-06-01'),
('Service drip irrigation lines',NULL,                                     1, 3, 'Pending',      'High',   '2024-06-20'),
('Replace greenhouse shade net', NULL,                                     3, 4, 'In Progress',  'Medium', '2024-06-18'),
('Inspect leaf blower motor',    NULL,                                     NULL, 3, 'Overdue',    'Low',    '2024-06-10');

-- Maintenance logs
INSERT INTO maintenance_logs (area_id, tool_id, worker_id, description, log_date) VALUES
(1, 1, 1, 'Sharpened and oiled pruning shears', '2024-06-01'),
(4, NULL, 5, 'Weeded vegetable patch beds', '2024-06-05');

-- Events
INSERT INTO events (title, description, area_id, event_date, duration_hours, fee) VALUES
('Bonsai Basics Workshop',   'Intro to bonsai shaping and care', 3, '2024-07-02', 2,   500),
('Composting 101',           'Hands-on composting session',      4, '2024-07-14', 1.5, 300);

-- Plant health records
INSERT INTO plant_health_records (plant_id, recorded_by, check_date, health_status, notes) VALUES
(3, 2, '2024-06-10', 'Needs Attention', 'Slight yellowing on lower leaves — monitor watering'),
(1, 1, '2024-06-12', 'Healthy', 'Vigorous new growth observed');

-- Notifications (a few illustrative rows; most are generated by triggers above)
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(1, 'Welcome', 'Your Campus Gardening Management System account is ready.', 'success', TRUE);

-- ============================================================================
-- End of schema
-- ============================================================================
