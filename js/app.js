function showSection(sectionId, event) {
  document.querySelectorAll(".section").forEach((sec) => {
    sec.classList.add("hidden");
    sec.classList.remove("visible");
  });

  document.getElementById(sectionId).classList.remove("hidden");
  document.getElementById(sectionId).classList.add("visible");

  if (event) {
    event.target.classList.add("active");
  }
}

function switchPage(sectionId, breadcrumbName, event) {
  // Switch visible section
  showSection(sectionId, event);

  // Update breadcrumb text
  document.getElementById("breadcrumb-page").textContent = breadcrumbName;
}

// greetings
function updateGreeting() {
  const greetWord = document.getElementById("greeting-word");
  const hour = new Date().getHours();

  let message = "Good morning!";

  if (hour >= 0 && hour < 12) {
    message = "Good morning!";
  } else if (hour >= 12 && hour < 18) {
    message = "Good afternoon!";
  } else if (hour >= 18 && hour < 22) {
    message = "Good evening!";
  } else {
    message = "Good night!";
  }

  greetWord.textContent = message;
}

updateGreeting();
setInterval(updateGreeting, 60000);

// donut
function renderDepartmentDonut() {
  const values = {
    surgery: 8493,
    medicine: 2542,
    cardio: 5432,
    radio: 1432,
    ortho: 1032,
  };

  const total = Object.values(values).reduce((a, b) => a + b, 0);

  // compute cumulative degrees
  let start = 0;
  const slices = [];

  const colors = {
    surgery: "#F4C430",
    medicine: "#4C8BF5",
    cardio: "#34C759",
    radio: "#9B6EF3",
    ortho: "#FF8FA3",
  };

  for (let key in values) {
    const val = values[key];
    const deg = (val / total) * 360;
    const end = start + deg;
    slices.push(`${colors[key]} ${start}deg ${end}deg`);
    start = end;
  }

  const donut = document.getElementById("deptDonut");
  donut.style.background = `conic-gradient(${slices.join(",")})`;
}

renderDepartmentDonut();

function renderPatients() {
  patientManager.sortPatients();

  const list = document.getElementById("patientsList");
  list.innerHTML = "";

  patientManager.patients.forEach((p, i) => {
    const row = document.createElement("div");
    row.classList.add("patient-row");

    row.innerHTML = `
      <span>${p.name}</span>
      <span>${p.age}</span>
      <span>${p.contact}</span>
      <span>${p.address}</span>
      <span>${p.blood}</span>
      <span>${p.lastVisit}</span>
    `;

    row.onclick = () => openPatientModal(i);
    list.appendChild(row);
  });
}

// Modal functions

function openPatientModal(index) {
  const p = patientManager.get(index);
  window.currentIndex = index;

  // Fill modal fields
  modalPhoto.src = p.photo;
  modalName.value = p.name;
  modalAge.value = p.age;
  modalSex.value = p.sex || "Female";
  modalContact.value = p.contact;
  modalAddress.value = p.address;

  modalPastIllness.value = p.pastIllness;
  modalChronic.value = p.chronic;
  modalFamily.value = p.family;
  modalVaccination.value = p.vaccination;
  modalMedications.value = p.meds;

  modalBP.value = p.bp;
  modalHR.value = p.hr;
  modalHeight.value = p.height;
  modalWeight.value = p.weight;

  modalNotes.value = p.notes;

  modalBlood.value = p.blood || "A+";
  modalDepartment.value = p.department || "Medicine";
  modalLastVisit.value = p.lastVisit || "";

  modalRFID.value = p.rfid || "";

  // always start in read-only mode
  setModalReadOnly(true);
  cancelEdit(); // make sure buttons reset

  document.getElementById("patientModalOverlay").classList.remove("hidden");
}

function closePatientModal() {
  document.getElementById("patientModalOverlay").classList.add("hidden");
}

// Save edits and return to read-only
function savePatientChanges() {
  const index = window.currentIndex;

  const updatedData = {
    name: modalName.value,
    age: modalAge.value,
    sex: modalSex.value,
    contact: modalContact.value,
    address: modalAddress.value,
    blood: modalBlood.value,
    department: modalDepartment.value,
    lastVisit: modalLastVisit.value,

    pastIllness: modalPastIllness.value,
    chronic: modalChronic.value,
    family: modalFamily.value,
    vaccination: modalVaccination.value,
    meds: modalMedications.value,

    bp: modalBP.value,
    hr: modalHR.value,
    height: modalHeight.value,
    weight: modalWeight.value,

    notes: modalNotes.value,
    rfid: modalRFID.value,
  };

  patientManager.update(index, updatedData);
  cancelEdit();
  renderPatients();
}

