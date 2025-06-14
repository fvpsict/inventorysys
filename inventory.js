const STORAGE_KEY = 'inventoryData';
let inventory = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const defaultHeaders = ["AssetNo", "Item", "Brand", "Model", "Serial", "Location"];
const ssoeHeaders = ["AssetNo", "Room", "ComputerName", "IP", "Monitor", "MonitorSN", "Keyboard", "Mouse"];

function getHeaders(category) {
  return category === "SSOE" ? ssoeHeaders : defaultHeaders;
}

function saveInventory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

function renderInventory(category = "All") {
  const tableContainer = document.getElementById("inventoryTableContainer");
  if (!tableContainer) return;

  const headers = getHeaders(category !== "All" ? category : "SSOE"); // Use SSOE as default

  let filteredData = category === "All"
    ? inventory
    : inventory.filter(item => item.Category === category);

  let table = `<table class="table table-bordered"><thead><tr>`;
  headers.forEach(h => table += `<th>${h}</th>`);
  table += `<th>Category</th><th>Actions</th></tr></thead><tbody>`;

  filteredData.forEach((item, index) => {
    table += `<tr>`;
    headers.forEach(h => {
      table += `<td contenteditable="true" onblur="updateItem(${index}, '${h}', this.innerText)">${item[h] || ''}</td>`;
    });
    table += `
      <td contenteditable="true" onblur="updateItem(${index}, 'Category', this.innerText)">${item.Category || ''}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteItem(${index})">Delete</button>
      </td>
    </tr>`;
  });

  table += `</tbody></table>`;
  tableContainer.innerHTML = table;
}

function updateItem(index, key, value) {
  inventory[index][key] = value.trim();
  saveInventory();
}

function deleteItem(index) {
  if (confirm("Are you sure you want to delete this item?")) {
    inventory.splice(index, 1);
    saveInventory();
    renderInventory(getSelectedCategory());
  }
}

function getSelectedCategory() {
  const select = document.getElementById("categoryFilter");
  return select ? select.value : "All";
}

function addItem(event) {
  event.preventDefault();
  const category = document.getElementById("category").value;
  const headers = getHeaders(category);
  const newItem = {};

  let isValid = true;

  headers.forEach(h => {
    const val = document.getElementById(h).value.trim();
    if (!val && h === "AssetNo") isValid = false;
    newItem[h] = val;
  });

  if (!isValid) {
    alert("AssetNo is required.");
    return;
  }

  newItem.Category = category;
  inventory.push(newItem);
  saveInventory();
  renderInventory(getSelectedCategory());
  document.getElementById("addForm").reset();
}

function clearForm() {
  document.getElementById("addForm").reset();
}

function initInventoryPage() {
  document.getElementById("addForm").addEventListener("submit", addItem);
  document.getElementById("categoryFilter").addEventListener("change", () => {
    renderInventory(getSelectedCategory());
  });

  renderInventory();
}

window.onload = initInventoryPage;
