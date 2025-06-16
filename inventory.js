document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "fvpsInventory";
  let inventory = JSON.parse(localStorage.getItem(storageKey)) || [];
  let editingIndex = null;

  const tableBody = document.querySelector("#inventory-table tbody");
  const filterSelect = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-inventory");
  const addBtn = document.getElementById("add-item-btn");

  const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const modalForm = document.getElementById("inventory-modal-form");
  const modalTitle = document.getElementById("inventoryModalLabel");

  // Calculate duration in use (years + months)
  function calcDuration(start, end) {
    if (!start) return "";
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    if (endDate < startDate) return "";

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }
    let result = "";
    if (years > 0) result += `${years} yr${years > 1 ? "s" : ""} `;
    if (months > 0) result += `${months} mo${months > 1 ? "s" : ""}`;
    return result.trim() || "<1 mo";
  }

  // Save inventory to localStorage
  function saveInventory() {
    localStorage.setItem(storageKey, JSON.stringify(inventory));
  }

  // Render table rows based on inventory array & filters
  function renderTable() {
    const filter = filterSelect.value.toLowerCase();
    const searchTerm = searchInput.value.trim().toLowerCase();

    tableBody.innerHTML = "";

    inventory.forEach((item, index) => {
      if (filter !== "all" && item.EquipmentType.toLowerCase() !== filter) return;

      const searchableText = Object.values(item).join(" ").toLowerCase();
      if (!searchableText.includes(searchTerm)) return;

      const tr = document.createElement("tr");

      const cols = [
        "EquipmentType", "Vendor", "BrandModel", "Profile", "Custodian",
        "AssetNo", "SerialNumber", "Location", "EndDate", "StartDate",
        "Hostname", "SSOE_PONumber", "CartNo", "SanitiseDate"
      ];

      cols.forEach((col) => {
        const td = document.createElement("td");
        if (["EndDate", "StartDate", "SanitiseDate"].includes(col)) {
          td.textContent = item[col] ? new Date(item[col]).toLocaleDateString() : "";
        } else {
          td.textContent = item[col] || "";
        }
        tr.appendChild(td);
      });

      // Duration in use
      const durTd = document.createElement("td");
      durTd.textContent = calcDuration(item.StartDate, item.EndDate);
      tr.appendChild(durTd);

      // Lamp Hour
      const lampTd = document.createElement("td");
      lampTd.textContent = item.LampHour || "";
      tr.appendChild(lampTd);

      // Date Updated
      const updatedTd = document.createElement("td");
      updatedTd.textContent = item.DateUpdated || "";
      tr.appendChild(updatedTd);

      // Actions
      const actionTd = document.createElement("td");
      actionTd.className = "text-center";

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-primary me-1";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openEditModal(index));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deleteItem(index));

      actionTd.appendChild(editBtn);
      actionTd.appendChild(deleteBtn);
      tr.appendChild(actionTd);

      tableBody.appendChild(tr);
    });
  }

  function openAddModal() {
    editingIndex = null;
    modalTitle.textContent = "Add Inventory Item";
    modalForm.reset();
    modalForm.elements["DateUpdated"].value = "";
    modal.show();
  }

  function openEditModal(index) {
    editingIndex = index;
    modalTitle.textContent = "Edit Inventory Item";

    const item = inventory[index];
    for (const key in item) {
      if (modalForm.elements[key]) {
        modalForm.elements[key].value = item[key];
      }
    }

    modal.show();
  }

  function deleteItem(index) {
    if (confirm("Are you sure you want to delete this item?")) {
      inventory.splice(index, 1);
      saveInventory();
      renderTable();
    }
  }

  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(modalForm);
    const newItem = {};
    for (const [key, value] of formData.entries()) {
      newItem[key] = value.trim();
    }

    newItem.DateUpdated = new Date().toLocaleString();

    if (editingIndex === null) {
      inventory.push(newItem);
    } else {
      inventory[editingIndex] = newItem;
    }

    saveInventory();
    renderTable();
    modal.hide();
  });

  filterSelect.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);
  addBtn.addEventListener("click", openAddModal);

  renderTable();
});
