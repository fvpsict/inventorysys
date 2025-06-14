const STANDARD_HEADERS = [
  "EquipmentType", "Vendor", "BrandModel", "AssetNo", "SerialNo",
  "StartDate", "EndDate", "Room", "RoomNo", "Lamphour", "DurationInUse"
];

const SSOE_HEADERS = [
  "EquipmentType", "Vendor", "BrandModel", "Profile", "Custodian", "AssetNo",
  "SerialNumber", "Location", "EndDate", "StartDate", "Hostname",
  "SSOE PONumber", "CartNo", "SanitiseDate", "Fault"
];

let inventoryData = JSON.parse(localStorage.getItem("inventoryData")) || [];

function getHeadersByCategory(category) {
  return category === "SSOE" ? SSOE_HEADERS : STANDARD_HEADERS;
}

function renderInventory(category) {
  const headers = getHeadersByCategory(category);
  const tableContainer = document.getElementById("inventoryTableContainer");
  const filteredData = inventoryData.filter(item => item.EquipmentType === category);
  
  let html = `<table class="table table-bordered"><thead><tr>`;
  headers.forEach(header => {
    html += `<th>${header}</th>`;
  });
  html += `<th>Actions</th></tr></thead><tbody>`;

  filteredData.forEach((item, index) => {
    html += `<tr>`;
    headers.forEach(header => {
      html += `<td contenteditable="true" oninput="editItem(${index}, '${header}', this.innerText)">${item[header] || ""}</td>`;
    });
    html += `<td><button class="btn btn-sm btn-danger" onclick="deleteItem(${index})">Delete</button></td>`;
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  tableContainer.innerHTML = html;
}

function addItem(category) {
  const headers = getHeadersByCategory(category);
  const newItem = {};
  headers.forEach(header => {
    const input = document.getElementById(`input-${header}`);
    newItem[header] = input ? input.value.trim() : "";
  });

  inventoryData.push(newItem);
  localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
  renderInventory(category);
  document.getElementById("addItemForm").reset();
}

function editItem(index, key, value) {
  const filteredIndex = getFilteredIndex(index);
  if (filteredIndex !== -1) {
    inventoryData[filteredIndex][key] = value.trim();
    localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
  }
}

function deleteItem(index) {
  const filteredIndex = getFilteredIndex(index);
  if (filteredIndex !== -1 && confirm("Delete this item?")) {
    inventoryData.splice(filteredIndex, 1);
    localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
    const currentCategory = document.getElementById("categorySelect").value;
    renderInventory(currentCategory);
  }
}

function getFilteredIndex(displayIndex) {
  const currentCategory = document.getElementById("categorySelect").value;
  let count = -1;
  for (let i = 0; i < inventoryData.length; i++) {
    if (inventoryData[i].EquipmentType === currentCategory) {
      count++;
      if (count === displayIndex) return i;
    }
  }
  return -1;
}

function setupCategorySelector() {
  const select = document.getElementById("categorySelect");
  select.addEventListener("change", () => {
    renderInventory(select.value);
    buildAddForm(select.value);
  });
  renderInventory(select.value);
  buildAddForm(select.value);
}

function buildAddForm(category) {
  const headers = getHeadersByCategory(category);
  const form = document.getElementById("addItemForm");
  form.innerHTML = "";

  headers.forEach(header => {
    form.innerHTML += `
      <div class="mb-2">
        <label class="form-label">${header}</label>
        <input type="text" id="input-${header}" class="form-control" />
      </div>`;
  });

  form.innerHTML += `<button type="button" class="btn btn-success mt-2" onclick="addItem('${category}')">Add Item</button>`;
}

window.onload = () => {
  setupCategorySelector();
};