// Read-only Edit-Mode Delete

function setModalReadOnly(state) {
  // Only target inputs inside the *view/edit* patient modal,
  // not the Add Patient modal — prevents blocking add form.
  const inputs = document.querySelectorAll(
    "#patientModalOverlay .modal-input, #patientModalOverlay .modal-textarea"
  );

  inputs.forEach((el) => {
    if (el.tagName === "SELECT") {
      el.disabled = state;
    } else {
      el.readOnly = state;
    }
  });
}

function enterEditMode() {
  setModalReadOnly(false);

  const buttons = document.getElementById("modalButtons");
  buttons.innerHTML = `
  <button class="delete-btn" onclick="openDeleteConfirm()">Delete</button>
  <div class="right-btns">
    <button class="cancel-btn" onclick="cancelEdit()">Cancel Edit</button>
    <button class="save-btn" onclick="savePatientChanges()">Save Changes</button>
  </div>
`;
}

function cancelEdit() {
  setModalReadOnly(true);

  const buttons = document.getElementById("modalButtons");
  buttons.innerHTML = `
  <button class="delete-btn" onclick="openDeleteConfirm()">Delete</button>
  <div class="right-btns">
    <button class="cancel-btn" onclick="closePatientModal()">Cancel</button>
    <button class="save-btn" id="updateBtn" onclick="enterEditMode()">Update</button>
  </div>
`;
}

function openDeleteConfirm() {
  document.getElementById("deleteConfirmOverlay").classList.remove("hidden");
}

function closeDeleteConfirm() {
  document.getElementById("deleteConfirmOverlay").classList.add("hidden");
}

function confirmDeletePatient() {
  const index = window.currentIndex;

  patientManager.patients.splice(index, 1);
  patientManager.save();

  closeDeleteConfirm();
  closePatientModal();
  renderPatients();
}

// Render Patient List

function renderPatients() {
  patientManager.sortPatients();

  const list = document.getElementById("patientsList");
  list.innerHTML = "";

  patientManager.patients.forEach((p, i) => {
    const row = document.createElement("div");
    row.classList.add("patient-row");

    row.innerHTML = `
      <span>${p.name}</span>
      <span>${p.age}</span>
      <span>${p.contact}</span>
      <span>${p.address}</span>
      <span>${p.blood}</span>
      <span>${p.lastVisit}</span>
    `;

    row.onclick = () => openPatientModal(i);
    list.appendChild(row);
  });
}

// OOP Classes

class Person {
  constructor({ name, age, contact, address, sex, photo }) {
    this.name = name;
    this.age = age;
    this.contact = contact;
    this.address = address;
    this.sex = sex;
    this.photo = photo;
  }
}

class Patient extends Person {
  constructor(data) {
    super(data); // inherit Person fields
    this.rfid = data.rfid || "";

    // Patient-specific fields
    this.blood = data.blood || "";
    this.lastVisit = data.lastVisit || "";

    // Medical History
    this.pastIllness = data.pastIllness || "";
    this.chronic = data.chronic || "";
    this.family = data.family || "";
    this.vaccination = data.vaccination || "";
    this.meds = data.meds || "";

    // Vitals
    this.bp = data.bp || "";
    this.hr = data.hr || "";
    this.height = data.height || "";
    this.weight = data.weight || "";

    // Notes
    this.notes = data.notes || "";

    this.department = data.department || "";
    this.lastVisit = data.lastVisit || "";
  }

  // Encapsulation (controlled updates)
  updateInfo(updatedData) {
    Object.assign(this, updatedData);
  }
}

class PatientManager {
  constructor(storageKey = "patients") {
    this.storageKey = storageKey;
    this.patients = [];
    this.load();
  }

  // Load from localStorage
  load() {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return;

    try {
      const array = JSON.parse(data);
      this.patients = array.map((item) => new Patient(item));
    } catch (e) {
      console.error("Error parsing patient data:", e);
    }
  }

