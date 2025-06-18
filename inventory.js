document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#inventory-table tbody");
  const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const form = document.getElementById("inventory-form");
  const addItemBtn = document.getElementById("add-item-btn");
  const equipmentTypeField = document.getElementById("EquipmentType");
  const equipmentField = document.getElementById("Equipment");
  const filterDropdown = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-inventory");

  let inventoryData = JSON.parse(localStorage.getItem("inventoryData") || "[]");
  let editIndex = null;

  function calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return "";
    const start = new Date(startDate);
    const end = new Date(endDate);
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} year(s) ${months} month(s)`;
  }

  function updateTable() {
    tableBody.innerHTML = "";
    const filter = filterDropdown.value;
    const search = searchInput.value.toLowerCase();

    inventoryData.forEach((item, index) => {
      if (filter !== "all" && item.EquipmentType !== filter) return;

      const rowValues = Object.values(item);
      if (
        search &&
        !rowValues.some(val => (val || "").toString().toLowerCase().includes(search))
      ) return;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.EquipmentType}</td>
        <td>${item.Equipment || ""}</td>
        <td>${item.Vendor || ""}</td>
        <td>${item.BrandModel || ""}</td>
        <td>${item.Profile || ""}</td>
        <td>${item.Custodian || ""}</td>
        <td>${item.AssetNo}</td>
        <td>${item.SerialNumber || ""}</td>
        <td>${item.Location || ""}</td>
        <td>${item.StartDate || ""}</td>
        <td>${item.EndDate || ""}</td>
        <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
        <td>${item.DateUpdated || ""}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1 edit-btn" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  function saveData() {
    localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
    updateTable();
  }

  addItemBtn.addEventListener("click", () => {
    form.reset();
    editIndex = null;
    document.getElementById("DateUpdated").value = new Date().toISOString().split("T")[0];
    modal.show();
  });

  equipmentTypeField.addEventListener("change", () => {
    if (equipmentTypeField.value === "SSOE") {
      equipmentField.disabled = false;
      equipmentField.required = true;
    } else {
      equipmentField.disabled = true;
      equipmentField.required = false;
      equipmentField.value = "";
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const item = Object.fromEntries(formData.entries());
    item.DateUpdated = new Date().toISOString().split("T")[0];

    if (editIndex === null) {
      inventoryData.push(item);
    } else {
      inventoryData[editIndex] = item;
    }

    saveData();
    modal.hide();
  });

  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const index = e.target.dataset.index;
      const item = inventoryData[index];
      editIndex = index;
      Object.entries(item).forEach(([key, value]) => {
        const input = form.elements[key];
        if (input) input.value = value;
      });
      modal.show();
    }

    if (e.target.classList.contains("delete-btn")) {
      const index = e.target.dataset.index;
      if (confirm("Are you sure you want to delete this item?")) {
        inventoryData.splice(index, 1);
        saveData();
      }
    }
  });

  filterDropdown.addEventListener("change", updateTable);
  searchInput.addEventListener("input", updateTable);

  updateTable();
});
