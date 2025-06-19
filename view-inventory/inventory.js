// Bootstrap modal instance for Add Item
const addItemModal = new bootstrap.Modal(document.getElementById("addItemModal"));
const addItemForm = document.getElementById("add-item-form");

// Show modal when Add Item button clicked
addItemBtn.addEventListener("click", () => {
  addItemForm.reset();
  addItemModal.show();
});

// Handle Add Item form submit
addItemForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Collect form values
  const formData = new FormData(addItemForm);
  const newItem = {
    EquipmentType: formData.get("EquipmentType") || "",
    Equipment: formData.get("Equipment") || "",
    Vendor: formData.get("Vendor") || "",
    BrandModel: formData.get("BrandModel") || "",
    Profile: formData.get("Profile") || "",
    Custodian: formData.get("Custodian") || "",
    AssetNo: formData.get("AssetNo")?.trim() || "",
    SerialNumber: formData.get("SerialNumber") || "",
    Location: formData.get("Location") || "",
    EndDate: formData.get("EndDate") || "",
    StartDate: formData.get("StartDate") || "",
    Hostname: formData.get("Hostname") || "",
    "SSOE PO Number": formData.get("SSOE PO Number") || "",
    "Cart No": formData.get("Cart No") || "",
    SanitiseDate: formData.get("SanitiseDate") || "",
    DateUpdated: new Date().toLocaleDateString(),
  };

  // Basic validation
  if (!newItem.EquipmentType || !newItem.Equipment || !newItem.AssetNo) {
    alert("Please fill in the required fields: Equipment Type, Equipment, AssetNo.");
    return;
  }

  inventory.push(newItem);
  saveInventory();
  renderTable();
  addItemModal.hide();
});