  // Save to localStorage
  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.patients));
  }

  // Add a new patient
  addPatient(data) {
    const newPatient = new Patient(data);
    this.patients.push(newPatient);
    this.sortPatients();
    this.save();
  }

  // Sort alphabetically
  sortPatients() {
    this.patients.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get patient by index
  get(index) {
    return this.patients[index];
  }

  // Update patient
  update(index, updatedData) {
    const patient = this.patients[index];
    patient.updateInfo(updatedData);
    this.save();
  }
}
function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// date today
function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Initialize
const patientManager = new PatientManager();

if (patientManager.patients.length === 0) {
  patientManager.addPatient({
    name: "Adrienne Ligaya",
    age: 19,
    contact: "09171234567",
    address: "Quezon City",
    sex: "Female",
    blood: "A+",
    lastVisit: getTodayDate(),
    photo: "/img/p1.jpg",
    rfid: "1189018005",
    weight: 60,
    department: "Medicine",
  });

  patientManager.addPatient({
    name: "Santiago Villareal",
    age: 21,
    contact: "09171262561",
    address: "Manila City",
    sex: "Male",
    blood: "O+",
    lastVisit: getTodayDate(),
    photo: "/img/p2.jpg",
    rfid: "1188764821",
    weight: 72,
    department: "Cardiology",
  });

  patientManager.addPatient({
    name: "Rafael Reyes",
    age: 22,
    contact: "09167362562",
    address: "Manila City",
    sex: "Male",
    blood: "O+",
    lastVisit: getTodayDate(),
    photo: "/img/p3.jpg",
    rfid: "1225256245",
    weight: 71,
    department: "Cardiology",
  });

  patientManager.addPatient({
    name: "Rocky Liwanag",
    age: 23,
    contact: "09667367562",
    address: "Makati City",
    sex: "Female",
    blood: "O+",
    lastVisit: getTodayDate(),
    photo: "/img/p4.jpg",
    rfid: "1188920517",
    weight: 61,
    department: "Medicine",
  });
}

renderPatients();
const patientSearch = document.getElementById("patientSearch");

patientSearch.addEventListener("input", function () {
  filterPatients(this.value.trim().toLowerCase());
});
function filterPatients(keyword) {
  const list = document.getElementById("patientsList");
  list.innerHTML = "";

  // show all if empty search
  if (keyword === "") {
    return renderPatients();
  }

  const filtered = patientManager.patients.filter((p) => {
    return (
      p.name.toLowerCase().includes(keyword) ||
      p.address.toLowerCase().includes(keyword) ||
      p.contact.toLowerCase().includes(keyword) ||
      p.department.toLowerCase().includes(keyword) ||
      p.blood.toLowerCase().includes(keyword)
    );
  });

  filtered.forEach((p, i) => {
    const row = document.createElement("div");
    row.classList.add("patient-row");

    row.innerHTML = `
      <span>${p.name}</span>
      <span>${p.age}</span>
      <span>${p.contact}</span>
      <span>${p.address}</span>
      <span>${p.blood}</span>
      <span>${p.lastVisit}</span>
    `;

    row.onclick = () => openPatientModal(patientManager.patients.indexOf(p));
    list.appendChild(row);
  });
}

function clearAddPatientFields() {
  addName.value = "";
  addAge.value = "";
  addSex.value = "Male"; // default
  addBlood.value = "A+"; // default
  addDepartment.value = "Medicine"; // default
  addContact.value = "";
  addAddress.value = "";
  addRFID.value = "";
}

function openAddPatientModal() {
  clearAddPatientFields();
  document.getElementById("addPatientOverlay").classList.remove("hidden");
}

function closeAddPatient() {
  document.getElementById("addPatientOverlay").classList.add("hidden");
}

function saveNewPatient() {
  const newPatient = {
    name: addName.value,
    age: addAge.value,
    sex: addSex.value,
    blood: addBlood.value,
    department: addDepartment.value,
    contact: addContact.value,
    address: addAddress.value,
    rfid: addRFID.value,
    lastVisit: getTodayDate(), // auto-set today
    photo: "/img/no-pfp-webp.webp", // default
  };

  patientManager.addPatient(newPatient);

  closeAddPatient();
  renderPatients();
}

let rfidBuffer = "";
let rfidTimer = null;

document.addEventListener("keydown", (e) => {
  // If the scanner ends with ENTER
  if (e.key === "Enter") {
    processRFID(rfidBuffer.trim());
    rfidBuffer = "";
    return;
  }

  // Ignore shift, ctrl, etc.
  if (e.key.length > 1) return;

  rfidBuffer += e.key;

  clearTimeout(rfidTimer);
  rfidTimer = setTimeout(() => {
    rfidBuffer = "";
  }, 80); // scanners type very fast (<50ms)
});

