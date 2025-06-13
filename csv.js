// Store inventory globally (can be synced with inventory.js)
let uploadedInventoryData = [];

// Preview CSV file content
function previewCsv() {
  const fileInput = document.getElementById("csvFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("No file selected.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const csvText = e.target.result;
    uploadedInventoryData = parseCsv(csvText);

    if (uploadedInventoryData.length === 0) {
      alert("CSV file is empty or invalid.");
      return;
    }

    // Preview first 5 rows
    const previewContent = document.querySelector(".preview-content");
    const headers = Object.keys(uploadedInventoryData[0]);
    let html = "<table><thead><tr>";

    headers.forEach((header) => {
      html += `<th>${header}</th>`;
    });
    html += "</tr></thead><tbody>";

    uploadedInventoryData.slice(0, 5).forEach((row) => {
      html += "<tr>";
      headers.forEach((header) => {
        html += `<td>${row[header] || ""}</td>`;
      });
      html += "</tr>";
    });

    html += "</tbody></table>";
    previewContent.innerHTML = html;
    document.getElementById("uploadPreview").style.display = "block";
  };

  reader.readAsText(file);
}

// Parse CSV string to array of objects
function parseCsv(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });
}

// Import previewed data into the inventory system
function handleCsvUpload() {
  if (uploadedInventoryData.length === 0) {
    alert("No previewed data available to import.");
    return;
  }

  // Add data to inventoryData and re-render
  uploadedInventoryData.forEach(item => addInventoryItem(item));
  uploadedInventoryData = []; // Clear cache

  document.getElementById("uploadPreview").style.display = "none";
  document.getElementById("csvFile").value = ""; // Reset file input
}

// Export current inventory to CSV or JSON
function exportToCsv() {
  const format = document.getElementById("exportFormat").value;
  const data = inventoryData;

  if (data.length === 0) {
    alert("No inventory data to export.");
    return;
  }

  let blob;
  if (format === "csv") {
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];
    data.forEach(row => {
      const values = headers.map(h => `"${row[h] || ""}"`);
      csvRows.push(values.join(","));
    });
    blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  } else if (format === "json") {
    blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  } else {
    alert("Unsupported export format.");
    return;
  }

  // Create download link
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `inventory_export.${format}`;
  link.click();
}
