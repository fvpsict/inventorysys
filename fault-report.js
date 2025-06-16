document.addEventListener("DOMContentLoaded", () => {
  const faultForm = document.getElementById("faultForm");
  const faultModalEl = document.getElementById("faultModal");
  const faultModal = new bootstrap.Modal(faultModalEl);
  const faultTableBody = document.querySelector("#faultTable tbody");
  const deleteFaultBtn = document.getElementById("deleteFaultBtn");
  const addFaultBtn = document.getElementById("addFaultBtn");

  const equipmentTypeOptions = ["Projector", "Projector Screen", "Visualiser"];
  const statusOptions = ["Pending Vendor", "Resolved", "In Progress"];

  let faults = JSON.parse(localStorage.getItem("faults")) || [];
  let editIndex = null;

  function populateDropdowns() {
    const equipSelect = faultForm.EquipmentType;
    const statusSelect = faultForm.Status;

    equipSelect.innerHTML = equipmentTypeOptions
      .map((opt) => `<option value="${opt}">${opt}</option>`)
      .join("");

    statusSelect.innerHTML = statusOptions
      .map((opt) => `<option value="${opt}">${opt}</option>`)
      .join("");
  }

  populateDropdowns();

  // Format date as "YYYY-MM-DD HH:mm:ss"
  function getCurrentFormattedDateTime() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
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

  // When opening modal for add or edit, set DateUpdated automatically
  function openModalForAdd() {
    clearForm();
    faultForm.DateUpdated.value = getCurrentFormattedDateTime();
    faultModal.show();
  }

  function openModalForEdit(idx) {
    editIndex = idx;
    fillForm(faults[editIndex]);
    faultForm.DateUpdated.value = getCurrentFormattedDateTime();
    deleteFaultBtn.style.display = "inline-block";
    faultModal.show();
  }

  addFaultBtn.addEventListener("click", openModalForAdd);

  faultTableBody.addEventListener("click", (e) => {
    const target = e.target;
    const idx = target.getAttribute("data-index");
    if (!idx) return;

    if (target.classList.contains("edit-btn")) {
      openModalForEdit(parseInt(idx));
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
      DateUpdated: faultForm.DateUpdated.value,
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
