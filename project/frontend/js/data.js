/* ==========================================================================
   js/data.js — Full 23-Entity Exact Field LocalStorage Store
   Initializes sample data matching the exact 23 PostgreSQL database tables
   and column names specified in garden.sql.
   ========================================================================== */

const STORAGE_KEYS = {
  PLANT: 'gms_tbl_plant',
  GARDEN_SECTION: 'gms_tbl_garden_section',
  STAFF: 'gms_tbl_staff',
  EQUIPMENT: 'gms_tbl_equipment',
  FERTILIZER: 'gms_tbl_fertilizer',
  IRRIGATION_SYSTEM: 'gms_tbl_irrigation_system',
  IRRIGATION_TYPE: 'gms_tbl_irrigation_type',
  VENDOR: 'gms_tbl_vendor',
  WORKSHOP: 'gms_tbl_workshop',
  PEST_CONTROL: 'gms_tbl_pest_control',
  MAINTENANCE_SCHEDULE: 'gms_tbl_maintenance_schedule',
  VISITOR: 'gms_tbl_visitor',
  VISITOR_CARD: 'gms_tbl_visitor_card',
  SECURITY_GROUP: 'gms_tbl_security_group',
  DEAD_PLANT_RECORD: 'gms_tbl_dead_plant_record',
  COMPOST_BIN: 'gms_tbl_compost_bin',
  CLIMATE_LOG: 'gms_tbl_climate_log',
  ATTENDS: 'gms_tbl_attends',
  APPLIES_FERTILIZER: 'gms_tbl_applies_fertilizer',
  APPLIES_PEST: 'gms_tbl_applies_pest',
  USES: 'gms_tbl_uses',
  EQUIP_MAINTAIN_BY: 'gms_tbl_equip_maintain_by',
  VISITOR_ACCESS: 'gms_tbl_visitor_access',
  USER: 'gms_user'
};

// 1. Plant(Plant_ID, Section_ID, Staff_ID, System_ID, Name, Date_Planted)
const DEFAULT_PLANT = [
  { Plant_ID: 'P001', Section_ID: 'SEC01', Staff_ID: 'ST001', System_ID: 'IS01', Name: 'Red Rose', Date_Planted: '2023-01-15', status: 'Healthy' },
  { Plant_ID: 'P002', Section_ID: 'SEC01', Staff_ID: 'ST002', System_ID: 'IS01', Name: 'Yellow Rose', Date_Planted: '2023-02-10', status: 'Needs Care' },
  { Plant_ID: 'P003', Section_ID: 'SEC02', Staff_ID: 'ST003', System_ID: 'IS04', Name: 'Sweet Basil', Date_Planted: '2023-03-05', status: 'Healthy' },
  { Plant_ID: 'P004', Section_ID: 'SEC02', Staff_ID: 'ST003', System_ID: 'IS04', Name: 'Spearmint', Date_Planted: '2023-03-06', status: 'Healthy' },
  { Plant_ID: 'P005', Section_ID: 'SEC03', Staff_ID: 'ST004', System_ID: 'IS02', Name: 'Juniper Bonsai', Date_Planted: '2022-11-20', status: 'Healthy' }
];

// 2. Garden_Section(Section_ID, Security_ID, Name, Area, sign_board)
const DEFAULT_GARDEN_SECTION = [
  { Section_ID: 'SEC01', Security_ID: 'SG01', Name: 'Rose Garden', Area: 1200, sign_board: 'Yes' },
  { Section_ID: 'SEC02', Security_ID: 'SG02', Name: 'Herb Corner', Area: 450, sign_board: 'Yes' },
  { Section_ID: 'SEC03', Security_ID: 'SG01', Name: 'Bonsai Court', Area: 300, sign_board: 'No' },
  { Section_ID: 'SEC04', Security_ID: 'SG03', Name: 'Vegetable Patch', Area: 900, sign_board: 'Yes' },
  { Section_ID: 'SEC05', Security_ID: 'SG04', Name: 'Cactus & Succulent', Area: 250, sign_board: 'Yes' }
];

// 3. Staff(Staff_ID, Name, role, DOB, contact, salary)
const DEFAULT_STAFF = [
  { Staff_ID: 'ST001', Name: 'Ravi Kumar', role: 'Head Gardener', DOB: '1985-03-12', contact: '9876500001', salary: 42000 },
  { Staff_ID: 'ST002', Name: 'Anjali Mehta', role: 'Horticulturist', DOB: '1990-07-25', contact: '9876500002', salary: 38000 },
  { Staff_ID: 'ST003', Name: 'Suresh Naidu', role: 'Gardener', DOB: '1993-11-02', contact: '9876500003', salary: 26000 },
  { Staff_ID: 'ST004', Name: 'Priya Sharma', role: 'Botanist', DOB: '1988-01-19', contact: '9876500004', salary: 45000 }
];