let lastRFIDPatientIndex = null;
function processRFID(code) {
  if (!code) return;

  const matched = patientManager.patients.find((p) => p.rfid == code);

  if (!matched) {
    showRFIDNotFound(code);
    return;
  }

  const index = patientManager.patients.indexOf(matched);
  lastRFIDPatientIndex = index;

  // Only update dashboard if dashboard elements exist
  if (document.getElementById("dashName")) {
    updateDashboardPatient(matched);
  }
}

function updateDashboardPatient(p) {
  dashPhoto.src = p.photo;
  dashName.textContent = p.name;
  dashSex.textContent = p.sex;
  dashWeight.textContent = p.weight ? `${p.weight} kg` : "--";
  dashBlood.textContent = p.blood || "--";
  dashLastVisit.textContent = p.lastVisit || "--";
  dashDepartment.textContent = p.department || "--";
}

function showRFIDNotFound(code) {
  alert("RFID not recognized: " + code);
}

document.getElementById("rfidCard").addEventListener("click", () => {
  if (lastRFIDPatientIndex === null) return;

  // Switch page to Patient section
  switchPage("patients", "Patient", null);

  // Give time for UI to switch, then open modal
  setTimeout(() => {
    openPatientModal(lastRFIDPatientIndex);
  }, 50);
});

// ---------- DOCTOR OOP + MANAGER ----------

class Doctor extends Person {
  constructor(data) {
    super(data);
    this.department = data.department || "";
    // schedule as object {mon:true,...}
    this.schedule = data.schedule || {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
    };
    this.patients = data.patients || []; // we will auto-generate view by department (optional)
    this.photo = data.photo || "/img/re1.jpg";
  }

  updateInfo(updatedData) {
    Object.assign(this, updatedData);
  }

  // helper: readable schedule
  scheduleText() {
    const days = [];
    if (this.schedule.mon) days.push("Mon");
    if (this.schedule.tue) days.push("Tue");
    if (this.schedule.wed) days.push("Wed");
    if (this.schedule.thu) days.push("Thu");
    if (this.schedule.fri) days.push("Fri");
    if (this.schedule.sat) days.push("Sat");
    return days.length ? days.join(" ") : "No schedule";
  }
}

class DoctorManager {
  constructor(storageKey = "doctors") {
    this.storageKey = storageKey;
    this.doctors = [];
    this.load();
  }

  load() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return;
    try {
      const arr = JSON.parse(raw);
      this.doctors = arr.map((item) => new Doctor(item));
    } catch (e) {
      console.error("Error parsing doctors:", e);
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.doctors));
  }

  addDoctor(data) {
    const d = new Doctor(data);
    this.doctors.push(d);
    this.sortDoctors();
    this.save();
  }

  sortDoctors() {
    this.doctors.sort((a, b) => a.name.localeCompare(b.name));
  }

  get(index) {
    return this.doctors[index];
  }

  update(index, data) {
    const doc = this.doctors[index];
    doc.updateInfo(data);
    this.save();
  }

  delete(index) {
    this.doctors.splice(index, 1);
    this.save();
  }
}

// initialize
const doctorManager = new DoctorManager();
// add default doctor if none
if (doctorManager.doctors.length === 0) {
  doctorManager.addDoctor({
    name: "Dr. Isabella Marcelline",
    age: 37,
    contact: "09171230000",
    department: "Cardiology",
    schedule: {
      mon: true,
      tue: true,
      wed: true,
      thu: true,
      fri: true,
      sat: false,
    },
    patients: [],
    photo: "/img/re1.jpg",
  });
  doctorManager.addDoctor({
    name: "Dr. Seraphina Lorette",
    age: 28,
    contact: "0917123032",
    department: "Surgery",
    schedule: {
      mon: true,
      tue: true,
      wed: true,
      thu: false,
      fri: true,
      sat: false,
    },
    patients: [],
    photo: "/img/re2.jpg",
  });

  doctorManager.addDoctor({
    name: "Dr. Antoinette Carino",
    age: 26,
    contact: "0916723032",
    department: "Medicine",
    schedule: {
      mon: true,
      tue: true,
      wed: true,
      thu: false,
      fri: true,
      sat: false,
    },
    patients: [],
    photo: "/img/re3.jpg",
  });

  doctorManager.addDoctor({
    name: "Dr. Adria Bellamonte",
    age: 26,
    contact: "0916724332",
    department: "Pediatrics",
    schedule: {
      mon: true,
      tue: true,
      wed: true,
      thu: false,
      fri: true,
      sat: false,
    },
    patients: [],
    photo: "/img/re4.jpg",
  });
}

