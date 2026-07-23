/* ==========================================================================
   js/api-client.js — Dual Mode API Client (PostgreSQL + LocalStorage Fallback)
   Queries Express server endpoints for all 23 database tables with full GET/DELETE.
   ========================================================================== */

const API_BASE = 'http://localhost:3000/api';

const ApiClient = {
  isConnected: false,
  dbName: 'Garden_section',

  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        this.isConnected = true;
        this.dbName = data.db || 'Garden_section';
      } else {
        this.isConnected = false;
      }
    } catch {
      this.isConnected = false;
    }
    this.updateStatusBadge();
    return this.isConnected;
  },

  updateStatusBadge() {
    const badge = document.getElementById('db-status-badge');
    if (!badge) return;

    if (this.isConnected) {
      badge.className = 'badge badge-healthy';
      badge.innerHTML = `<i class="fa-solid fa-database"></i> PostgreSQL Connected (${this.dbName})`;
    } else {
      badge.className = 'badge badge-pending';
      badge.innerHTML = `<i class="fa-solid fa-box-archive"></i> LocalStorage Mode`;
    }
  },

  async fetchEndpoint(endpoint, fallbackKey) {
    if (this.isConnected) {
      try {
        const res = await fetch(`${API_BASE}/${endpoint}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn(`API Error on /${endpoint}, using LocalStorage fallback:`, e);
      }
    }
    return window.GardenData.getTable(fallbackKey);
  },

  async deleteEndpoint(endpoint, id, fallbackKey, idField = 'id') {
    if (this.isConnected) {
      try {
        const res = await fetch(`${API_BASE}/${endpoint}/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) return true;
      } catch (e) {
        console.warn(`API Delete Error on /${endpoint}/${id}:`, e);
      }
    }
    window.GardenData.deleteRow(fallbackKey, idField, id);
    return true;
  },

  async updateEndpoint(endpoint, id, updatedData, fallbackKey, idField = 'id') {
    if (this.isConnected) {
      try {
        const res = await fetch(`${API_BASE}/${endpoint}/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });
        if (res.ok) {
          const resData = await res.json();
          window.GardenData.updateRow(fallbackKey, idField, id, resData);
          return resData;
        }
      } catch (e) {
        console.warn(`API Update Error on /${endpoint}/${id}:`, e);
      }
    }
    return window.GardenData.updateRow(fallbackKey, idField, id, updatedData);
  },

  // 23 Entity Client Methods
  getPlants() { return this.fetchEndpoint('plants', 'PLANT'); },
  deletePlant(id) { return this.deleteEndpoint('plants', id, 'PLANT', 'Plant_ID'); },
  updatePlant(id, data) { return this.updateEndpoint('plants', id, data, 'PLANT', 'Plant_ID'); },

  getSections() { return this.fetchEndpoint('sections', 'GARDEN_SECTION'); },
  deleteSection(id) { return this.deleteEndpoint('sections', id, 'GARDEN_SECTION', 'Section_ID'); },
  updateSection(id, data) { return this.updateEndpoint('sections', id, data, 'GARDEN_SECTION', 'Section_ID'); },

  getStaff() { return this.fetchEndpoint('staff', 'STAFF'); },
  deleteStaff(id) { return this.deleteEndpoint('staff', id, 'STAFF', 'Staff_ID'); },
  updateStaff(id, data) { return this.updateEndpoint('staff', id, data, 'STAFF', 'Staff_ID'); },

  getEquipment() { return this.fetchEndpoint('equipment', 'EQUIPMENT'); },
  deleteEquipment(id) { return this.deleteEndpoint('equipment', id, 'EQUIPMENT', 'Equipment_ID'); },
  updateEquipment(id, data) { return this.updateEndpoint('equipment', id, data, 'EQUIPMENT', 'Equipment_ID'); },

  getFertilizers() { return this.fetchEndpoint('fertilizers', 'FERTILIZER'); },
  deleteFertilizer(id) { return this.deleteEndpoint('fertilizers', id, 'FERTILIZER', 'Fertilizer_ID'); },
  updateFertilizer(id, data) { return this.updateEndpoint('fertilizers', id, data, 'FERTILIZER', 'Fertilizer_ID'); },

  getIrrigationSystems() { return this.fetchEndpoint('irrigation-systems', 'IRRIGATION_SYSTEM'); },
  deleteIrrigationSystem(id) { return this.deleteEndpoint('irrigation-systems', id, 'IRRIGATION_SYSTEM', 'System_ID'); },
  updateIrrigationSystem(id, data) { return this.updateEndpoint('irrigation-systems', id, data, 'IRRIGATION_SYSTEM', 'System_ID'); },

  getIrrigationTypes() { return this.fetchEndpoint('irrigation-types', 'IRRIGATION_TYPE'); },
  deleteIrrigationType(name) { return this.deleteEndpoint('irrigation-types', name, 'IRRIGATION_TYPE', 'Type_name'); },
  updateIrrigationType(name, data) { return this.updateEndpoint('irrigation-types', name, data, 'IRRIGATION_TYPE', 'Type_name'); },

  getVendors() { return this.fetchEndpoint('vendors', 'VENDOR'); },
  deleteVendor(id) { return this.deleteEndpoint('vendors', id, 'VENDOR', 'Vendor_ID'); },
  updateVendor(id, data) { return this.updateEndpoint('vendors', id, data, 'VENDOR', 'Vendor_ID'); },

  getWorkshops() { return this.fetchEndpoint('workshops', 'WORKSHOP'); },
  deleteWorkshop(id) { return this.deleteEndpoint('workshops', id, 'WORKSHOP', 'Workshop_ID'); },
  updateWorkshop(id, data) { return this.updateEndpoint('workshops', id, data, 'WORKSHOP', 'Workshop_ID'); },

  getPestControl() { return this.fetchEndpoint('pest-control', 'PEST_CONTROL'); },
  deletePestControl(id) { return this.deleteEndpoint('pest-control', id, 'PEST_CONTROL', 'Control_ID'); },
  updatePestControl(id, data) { return this.updateEndpoint('pest-control', id, data, 'PEST_CONTROL', 'Control_ID'); },

  getMaintenance() { return this.fetchEndpoint('maintenance', 'MAINTENANCE_SCHEDULE'); },
  deleteMaintenance(id) { return this.deleteEndpoint('maintenance', id, 'MAINTENANCE_SCHEDULE', 'Schedule_ID'); },
  updateMaintenance(id, data) { return this.updateEndpoint('maintenance', id, data, 'MAINTENANCE_SCHEDULE', 'Schedule_ID'); },

  getVisitors() { return this.fetchEndpoint('visitors', 'VISITOR'); },
  deleteVisitor(id) { return this.deleteEndpoint('visitors', id, 'VISITOR', 'Visitor_ID'); },
  updateVisitor(id, data) { return this.updateEndpoint('visitors', id, data, 'VISITOR', 'Visitor_ID'); },

  getVisitorCards() { return this.fetchEndpoint('visitor-cards', 'VISITOR_CARD'); },
  deleteVisitorCard(id) { return this.deleteEndpoint('visitor-cards', id, 'VISITOR_CARD', 'Card_ID'); },
  updateVisitorCard(id, data) { return this.updateEndpoint('visitor-cards', id, data, 'VISITOR_CARD', 'Card_ID'); },

  getSecurity() { return this.fetchEndpoint('security', 'SECURITY_GROUP'); },
  deleteSecurity(id) { return this.deleteEndpoint('security', id, 'SECURITY_GROUP', 'Security_ID'); },
  updateSecurity(id, data) { return this.updateEndpoint('security', id, data, 'SECURITY_GROUP', 'Security_ID'); },

  getDeadPlants() { return this.fetchEndpoint('dead-plants', 'DEAD_PLANT_RECORD'); },
  deleteDeadPlant(id) { return this.deleteEndpoint('dead-plants', id, 'DEAD_PLANT_RECORD', 'Record_ID'); },
  updateDeadPlant(id, data) { return this.updateEndpoint('dead-plants', id, data, 'DEAD_PLANT_RECORD', 'Record_ID'); },

  getCompost() { return this.fetchEndpoint('compost', 'COMPOST_BIN'); },
  deleteCompost(id) { return this.deleteEndpoint('compost', id, 'COMPOST_BIN', 'Bin_ID'); },
  updateCompost(id, data) { return this.updateEndpoint('compost', id, data, 'COMPOST_BIN', 'Bin_ID'); },

  getClimate() { return this.fetchEndpoint('climate', 'CLIMATE_LOG'); },
  deleteClimate(date) { return this.deleteEndpoint('climate', date, 'CLIMATE_LOG', 'date'); },
  updateClimate(date, data) { return this.updateEndpoint('climate', date, data, 'CLIMATE_LOG', 'date'); },

  getAttends() { return this.fetchEndpoint('attends', 'ATTENDS'); },
  deleteAttends(id) { return this.deleteEndpoint('attends', id, 'ATTENDS', 'Staff_ID'); },

  getAppliesFertilizer() { return this.fetchEndpoint('applies-fertilizer', 'APPLIES_FERTILIZER'); },
  deleteAppliesFertilizer(id) { return this.deleteEndpoint('applies-fertilizer', id, 'APPLIES_FERTILIZER', 'Plant_ID'); },

  getAppliesPest() { return this.fetchEndpoint('applies-pest', 'APPLIES_PEST'); },
  deleteAppliesPest(id) { return this.deleteEndpoint('applies-pest', id, 'APPLIES_PEST', 'Plant_ID'); },

  getUses() { return this.fetchEndpoint('uses', 'USES'); },
  deleteUses(id) { return this.deleteEndpoint('uses', id, 'USES', 'Staff_ID'); },

  getEquipMaintain() { return this.fetchEndpoint('equip-maintain', 'EQUIP_MAINTAIN_BY'); },
  deleteEquipMaintain(id) { return this.deleteEndpoint('equip-maintain', id, 'EQUIP_MAINTAIN_BY', 'Schedule_ID'); },

  getVisitorAccess() { return this.fetchEndpoint('visitor-access', 'VISITOR_ACCESS'); },
  deleteVisitorAccess(id) { return this.deleteEndpoint('visitor-access', id, 'VISITOR_ACCESS', 'Visitor_ID'); }
};

document.addEventListener('DOMContentLoaded', () => {
  ApiClient.checkHealth();
});

window.ApiClient = ApiClient;
