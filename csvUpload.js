// csvUpload.js

function handleCsvUpload() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const data = parseCSV(text);
            
            // Add each item to inventory
            data.forEach(item => {
                item.id = generateId();
                inventory.push(item);
            });
            
            saveInventory();
            createTable();
            closePreview();
        };
        reader.readAsText(file);
    }
}

function previewCsv() {
    const fileInput = document.getElementById('csvFile');
    const previewDiv = document.getElementById('uploadPreview');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const data = parseCSV(text);
            
            // Display preview
            previewDiv.style.display = 'block';
            previewDiv.querySelector('.preview-content').innerHTML = `
                <p>Found ${data.length} items to import</p>
                <p>First item preview:</p>
                <pre>${JSON.stringify(data[0], null, 2)}</pre>
            `;
        };
        reader.readAsText(file);
    }
}

function closePreview() {
    const previewDiv = document.getElementById('uploadPreview');
    previewDiv.style.display = 'none';
    document.getElementById('csvFile').value = '';
}