// ---------- DOCTOR RENDER + UI ----------

function renderDoctors() {
  doctorManager.sortDoctors();
  const list = document.getElementById("doctorsList");
  list.innerHTML = "";
  doctorManager.doctors.forEach((d, i) => {
    const row = document.createElement("div");
    row.classList.add("doctor-row");
    row.innerHTML = `
      <span>${d.name}</span>
      <span>${d.age || "--"}</span>
      <span>${d.contact || "--"}</span>
      <span>${d.department || "--"}</span>
      <span>${d.scheduleText()}</span>
      <span>${countPatientsForDoctor(d)}</span>
    `;
    row.onclick = () => openDoctorModal(i);
    list.appendChild(row);
  });
}

// helper: count patients by department (auto-based)
function countPatientsForDoctor(doctor) {
  if (!patientManager || !patientManager.patients) return 0;
  // Option A: auto-generate by department
  return patientManager.patients.filter(
    (p) => (p.department || "") === (doctor.department || "")
  ).length;
}

// ---------- DOCTOR MODAL LOGIC (view/edit) ----------

let lastDoctorIndex = null;

function openDoctorModal(index) {
  const d = doctorManager.get(index);
  lastDoctorIndex = index;

  // fill fields
  document.getElementById("doctorPhoto").src = d.photo;
  document.getElementById("doctorName").value = d.name;
  document.getElementById("doctorAge").value = d.age || "";
  document.getElementById("doctorSex").value = d.sex || "Male";
  document.getElementById("doctorDepartment").value =
    d.department || "Medicine";
  document.getElementById("doctorContact").value = d.contact || "";

  // schedule checkboxes
  document.getElementById("schedMon").checked = !!d.schedule.mon;
  document.getElementById("schedTue").checked = !!d.schedule.tue;
  document.getElementById("schedWed").checked = !!d.schedule.wed;
  document.getElementById("schedThu").checked = !!d.schedule.thu;
  document.getElementById("schedFri").checked = !!d.schedule.fri;
  document.getElementById("schedSat").checked = !!d.schedule.sat;

  // list patients by department
  renderDoctorPatientsList(d);

  // start read-only
  setDoctorModalReadOnly(true);
  resetDoctorModalButtons();

  document.getElementById("doctorModalOverlay").classList.remove("hidden");
}

function closeDoctorModal() {
  document.getElementById("doctorModalOverlay").classList.add("hidden");
}

function setDoctorModalReadOnly(state) {
  const inputs = document.querySelectorAll(
    "#doctorModalOverlay .modal-input, #doctorModalOverlay .modal-textarea, #doctorModalOverlay .sched-checkbox"
  );
  inputs.forEach((el) => {
    if (el.tagName === "SELECT") el.disabled = state;
    else if (el.type === "checkbox") el.disabled = state;
    else el.readOnly = state;
  });
}

function enterDoctorEditMode() {
  setDoctorModalReadOnly(false);
  const btns = document.getElementById("doctorModalButtons");
  btns.innerHTML = `
    <button class="delete-btn" onclick="openDeleteDoctorConfirm()">Delete</button>
    <div class="right-btns">
      <button class="cancel-btn" onclick="cancelDoctorEdit()">Cancel Edit</button>
      <button class="save-btn" onclick="saveDoctorChanges()">Save Changes</button>
    </div>`;
}

function cancelDoctorEdit() {
  setDoctorModalReadOnly(true);
  resetDoctorModalButtons();
}

function resetDoctorModalButtons() {
  const btns = document.getElementById("doctorModalButtons");
  btns.innerHTML = `
    <button class="cancel-btn" onclick="closeDoctorModal()">Cancel</button>
    <button class="save-btn" id="doctorUpdateBtn" onclick="enterDoctorEditMode()">Update</button>
  `;
}

