document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#inventory-table tbody");
  const addItemBtn = document.getElementById("add-item-btn");
  const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const form = document.getElementById("inventory-modal-form");

  let editingIndex = -1;

  function loadInventory() {
    const data = JSON.parse(localStorage.getItem("inventoryData") || "[]");
    tableBody.innerHTML = "";
    data.forEach((item, index) => {
      tableBody.appendChild(createRow(item, index));
    });
  }

  function saveInventory(data) {
    localStorage.setItem("inventoryData", JSON.stringify(data));
  }

  function getFormData() {
    const formData = new FormData(form);
    const item = {};
    formData.forEach((value, key) => {
      item[key] = value;
    });

    item["DateUpdated"] = new Date().toISOString().split("T")[0];
    item["Duration in use"] = calculateDuration(item["StartDate"], item["EndDate"]);
    return item;
  }

  function fillForm(data) {
    Object.entries(data).forEach(([key, value]) => {
      const input = form.elements[key];
      if (input) input.value = value;
    });
  }

  function clearForm() {
    form.reset();
    editingIndex = -1;
    form.elements["DateUpdated"].value = "";
  }

  function calculateDuration(start, end) {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years}y ${months}m`;
  }

  function createRow(data, index) {
    const tr = document.createElement("tr");
    const headers = [
      "EquipmentType", "Equipment", "Vendor", "BrandModel", "Profile", "Custodian", "AssetNo",
      "SerialNumber", "Location", "EndDate", "StartDate", "Hostname",
      "SSOE PO Number", "Cart No", "SanitiseDate", "Duration in use", "Lamp Hour", "DateUpdated"
    ];

    headers.forEach((field) => {
      const td = document.createElement("td");
      td.textContent = data[field] || "";
      tr.appendChild(td);
    });

    const actionTd = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-primary me-2";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => {
      editingIndex = index;
      fillForm(data);
      modal.show();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => {
      if (confirm("Delete this entry?")) {
        const all = JSON.parse(localStorage.getItem("inventoryData") || "[]");
        all.splice(index, 1);
        saveInventory(all);
        loadInventory();
      }
    };

    actionTd.appendChild(editBtn);
    actionTd.appendChild(deleteBtn);
    tr.appendChild(actionTd);

    return tr;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newItem = getFormData();
    const allItems = JSON.parse(localStorage.getItem("inventoryData") || "[]");

    if (editingIndex > -1) {
      allItems[editingIndex] = newItem;
    } else {
      allItems.push(newItem);
    }

    saveInventory(allItems);
    loadInventory();
    modal.hide();
    clearForm();
  });

  addItemBtn.addEventListener("click", () => {
    clearForm();
    modal.show();
  });

  // Filter functionality
  const filterSelect = document.getElementById("filter-equipmenttype");
  filterSelect.addEventListener("change", () => {
    const selected = filterSelect.value;
    const all = JSON.parse(localStorage.getItem("inventoryData") || "[]");
    const filtered = selected === "all" ? all : all.filter(d => d.EquipmentType === selected);
    tableBody.innerHTML = "";
    filtered.forEach((item, idx) => {
      tableBody.appendChild(createRow(item, idx));
    });
  });

  // Search functionality
  const searchBox = document.getElementById("search-inventory");
  searchBox.addEventListener("input", () => {
    const term = searchBox.value.toLowerCase();
    const all = JSON.parse(localStorage.getItem("inventoryData") || "[]");
    const filtered = all.filter(obj => Object.values(obj).some(v => (v || "").toLowerCase().includes(term)));
    tableBody.innerHTML = "";
    filtered.forEach((item, idx) => {
      tableBody.appendChild(createRow(item, idx));
    });
  });

  loadInventory();
});
