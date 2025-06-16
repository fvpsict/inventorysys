document.addEventListener("DOMContentLoaded", () => {
  const faultForm = document.getElementById("faultForm");
  const faultModalEl = document.getElementById("faultModal");
  const faultModal = new bootstrap.Modal(faultModalEl);
  const faultTableBody = document.querySelector("#faultTable tbody");
  const deleteFaultBtn = document.getElementById("deleteFaultBtn");
  const addFaultBtn = document.getElementById("addFaultBtn");

  let faults = JSON.parse(localStorage.getItem("faults")) || [];
  let editIndex = null;

  // Format current date: dd MMMM yyyy (e.g., 25 June 2025)
  function getCurrentDateTime() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    return `${day} ${month} ${year}`;
  }

  function renderTable() {
    faultTableBody.innerHTML = "";
    faults.forEach((fault, idx) => {
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
        <td>${fault.DateUpdated || ""}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" data-index="${idx}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${idx}">Delete</button>
        </td>
      `;
      faultTableBody.appendChild(tr);
    });
  }

  function clearForm() {
    faultForm.reset();
    editIndex = null;
    deleteFaultBtn.style.display = "none";
    // Clear DateUpdated input as well
    faultForm.DateUpdated.value = "";
  }

  function fillForm(fault) {
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
    faultForm.DateUpdated.value = fault.DateUpdated || "";
  }

  function saveFaults() {
    localStorage.setItem("faults", JSON.stringify(faults));
  }

  addFaultBtn.addEventListener("click", () => {
    clearForm();
    faultModal.show();
  });

  faultTableBody.addEventListener("click", (e) => {
    const target = e.target;
    const idx = target.getAttribute("data-index");
    if (!idx) return;

    if (target.classList.contains("edit-btn")) {
      editIndex = parseInt(idx);
      fillForm(faults[editIndex]);
      deleteFaultBtn.style.display = "inline-block";
      faultModal.show();
    }

    if (target.classList.contains("delete-btn")) {
      if (confirm("Are you sure you want to delete this fault?")) {
        faults.splice(parseInt(idx), 1);
        saveFaults();
        renderTable();
      }
    }
  });

  deleteFaultBtn.addEventListener("click", () => {
    if (editIndex !== null) {
      if (confirm("Delete this fault?")) {
        faults.splice(editIndex, 1);
        saveFaults();
        renderTable();
        faultModal.hide();
        clearForm();
      }
    }
  });

  faultForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Auto set the DateUpdated to current date formatted
    const currentDateFormatted = getCurrentDateTime();

    const newFault = {
      EquipmentType: faultForm.EquipmentType.value,
      Vendor: faultForm.Vendor.value.trim(),
      BrandModel: faultForm.BrandModel.value.trim(),
      AssetNo: faultForm.AssetNo.value.trim(),
      SerialNumber: faultForm.SerialNumber.value.trim(),
      EndDate: faultForm.EndDate.value,
      StartDate: faultForm.StartDate.value,
      Room: faultForm.Room.value.trim(),
      RoomNumber: faultForm.RoomNumber.value.trim(),
      Level: faultForm.Level.value.trim(),
      Lamphour: faultForm.Lamphour.value.trim(),
      Fault: faultForm.Fault.value.trim(),
      Status: faultForm.Status.value,
      DateResolved: faultForm.DateResolved.value,
      ActionTaken: faultForm.ActionTaken.value.trim(),
      DateUpdated: currentDateFormatted
    };

    if (editIndex === null) {
      faults.push(newFault);
    } else {
      faults[editIndex] = newFault;
    }

    saveFaults();
    renderTable();
    faultModal.hide();
    clearForm();
  });

  renderTable();
});
