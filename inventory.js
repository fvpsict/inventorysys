document.addEventListener("DOMContentLoaded", function () {
  const inventoryTableBody = document.querySelector("#inventory-table tbody");
  const itemForm = document.getElementById("itemForm");
  const searchInput = document.getElementById("searchInput");

  let editIndex = null;

  function formatDate(date) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function getFormData() {
    const formData = new FormData(itemForm);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value.trim();
    });
    data["DateUpdated"] = formatDate(new Date());
    return data;
  }

  function createRow(data) {
    const tr = document.createElement("tr");

    const keys = [
      "Equipment",
      "EquipmentType",
      "Vendor",
      "BrandModel",
      "Profile",
      "Custodian",
      "AssetNo",
      "SerialNumber",
      "Location",
      "EndDate",
      "StartDate",
      "Hostname",
      "SSOE PO Number",
      "Cart No",
      "SanitiseDate",
      "Fault",
      "DateUpdated"
    ];

    keys.forEach((key) => {
      const td = document.createElement("td");
      td.textContent = data[key] || "";
      tr.appendChild(td);
    });

    const actionTd = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn btn-sm btn-primary me-2";
    editBtn.onclick = () => editItem(tr);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.onclick = () => tr.remove();

    actionTd.appendChild(editBtn);
    actionTd.appendChild(deleteBtn);
    tr.appendChild(actionTd);

    return tr;
  }

  function populateForm(tr) {
    const cells = tr.querySelectorAll("td");
    const fields = [
      "Equipment",
      "EquipmentType",
      "Vendor",
      "BrandModel",
      "Profile",
      "Custodian",
      "AssetNo",
      "SerialNumber",
      "Location",
      "EndDate",
      "StartDate",
      "Hostname",
      "SSOE PO Number",
      "Cart No",
      "SanitiseDate",
      "Fault"
    ];

    fields.forEach((field, index) => {
      const input = itemForm.querySelector(`[name="${field}"]`);
      if (input) input.value = cells[index].textContent;
    });
  }

  function editItem(tr) {
    populateForm(tr);
    editIndex = Array.from(inventoryTableBody.children).indexOf(tr);
    const modal = new bootstrap.Modal(document.getElementById("itemModal"));
    modal.show();
  }

  itemForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = getFormData();
    const newRow = createRow(formData);

    if (editIndex !== null) {
      inventoryTableBody.children[editIndex].replaceWith(newRow);
      editIndex = null;
    } else {
      inventoryTableBody.appendChild(newRow);
    }

    itemForm.reset();
    bootstrap.Modal.getInstance(document.getElementById("itemModal")).hide();
  });

  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const rows = inventoryTableBody.querySelectorAll("tr");
    rows.forEach((row) => {
      row.style.display = [...row.cells].some((cell) =>
        cell.textContent.toLowerCase().includes(query)
      )
        ? ""
        : "none";
    });
  });
});
