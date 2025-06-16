//inventory.js

document.addEventListener("DOMContentLoaded", () => {
  const inventoryTableBody = document.querySelector("#inventory-table tbody");
  const filterSelect = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-inventory");
  const addItemBtn = document.getElementById("add-item-btn");
  const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const inventoryForm = document.getElementById("inventory-form");
  const modalTitle = document.getElementById("inventoryModalLabel");

  // Columns in order
  const equipmentHeaders = [
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
    "Duration in use",
    "Lamp Hour",
    "DateUpdated",
  ];

  // Load inventory data from localStorage or start with empty array
  let inventoryData = JSON.parse(localStorage.getItem("inventoryData")) || [];

  // Helper: Calculate Duration in use (years + months)
  function calculateDuration(startDateStr, endDateStr) {
    if (!startDateStr) return "";
    let startDate = new Date(startDateStr);
    let endDate = endDateStr ? new Date(endDateStr) : new Date();
    if (isNaN(startDate) || isNaN(endDate)) return "";

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years < 0) return "";
    return `${years} yrs ${months} mos`;
  }

  // Render table rows based on data array
  function renderTable(data) {
    inventoryTableBody.innerHTML = "";
    if (data.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = equipmentHeaders.length + 1;
      td.classList.add("text-center", "text-muted");
      td.textContent = "No items found.";
      tr.appendChild(td);
      inventoryTableBody.appendChild(tr);
      return;
    }

    data.forEach((item, index) => {
      const tr = document.createElement("tr");

      equipmentHeaders.forEach((key) => {
        const td = document.createElement("td");

        if (key === "Duration in use") {
          td.textContent = calculateDuration(item.StartDate, item.EndDate);
        } else {
          td.textContent = item[key] || "";
        }

        tr.appendChild(td);
      });

      // Actions column
      const actionsTd = document.createElement("td");
      actionsTd.classList.add("text-center");

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-primary me-2";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openModalForEdit(index));
      actionsTd.appendChild(editBtn);

      // Delete button
      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-sm btn-danger";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => deleteItem(index));
      actionsTd.appendChild(delBtn);

      tr.appendChild(actionsTd);
      inventoryTableBody.appendChild(tr);
    });
  }

  // Filter and search combined function
  function filterAndSearch() {
    const selectedType = filterSelect.value;
    const searchTerm = searchInput.value.trim().toLowerCase();

    let filteredData = inventoryData;

    if (selectedType !== "All") {
      filteredData = filteredData.filter(
        (item) => item.EquipmentType === selectedType
      );
    }

    if (searchTerm !== "") {
      filteredData = filteredData.filter((item) =>
        equipmentHeaders.some(
          (key) =>
            item[key] &&
            item[key].toString().toLowerCase().includes(searchTerm)
        )
      );
    }

    renderTable(filteredData);
  }

  // Open modal for add new item
  function openModalForAdd() {
    modalTitle.textContent = "Add Item";
    inventoryForm.innerHTML = "";

    equipmentHeaders.forEach((key) => {
      const formGroup = document.createElement("div");
      formGroup.className = "mb-3";

      const label = document.createElement("label");
      label.className = "form-label";
      label.setAttribute("for", `input-${key}`);
      label.textContent = key;

      let input;
      // For dates, use date input type
      if (key.toLowerCase().includes("date") || key === "EndDate" || key === "StartDate") {
        input = document.createElement("input");
        input.type = "date";
      } else {
        input = document.createElement("input");
        input.type = "text";
      }

      input.className = "form-control";
      input.id = `input-${key}`;
      input.name = key;

      formGroup.appendChild(label);
      formGroup.appendChild(input);
      inventoryForm.appendChild(formGroup);
    });

    // Add Save and Cancel buttons
    const btnGroup = document.createElement("div");
    btnGroup.className = "d-flex justify-content-end gap-2";

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn-success";
    saveBtn.textContent = "Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-secondary";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => inventoryModal.hide());

    btnGroup.appendChild(cancelBtn);
    btnGroup.appendChild(saveBtn);
    inventoryForm.appendChild(btnGroup);

    // Submit handler
    inventoryForm.onsubmit = function (e) {
      e.preventDefault();
      const formData = new FormData(inventoryForm);
      const newItem = {};
      equipmentHeaders.forEach((key) => {
        newItem[key] = formData.get(key) || "";
      });
      newItem["DateUpdated"] = new Date().toISOString().slice(0, 10);

      inventoryData.push(newItem);
      saveAndRefresh();
      inventoryModal.hide();
    };

    inventoryModal.show();
  }

  // Open modal for editing an existing item
  function openModalForEdit(index) {
    modalTitle.textContent = "Edit Item";
    inventoryForm.innerHTML = "";

    const item = inventoryData[index];

    equipmentHeaders.forEach((key) => {
      const formGroup = document.createElement("div");
      formGroup.className = "mb-3";

      const label = document.createElement("label");
      label.className = "form-label";
      label.setAttribute("for", `input-${key}`);
      label.textContent = key;

      let input;
      if (key.toLowerCase().includes("date") || key === "EndDate" || key === "StartDate") {
        input = document.createElement("input");
        input.type = "date";
      } else {
        input = document.createElement("input");
        input.type = "text";
      }

      input.className = "form-control";
      input.id = `input-${key}`;
      input.name = key;
      input.value = item[key] || "";

      formGroup.appendChild(label);
      formGroup.appendChild(input);
      inventoryForm.appendChild(formGroup);
    });

    // Save and Cancel buttons
    const btnGroup = document.createElement("div");
    btnGroup.className = "d-flex justify-content-end gap-2";

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn-success";
    saveBtn.textContent = "Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-secondary";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => inventoryModal.hide());

    btnGroup.appendChild(cancelBtn);
    btnGroup.appendChild(saveBtn);
    inventoryForm.appendChild(btnGroup);

    inventoryForm.onsubmit = function (e) {
      e.preventDefault();
      const formData = new FormData(inventoryForm);
      equipmentHeaders.forEach((key) => {
        item[key] = formData.get(key) || "";
      });
      item["DateUpdated"] = new Date().toISOString().slice(0, 10);

      saveAndRefresh();
      inventoryModal.hide();
    };

    inventoryModal.show();
  }

  // Delete an item by index
  function deleteItem(index) {
    if (confirm("Are you sure you want to delete this item?")) {
      inventoryData.splice(index, 1);
      saveAndRefresh();
    }
  }

  // Save data to localStorage and refresh table
  function saveAndRefresh() {
    localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
    filterAndSearch();
  }

  // Initial render
  renderTable(inventoryData);

  // Event listeners
  filterSelect.addEventListener("change", filterAndSearch);
  searchInput.addEventListener("input", filterAndSearch);
  addItemBtn.addEventListener("click", openModalForAdd);
});
