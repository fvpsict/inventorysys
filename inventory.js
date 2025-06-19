const tbody = document.querySelector("#inventory-table tbody");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");
const addItemBtn = document.getElementById("add-item-btn");
const form = document.getElementById("inventory-modal-form");
const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");
let editingIndex = null;

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function calculateDuration(start, end) {
  if (!start) return "";
  const s = new Date(start), e = end ? new Date(end) : new Date();
  if (s > e) return "";
  let years = e.getFullYear() - s.getFullYear(), months = e.getMonth() - s.getMonth();
  if (months < 0) { years--; months += 12; }
  let parts = [];
  if (years) parts.push(`${years} yr${years>1?'s':''}`);
  if (months) parts.push(`${months} mo${months>1?'s':''}`);
  return parts.length ? parts.join(" ") : "<1 mo";
}

function renderTable() {
  tbody.innerHTML = "";
  const filterVal = filterSelect.value.toLowerCase();
  const searchVal = searchInput.value.toLowerCase();
  inventory.forEach((item, idx) => {
    if (filterVal !== "all" && item.EquipmentType?.toLowerCase() !== filterVal) return;
    if (!Object.values(item).some(x => x?.toString().toLowerCase().includes(searchVal))) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.EquipmentType||""}</td><td>${item.Equipment||""}</td><td>${item.Vendor||""}</td>
      <td>${item.BrandModel||""}</td><td>${item.Profile||""}</td><td>${item.Custodian||""}</td>
      <td>${item.AssetNo||""}</td><td>${item.SerialNumber||""}</td><td>${item.Location||""}</td>
      <td>${formatDate(item.StartDate)}</td><td>${formatDate(item.EndDate)}</td>
      <td>${calculateDuration(item.StartDate,item.EndDate)}</td><td>${item.Hostname||""}</td>
      <td>${item.SSOE_PO_No||""}</td><td>${item.CartNo||""}</td><td>${formatDate(item.SanitiseDate)}</td>
      <td>${item.LampHour||""}</td><td>${item.DateUpdated||""}</td>
      <td>
        <button class="btn btn-sm btn-primary btn-edit" data-idx="${idx}">Edit</button>
        <button class="btn btn-sm btn-danger btn-delete" data-idx="${idx}">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
  attachButtons();
}

function attachButtons() {
  document.querySelectorAll(".btn-edit").forEach(b => {
    b.onclick = () => { editingIndex = b.dataset.idx; fillForm(inventory[editingIndex]); modal.show(); };
  });
  document.querySelectorAll(".btn-delete").forEach(b => {
    b.onclick = () => {
      if (confirm("Delete this item?")) {
        inventory.splice(b.dataset.idx,1);
        saveAndRender();
      }
    };
  });
}

function resetForm() {
  editingIndex = null;
  form.reset();
  form.DateUpdated.value = formatDate(new Date().toISOString().split('T')[0]);
}

function fillForm(item) {
  for (const key in item) {
    if (form[key] !== undefined) form[key].value = item[key];
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();
  if (!form.checkValidity()) { form.classList.add("was-validated"); return; }

  const fd = new FormData(form);
  let item = {};
  fd.forEach((v, k) => item[k] = v);
  item.DateUpdated = formatDate(new Date().toISOString().split("T")[0]);

  if (editingIndex !== null) inventory[editingIndex] = item;
  else inventory.push(item);

  saveAndRender();
  modal.hide();
});

function saveAndRender() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
  renderTable();
}

addItemBtn.onclick = () => { resetForm(); modal.show(); };
filterSelect.onchange = renderTable;
searchInput.oninput = renderTable;

// Initial
renderTable();
