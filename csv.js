function previewCsv() {
  const fileInput = document.getElementById("csvFile");
  const previewContainer = document.querySelector(".preview-content");
  const file = fileInput.files[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const rows = text.split("\n").filter(r => r.trim() !== "");
    const headers = rows[0].split(",");

    const preview = document.createElement("table");
    preview.classList.add("table");

    const thead = preview.createTHead();
    const headerRow = thead.insertRow();
    headers.forEach(h => {
      const th = document.createElement("th");
      th.textContent = h.trim();
      headerRow.appendChild(th);
    });

    const tbody = preview.createTBody();
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(",");
      const tr = tbody.insertRow();
      row.forEach(cell => {
        const td = tr.insertCell();
        td.textContent = cell.trim();
      });
    }

    previewContainer.innerHTML = "";
    previewContainer.appendChild(preview);
    document.getElementById("uploadPreview").style.display = "block";
  };

  reader.readAsText(file);
}

function handleCsvUpload() {
  const fileInput = document.getElementById("csvFile");
  const file = fileInput.files[0];
  if (!file) return alert("Please select a CSV file.");

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const rows = text.split("\n").filter(r => r.trim() !== "");
    const headers = rows[0].split(",");
    inventoryData = [];

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(",");
      if (values.length !== headers.length) continue;

      const item = {};
      headers.forEach((h, idx) => {
        item[h.trim()] = values[idx].trim();
      });
      inventoryData.push(item);
    }

    renderTable();
    closePreview();
  };

  reader.readAsText(file);
}

function exportToCsv() {
  const format = document.getElementById("exportFormat").value;

  if (inventoryData.length === 0) {
    alert("No data to export.");
    return;
  }

  if (format === "csv") {
    const headers = Object.keys(inventoryData[0]);
    const rows = inventoryData.map(item => headers.map(h => item[h] || "").join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    downloadFile(csv, "inventory.csv", "text/csv");
  } else if (format === "json") {
    const json = JSON.stringify(inventoryData, null, 2);
    downloadFile(json, "inventory.json", "application/json");
  }
}

function closePreview() {
  document.getElementById("uploadPreview").style.display = "none";
  document.querySelector(".preview-content").innerHTML = "";
  document.getElementById("csvFile").value = "";
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
