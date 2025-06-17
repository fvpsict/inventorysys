document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#inventory-table tbody");
  const form = document.getElementById("itemForm");
  const modal = new bootstrap.Modal(document.getElementById("itemModal"));
  const addItemBtn = document.getElementById("addItemBtn");
  const searchInput = document.getElementById("searchInput");

  let editIndex = null;

  const headers = [
    "Equipment",
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
    "LampHour",
    "DateUpdated"
  ];

  function formatDate(date = new Date()) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  function calculateDuration(startDate) {
    if (!startDate) return "";
    const start = new Date(startDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years}y ${months}m`;
  }

  function saveToLocalStorage(data) {
    localStorage.setItem("inventoryData", JSON.stringify(data));
  }

  function loadFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem("inventoryData")) || [];
    data.forEach((item, index) => {
      addRow(item, index);
    });
  }

  function getFormData() {
    const formData = {};
    headers.forEach(header => {
      const field = form.elements[header];
      if (field) formData[header] = field.value.trim();
    });
    formData["Duration in use"] = calculateDuration(formData["StartDate"]);
    formData["DateUpdated"] = formatDate();
    return formData;
  }

  function populateForm(data) {
    headers.forEach(header => {
      const field = form.elements[header];
      if (field) field.value = data[header] || "";
    });
  }

  function clearForm() {
    form.reset();
    editIndex = null;
  }

  function addRow(data, index) {
    const row = document.createElement("tr");

    headers.forEach(header => {
      const cell = document.createElement("td");
      cell.textContent = data[header] || "";
      row.appendChild(cell);
    });

    const actions = document.createElement("td");
    actions.innerHTML = `
      <button class="btn btn-sm btn-primary me-2 edit-btn">Edit</button>
      <button class="btn btn-sm btn-danger delete-btn">Delete</button>
    `;
    row.appendChild(actions);

    row.querySelector(".edit-btn").addEventListener("click", () => {
      populateForm(data);
      editIndex = index;
      modal.show();
    });

    row.querySelector(".delete-btn").addEventListener("click", () => {
      const inventory = JSON.parse(localStorage.getItem("inventoryData")) || [];
      inventory.splice(index, 1);
      saveToLocalStorage(inventory);
      renderTable();
    });

    tableBody.appendChild(row);
  }

  function renderTable() {
    tableBody.innerHTML = "";
    const inventory = JSON.parse(localStorage.getItem("inventoryData")) || [];
    inventory.forEach((item, index) => {
      item["Duration in use"] = calculateDuration(item["StartDate"]);
      item["DateUpdated"] = formatDate();
      addRow(item, index);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = getFormData();
    const inventory = JSON.parse(localStorage.getItem("inventoryData")) || [];

    if (editIndex !== null) {
      inventory[editIndex] = data;
    } else {
      inventory.push(data);
    }

    saveToLocalStorage(inventory);
    renderTable();
    modal.hide();
    clearForm();
  });

  addItemBtn.addEventListener("click", () => {
    clearForm();
    modal.show();
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? "" : "none";
    });
  });

  loadFromLocalStorage();
});