// 4. Equipment(Equipment_ID, Vendor_ID, Name, material, warranty, cost)
const DEFAULT_EQUIPMENT = [
  { Equipment_ID: 'EQ01', Vendor_ID: 'V001', Name: 'Hedge Trimmer', material: 'Steel', warranty: '12 months', cost: 4500 },
  { Equipment_ID: 'EQ02', Vendor_ID: 'V002', Name: 'Sprinkler Pump', material: 'Cast Iron', warranty: '24 months', cost: 12000 },
  { Equipment_ID: 'EQ03', Vendor_ID: 'V001', Name: 'Pruning Shears', material: 'Carbon Steel', warranty: '6 months', cost: 1200 }
];

// 5. Fertilizer(Fertilizer_ID, Vendor_ID, Name, nutrient_type, stock_level, Expiry_date)
const DEFAULT_FERTILIZER = [
  { Fertilizer_ID: 'F001', Vendor_ID: 'V001', Name: 'NPK Organic Mixture', nutrient_type: 'Nitrogen-Phosphorus', stock_level: '45 kg', Expiry_date: '2027-05-15' },
  { Fertilizer_ID: 'F002', Vendor_ID: 'V002', Name: 'Bio-Compost Concentrate', nutrient_type: 'Humus', stock_level: '120 kg', Expiry_date: '2026-12-31' }
];

// 6. Irrigation_System(System_ID, date, Type_name)
const DEFAULT_IRRIGATION_SYSTEM = [
  { System_ID: 'IS01', date: '2024-01-10', Type_name: 'Drip' },
  { System_ID: 'IS02', date: '2024-02-15', Type_name: 'Sprinkler' },
  { System_ID: 'IS03', date: '2024-03-05', Type_name: 'Flood' },
  { System_ID: 'IS04', date: '2024-04-20', Type_name: 'Manual' }
];

// 7. Irrigation_Type(Type_name, water_usage)
const DEFAULT_IRRIGATION_TYPE = [
  { Type_name: 'Drip', water_usage: 'Low' },
  { Type_name: 'Sprinkler', water_usage: 'Medium' },
  { Type_name: 'Flood', water_usage: 'High' },
  { Type_name: 'Manual', water_usage: 'Low' }
];

// 8. Vendor(Vendor_ID, Name, Contact, performance_rating, city)
const DEFAULT_VENDOR = [
  { Vendor_ID: 'V001', Name: 'GreenSupply Co.', Contact: '040-2345 1101', performance_rating: 4.6, city: 'Hyderabad' },
  { Vendor_ID: 'V002', Name: 'AgroTech Traders', Contact: '040-2345 1102', performance_rating: 4.1, city: 'Bengaluru' },
  { Vendor_ID: 'V003', Name: 'Bloom & Root Ltd.', Contact: '040-2345 1103', performance_rating: 3.8, city: 'Chennai' }
];

// 9. Workshop(Workshop_ID, Topic, Date, Duration, fees)
const DEFAULT_WORKSHOP = [
  { Workshop_ID: 'WS01', Topic: 'Organic Composting', Date: '2026-08-05', Duration: '2 hours', fees: '$0' },
  { Workshop_ID: 'WS02', Topic: 'Bonsai Care & Wiring', Date: '2026-08-12', Duration: '3 hours', fees: '$15' }
];

// 10. Pest_Control(Control_ID, Vendor_ID, exp_date)
const DEFAULT_PEST_CONTROL = [
  { Control_ID: 'PC01', Vendor_ID: 'V001', exp_date: '2027-02-10', target: 'Aphids & Whiteflies' },
  { Control_ID: 'PC02', Vendor_ID: 'V003', exp_date: '2026-11-30', target: 'Powdery Mildew' }
];

// 11. Maintenance_Schedule(Schedule_ID, status, task)
const DEFAULT_MAINTENANCE_SCHEDULE = [
  { Schedule_ID: 'SCH01', status: 'Pending', task: 'Morning Drip Irrigation Cycle' },
  { Schedule_ID: 'SCH02', status: 'Completed', task: 'Trim Juniper Bonsai Branches' },
  { Schedule_ID: 'SCH03', status: 'Pending', task: 'Apply Neem Oil Pest Spray' }
];

