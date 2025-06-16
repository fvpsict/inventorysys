document.addEventListener("DOMContentLoaded", () => {
  const inventoryTable = document.querySelector("#inventory-table tbody");
  const inventoryForm = document.getElementById("inventory-form");
  const addItemBtn = document.getElementById("add-item-btn");
  const filterSelect = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-inventory");

  let inventoryData = JSON.parse(localStorage.getItem("inventoryData")) || [];

  function saveData() {
    localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
  }

  function formatToday() {
    return new Date().toISOString().split("T")[0];
  }

  function renderTable(data) {
    inventoryTable.innerHTML = "";
    data.forEach((item, index) => {
      const row = document.createElement("tr");
      Object.keys(item).forEach((key) => {
        const cell = document.createElement("td");
        cell.textContent = item[key];
        row.appendChild(cell);
      });

      // Actions cell
      const actionsCell = document.createElement("td");
      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-primary me-1";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openForm(item, index));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this item?")) {
          inventoryData.splice(index, 1);
          saveData();
          renderTable(applyFilterAndSearch());
        }
      });

      actionsCell.appendChild(editBtn);
      actionsCell.appendChild(deleteBtn);
      row.appendChild(actionsCell);

      inventoryTable.appendChild(row);
    });
  }

  function applyFilterAndSearch() {
    const filter = filterSelect.value;
    const search = searchInput.value.toLowerCase();

    return inventoryData.filter(item => {
      const matchesFilter = filter === "All" || item.EquipmentType === filter;
      const matchesSearch = Object.values(item).some(val =>
        val.toLowerCase().includes(search)
      );
      return matchesFilter && matchesSearch;
    });
  }

  function generateFormFields(data = {}) {
    inventoryForm.innerHTML = "";

    const headers = [
      "EquipmentType", "Vendor", "BrandModel", "Profile", "Custodian", "AssetNo",
      "SerialNumber", "Location", "EndDate", "StartDate", "Hostname", "SSOE PO Number",
      "Cart No", "SanitiseDate", "Duration in use", "Lamp Hour", "DateUpdated"
    ];

    headers.forEach(key => {
      const wrapper = document.createElement("div");
      wrapper.className = "mb-3";

      const label = document.createElement("label");
      label.className = "form-label";
      label.textContent = key;
      label.htmlFor = key;

      let input;

      if (key === "EquipmentType") {
        input = document.createElement("select");
        input.className = "form-select";
        input.id = key;
        input.name = key;

        const options = [
          "SSOE", "Projector", "Projector Screen", "Touch Panel", "Visualiser",
          "SMax", "Macbook", "Portable HDD", "TV", "Monitor", "OMR"
        ];

        options.forEach(option => {
          const opt = document.createElement("option");
          opt.value = option;
          opt.textContent = option;
          input.appendChild(opt);
        });

        input.value = data[key] || "";
      } else if (key === "DateUpdated") {
        input = document.createElement("input");
        input.type = "date";
        input.className = "form-control";
        input.id = key;
        input.name = key;
        input.value = formatToday(); // auto populate
        input.readOnly = true;
      } else {
        input = document.createElement("input");
        input.type = key.toLowerCase().includes("date") ? "date" : "text";
        input.className = "form-control";
        input.id = key;
        input.name = key;
        input.value = data[key] || "";
      }

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      inventoryForm.appendChild(wrapper);
    });

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "btn btn-success";
    submitBtn.textContent = "Save";

    inventoryForm.appendChild(submitBtn);
  }

  function openForm(data = {}, index = null) {
    generateFormFields(data);

    const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
    modal.show();

    inventoryForm.onsubmit = function (e) {
      e.preventDefault();

      const formData = new FormData(inventoryForm);
      const item = {};
      formData.forEach((val, key) => {
        item[key] = val;
      });

      item["DateUpdated"] = formatToday();

      if (index !== null) {
        inventoryData[index] = item;
      } else {
        inventoryData.push(item);
      }

      saveData();
      renderTable(applyFilterAndSearch());
      modal.hide();
    };
  }

  addItemBtn.addEventListener("click", () => openForm());

  filterSelect.addEventListener("change", () => {
    renderTable(applyFilterAndSearch());
  });

  searchInput.addEventListener("input", () => {
    renderTable(applyFilterAndSearch());
  });

  renderTable(applyFilterAndSearch());
});
