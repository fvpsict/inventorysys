document.addEventListener("DOMContentLoaded", () => {
  const faultTableBody = document.querySelector("#fault-table tbody");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModalElement = document.getElementById("faultModal");
  const faultModal = new bootstrap.Modal(faultModalElement);
  const faultForm = document.getElementById("fault-modal-form");
  const filterSelect = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-fault");

  let editingRow = null;

  // Format a date string YYYY-MM-DD to DD MMM YYYY
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Parse date from display format back to YYYY-MM-DD for form input
  function parseDate(displayDate) {
    if (!displayDate) return "";
    // Try to parse DD MMM YYYY
    const parts = displayDate.split(" ");
    if (parts.length !== 3) return "";
    const day = parts[0];
    const monthStr = parts[1];
    const year = parts[2];

    // Convert month abbreviation to month number
    const months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    const month = months[monthStr];
    if (!month) return "";

    return `${year}-${month}-${day}`;
  }

  // Create a new table row from form data
  function createRow(formData) {
    const row = document.createElement("tr");
    const columns = [
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

    columns.forEach((text) => {
      const cell = row.insertCell();
      cell.textContent = text;
    });

    // Actions cell
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

  // Fill form with data from a table row (for editing)
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

  // Filter and search the table rows
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

  // Open modal for adding new fault
  addFaultBtn.addEventListener("click", () => {
    editingRow = null;
    clearForm();
    faultModal.show();
  });

  // Handle form submission
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
      const newRow = createRow(formData);
      faultTableBody.appendChild(newRow);
    }

    faultModal.hide();
    filterAndSearch();
  });

  // Edit/Delete button clicks
  faultTableBody.addEventListener("click", (e) => {
    const target = e.target;

    if (target.classList.contains("btn-edit")) {
      editingRow = target.closest("tr");
      fillFormFromRow(editingRow);
      faultModal.show();
    }

    if (target.classList.contains("btn-delete")) {
      const row = target.closest("tr");
      if (confirm("Are you sure you want to delete this fault report?")) {
        row.remove();
      }
    }
  });

  // Filter & Search event listeners
  filterSelect.addEventListener("change", filterAndSearch);
  searchInput.addEventListener("input", filterAndSearch);
});
