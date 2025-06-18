// fault-report.js

document.addEventListener("DOMContentLoaded", () => {
  const faultForm = document.getElementById("faultForm");
  const faultTableBody = document.querySelector("#faultTable tbody");
  const filterCategory = document.getElementById("filterCategory");
  const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
  const faultModalLabel = document.getElementById("faultModalLabel");
  const saveFaultBtn = document.getElementById("saveFaultBtn");
  const faultIndexInput = document.getElementById("faultIndex");

  let faults = JSON.parse(localStorage.getItem("faults")) || [];
  let filterValue = "All";

  // Render the faults table based on current faults and filter
  function renderTable() {
    faultTableBody.innerHTML = "";

    const filteredFaults =
      filterValue === "All"
        ? faults
        : faults.filter(fault => fault.equipmentType === filterValue);

    if (filteredFaults.length === 0) {
      faultTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No faults found.</td></tr>`;
      return;
    }

    filteredFaults.forEach((fault, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${fault.equipmentType}</td>
        <td>${fault.assetNo}</td>
        <td>${fault.faultDescription}</td>
        <td>${fault.status}</td>
        <td>${fault.dateReported}</td>
        <td>
          <button class="btn btn-sm btn-primary me-1 edit-btn" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
        </td>
      `;

      faultTableBody.appendChild(tr);
    });
  }

  // Save faults to localStorage
  function saveFaults() {
    localStorage.setItem("faults", JSON.stringify(faults));
  }

  // Clear the form fields
  function clearForm() {
    faultForm.reset();
    faultIndexInput.value = "";
    faultModalLabel.textContent = "Add New Fault";
  }

  // Handle form submission
  faultForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const equipmentType = faultForm.equipmentType.value.trim();
    const assetNo = faultForm.assetNo.value.trim();
    const faultDescription = faultForm.faultDescription.value.trim();
    const status = faultForm.status.value;
    const dateReported = faultForm.dateReported.value;

    if (!equipmentType || !assetNo || !faultDescription || !status || !dateReported) {
      alert("Please fill in all required fields.");
      return;
    }

    const newFault = {
      equipmentType,
      assetNo,
      faultDescription,
      status,
      dateReported,
    };

    const editingIndex = faultIndexInput.value;

    if (editingIndex === "") {
      // Add new fault
      faults.push(newFault);
    } else {
      // Update existing fault
      faults[editingIndex] = newFault;
    }

    saveFaults();
    renderTable();
    faultModal.hide();
    clearForm();
  });

  // Handle edit and delete button clicks
  faultTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const index = e.target.dataset.index;
      const fault = faults[index];

      faultForm.equipmentType.value = fault.equipmentType;
      faultForm.assetNo.value = fault.assetNo;
      faultForm.faultDescription.value = fault.faultDescription;
      faultForm.status.value = fault.status;
      faultForm.dateReported.value = fault.dateReported;

      faultIndexInput.value = index;
      faultModalLabel.textContent = "Edit Fault";
      faultModal.show();
    } else if (e.target.classList.contains("delete-btn")) {
      const index = e.target.dataset.index;
      if (confirm("Are you sure you want to delete this fault?")) {
        faults.splice(index, 1);
        saveFaults();
        renderTable();
      }
    }
  });

  // Filter faults by category
  filterCategory.addEventListener("change", (e) => {
    filterValue = e.target.value;
    renderTable();
  });

  // When modal is hidden, clear the form
  document.getElementById("faultModal").addEventListener("hidden.bs.modal", () => {
    clearForm();
  });

  // Initial render
  renderTable();
});