function saveDoctorChanges() {
  const index = lastDoctorIndex;
  const updated = {
    name: document.getElementById("doctorName").value,
    age: document.getElementById("doctorAge").value,
    sex: document.getElementById("doctorSex").value,
    department: document.getElementById("doctorDepartment").value,
    contact: document.getElementById("doctorContact").value,
    schedule: {
      mon: !!document.getElementById("schedMon").checked,
      tue: !!document.getElementById("schedTue").checked,
      wed: !!document.getElementById("schedWed").checked,
      thu: !!document.getElementById("schedThu").checked,
      fri: !!document.getElementById("schedFri").checked,
      sat: !!document.getElementById("schedSat").checked,
    },
  };

  doctorManager.update(index, updated);
  cancelDoctorEdit();
  renderDoctors();
}

// render patients list inside modal (auto by department)
function renderDoctorPatientsList(doctor) {
  const container = document.getElementById("doctorPatientsList");
  container.innerHTML = "";
  if (!patientManager || !patientManager.patients) return;

  const patients = patientManager.patients.filter(
    (p) => (p.department || "") === (doctor.department || "")
  );
  if (patients.length === 0) {
    container.innerHTML = `<p class="muted">No patients found for ${doctor.department}</p>`;
    return;
  }

  patients.forEach((p) => {
    const el = document.createElement("div");
    el.classList.add("patient-row"); // reuse styles
    el.style.padding = "8px 10px";
    el.style.marginBottom = "6px";
    el.innerHTML = `
      <span style="font-weight:600">${p.name}</span>
      <span style="float:right; opacity:0.8">${p.lastVisit || "--"}</span>
    `;
    // clicking a patient in this mini list opens their modal
    el.onclick = () => {
      const idx = patientManager.patients.indexOf(p);
      // switch to patient page and open modal there
      switchPage("patients", "Patients", null);
      setTimeout(() => openPatientModal(idx), 50);
    };
    container.appendChild(el);
  });
}

// ---------- ADD DOCTOR MODAL ----------

function openAddDoctorModal() {
  clearAddDoctorFields();
  document.getElementById("addDoctorOverlay").classList.remove("hidden");
}

function closeAddDoctor() {
  document.getElementById("addDoctorOverlay").classList.add("hidden");
}

function clearAddDoctorFields() {
  document.getElementById("addDoctorName").value = "";
  document.getElementById("addDoctorAge").value = "";
  document.getElementById("addDoctorSex").value = "Male";
  document.getElementById("addDoctorDepartment").value = "Medicine";
  document.getElementById("addDoctorContact").value = "";
  document.getElementById("addSchedMon").checked = false;
  document.getElementById("addSchedTue").checked = false;
  document.getElementById("addSchedWed").checked = false;
  document.getElementById("addSchedThu").checked = false;
  document.getElementById("addSchedFri").checked = false;
  document.getElementById("addSchedSat").checked = false;
}

function saveNewDoctor() {
  const data = {
    name: document.getElementById("addDoctorName").value,
    age: document.getElementById("addDoctorAge").value,
    sex: document.getElementById("addDoctorSex").value,
    department: document.getElementById("addDoctorDepartment").value,
    contact: document.getElementById("addDoctorContact").value,
    schedule: {
      mon: !!document.getElementById("addSchedMon").checked,
      tue: !!document.getElementById("addSchedTue").checked,
      wed: !!document.getElementById("addSchedWed").checked,
      thu: !!document.getElementById("addSchedThu").checked,
      fri: !!document.getElementById("addSchedFri").checked,
      sat: !!document.getElementById("addSchedSat").checked,
    },
    patients: [],
    photo: "/img/no-pfp-webp.webp",
  };

  doctorManager.addDoctor(data);
  closeAddDoctor();
  renderDoctors();
}

// ---------- DELETE DOCTOR ----------

function openDeleteDoctorConfirm() {
  document
    .getElementById("deleteDoctorConfirmOverlay")
    .classList.remove("hidden");
}

function closeDeleteDoctorConfirm() {
  document.getElementById("deleteDoctorConfirmOverlay").classList.add("hidden");
}

function confirmDeleteDoctor() {
  if (lastDoctorIndex === null) return;
  doctorManager.delete(lastDoctorIndex);
  closeDeleteDoctorConfirm();
  closeDoctorModal();
  renderDoctors();
}

// ---------- SEARCH DOCTORS ----------

document.getElementById("doctorSearch").addEventListener("input", function () {
  filterDoctors(this.value.trim().toLowerCase());
});

