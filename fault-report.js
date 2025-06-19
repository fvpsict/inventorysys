const tableBody = document.querySelector("#fault-table tbody");
const searchInputF = document.getElementById("search-fault");
const filterSelectF = document.getElementById("filter-equipmenttype");
const addBtn = document.getElementById("add-fault-btn");
const modal = new bootstrap.Modal(document.getElementById("faultModal"));
const formF = document.getElementById("fault-form");
let dataF = JSON.parse(localStorage.getItem("faultData") || "[]");
let editingIndexF = null;

function formatDate(dstr) {
  if (!dstr) return "";
  const d = new Date(dstr);
  return isNaN(d) ? "" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function renderFaults() {
  tableBody.innerHTML = "";
  const search = searchInputF.value.toLowerCase();
  const filter = filterSelectF.value.toLowerCase();

  dataF.forEach((item, idx) => {
    if (filter !== "all" && item.EquipmentType.toLowerCase() !== filter) return;
    if (!Object.values(item).some(x => x?.toString().toLowerCase().includes(search))) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.EquipmentType}</td><td>${item.Equipment}</td><td>${item.Venue||""}</td><td>${item.AssetNo||""}</td><td>${item.SerialNo||""}</td>
      <td>${item.Fault}</td><td>${item.Status}</td><td>${formatDate(item.DateReported)}</td>
      <td><button class="btn btn-sm btn-primary btn-edit" data-i="${idx}">Edit</button> <button class="btn btn-sm btn-danger btn-delete" data-i="${idx}">Delete</button></td>`;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll(".btn-edit").forEach(btn => {
    btn.onclick = () => { editingIndexF = btn.dataset.i; fillFaultForm(dataF[editingIndexF]); modal.show(); };
  });
  tableBody.querySelectorAll(".btn-delete").forEach(btn => {
    btn.onclick = () => {
      if (confirm("Delete fault?")) {
        dataF.splice(btn.dataset.i, 1);
        saveAndRenderF();
      }
    };
  });
}

function fillFaultForm(item) {
  for (const k in item) {
    const f = formF[k];
    if (f) f.value = item[k];
  }
}

function resetFaultForm() {
  editingIndexF = null;
  formF.reset();
  formF.DateReported.value = new Date().toISOString().split("T")[0];
}

formF.onsubmit = e => {
  e.preventDefault();
  if (!formF.checkValidity()) {
    formF.classList.add("was-validated");
    return;
  }

  const item = Object.fromEntries(new FormData(formF));
  if (editingIndexF !== null) dataF[editingIndexF] = item;
  else dataF.push(item);
  saveAndRenderF();
  modal.hide();
};

function saveAndRenderF() {
  localStorage.setItem("faultData", JSON.stringify(dataF));
  renderFaults();
}

addBtn.onclick = () => { resetFaultForm(); modal.show(); };
searchInputF.oninput = renderFaults;
filterSelectF.onchange = renderFaults;

renderFaults();
