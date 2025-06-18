document.addEventListener("DOMContentLoaded", () => {
  const addItemBtn = document.getElementById("add-item-btn");
  const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const inventoryForm = document.getElementById("inventory-form");
  const dateUpdatedInput = document.getElementById("DateUpdated");
  const inventoryTableBody = document.querySelector("#inventory-table tbody");
  const filterEquipment = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-inventory");

  // Format date as "DD MMM YYYY" e.g. "15 Jun 2025"
  function formatDateDDMMMYYYY(date) {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  }

  // Calculate duration between two dates as "X years Y months"
  function calculateDuration(startDateStr) {
    if (!startDateStr) return "";
    const startDate = new Date(startDateStr);
    if (isNaN(startDate)) return "";
    const now = new Date();

    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years < 0) return "";

    let result = "";
    if (years > 0) result += years + (years === 1 ? " year " : " years ");
    if (months > 0) result += months + (months === 1 ? " month" : " months");

    return result.trim() || "0 month";
  }

  // Add a row to the inventory table
  function addInventoryRow(item) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.Equipment}</td>
      <td>${item.Vendor}</td>
      <td>${item.BrandModel}</td>
      <td>${item.Profile}</td>
      <td>${item.Custodian}</td>
      <td>${item.AssetNo || ""}</td>
      <td>${item.SerialNumber || ""}</td>
      <td>${item.Location}</td>
      <td>${item.StartDate || ""}</td>
      <td>${calculateDuration(item.StartDate)}</td>
      <td>${item.DateUpdated}</td>
      <td>
        <button class="btn btn-sm btn-danger delete-btn">Delete</button>
      </td>
    `;
    inventoryTableBody.appendChild(tr);
  }

  // Clear form fields
  function clearForm() {
    inventoryForm.reset();
    // Reset DateUpdated manually after reset
    dateUpdatedInput.value = formatDateDDMMMYYYY(new Date());
  }

  // Filter inventory table by Equipment dropdown and Search input
  function filterTable() {
    const equipmentFilter = filterEquipment.value.toLowerCase();
    const searchTerm = searchInput.value.toLowerCase();

    Array.from(inventoryTableBody.rows).forEach((row) => {
      const equipmentCell = row.cells[0].textContent.toLowerCase();

      const matchesEquipment =
        equipmentFilter === "all" || equipmentCell === equipmentFilter;

      // Check if any cell text contains the search term
      const matchesSearch = Array.from(row.cells).some((cell) =>
        cell.textContent.toLowerCase().includes(searchTerm)
      );

      row.style.display = matchesEquipment && matchesSearch ? "" : "none";
    });
  }

  // Event: Open modal and set DateUpdated
  addItemBtn.addEventListener("click", () => {
    clearForm();
    inventoryModal.show();
  });

  // Event: Form submit to add inventory item
  inventoryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(inventoryForm);
    const item = {
      Equipment: formData.get("Equipment").trim(),
      Vendor: formData.get("Vendor").trim(),
      BrandModel: formData.get("BrandModel").trim(),
      Profile: formData.get("Profile").trim(),
      Custodian: formData.get("Custodian").trim(),
      AssetNo: formData.get("AssetNo")?.trim() || "",
      SerialNumber: formData.get("SerialNumber")?.trim() || "",
      Location: formData.get("Location").trim(),
      StartDate: formData.get("StartDate"),
      DateUpdated: formData.get("DateUpdated"),
    };

    if (!item.Equipment) {
      alert("Please select Equipment.");
      return;
    }

    addInventoryRow(item);
    inventoryModal.hide();
  });

  // Event: Delete button
  inventoryTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      if (confirm("Are you sure you want to delete this item?")) {
        e.target.closest("tr").remove();
      }
    }
  });

  // Filter events
  filterEquipment.addEventListener("change", filterTable);
  searchInput.addEventListener("input", filterTable);
});
