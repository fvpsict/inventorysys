document.addEventListener("DOMContentLoaded", () => {
  const faultTableBody = document.querySelector("#fault-table tbody");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModalElement = document.getElementById("faultModal");
  const faultModal = new bootstrap.Modal(faultModalElement);
  const faultForm = document.getElementById("fault-modal-form");
  const filterSelect = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-fault");

  let editingRow = null;

  // Format date for display: "dd MMM yyyy"
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

  // Parse displayed date string back to ISO yyyy-mm-dd for input[type=date]
  function parseDate(displayDate) {
    if (!displayDate) return "";
    const parsed = Date.parse(displayDate);
    if (isNaN(parsed)) return "";
    const date = new Date(parsed);
    // Format ISO yyyy-mm-dd
    return date.toISOString().slice(0, 10);
  }

  // Create a new table row from form data
  function createRowFromForm(formData) {
    const row = document.createElement("tr");
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

    const actionsCell = row.insertCell();
    actionsCell.innerHTML = `
      <button class="btn btn-sm btn-primary btn-edit me-2" type="button">Edit</button>
      <button class="btn btn-sm btn-danger btn-delete" type="button">Delete</button>
    `;

    return row;
  }

  // Clear form fields
  function clearForm() {
    faultForm.reset();
  }

  // Populate form fields from a table row (for editing)
  function fillFormFromRow(row) {
    const cells = row.cells;
    faultForm.elements["DateReported"].value = parseDate(cells[0].textContent);
    faultForm.elements["EquipmentType"].value = cells[1].textContent;
    faultForm.elements["Equipment"].value = cells[2].textContent;
    faultForm.elements["BrandModel"].value = cells[3].textContent;
    faultForm.elements["SerialNumber"].value = cells[4].textContent;
    faultForm.elements["Location"].value = cells[5].textContent;
    faultForm.elements["RoomNumber"].value = cells[6].textContent;
    faultForm.elements["FaultDescription"].value = cells[7].textContent;
    faultForm.elements["Status"].value = cells[8].textContent;
  }

  // Filter and search table rows based on filter dropdown and search input
  function filterAndSearch() {
    const filterValue = filterSelect.value.toLowerCase();
    const searchValue = searchInput.value.toLowerCase();

    Array.from(faultTableBody.rows).forEach((row) => {
      const equipmentType = row.cells[1].textContent.toLowerCase();
      const rowText = row.textContent.toLowerCase();

      const matchesFilter = filterValue === "all" || equipmentType === filterValue;
      const matchesSearch = rowText.includes(searchValue);

      row.style.display = matchesFilter && matchesSearch ? "" : "none";
    });
  }

  // Event: click Add Fault button
  addFaultBtn.addEventListener("click", () => {
    editingRow = null;
    clearForm();
    faultModal.show();
  });

  // Event: submit form (add or edit)
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
      // Create new row
      const newRow = createRowFromForm(formData);
      faultTableBody.appendChild(newRow);
    }

    faultModal.hide();
    filterAndSearch();
  });

  // Event: Edit/Delete buttons in table rows
  faultTableBody.addEventListener("click", (e) => {
    const target = e.target;
    const row = target.closest("tr");
    if (!row) return;

    if (target.classList.contains("btn-edit")) {
      editingRow = row;
      fillFormFromRow(row);
      faultModal.show();
    }

    if (target.classList.contains("btn-delete")) {
      if (confirm("Are you sure you want to delete this fault report?")) {
        row.remove();
      }
    }
  });

  // Filter and search inputs events
  filterSelect.addEventListener("change", filterAndSearch);
  searchInput.addEventListener("input", filterAndSearch);

  // Optional: autofocus first input on modal shown
  faultModalElement.addEventListener("shown.bs.modal", () => {
    faultForm.elements["DateReported"].focus();
  });
});
