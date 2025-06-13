const modal = document.getElementById("itemModal");
const form = document.getElementById("itemForm");

function openModal() {
  modal.style.display = "block";
  form.reset();
}

function closeModal() {
  modal.style.display = "none";
}

// Close modal when clicking outside modal content
window.onclick = function (event) {
  if (event.target === modal) {
    closeModal();
  }
};
