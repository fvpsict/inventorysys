// modal.js

const modal = document.getElementById("itemModal");

function openModal() {
  modal.style.display = "block";
  // Focus first input or modal
  const firstInput = modal.querySelector("input, button, select, textarea");
  if (firstInput) firstInput.focus();
}

function closeModal() {
  modal.style.display = "none";
}

// Close modal when clicking outside content
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Close modal on ESC key
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.style.display === "block") {
    closeModal();
  }
});
