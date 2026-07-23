/* ==========================================================================
   server.js — PostgreSQL Express Backend Server
   Full CRUD endpoints for all 23 database tables matching Garden_section schema.
   ========================================================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

const pool = new Pool({
  host: (process.env.DB_HOST || 'localhost').trim(),
  port: Number(process.env.DB_PORT) || 5432,
  database: (process.env.DB_NAME || 'Garden_section').trim(),
  user: (process.env.DB_USER || 'postgres').trim(),
  password: String(process.env.DB_PASSWORD || '').trim(),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({ status: 'connected', db: process.env.DB_NAME || 'Garden_section', time: result.rows[0].time });
  } catch (err) {
    res.status(503).json({ status: 'disconnected', message: err.message });
  }
});

async function queryDb(sql, params = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res.rows;
  } finally {
    client.release();
  }
}

/* ---------------------- Generic Helper Functions ---------------------- */
function createTableEndpoints(endpointName, tableName, primaryKeyCol) {
  // GET
  app.get(`/api/${endpointName}`, async (req, res) => {
    try { res.json(await queryDb(`SELECT * FROM ${tableName} ORDER BY 1 DESC`)); }
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  // DELETE
  app.delete(`/api/${endpointName}/:id`, async (req, res) => {
    try {
      const id = req.params.id;
      await queryDb(`DELETE FROM ${tableName} WHERE ${primaryKeyCol} = $1`, [id]);
      res.json({ success: true, id });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // PUT (Update)
  app.put(`/api/${endpointName}/:id`, async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const keys = Object.keys(updates).filter(k => k.toLowerCase() !== primaryKeyCol.toLowerCase());
      if (keys.length === 0) return res.json({ success: true, id });
      const setClause = keys.map((k, idx) => `"${k}" = $${idx + 2}`).join(', ');
      const values = keys.map(k => updates[k]);
      const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${primaryKeyCol} = $1 RETURNING *`;
      const rows = await queryDb(sql, [id, ...values]);
      res.json(rows[0] || updates);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });
}

// Register endpoints for all 23 database tables
createTableEndpoints('plants', 'plant', 'plant_id');
createTableEndpoints('sections', 'garden_section', 'section_id');
createTableEndpoints('staff', 'staff', 'staff_id');
createTableEndpoints('equipment', 'equipment', 'equipment_id');
createTableEndpoints('fertilizers', 'fertilizer', 'fertilizer_id');
createTableEndpoints('irrigation-systems', 'irrigation_system', 'system_id');
createTableEndpoints('irrigation-types', 'irrigation_type', 'type_name');
createTableEndpoints('vendors', 'vendor', 'vendor_id');
createTableEndpoints('workshops', 'workshop', 'workshop_id');
createTableEndpoints('pest-control', 'pest_control', 'control_id');
createTableEndpoints('maintenance', 'maintenance_schedule', 'schedule_id');
createTableEndpoints('visitors', 'visitor', 'visitor_id');
createTableEndpoints('visitor-cards', 'visitor_card', 'card_id');
createTableEndpoints('security', 'security_group', 'security_id');
createTableEndpoints('dead-plants', 'dead_plant_record', 'record_id');
createTableEndpoints('compost', 'compost_bin', 'bin_id');
createTableEndpoints('climate', 'climate_log', 'date');
createTableEndpoints('attends', 'attends', 'staff_id');
createTableEndpoints('applies-fertilizer', 'applies_fertilizer', 'plant_id');
createTableEndpoints('applies-pest', 'applies_pest', 'plant_id');
createTableEndpoints('uses', 'uses', 'staff_id');
createTableEndpoints('equip-maintain', 'equip_maintain_by', 'schedule_id');
createTableEndpoints('visitor-access', 'visitor_access', 'visitor_id');

// Add Plant POST
app.post('/api/plants', async (req, res) => {
  const { name, section_id, staff_id, system_id, date_planted } = req.body;
  try {
    const rows = await queryDb(`
      INSERT INTO plant (name, section_id, staff_id, system_id, date_planted)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [name, section_id || 1, staff_id || 1, system_id || 1, date_planted || new Date().toISOString().split('T')[0]]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Campus Gardening Server: http://localhost:${PORT}`);
  console.log(` PostgreSQL DB Target: ${process.env.DB_NAME}`);
  console.log(`===================================================`);
});