function filterDoctors(keyword) {
  const list = document.getElementById("doctorsList");
  list.innerHTML = "";
  if (!keyword) return renderDoctors();

  const filtered = doctorManager.doctors.filter((d) => {
    return (
      (d.name || "").toLowerCase().includes(keyword) ||
      (d.department || "").toLowerCase().includes(keyword) ||
      (d.contact || "").toLowerCase().includes(keyword)
    );
  });

  filtered.forEach((d) => {
    const i = doctorManager.doctors.indexOf(d);
    const row = document.createElement("div");
    row.classList.add("doctor-row");
    row.innerHTML = `
      <span>${d.name}</span>
      <span>${d.age || "--"}</span>
      <span>${d.contact || "--"}</span>
      <span>${d.department || "--"}</span>
      <span>${d.scheduleText()}</span>
      <span>${countPatientsForDoctor(d)}</span>
    `;
    row.onclick = () => openDoctorModal(i);
    list.appendChild(row);
  });
}

// initial render
renderDoctors();

// -------------------- APPOINTMENT OOP --------------------

class Appointment {
  constructor(data) {
    this.patientId = data.patientId;
    this.doctorId = data.doctorId;

    this.date = data.date;
    this.time = data.time;
    this.reason = data.reason || "";
    this.status = data.status || "Pending";
  }

  updateInfo(updated) {
    Object.assign(this, updated);
  }
}

class AppointmentManager {
  constructor(storageKey = "appointments") {
    this.storageKey = storageKey;
    this.appointments = [];
    this.load();
  }

  load() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return;

    try {
      const arr = JSON.parse(raw);
      this.appointments = arr.map((a) => new Appointment(a));
    } catch (e) {
      console.error("Error parsing appointments:", e);
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.appointments));
  }

  addAppointment(data) {
    this.appointments.push(new Appointment(data));
    this.sortAppointments();
    this.save();
  }

  get(index) {
    return this.appointments[index];
  }

  update(index, updatedData) {
    this.appointments[index].updateInfo(updatedData);
    this.save();
  }

  delete(index) {
    this.appointments.splice(index, 1);
    this.save();
  }

  sortAppointments() {
    this.appointments.sort((a, b) => {
      if (a.date === b.date) return a.time.localeCompare(b.time);
      return a.date.localeCompare(b.date);
    });
  }
}

const appointmentManager = new AppointmentManager();

// render
function renderAppointments() {
  appointmentManager.sortAppointments();

  const list = document.getElementById("appointmentsList");
  list.innerHTML = "";

  appointmentManager.appointments.forEach((appt, index) => {
    const patient = patientManager.get(appt.patientId);
    const doctor = doctorManager.get(appt.doctorId);

    const row = document.createElement("div");
    row.classList.add("patient-row");

    row.innerHTML = `
      <span>${patient?.name || "-"}</span>
      <span>${doctor?.name || "-"}</span>
      <span>${appt.date}</span>
      <span>${appt.time}</span>
      <span>${appt.status}</span>
    `;

    row.onclick = () => openAppointmentModal(index);
    list.appendChild(row);
  });
}

// open + close add appointment modal
function openAddAppointmentModal() {
  fillPatientDropdown("addApptPatient");
  fillDoctorDropdown("addApptDoctor");

  document.getElementById("addApptDate").value = "";
  document.getElementById("addApptTime").value = "";
  document.getElementById("addApptReason").value = "";

  document.getElementById("addAppointmentOverlay").classList.remove("hidden");
}

function closeAddAppointment() {
  document.getElementById("addAppointmentOverlay").classList.add("hidden");
}

function saveNewAppointment() {
  const newData = {
    patientId: document.getElementById("addApptPatient").value,
    doctorId: document.getElementById("addApptDoctor").value,

    date: document.getElementById("addApptDate").value,
    time: document.getElementById("addApptTime").value,
    reason: document.getElementById("addApptReason").value,
    status: "Pending",
  };

  appointmentManager.addAppointment(newData);
  closeAddAppointment();
  renderAppointments();
}

// open/view/edit appointment

let currentApptIndex = null;

