document.addEventListener("DOMContentLoaded", () => {
  const inventoryTable = document.getElementById("inventoryTable").getElementsByTagName("tbody")[0];
  const form = document.getElementById("inventoryForm");
  const STORAGE_KEY = "inventoryData";

  let editIndex = -1;
  let inventoryData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  const category = document.body.dataset.category || "SSOE";
  const headers = {
    SSOE: [
      "EquipmentType", "Vendor", "BrandModel", "Profile", "Custodian",
      "AssetNo", "SerialNumber", "Location", "EndDate", "StartDate",
      "Hostname", "SSOE PO Number", "Cart No", "SanitiseDate", "Fault"
    ],
    Projector: [
      "EquipmentType", "Vendor", "BrandModel", "AssetNo", "SerialNumber",
      "EndDate", "StartDate", "Room", "Room Number", "Level", "Lamphour",
      "Fault", "Duration in use", "Last Updated"
    ]
  };

  function renderTable() {
    inventoryTable.innerHTML = "";
    inventoryData.forEach((row, index) => {
      const tr = document.createElement("tr");
      headers[category].forEach(h => {
        const td = document.createElement("td");
        td.textContent = row[h] || "";
        tr.appendChild(td);
      });

      const actionTd = document.createElement("td");
      actionTd.innerHTML = `
        <button class="btn btn-sm btn-warning edit-btn" data-index="${index}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
      `;
      tr.appendChild(actionTd);
      inventoryTable.appendChild(tr);
    });
  }

  function populateForm(data = {}) {
    headers[category].forEach(h => {
      const input = form.elements[h];
      if (input) input.value = data[h] || "";
    });
  }

  function clearForm() {
    form.reset();
    editIndex = -1;
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const formData = {};
    headers[category].forEach(h => {
      formData[h] = form.elements[h].value.trim();
    });

    if (editIndex === -1) {
      inventoryData.push(formData);
    } else {
      inventoryData[editIndex] = formData;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventoryData));
    renderTable();
    clearForm();
  });

  inventoryTable.addEventListener("click", e => {
    const target = e.target;
    const index = parseInt(target.dataset.index);
    if (target.classList.contains("edit-btn")) {
      editIndex = index;
      populateForm(inventoryData[index]);
    } else if (target.classList.contains("delete-btn")) {
      inventoryData.splice(index, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventoryData));
      renderTable();
      clearForm();
    }
  });

  renderTable();
});
