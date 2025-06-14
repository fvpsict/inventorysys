document.addEventListener("DOMContentLoaded", () => {
  const faultForm = document.getElementById("faultForm");
  const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
  const faultTableBody = document.querySelector("#faultTable tbody");
  const deleteFaultBtn = document.getElementById("deleteFaultBtn");

  let faults = JSON.parse(localStorage.getItem("faults")) || [];
  let editIndex = null; // Track which fault is being edited; null = adding new

  // Utility: Render the fault table rows
  function renderTable() {
    faultTableBody.innerHTML = "";
    faults.forEach((fault, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${fault.EquipmentType || ""}</td>
        <td>${fault.Vendor || ""}</td>
        <td>${fault.BrandModel || ""}</td>
        <td>${fault.AssetNo || ""}</td>
        <td>${fault.SerialNumber || ""}</td>
        <td>${fault.EndDate || ""}</td>
        <td>${fault.StartDate || ""}</td>
        <td>${fault.Room || ""}</td>
        <td>${fault.RoomNumber || ""}</td>
        <td>${fault.Level || ""}</td>
        <td>${fault.Lamphour || ""}</td>
        <td>${fault.Fault || ""}</td>
        <td>${fault.Status || ""}</td>
        <td>${fault.DateResolved || ""}</td>
        <td>${fault.ActionTaken || ""}</td>
        <td>
          <button class="btn btn-sm btn-primary btn-edit" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger btn-delete" data-index="${index}">Delete</button>
        </td>
      `;
      faultTableBody.appendChild(tr);
    });
  }

  // Clear the form fields
  function clearForm() {
    faultForm.reset();
    editIndex = null;
    deleteFaultBtn.style.display = "none"; // Hide delete button for new entries
  }

  // Populate the form fields with a fault record (for editing)
  function populateForm(fault) {
    faultForm.EquipmentType.value = fault.EquipmentType || "";
    faultForm.Vendor.value = fault.Vendor || "";
    faultForm.BrandModel.value = fault.BrandModel || "";
    faultForm.AssetNo.value = fault.AssetNo || "";
    faultForm.SerialNumber.value = fault.SerialNumber || "";
    faultForm.EndDate.value = fault.EndDate || "";
    faultForm.StartDate.value = fault.StartDate || "";
    faultForm.Room.value = fault.Room || "";
    faultForm.RoomNumber.value = fault.RoomNumber || "";
    faultForm.Level.value = fault.Level || "";
    faultForm.Lamphour.value = fault.Lamphour || "";
    faultForm.Fault.value = fault.Fault || "";
    faultForm.Status.value = fault.Status || "";
    faultForm.DateResolved.value = fault.DateResolved || "";
    faultForm.ActionTaken.value = fault.ActionTaken || "";
  }

  // Save faults to localStorage
  function saveToStorage() {
    localStorage.setItem("faults", JSON.stringify(faults));
  }

  // Show modal for adding new fault
  document.getElementById("addFaultBtn")?.addEventListener("click", () => {
    clearForm();
    deleteFaultBtn.style.display = "none"; // no delete when adding new
    faultModal.show();
  });

  // Handle Edit button click on table rows
  faultTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-edit")) {
      const idx = e.target.getAttribute("data-index");
      if (idx !== null) {
        editIndex = Number(idx);
        populateForm(faults[editIndex]);
        deleteFaultBtn.style.display = "inline-block";
        faultModal.show();
      }
    }

    if (e.target.classList.contains("btn-delete")) {
      const idx = e.target.getAttribute("data-index");
      if (idx !== null) {
        if (confirm("Are you sure you want to delete this fault?")) {
          faults.splice(Number(idx), 1);
          saveToStorage();
          renderTable();
        }
      }
    }
  });

  // Handle Delete button in modal
  deleteFaultBtn.addEventListener("click", () => {
    if (editIndex !== null) {
      if (confirm("Are you sure you want to delete this fault?")) {
        faults.splice(editIndex, 1);
        saveToStorage();
        renderTable();
        faultModal.hide();
        clearForm();
      }
    }
  });

  // Handle form submission (Add or Edit)
  faultForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Collect form data
    const formData = {
      EquipmentType: faultForm.EquipmentType.value,
      Vendor: faultForm.Vendor.value,
      BrandModel: faultForm.BrandModel.value,
      AssetNo: faultForm.AssetNo.value,
      SerialNumber: faultForm.SerialNumber.value,
      EndDate: faultForm.EndDate.value,
      StartDate: faultForm.StartDate.value,
      Room: faultForm.Room.value,
      RoomNumber: faultForm.RoomNumber.value,
      Level: faultForm.Level.value,
      Lamphour: faultForm.Lamphour.value,
      Fault: faultForm.Fault.value,
      Status: faultForm.Status.value,
      DateResolved: faultForm.DateResolved.value,
      ActionTaken: faultForm.ActionTaken.value,
    };

    if (editIndex !== null) {
      // Update existing fault
      faults[editIndex] = formData;
    } else {
      // Add new fault
      faults.push(formData);
    }

    saveToStorage();
    renderTable();
    faultModal.hide();
    clearForm();
  });

  // Initial render
  renderTable();
});
