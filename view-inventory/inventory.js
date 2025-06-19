const tbody = document.querySelector("#inventory-table tbody");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");
const inventoryForm = document.getElementById("inventory-form");
const durationInput = document.getElementById("durationInUse");
const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));

let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");
let editingIndex = null;

// Format DateUpdated as "DD Month YYYY"
function formatDateLong(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric"
  });
}

// Calculate Duration in Use
function calculateDuration(start, end) {
  if (!start) return "";
  const s = new Date(start), e = end ? new Date(end) : new Date();
  if (s > e) return "";
  let yrs = e.getFullYear() - s.getFullYear();
  let mos = e.getMonth() - s.getMonth();
  if (mos < 0) { yrs--; mos += 12; }
  let out = "";
  if (yrs > 0) out += yrs + (yrs === 1 ? " yr " : " yrs ");
  if (mos > 0) out += mos + (mos === 1 ? " mo" : " mos");
  return out.trim() || "<1 mo";
}

// Render table
function renderTable() {
  tbody.innerHTML = "";
  const filter = filterSelect.value.toLowerCase(), search = searchInput.value.toLowerCase();

  inventory.forEach((item, i) => {
    if (filter !== "all" && (item.EquipmentType || "").toLowerCase() !== filter) return;
    const combined = Object.values(item).join(" ").toLowerCase();
    if (search && !combined.includes(search)) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.EquipmentType||""}</td>
      <td>${item.Equipment||""}</td>
      <td>${item.Vendor||""}</td>
      <td>${item.BrandModel||""}</td>
      <td>${item.Profile||""}</td>
      <td>${item.Custodian||""}</td>
      <td>${item.AssetNo||""}</td>
      <td>${item.SerialNumber||""}</td>
      <td>${item.Location||""}</td>
      <td>${item.EndDate||""}</td>
      <td>${item.StartDate||""}</td>
      <td>${item.Hostname||""}</td>
      <td>${item["SSOE PO Number"]||""}</td>
      <td>${item["Cart No"]||""}</td>
      <td>${item.SanitiseDate||""}</td>
      <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
      <td>${formatDateLong(item.DateUpdated)}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-index="${i}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${i}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Edit handlers
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      editingIndex = +btn.dataset.index;
      const item = inventory[editingIndex];
      Object.entries(item).forEach(([k,v]) => {
        if (inventoryForm.elements[k]) inventoryForm.elements[k].value = v;
      });
      durationInput.value = calculateDuration(item.StartDate, item.EndDate);
      inventoryModal.show();
    });
  });

  // Delete handlers
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = +btn.dataset.index;
      if (confirm("Delete this item?")) {
        inventory.splice(idx,1);
        saveInventory();
        renderTable();
      }
    });
  });
}

function saveInventory(){
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

// Live update duration in modal
inventoryForm.startDate.addEventListener("change", () => {
  durationInput.value = calculateDuration(inventoryForm.startDate.value, inventoryForm.endDate.value);
});
inventoryForm.endDate.addEventListener("change", () => {
  durationInput.value = calculateDuration(inventoryForm.startDate.value, inventoryForm.endDate.value);
});

// Handle form submit (Add or Edit)
inventoryForm.addEventListener("submit", e => {
  e.preventDefault();
  const fd = new FormData(inventoryForm);
  const obj = {};
  fd.forEach((v,k) => obj[k] = v.trim());
  obj.DateUpdated = new Date().toISOString().slice(0,10);

  if (!obj.EquipmentType || !obj.AssetNo) {
    return alert("Equipment Type & AssetNo are required.");
  }

  if (editingIndex === null) {
    inventory.push(obj);
  } else {
    inventory[editingIndex] = obj;
  }

  saveInventory();
  renderTable();
  inventoryForm.reset();
  durationInput.value = "";
  editingIndex = null;
  inventoryModal.hide();
});

// Filter & search
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Initial
renderTable();