// 12. Visitor(Visitor_ID, Card_ID, Name, Contact, profession, from)
const DEFAULT_VISITOR = [
  { Visitor_ID: 'VIS01', Card_ID: 'CARD101', Name: 'Dr. Ramesh Rao', Contact: '9849011223', profession: 'Botanist', from: 'Osmania Univ' },
  { Visitor_ID: 'VIS02', Card_ID: 'CARD102', Name: 'Suhana Patel', Contact: '9849033445', profession: 'Architect', from: 'GreenStudio' }
];

// 13. Visitor_Card(Card_ID, type, number_of_people_allowed, fees, entry_time, exit_time, Security_ID)
const DEFAULT_VISITOR_CARD = [
  { Card_ID: 'CARD101', type: 'VIP Research Pass', number_of_people_allowed: 2, fees: '$10', entry_time: '09:00 AM', exit_time: '05:00 PM', Security_ID: 'SG01' },
  { Card_ID: 'CARD102', type: 'Day Visitor Pass', number_of_people_allowed: 1, fees: '$5', entry_time: '10:00 AM', exit_time: '04:00 PM', Security_ID: 'SG02' }
];

// 14. Security_Group(Security_ID, Number_of_Guard, Shift)
const DEFAULT_SECURITY_GROUP = [
  { Security_ID: 'SG01', Number_of_Guard: 4, Shift: 'Morning' },
  { Security_ID: 'SG02', Number_of_Guard: 3, Shift: 'Evening' },
  { Security_ID: 'SG03', Number_of_Guard: 2, Shift: 'Night' }
];

// 15. Dead_Plant_Record(Record_ID, Plant_ID, Date_Recorded, Reason)
const DEFAULT_DEAD_PLANT_RECORD = [
  { Record_ID: 'DR01', Plant_ID: 'P004', Date_Recorded: '2026-02-01', Reason: 'Root rot from overwatering' },
  { Record_ID: 'DR02', Plant_ID: 'P002', Date_Recorded: '2026-03-18', Reason: 'Frost damage' }
];

// 16. Compost_Bin(Bin_ID, Section_ID, Capacity, type)
const DEFAULT_COMPOST_BIN = [
  { Bin_ID: 'BIN01', Section_ID: 'SEC04', Capacity: '500 Liters', type: 'Aerobic Vermicompost' },
  { Bin_ID: 'BIN02', Section_ID: 'SEC02', Capacity: '300 Liters', type: 'Leaf Mold Bin' }
];

// 17. Climate_Log(date, temperature, humidity, rainfall, wind)
const DEFAULT_CLIMATE_LOG = [
  { date: '2026-07-24', temperature: '28°C', humidity: '65%', rainfall: '12 mm', wind: '14 km/h' },
  { date: '2026-07-23', temperature: '30°C', humidity: '58%', rainfall: '0 mm', wind: '10 km/h' }
];

// 18. Attends(Staff_ID, Workshop_ID)
const DEFAULT_ATTENDS = [
  { Staff_ID: 'ST001', Workshop_ID: 'WS01' },
  { Staff_ID: 'ST002', Workshop_ID: 'WS01' },
  { Staff_ID: 'ST004', Workshop_ID: 'WS02' }
];

// 19. Applies_Fertilizer(Plant_ID, Staff_ID, Fertilizer_ID, last_applies_date, Amount)
const DEFAULT_APPLIES_FERTILIZER = [
  { Plant_ID: 'P001', Staff_ID: 'ST001', Fertilizer_ID: 'F001', last_applies_date: '2026-07-10', Amount: '250 grams' },
  { Plant_ID: 'P003', Staff_ID: 'ST002', Fertilizer_ID: 'F002', last_applies_date: '2026-07-15', Amount: '500 grams' }
];

// 20. Applies_pest(Plant_ID, Staff_ID, pest_ID, last_applies_date, Amount)
const DEFAULT_APPLIES_PEST = [
  { Plant_ID: 'P002', Staff_ID: 'ST002', pest_ID: 'PC01', last_applies_date: '2026-07-12', Amount: '100 ml spray' }
];

// 21. Uses(Staff_ID, Equipment_ID, duration)
const DEFAULT_USES = [
  { Staff_ID: 'ST001', Equipment_ID: 'EQ01', duration: '3 hours' },
  { Staff_ID: 'ST003', Equipment_ID: 'EQ03', duration: '2 hours' }
];

// 22. Equip_Maintain_by(Schedule_ID, Equipment_ID, Date, Cost)
const DEFAULT_EQUIP_MAINTAIN_BY = [
  { Schedule_ID: 'SCH01', Equipment_ID: 'EQ01', Date: '2026-06-20', Cost: '$45' },
  { Schedule_ID: 'SCH02', Equipment_ID: 'EQ02', Date: '2026-07-01', Cost: '$120' }
];

