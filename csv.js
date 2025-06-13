// csv.js

function previewCsv() {
  const input = document.getElementById("csvFile");
  if (!input.files.length) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const text = e.target.result;
    const rows = text.trim().split(/\r?\n/);

    const previewDiv = document.querySelector(".preview-content");
    previewDiv.innerHTML = "";

    // Simple preview: show first 10 rows in a table
    const table = document.createElement("table");
    table.className = "table";

    rows.slice(0, 10).forEach((row, idx) => {
      const tr = document.createElement("tr");
      const cols = row.split(",");
      cols.forEach((col) => {
        const cell = idx === 0 ? document.createElement("th") : document.createElement("td");
        cell.textContent = col;
        tr.appendChild(cell);
      });
      table.appendChild(tr);
    });

    previewDiv.appendChild(table);
    document.getElementById("uploadPreview").style.display = "block";
  };

  reader.readAsText(file);
}

function closePreview() {
  document.getElementById("uploadPreview").style.display = "none";
  document.querySelector(".preview-content").innerHTML = "";
  document.getElementById("csvFile").value = "";
}

function handleCsvUpload() {
  const input = document.getElementById("csvFile");
  if (!input.files.length) {
    alert("Please select a CSV file first.");
    return;
  }

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const text = e.target.result;
    const rows = text.trim().split(/\r?\n/);
    if (rows.length < 2) {
      alert("CSV must have header and at least one data row.");
      return;
    }

    // Parse header row and map to keys
    const headers = rows[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s/g, ""));

    // Map CSV headers to your keys
    // For example: "equipmenttype", "vendor", etc.
    // We'll try to match them loosely
    const keyMap = {};
    headers.forEach((header, idx) => {
      tableHeadersKeys.forEach((key) => {
        if (header.includes(key.toLowerCase())) {
          keyMap[key] = idx;
        }
      });
    });

    // Clear current data
    inventoryData = [];

    // Parse data rows
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(",");
      const item = {};
      for (const key of tableHeadersKeys) {
        if (keyMap[key] !== undefined) {
          item[key] = cols[keyMap[key]] ? cols[keyMap[key]].trim() : "";
        } else {
          item[key] = "";
        }
      }
      inventoryData.push(item);
    }

    renderTable();
    closePreview();
    alert("CSV imported successfully!");
  };

  reader.readAsText(file);
}

function exportToCsv() {
  const formatSelect = document.getElementById("exportFormat");
  const format = formatSelect.value;

  if (!inventoryData.length) {
    alert("No data to export.");
    return;
  }

  if (format === "csv") {
    let csvContent = tableHeaders.join(",") + "\n";

    inventoryData.forEach((item) => {
      const row = tableHeadersKeys.map((key) => {
        // Escape commas and quotes in values
        const val = item[key] || "";
        if (val.includes(",") || val.includes('"')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvContent += row.join(",") + "\n";
    });

    downloadFile(csvContent, "inventory_export.csv", "text/csv");
  } else if (format === "json") {
    const jsonContent = JSON.stringify(inventoryData, null, 2);
    downloadFile(jsonContent, "inventory_export.json", "application/json");
  }
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
