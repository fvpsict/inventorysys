document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("inventoryModal");
  const modal = new bootstrap.Modal(modalEl);
  const addItemBtn = document.getElementById("add-item-btn");
  const form = document.getElementById("inventory-form");
  const tbody = document.querySelector("#inventory-table tbody");
  const filterEquipment = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-inventory");

  let inventoryData = [];

  // Show modal when Add button clicked
  addItemBtn.addEventListener("click", () => {
    form.reset();
    form.DateUpdated.value = formatDate(new Date());
    modal.show();
  });

  // Format date as "DD MMM YYYY" e.g. "15 Jun 2025"
  function formatDate(date) {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  }

  // Render table rows from inventoryData array
  function renderTable() {
    tbody.innerHTML = "";

    let filtered = inventoryData;

    // Filter by equipment
    if (filterEquipment.value !== "all") {
      filtered = filtered.filter(
        (item) => item.Equipment === filterEquipment.value
      );
    }

    // Search filter (case insensitive)
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        Object.values(item).some(
          (val) =>
            val &&
            val.toString().toLowerCase().includes(searchTerm)
        )
      );
    }

    // Create rows
    filtered.forEach((item, index) => {
      const tr = document.createElement("tr");

      // Calculate duration in years and months from StartDate to today
      let durationText = "";
      if (item.StartDate) {
        const start = new Date(item.StartDate);
        const now = new Date();
        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        if (months < 0) {
          years--;
          months += 12;
        }
        if (years > 0) durationText += `${years} yr${years > 1 ? "s" : ""} `;
        if (months > 0) durationText += `${months} mo${months > 1 ? "s" : ""}`;
      }

      tr.innerHTML = `
        <td>${item.Equipment || ""}</td>
        <td>${item.Vendor || ""}</td>
        <td>${item.BrandModel || ""}</td>
        <td>${item.Profile || ""}</td>
        <td>${item.Custodian || ""}</td>
        <td>${item.AssetNo || ""}</td>
        <td>${item.SerialNumber || ""}</td>
        <td>${item.Location || ""}</td>
        <td>${item.StartDate || ""}</td>
        <td>${durationText}</td>
        <td>${item.DateUpdated || ""}</td>
        <td>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Add event listeners for delete buttons
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.getAttribute("data-index");
        inventoryData.splice(idx, 1);
        renderTable();
      });
    });
  }

  // Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // Required: Equipment must be selected
    if (!formData.get("Equipment")) {
      alert("Please select Equipment.");
      return;
    }

    // SerialNumber and AssetNo are NOT required (no validation)

    // Prepare new item object
    const newItem = {
      Equipment: formData.get("Equipment"),
      Vendor: formData.get("Vendor") || "",
      BrandModel: formData.get("BrandModel") || "",
      Profile: formData.get("Profile") || "",
      Custodian: formData.get("Custodian") || "",
      AssetNo: formData.get("AssetNo") || "",
      SerialNumber: formData.get("SerialNumber") || "",
      Location: formData.get("Location") || "",
      StartDate: formData.get("StartDate") || "",
      DateUpdated: formatDate(new Date()),
    };

    inventoryData.push(newItem);
    renderTable();
    modal.hide();
  });

  // Update DateUpdated field automatically whenever modal opens or form resets
  // (already handled in addItemBtn click listener)

  // Filter and search event handlers
  filterEquipment.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);

  // Initial render
  renderTable();
});
