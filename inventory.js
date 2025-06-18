document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#inventory-table tbody");
  const modal = new bootstrap.Modal(document.getElementById("itemModal"));
  const form = document.getElementById("itemForm");
  const addItemBtn = document.getElementById("add-item-btn");
  const filterSelect = document.getElementById("category-filter");
  const searchInput = document.getElementById("search-inventory");
  const equipmentTypeSelect = document.getElementById("EquipmentType");
  const equipmentSelect = document.getElementById("Equipment");

  let editIndex = null;

  function calculateDuration(startDate, endDate) {
    if (!startDate) return "";
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years}y ${months}m`;
  }

  function renderTable() {
    const filter = filterSelect.value.toLowerCase();
    const search = searchInput.value.toLowerCase();
    tableBody.innerHTML = "";

    const items = JSON.parse(localStorage.getItem("inventoryItems") || "[]");

    items.forEach((item, index) => {
      if (
        (filter && item["EquipmentType"].toLowerCase() !== filter) ||
        !Object.values(item).some((val) => val.toLowerCase().includes(search))
      ) {
        return;
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item["EquipmentType"] || ""}</td>
        <td>${item["Equipment"] || ""}</td>
        <td>${item["Vendor"] || ""}</td>
        <td>${item["BrandModel"] || ""}</td>
        <td>${item["Profile"] || ""}</td>
        <td>${item["Custodian"] || ""}</td>
        <td>${item["AssetNo"] || ""}</td>
        <td>${item["SerialNumber"] || ""}</td>
        <td>${item["Location"] || ""}</td>
        <td>${item["StartDate"] || ""}</td>
        <td>${item["EndDate"] || ""}</td>
        <td>${item["Hostname"] || ""}</td>
        <td>${item["SSOE PO Number"] || ""}</td>
        <td>${item["Cart No"] || ""}</td>
        <td>${item["SanitiseDate"] || ""}</td>
        <td>${item["Duration in Use"] || ""}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  function resetForm() {
    form.reset();
    editIndex = null;
    equipmentSelect.closest(".col-md-4").style.display = "none";
  }

  function fillForm(data) {
    for (const [key, value] of Object.entries(data)) {
      const input = form.elements[key];
      if (input) input.value = value;
    }

    equipmentSelect.closest(".col-md-4").style.display =
      form.EquipmentType.value === "SSOE" ? "block" : "none";
  }

  addItemBtn.addEventListener("click", () => {
    resetForm();
    modal.show();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const item = Object.fromEntries(formData.entries());

    item["Duration in Use"] = calculateDuration(item["StartDate"], item["EndDate"]);

    const items = JSON.parse(localStorage.getItem("inventoryItems") || "[]");

    if (editIndex !== null) {
      items[editIndex] = item;
    } else {
      items.push(item);
    }

    localStorage.setItem("inventoryItems", JSON.stringify(items));
    renderTable();
    modal.hide();
  });

  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const index = e.target.dataset.index;
      const items = JSON.parse(localStorage.getItem("inventoryItems") || "[]");
      fillForm(items[index]);
      editIndex = index;
      modal.show();
    }

    if (e.target.classList.contains("delete-btn")) {
      const index = e.target.dataset.index;
      if (confirm("Are you sure you want to delete this item?")) {
        const items = JSON.parse(localStorage.getItem("inventoryItems") || "[]");
        items.splice(index, 1);
        localStorage.setItem("inventoryItems", JSON.stringify(items));
        renderTable();
      }
    }
  });

  filterSelect.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);

  equipmentTypeSelect.addEventListener("change", () => {
    const showEquipment = equipmentTypeSelect.value === "SSOE";
    equipmentSelect.closest(".col-md-4").style.display = showEquipment ? "block" : "none";
  });

  renderTable();
});
