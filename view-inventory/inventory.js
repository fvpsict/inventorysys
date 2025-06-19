const tbody = document.querySelector("#inventory-table tbody");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");
const inventoryForm = document.getElementById("inventory-form");
const durationInput = document.getElementById("durationInUse");
const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));

let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");

// Format Date Updated as "DD Month YYYY"
function formatDateLong(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

// Calculate Duration in Use (X yrs Y mos)
function calculateDuration(start, end) {
  if (!start) return "";
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  if (isNaN(s) || isNaN(e) || s > e) return "";
  let yrs = e.getFullYear() - s.getFullYear();
  let mos = e.getMonth() - s.getMonth();
  if (mos < 0) {
    yrs--;
    mos += 12;
  }
  let out = "";
  if (yrs > 0) out += yrs + (yrs === 1 ? " yr " : " yrs ");
  if (mos > 0) out += mos + (mos === 1 ? " mo" : " mos");
  return out.trim() || "<1 mo";
}

// Render table rows
function renderTable() {
  tbody.innerHTML = "";
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory.forEach((item, i) => {
    if (filter !== "all" && (item.EquipmentType || "").toLowerCase() !== filter) return;

    const combined = Object.values(item).join(" ").toLowerCase();
    if (search && !combined.includes(search)) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.EquipmentType || ""}</td>
      <td>${item.Equipment || ""}</td>
      <td>${item.Vendor || ""}</td>
      <td>${item.BrandModel || ""}</td>
      <td>${item.Profile || ""}</td>
      <td>${item.Custodian || ""}</td>
      <td>${item.AssetNo || ""}</td>
      <td>${item.SerialNumber || ""}</td>
      <td>${item.Location || ""}</td>
      <td>${item.EndDate || ""}</td>
      <td>${item.StartDate || ""}</td>
      <td>${item.Hostname || ""}</td>
      <td>${item["SSOE PO Number"] || ""}</td>
      <td>${item["Cart No"] || ""}</td>
      <td>${item.SanitiseDate || ""}</td>
      <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
      <td>${formatDateLong(item.DateUpdated)}</td>
      <td>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${i}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach delete handlers
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = +btn.dataset.index;
      if (confirm("Delete this item?")) {
        inventory.splice(idx, 1);
        saveInventory();
        renderTable();
      }
    });
  });
}

// Save to localStorage
function saveInventory() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

// Update duration live as dates change
function updateDuration() {
  const sd = inventoryForm.startDate.value;
  const ed = inventoryForm.endDate.value;
  durationInput.value = calculateDuration(sd, ed);
}
inventoryForm.startDate.addEventListener("change", updateDuration);
inventoryForm.endDate.addEventListener("change", updateDuration);

// Handle form submission to add new item
inventoryForm.addEventListener("submit", e => {
  e.preventDefault();
  const fd = new FormData(inventoryForm);
  const newItem = {
    EquipmentType: fd.get("EquipmentType").trim(),
    Equipment: fd.get("Equipment").trim(),
    Vendor: fd.get("Vendor").trim(),
    BrandModel: fd.get("BrandModel").trim(),
    Profile: fd.get("Profile").trim(),
    Custodian: fd.get("Custodian").trim(),
    AssetNo: fd.get("AssetNo").trim(),
    SerialNumber: fd.get("SerialNumber").trim(),
    Location: fd.get("Location").trim(),
    EndDate: fd.get("EndDate"),
    StartDate: fd.get("StartDate"),
    Hostname: fd.get("Hostname").trim(),
    "SSOE PO Number": fd.get("SSOE PO Number").trim(),
    "Cart No": fd.get("Cart No").trim(),
    SanitiseDate: fd.get("SanitiseDate"),
    DateUpdated: new Date().toISOString().slice(0,10)
  };

  if (!newItem.EquipmentType || !newItem.AssetNo) {
    alert("Please fill in Equipment Type and AssetNo.");
    return;
  }

  inventory.push(newItem);
  saveInventory();
  renderTable();
  inventoryForm.reset();
  durationInput.value = "";
  inventoryModal.hide();
});

// Filter & Search bindings
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Initial render
renderTable();
