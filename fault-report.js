document.addEventListener("DOMContentLoaded", () => {
  const faultTable = document.getElementById("fault-table");
  const faultTableBody = faultTable.querySelector("tbody");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
  const faultForm = document.getElementById("fault-modal-form");
  const filterSelect = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-fault");

  let faults = [];
  let editingIndex = null;

  // Approximate column widths in pixels (adjust as needed)
  const columnWidths = {
    DateReported: 110,
    EquipmentType: 130,
    Equipment: 120,
    AssetNo: 100,
    BrandModel: 150,
    SerialNumber: 130,
    Location: 120,
    RoomNumber: 100,
    FaultDescription: 250,
    Status: 120,
    DateUpdated: 110,
    Actions: 120
  };

  // Calculate total min width based on columns present in table header
  function setTableMinWidth() {
    const headers = faultTable.querySelectorAll("thead th");
    let totalWidth = 0;
    headers.forEach((th) => {
      const key = th.textContent.replace(/\s+/g, '');
      totalWidth += columnWidths[key] || 120; // fallback width
    });
    faultTable.style.minWidth = totalWidth + "px";
  }

  // Format date as YYYY-MM-DD
  function formatDate(date = new Date()) {
    return date.toISOString().split("T")[0];
  }

  function renderTable() {
    const filterValue = filterSelect.value.toLowerCase();
    const searchValue = searchInput.value.toLowerCase();

    faultTableBody.innerHTML = "";

    faults.forEach((fault, index) => {
      if (filterValue !== "all" && fault.EquipmentType.toLowerCase() !== filterValue) {
        return;
      }

      const combinedText = Object.values(fault).join(" ").toLowerCase();
      if (!combinedText.includes(searchValue)) {
        return;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${fault.DateReported || ""}</td>
        <td>${fault.EquipmentType || ""}</td>
        <td>${fault.Equipment || ""}</td>
        <td>${fault.AssetNo || ""}</td>
        <td>${fault.BrandModel || ""}</td>
        <td>${fault.SerialNumber || ""}</td>
        <td>${fault.Location || ""}</td>
        <td>${fault.RoomNumber || ""}</td>
        <td>${fault.FaultDescription || ""}</td>
        <td>${fault.Status || ""}</td>
        <td>${fault.DateUpdated || ""}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
        </td>
      `;

      faultTableBody.appendChild(tr);
    });
  }

  function resetForm() {
    faultForm.reset();
    faultForm.elements["DateUpdated"].value = "";
    editingIndex = null;
  }

  addFaultBtn.addEventListener("click", () => {
    resetForm();
    faultForm.elements["DateReported"].value = formatDate();
    faultModal.show();
  });

  faultForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(faultForm);
    const faultData = {};
    for (const [key, value] of formData.entries()) {
      faultData[key] = value.trim();
    }

    faultData.DateUpdated = formatDate();

    if (editingIndex !== null) {
      faults[editingIndex] = faultData;
    } else {
      faults.push(faultData);
    }

    renderTable();
    faultModal.hide();
  });

  faultTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const index = parseInt(e.target.dataset.index, 10);
      editingIndex = index;

      const fault = faults[index];
      for (const key in fault) {
        if (faultForm.elements[key]) {
          faultForm.elements[key].value = fault[key];
        }
      }

      faultModal.show();
    } else if (e.target.classList.contains("delete-btn")) {
      const index = parseInt(e.target.dataset.index, 10);
      if (confirm("Delete this fault report?")) {
        faults.splice(index, 1);
        renderTable();
      }
    }
  });

  filterSelect.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);

  // Set table min-width on load
  setTableMinWidth();

  renderTable();
});
