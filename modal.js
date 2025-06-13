// Open the modal and clear form
function openModal() {
  const modal = document.getElementById("itemModal");
  const form = document.getElementById("itemForm");

  form.reset(); // Clear previous entries
  modal.style.display = "block";
}

// Close the modal
function closeModal() {
  const modal = document.getElementById("itemModal");
  modal.style.display = "none";
}

// Handle form submission
document.getElementById("itemForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Capture form data
  const formData = new FormData(e.target);
  const newItem = {};

  for (let [key, value] of formData.entries()) {
    newItem[key] = value.trim();
  }

  // Basic validation
  if (!newItem.equipmentType || !newItem.assetNo) {
    alert("Please fill in at least Equipment Type and Asset No.");
    return;
  }

  // Add to table and close modal
  addInventoryItem(newItem);
  closeModal();
});
