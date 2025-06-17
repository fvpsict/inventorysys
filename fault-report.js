document.addEventListener("DOMContentLoaded", () => {
  const faultTableBody = document.querySelector("#fault-table tbody");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
  const faultForm = document.getElementById("fault-modal-form");
  const filterSelect = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-fault");

  let editingRow = null; // track row being edited

  // Helper: Format date YYYY-MM-DD to DD MMM YYYY (e.g. 25 Jun 2025)
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Create table row from form data
  function createRowFromForm(formData) {
    const row = document.createElement("tr");

    // Columns: DateReported, EquipmentType, Equipment, BrandModel, SerialNumber, Location, RoomNumber, FaultDescription, Status, Actions
    const values = [
      formatDate(formData.get("DateReported")),
      formData.get("EquipmentType") || "",
      formData.get("Equipment") || "",
      formData.get("BrandModel") || "",
      formData.get("SerialNumber") || "",
      formData.get("Location") || "",
      formData.get("RoomNumber") || "",
      formData.get("FaultDescription") || "",
      formData.get("Status") || "",
    ];

    for (const val of values) {
      const cell = row.insertCell();
      cell.textContent = val;
    }

    // Actions cell with Edit/Delete buttons
    const actionsCell = row.insertCell();
    actionsCell.innerHTML = `
      <button class="btn btn-sm btn-primary btn-edit me-2">Edit</button>
      <button class="btn btn-sm btn-danger btn-delete">Delete</button>
    `;

    return row;
  }

  // Clear form fields
  function clearForm() {
    faultForm.reset();
  }

  // Populate form with row data for editing
  function populateFormFromRow(row) {
    const cells = row.cells;
    faultForm.elements["DateReported"].value = cells[0].textContent ? new Date(cells[0].textContent).toISOString().substring(0, 10) : "";
    faultForm.elements["EquipmentType"].value = cells[1].textContent;
    faultForm.elements["Equipment"].value = cells[2].textContent;
    faultForm.elements["BrandModel"].value = cells[3].textContent;
    faultForm.elements["SerialNumber"].value = cells[4].textContent;
    faultForm.elements["Location"].value = cells[5].textContent;
    faultForm.elements["RoomNumber"].value = cells[6].textContent;
    faultForm.elements["FaultDescription"].value = cells[7].textContent;
    faultForm.elements["Status"].value = cells[8].textContent;
  }

  // Filter & Search
  function filterAndSearch() {
    const filterVal = filterSelect.value.toLowerCase();
    const searchVal = searchInput.value.toLowerCase();

    Array.from(faultTableBody.rows).forEach((row) => {
      const equipmentType = row.cells[1].textContent.toLowerCase();
      const rowText = row.textContent.toLowerCase();

      const matchesFilter = filterVal === "all" || equipmentType === filterVal;
      const matchesSearch = rowText.includes(searchVal);

      row.style.display = matchesFilter && matchesSearch ? "" : "none";
    });
  }

  // Add Fault button opens modal for new entry
  addFaultBtn.addEventListener("click", () => {
    editingRow = null;
    clearForm();
    faultModal.show();
  });

  // Submit form to add/edit fault
  faultForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(faultForm);

    if (editingRow) {
      // Update existing row
      const cells = editingRow.cells;
      cells[0].textContent = formatDate(formData.get("DateReported"));
      cells[1].textContent = formData.get("EquipmentType") || "";
      cells[2].textContent = formData.get("Equipment") || "";
      cells[3].textContent = formData.get("BrandModel") || "";
      cells[4].textContent = formData.get("SerialNumber") || "";
      cells[5].textContent = formData.get("Location") || "";
      cells[6].textContent = formData.get("RoomNumber") || "";
      cells[7].textContent = formData.get("FaultDescription") || "";
      cells[8].textContent = formData.get("Status") || "";
    } else {
      // Add new row
      const newRow = createRowFromForm(formData);
      faultTableBody.appendChild(newRow);
    }

    faultModal.hide();
    filterAndSearch();
  });

  // Event delegation for Edit/Delete buttons in table
  faultTableBody.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("btn-edit")) {
      editingRow = target.closest("tr");
      populateFormFromRow(editingRow);
      faultModal.show();
    } else if (target.classList.contains("btn-delete")) {
      if (confirm("Are you sure you want to delete this fault report?")) {
        const row = target.closest("tr");
        row.remove();
      }
    }
  });

  // Filter and search inputs
  filterSelect.addEventListener("change", filterAndSearch);
  searchInput.addEventListener("input", filterAndSearch);
});