function openAppointmentModal(index) {
  currentApptIndex = index;
  const appt = appointmentManager.get(index);

  fillPatientDropdown("apptPatient");
  fillDoctorDropdown("apptDoctor");

  document.getElementById("apptPatient").value = appt.patientId;
  document.getElementById("apptDoctor").value = appt.doctorId;
  document.getElementById("apptDate").value = appt.date;
  document.getElementById("apptTime").value = appt.time;
  document.getElementById("apptReason").value = appt.reason;
  document.getElementById("apptStatus").value = appt.status;

  setAppointmentModalReadOnly(true);
  resetApptModalButtons();

  document.getElementById("appointmentModalOverlay").classList.remove("hidden");
}

function closeAppointmentModal() {
  document.getElementById("appointmentModalOverlay").classList.add("hidden");
}

// edit save delete
function setAppointmentModalReadOnly(state) {
  const inputs = document.querySelectorAll(
    "#appointmentModalOverlay .modal-input, #appointmentModalOverlay .modal-textarea"
  );

  inputs.forEach((el) => {
    if (el.tagName === "SELECT") el.disabled = state;
    else el.readOnly = state;
  });
}

function enterApptEditMode() {
  setAppointmentModalReadOnly(false);

  document.getElementById("apptModalButtons").innerHTML = `
    <button class="delete-btn" onclick="openDeleteAppointmentConfirm()">Delete</button>
    <button class="cancel-btn" onclick="cancelApptEdit()">Cancel Edit</button>
    <button class="save-btn" onclick="saveAppointmentChanges()">Save</button>
  `;
}

function cancelApptEdit() {
  setAppointmentModalReadOnly(true);
  resetApptModalButtons();
}

function resetApptModalButtons() {
  document.getElementById("apptModalButtons").innerHTML = `
    <button class="cancel-btn" onclick="closeAppointmentModal()">Cancel</button>
    <button class="save-btn" onclick="enterApptEditMode()">Update</button>
  `;
}

function saveAppointmentChanges() {
  const updated = {
    patientId: document.getElementById("apptPatient").value,
    doctorId: document.getElementById("apptDoctor").value,
    date: document.getElementById("apptDate").value,
    time: document.getElementById("apptTime").value,
    reason: document.getElementById("apptReason").value,
    status: document.getElementById("apptStatus").value,
  };

  appointmentManager.update(currentApptIndex, updated);
  cancelApptEdit();
  renderAppointments();
}

// delete appointment

function openDeleteAppointmentConfirm() {
  document
    .getElementById("deleteAppointmentConfirmOverlay")
    .classList.remove("hidden");
}

function closeDeleteAppointmentConfirm() {
  document
    .getElementById("deleteAppointmentConfirmOverlay")
    .classList.add("hidden");
}

function confirmDeleteAppointment() {
  appointmentManager.delete(currentApptIndex);
  closeDeleteAppointmentConfirm();
  closeAppointmentModal();
  renderAppointments();
}

// dropdown helpers
function fillPatientDropdown(selectId) {
  const sel = document.getElementById(selectId);
  sel.innerHTML = "";

  patientManager.patients.forEach((p, i) => {
    sel.innerHTML += `<option value="${i}">${p.name}</option>`;
  });
}

function fillDoctorDropdown(selectId) {
  const sel = document.getElementById(selectId);
  sel.innerHTML = "";

  doctorManager.doctors.forEach((d, i) => {
    sel.innerHTML += `<option value="${i}">${d.name} (${d.department})</option>`;
  });
}

// search appointments
document
  .getElementById("appointmentSearch")
  .addEventListener("input", function () {
    filterAppointments(this.value.trim().toLowerCase());
  });

function filterAppointments(keyword) {
  const list = document.getElementById("appointmentsList");
  list.innerHTML = "";

  if (!keyword) return renderAppointments();

  appointmentManager.appointments.forEach((appt, idx) => {
    const patient = patientManager.get(appt.patientId);
    const doctor = doctorManager.get(appt.doctorId);

    if (
      patient.name.toLowerCase().includes(keyword) ||
      doctor.name.toLowerCase().includes(keyword) ||
      appt.date.includes(keyword) ||
      appt.status.toLowerCase().includes(keyword)
    ) {
      const row = document.createElement("div");
      row.classList.add("patient-row");

      row.innerHTML = `
        <span>${patient.name}</span>
        <span>${doctor.name}</span>
        <span>${appt.date}</span>
        <span>${appt.time}</span>
        <span>${appt.status}</span>
      `;

      row.onclick = () => openAppointmentModal(idx);
      list.appendChild(row);
    }
  });
}

// initialize
renderAppointments();
