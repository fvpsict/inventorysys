const faultTableBody = document.querySelector("#fault-table tbody");
const searchInput = document.getElementById("search-fault");
const addFaultBtn = document.getElementById("add-fault-btn");
const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
const faultForm = document.getElementById("fault-form");

let faultData = JSON.parse(localStorage.getItem("faultData") || "[]");
let editingIndex = -1;

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function renderTable() {
  faultTableBody.innerHTML = "";
  const search = searchInput.value.toLowerCase();

  faultData.forEach((item, index) => {
    const combined = Object.values(item).join(" ").toLowerCase();
    if (!combined.includes(search)) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.EquipmentType || ""}</td>
      <td>${item.Equipment || ""}</td>
      <td>${item.Venue || ""}</td>
      <td>${item.AssetNo || ""}</td>
      <td>${item.SerialNo || ""}</td>
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
  for (const key in item) {
    const field = document.querySelector(`[name="${key}"]`);
    if (field) field.value = item[key];
  }
}

faultForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(faultForm);
  const item = Object.fromEntries(formData.entries());

  if (editingIndex >= 0) {
    faultData[editingIndex] = item;
  } else {
    faultData.push(item);
  }

  localStorage.setItem("faultData", JSON.stringify(faultData));
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
    if (confirm("Delete this fault record?")) {
      faultData.splice(index, 1);
      localStorage.setItem("faultData", JSON.stringify(faultData));
      renderTable();
    }
  }
});

searchInput.addEventListener("input", renderTable);
renderTable();
