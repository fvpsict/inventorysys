// csv.js

// Handle CSV upload after previewing
function handleCsvUpload() {
  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a CSV file to upload.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const data = parseCSV(text);

    // Add each item with a new unique ID
    data.forEach(item => {
      item.id = generateId();
      inventory.push(item);
    });

    saveInventory();
    createTable();
    closePreview();
    alert(`${data.length} items imported successfully.`);
  };
  reader.readAsText(file);
}

// Preview CSV file content
function previewCsv() {
  const fileInput = document.getElementById('csvFile');
  const previewDiv = document.getElementById('uploadPreview');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a CSV file to preview.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const data = parseCSV(text);

    previewDiv.style.display = 'block';
    previewDiv.querySelector('.preview-content').innerHTML = `
      <p>Found <strong>${data.length}</strong> items to import.</p>
      <p>First item preview:</p>
      <pre>${JSON.stringify(data[0], null, 2)}</pre>
    `;
  };
  reader.readAsText(file);
}

// Close CSV preview and reset file input
function closePreview() {
  const previewDiv = document.getElementById('uploadPreview');
  previewDiv.style.display = 'none';
  document.getElementById('csvFile').value = '';
}

// Simple CSV parser assuming no complex escaped commas
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map(h => h.trim());

  const items = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i].split(',').map(v => v.trim());
    const item = {};

    headers.forEach((header, index) => {
      item[header] = values[index] || '';
    });

    items.push(item);
  }
  return items;
}
