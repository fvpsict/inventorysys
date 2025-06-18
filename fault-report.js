// fault-report.js

const faultTableBody = document.querySelector("#fault-table tbody");
const searchFaultInput = document.getElementById("search-fault");
const addFaultBtn = document.getElementById("add-fault-btn");
const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
const faultForm = document.getElementById("fault-form");

let faultData = [];
let editingIndex = -1;

// Format date "YYYY-MM-DD" to "DD MMM YYYY"
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

// Render fault table rows with search filter
function renderTable() {
  const search = searchFaultInput.value.toLowerCase();
  faultTableBody.innerHTML = "";

  faultData.forEach((item, index) => {
    // Simple search in any field
    const combined = Object.values(item).join(" ").toLowerCase();
    if (!combined.includes(search)) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.EquipmentType || ""}</td>
      <td>${item.Equipment || ""}</td>
      <td>${item.AssetNo || ""}</td>
      <td>${item.Fault || ""}</td>
      <td>${item.Status || ""}</td>
      <td>${formatDate(item.DateReported)}</td>
      <td>
        <button class="btn btn-sm btn-primary btn-edit" data-index="${index}">Edit</button>
        <button class="btn btn-sm btn-danger btn-delete" data-index="${index}">Delete</button>
      </td>
    `;
    faultTableBody.appendChild(tr);
  });
}

// Reset the fault form for adding
function resetForm() {
  faultForm.reset();
  editingIndex = -1;
  // Set DateReported to today as default
  const todayStr = new Date().toISOString().slice(0, 10);
  document.getElementById("fault-DateReported").value = todayStr;
}

// Fill form fields for editing a fault
function fillForm(item) {
  document.getElementById("fault-EquipmentType").value = item.EquipmentType || "";
  document.getElementById("fault-Equipment").value = item.Equipment || "";
  document.getElementById("fault-AssetNo").value = item.AssetNo || "";
  document.getElementById("fault-Fault").value = item.Fault || "";
  document.getElementById("fault-Status").value = item.Status || "";
  document.getElementById("fault-DateReported").value = item.DateReported || "";
}

// Handle form submission
faultForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(faultForm);

  const item = {
    EquipmentType: formData.get("EquipmentType"),
    Equipment: formData.get("Equipment"),
    AssetNo: formData.get("AssetNo").trim(),
    Fault: formData.get("Fault").trim(),
    Status: formData.get("Status"),
    DateReported: formData.get("DateReported"),
  };

  // Basic validation
  if (!item.EquipmentType || !item.Equipment || !item.Fault || !item.Status || !item.DateReported) {
    alert("Please fill in all required fields.");
    return;
  }

  if (editingIndex >= 0) {
    faultData[editingIndex] = item;
  } else {
    faultData.push(item);
  }

  renderTable();
  faultModal.hide();
});

// Add Fault button
addFaultBtn.addEventListener("click", () => {
  resetForm();
  document.getElementById("faultModalLabel").textContent = "Add Fault";
  faultModal.show();
});

// Edit & Delete buttons
faultTableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-edit")) {
    editingIndex = +e.target.dataset.index;
    fillForm(faultData[editingIndex]);
    document.getElementById("faultModalLabel").textContent = "Edit Fault";
    faultModal.show();
  } else if (e.target.classList.contains("btn-delete")) {
    if (confirm("Are you sure you want to delete this fault record?")) {
      const idx = +e.target.dataset.index;
      faultData.splice(idx, 1);
      renderTable();
    }
  }
});

// Search input
searchFaultInput.addEventListener("input", renderTable);

// Initial render
renderTable();
