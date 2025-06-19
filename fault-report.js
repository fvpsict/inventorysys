const faultTableBody = document.querySelector("#fault-table tbody");
const searchFaultInput = document.getElementById("search-inventory");
const addFaultBtn = document.getElementById("add-fault-btn");
const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
const faultForm = document.getElementById("fault-form");

let faultData = [];
let editingIndex = -1;

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

function renderTable() {
  const search = searchFaultInput.value.toLowerCase();
  faultTableBody.innerHTML = "";

  faultData.forEach((item, index) => {
    const combined = Object.values(item).join(" ").toLowerCase();
    if (!combined.includes(search)) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.EquipmentType || ""}</td>
      <td>${item.Equipment || ""}</td>
      <td>${item.Venue || ""}</td>
      <td>${item.AssetNo || ""}</td>
      <td>${item.SerialNumber || ""}</td>
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

function resetForm() {
  faultForm.reset();
  editingIndex = -1;
  document.getElementById("fault-DateReported").value = new Date().toISOString().split("T")[0];
}

function fillForm(item) {
  document.getElementById("fault-EquipmentType").value = item.EquipmentType || "";
  document.getElementById("fault-Equipment").value = item.Equipment || "";
  document.getElementById("fault-Venue").value = item.Venue || "";
  document.getElementById("fault-AssetNo").value = item.AssetNo || "";
  document.getElementById("fault-SerialNumber").value = item.SerialNumber || "";
  document.getElementById("fault-Fault").value = item.Fault || "";
  document.getElementById("fault-Status").value = item.Status || "";
  document.getElementById("fault-DateReported").value = item.DateReported || "";
}

faultForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(faultForm);
  const item = {
    EquipmentType: formData.get("EquipmentType"),
    Equipment: formData.get("Equipment"),
    Venue: formData.get("Venue"),
    AssetNo: formData.get("AssetNo"),
    SerialNumber: formData.get("SerialNumber"),
    Fault: formData.get("Fault"),
    Status: formData.get("Status"),
    DateReported: formData.get("DateReported"),
  };

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

addFaultBtn.addEventListener("click", () => {
  resetForm();
  document.getElementById("faultModalLabel").textContent = "Add Fault";
  faultModal.show();
});

faultTableBody.addEventListener("click", (e) => {
  const index = +e.target.dataset.index;
  if (e.target.classList.contains("btn-edit")) {
    editingIndex = index;
    fillForm(faultData[index]);
    document.getElementById("faultModalLabel").textContent = "Edit Fault";
    faultModal.show();
  } else if (e.target.classList.contains("btn-delete")) {
    if (confirm("Are you sure you want to delete this fault record?")) {
      faultData.splice(index, 1);
      renderTable();
    }
  }
});

searchFaultInput.addEventListener("input", renderTable);

renderTable();
