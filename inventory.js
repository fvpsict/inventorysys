// Sample data for demonstration
const inventoryData = [
  {
    equipmentType: "Projector",
    vendor: "Epson",
    brandModel: "EB-X41",
    serialNo: "12345ABC",
    assetNo: "A-001",
    location: "Room 101"
  },
  {
    equipmentType: "Laptop",
    vendor: "HP",
    brandModel: "EliteBook 840",
    serialNo: "98765XYZ",
    assetNo: "A-002",
    location: "IT Room"
  }
];

// Dynamically render headers and data into table
function renderInventoryTable(data) {
  const tableHeaders = document.getElementById("tableHeaders");
  const tableBody = document.getElementById("tableBody");

  tableHeaders.innerHTML = "";
  tableBody.innerHTML = "";

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="10">No data available</td></tr>`;
    return;
  }

  // Extract keys from first object as headers
  const headers = Object.keys(data[0]);

  // Render table headers
  headers.forEach((key) => {
    const th = document.createElement("th");
    th.textContent = toTitleCase(key);
    tableHeaders.appendChild(th);
  });

  // Render table rows
  data.forEach((row) => {
    const tr = document.createElement("tr");
    headers.forEach((key) => {
      const td = document.createElement("td");
      td.textContent = row[key] || "";
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

// Utility function to convert camelCase to Title Case
function toTitleCase(str) {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, function (s) {
      return s.toUpperCase();
    });
}

// Add new item to table (can be extended to use modal form)
function addInventoryItem(item) {
  inventoryData.push(item);
  renderInventoryTable(inventoryData);
}

// Call on page load
document.addEventListener("DOMContentLoaded", function () {
  renderInventoryTable(inventoryData);
});
