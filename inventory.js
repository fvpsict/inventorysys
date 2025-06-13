let inventoryData = [];

document.addEventListener("DOMContentLoaded", () => {
  renderTable();
  document.getElementById("itemForm").addEventListener("submit", saveItem);
});

function renderTable() {
  const tableHeaders = document.getElementById("tableHeaders");
  const tableBody = document.getElementById("tableBody");

  // Clear existing
  tableHeaders.innerHTML = "";
  tableBody.innerHTML = "";

  if (inventoryData.length === 0) {
    tableHeaders.innerHTML = "<th>No Data</th>";
    return;
  }

  // Create table headers
  const headers = Object.keys(inventoryData[0]);
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    tableHeaders.appendChild(th);
  });

  // Populate rows
  inventoryData.forEach((item) => {
    const row = document.createElement("tr");
    headers.forEach((key) => {
      const cell = document.createElement("td");
      cell.textContent = item[key] || "";
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });
}

function saveItem(e) {
  e.preventDefault();

  const form = document.getElementById("itemForm");
  const formData = new FormData(form);
  const item = {};

  formData.forEach((value, key) => {
    item[key] = value.trim();
  });

  inventoryData.push(item);
  renderTable();
  form.reset();
  closeModal();
}
