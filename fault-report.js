// fault-report.js

document.addEventListener("DOMContentLoaded", () => {
  const faultTableBody = document.querySelector("#fault-table tbody");
  const filterSelect = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-fault");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
  const faultForm = document.getElementById("fault-modal-form");

  // Key for localStorage
  const STORAGE_KEY = "faultReports";

  let faultReports = [];
  let editingIndex = null; // null when adding new

  // Load fault reports from localStorage or mock sample data
  function loadFaultReports() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      faultReports = JSON.parse(stored);
    } else {
      // Mock sample data - replace with fetch or other real data loading
      faultReports = [
        {
          DateReported: "2025-06-01",
          EquipmentType: "Projector",
          Equipment: "Projector",
          BrandModel: "Epson X123",
          SerialNumber: "SN123456",
          Location: "Library",
          RoomNumber: "L01",
          FaultDescription: "No image displayed",
          Status: "Open",
        },
        {
          DateReported: "2025-06-15",
          EquipmentType: "SSOE",
          Equipment: "SSOE",
          BrandModel: "VendorX ModelY",
          SerialNumber: "SSOE7890",
          Location: "Admin Office",
          RoomNumber: "A10",
          FaultDescription: "Network connectivity issue",
          Status: "In Progress",
        },
      ];
      saveFaultReports();
    }
  }

  // Save fault reports to localStorage
  function saveFaultReports() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(faultReports));
  }

  // Render the fault reports into the table with current filters
  function renderTable() {
    const filterValue = filterSelect.value.toLowerCase();
    const searchTerm = searchInput.value.trim().toLowerCase();

    faultTableBody.innerHTML = "";

    faultReports.forEach((report, index) => {
      // Filter by equipment type
      if (filterValue !== "all" && report.EquipmentType.toLowerCase() !== filterValue) {
        return;
      }

      // Search filter: check if any cell contains the search term
      const combinedText = Object.values(report).join(" ").toLowerCase();
      if (searchTerm && !combinedText.includes(searchTerm)) {
        return;
      }

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${report.DateReported}</td>
        <td>${report.EquipmentType}</td>
        <td>${report.Equipment}</td>
        <td>${report.BrandModel || ""}</td>
        <td>${report.SerialNumber || ""}</td>
        <td>${report.Location || ""}</td>
        <td>${report.RoomNumber || ""}</td>
        <td>${report.FaultDescription}</td>
        <td>${report.Status}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
        </td>
      `;

      faultTableBody.appendChild(tr);
    });

    // Attach event listeners for Edit and Delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        editingIndex = Number(e.target.dataset.index);
        openEditModal(editingIndex);
      })
    );

    document.querySelectorAll(".delete-btn").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const idx = Number(e.target.dataset.index);
        if (confirm("Are you sure you want to delete this fault report?")) {
          faultReports.splice(idx, 1);
          saveFaultReports();
          renderTable();
        }
      })
    );
  }

  // Open modal and populate form for editing
  function openEditModal(index) {
    const report = faultReports[index];
    if (!report) return;

    faultForm.reset();

    for (const [key, value] of Object.entries(report)) {
      const input = faultForm.elements.namedItem(key);
      if (input) input.value = value;
    }

    faultModal.show();
  }

  // Clear form for adding new fault
  function openAddModal() {
    editingIndex = null;
    faultForm.reset();
    faultModal.show();
  }

  // Handle form submission
  faultForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(faultForm);
    const newReport = {};

    for (const [key, value] of formData.entries()) {
      newReport[key] = value.trim();
    }

    // Simple validation check (DateReported, EquipmentType, Equipment, FaultDescription, Status required)
    if (
      !newReport.DateReported ||
      !newReport.EquipmentType ||
      !newReport.Equipment ||
      !newReport.FaultDescription ||
      !newReport.Status
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (editingIndex === null) {
      // Add new
      faultReports.push(newReport);
    } else {
      // Update existing
      faultReports[editingIndex] = newReport;
    }

    saveFaultReports();
    renderTable();
    faultModal.hide();
  });

  // Event listeners for filter and search inputs
  filterSelect.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);
  addFaultBtn.addEventListener("click", openAddModal);

  // Initial load
  loadFaultReports();
  renderTable();
});
