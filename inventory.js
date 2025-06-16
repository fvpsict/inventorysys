// inventory.js

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
      // Filter by EquipmentType
      if (filter !== "all" && item.EquipmentType.toLowerCase() !== filter) return;

      // Search in any field (simple)
      const searchableText = Object.values(item).join(" ").toLowerCase();
      if (!searchableText.includes(searchTerm)) return;

      const tr = document.createElement("tr");

      // Create cells for all required columns
      const cols = [
        "EquipmentType",
        "Vendor",
        "BrandModel",
        "Profile",
        "Custodian",
        "AssetNo",
        "SerialNumber",
        "Location",
        "EndDate",
        "StartDate",
        "Hostname",
        "SSOE PO Number",
        "Cart No",
        "SanitiseDate",
        "Lamp Hour",
        "DateUpdated"
      ];

      cols.forEach((col) => {
        const td = document.createElement("td");

        // Format dates for display
        if (col === "EndDate" || col === "StartDate" || col === "SanitiseDate") {
          td.textContent = item[col] ? new Date(item[col]).toLocaleDateString() : "";
        } else {
          td.textContent = item[col] || "";
        }
        tr.appendChild(td);
      });

      // Duration in use column (calculated)
      const durTd = document.createElement("td");
      durTd.textContent = calcDuration(item.StartDate, item.EndDate);
      tr.insertBefore(durTd, tr.children[14]); // Before Lamp Hour column

      // Actions column with Edit and Delete buttons
      const actionTd = document.createElement("td");
      actionTd.classList.add("text-center");

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

  // Open modal for adding new item
  function openAddModal() {
    editingIndex = null;
    modalTitle.textContent = "Add Inventory Item";
    modalForm.reset();

    // Clear DateUpdated field
    modalForm.elements["DateUpdated"].value = "";
    modal.show();
  }

  // Open modal for editing existing item
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

  // Delete item with confirmation
  function deleteItem(index) {
    if (confirm("Are you sure you want to delete this item?")) {
      inventory.splice(index, 1);
      saveInventory();
      renderTable();
    }
  }

  // Handle modal form submission (Add or Edit)
  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(modalForm);
    const newItem = {};
    for (const [key, value] of formData.entries()) {
      newItem[key] = value.trim();
    }

    // Set DateUpdated to current datetime string
    newItem.DateUpdated = new Date().toLocaleString();

    if (editingIndex === null) {
      // Add new item
      inventory.push(newItem);
    } else {
      // Update existing item
      inventory[editingIndex] = newItem;
    }

    saveInventory();
    renderTable();
    modal.hide();
  });

  // Event listeners for filter and search
  filterSelect.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);
  addBtn.addEventListener("click", openAddModal);

  // Initial render
  renderTable();
});