// 23. Visitor_Access(Visitor_ID, Section_ID, purpose)
const DEFAULT_VISITOR_ACCESS = [
  { Visitor_ID: 'VIS01', Section_ID: 'SEC03', purpose: 'Bonsai Taxonomy Research' },
  { Visitor_ID: 'VIS02', Section_ID: 'SEC01', purpose: 'Landscape Photography' }
];

// Central GardenData Store
const GardenData = {
  init() {
    const listMap = [
      [STORAGE_KEYS.PLANT, DEFAULT_PLANT],
      [STORAGE_KEYS.GARDEN_SECTION, DEFAULT_GARDEN_SECTION],
      [STORAGE_KEYS.STAFF, DEFAULT_STAFF],
      [STORAGE_KEYS.EQUIPMENT, DEFAULT_EQUIPMENT],
      [STORAGE_KEYS.FERTILIZER, DEFAULT_FERTILIZER],
      [STORAGE_KEYS.IRRIGATION_SYSTEM, DEFAULT_IRRIGATION_SYSTEM],
      [STORAGE_KEYS.IRRIGATION_TYPE, DEFAULT_IRRIGATION_TYPE],
      [STORAGE_KEYS.VENDOR, DEFAULT_VENDOR],
      [STORAGE_KEYS.WORKSHOP, DEFAULT_WORKSHOP],
      [STORAGE_KEYS.PEST_CONTROL, DEFAULT_PEST_CONTROL],
      [STORAGE_KEYS.MAINTENANCE_SCHEDULE, DEFAULT_MAINTENANCE_SCHEDULE],
      [STORAGE_KEYS.VISITOR, DEFAULT_VISITOR],
      [STORAGE_KEYS.VISITOR_CARD, DEFAULT_VISITOR_CARD],
      [STORAGE_KEYS.SECURITY_GROUP, DEFAULT_SECURITY_GROUP],
      [STORAGE_KEYS.DEAD_PLANT_RECORD, DEFAULT_DEAD_PLANT_RECORD],
      [STORAGE_KEYS.COMPOST_BIN, DEFAULT_COMPOST_BIN],
      [STORAGE_KEYS.CLIMATE_LOG, DEFAULT_CLIMATE_LOG],
      [STORAGE_KEYS.ATTENDS, DEFAULT_ATTENDS],
      [STORAGE_KEYS.APPLIES_FERTILIZER, DEFAULT_APPLIES_FERTILIZER],
      [STORAGE_KEYS.APPLIES_PEST, DEFAULT_APPLIES_PEST],
      [STORAGE_KEYS.USES, DEFAULT_USES],
      [STORAGE_KEYS.EQUIP_MAINTAIN_BY, DEFAULT_EQUIP_MAINTAIN_BY],
      [STORAGE_KEYS.VISITOR_ACCESS, DEFAULT_VISITOR_ACCESS]
    ];

    listMap.forEach(([key, seed]) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(seed));
      }
    });

    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ name: 'Admin Gardener', role: 'Head Supervisor' }));
    }
  },

  getUser() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || { name: 'Admin Gardener', role: 'Head Supervisor' }; }
    catch { return { name: 'Admin Gardener', role: 'Head Supervisor' }; }
  },

  setUser(user) { localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)); },

  getTable(keyName) {
    const k = STORAGE_KEYS[keyName];
    return k ? JSON.parse(localStorage.getItem(k)) || [] : [];
  },

  setTable(keyName, data) {
    const k = STORAGE_KEYS[keyName];
    if (k) localStorage.setItem(k, JSON.stringify(data));
  },

  addRow(keyName, row) {
    const list = this.getTable(keyName);
    list.unshift(row);
    this.setTable(keyName, list);
    return row;
  },

  deleteRow(keyName, idField, value) {
    let list = this.getTable(keyName);
    list = list.filter(item => String(item[idField] || item.id || '') !== String(value));
    this.setTable(keyName, list);
  },

  getSummary() {
    return {
      totalPlants: this.getTable('PLANT').length,
      totalSections: this.getTable('GARDEN_SECTION').length,
      totalStaff: this.getTable('STAFF').length,
      totalEquipment: this.getTable('EQUIPMENT').length,
      totalVendors: this.getTable('VENDOR').length,
      pendingTasks: this.getTable('MAINTENANCE_SCHEDULE').filter(t => t.status === 'Pending').length
    };
  }
};

GardenData.init();
window.GardenData = GardenData;
