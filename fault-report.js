function renderTable() {
  const search = document.getElementById("search-inventory")?.value?.toLowerCase() || "";
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

// Fill form for edit
function fillForm(item) {
  document.getElementById("fault-EquipmentType").value = item.EquipmentType || "";
  document.getElementById("fault-Equipment").value = item.Equipment || "";
  document.getElementById("fault-Venue").value = item.Venue || "";
  document.getElementById("fault-AssetNo").value = item.AssetNo || "";
  document.getElementById("fault-SerialNumber").value = item.SerialNumber || "";
  document.getElementById("fault-Description").value = item.Fault || "";
  document.getElementById("fault-Status").value = item.Status || "";
  document.getElementById("fault-DateReported").value = item.DateReported || "";
}

// Handle save
faultForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const item = {
    EquipmentType: faultForm["EquipmentType"].value,
    Equipment: faultForm["Equipment"].value,
    Venue: faultForm["Venue"].value,
    AssetNo: faultForm["AssetNo"].value,
    SerialNumber: faultForm["SerialNumber"].value,
    Fault: faultForm["FaultDescription"].value,
    Status: faultForm["Status"].value,
    DateReported: faultForm["DateReported"].value,
  };

  if (!item.EquipmentType || !item.Equipment || !item.Fault || !item.Status || !item.DateReported || !item.Venue) {
    alert("Please fill in all required fields.");
    return;
  }

  if (editingIndex >= 0) {
    faultData[editingIndex] = item;
  } else {
    faultData.push(item);
  }

  faultModal.hide();
  renderTable();
});
