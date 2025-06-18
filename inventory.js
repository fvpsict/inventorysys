document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#inventory-table tbody");
  const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const form = document.getElementById("inventory-form");
  const addBtn = document.getElementById("add-item-btn");
  const equipmentType = document.getElementById("equipmentType");
  const equipment = document.getElementById("equipment");
  const star = document.getElementById("equipment-star");

  addBtn.addEventListener("click", () => {
    form.reset();
    document.getElementById("dateUpdated").value = new Date().toLocaleDateString("en-GB", {
      day:"2-digit", month:"long", year:"numeric"
    });
    modal.show();
    checkEquipmentRequired();
  });

  function checkEquipmentRequired() {
    if (equipmentType.value === "SSOE") {
      equipment.required = true;
      star.classList.remove("d-none");
    } else {
      equipment.required = false;
      star.classList.add("d-none");
    }
  }
  equipmentType.addEventListener("change", checkEquipmentRequired);

  form.addEventListener("submit", e => {
    e.preventDefault();
    const row = document.createElement("tr");
    const vals = [
      equipmentType.value, equipment.value, form.vendor.value,
      form.brandModel.value, form.profile.value, form.custodian.value,
      form.assetNo.value, form.serialNumber.value, form.location.value,
      form.endDate.value, form.startDate.value, form.hostname.value,
      form.ssoePoNumber.value, form.cartNo.value, form.sanitiseDate.value,
      form.durationInUse.value, form.lampHour.value,
      form.dateUpdated.value
    ];
    row.innerHTML = vals.map(v => `<td>${v || ""}</td>`).join("") +
      `<td><button class="btn btn-danger btn-sm">Delete</button></td>`;
    row.querySelector("button").addEventListener("click", () => row.remove());
    tbody.appendChild(row);
    modal.hide();
  });
});
