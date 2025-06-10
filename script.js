// script.js
const standardHeaders = [
    'EquipmentType', 'Vendor', 'BrandModel', 'AssetNo', 'SerialNumber',
    'Location', 'Room No', 'EndDate', 'StartDate'
];

const ssoeHeaders = [
    'EquipmentType', 'Vendor', 'BrandModel', 'Profile', 'Custodian',
    'AssetNo', 'SerialNumber', 'Location', 'EndDate', 'StartDate',
    'Hostname', 'SSOE PO Number', 'Cart No', 'SanitiseDate', 'Fault'
];

const equipmentTypes = [
    'SSOE',
    'Projector',
    'Projector Screen',
    'Visualiser',
    'Apple TV',
    'SMAX',
    'Portable HDD',
    'Macbook',
    'TV',
    'OMR'
];

let inventory = [];

document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('categoryFilter').addEventListener('change', filterInventory);
    document.getElementById('addNewBtn').addEventListener('click', showAddModal);
    document.getElementById('uploadBtn').addEventListener('click', handleCsvUpload);
    
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('itemModal');
        if (event.target === modal) {
            closeModal();
        }
    });

    document.getElementById('itemForm').addEventListener('submit', (event) => {
        event.preventDefault();
        saveFormData();
    });
}

function showAddModal() {
    const modal = document.getElementById('itemModal');
    const category = document.getElementById('categoryFilter').value;
    const headers = category === 'SSOE' ? ssoeHeaders : standardHeaders;
    
    const fieldIcons = {
        EquipmentType: 'bi-pc-display',
        Vendor: 'bi-shop',
        BrandModel: 'bi-tag',
        AssetNo: 'bi-upc-scan',
        SerialNumber: 'bi-123',
        Location: 'bi-geo-alt',
        'Room No': 'bi-door-closed',
        EndDate: 'bi-calendar-event',
        StartDate: 'bi-calendar-check',
        Profile: 'bi-person-vcard',
        Custodian: 'bi-person',
        Hostname: 'bi-pc',
        'SSOE PO Number': 'bi-file-text',
        'Cart No': 'bi-cart',
        SanitiseDate: 'bi-calendar2-check',
        Fault: 'bi-exclamation-triangle'
    };

    const form = document.getElementById('itemForm');
    form.innerHTML = headers.map(header => {
        const iconClass = fieldIcons[header] || 'bi-asterisk';
        
        if (header === 'EquipmentType') {
            return `
                <div class="form-group">
                    <label for="${header}">
                        <i class="bi ${iconClass}"></i> ${header}
                    </label>
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="bi ${iconClass}"></i>
                        </span>
                        <select id="${header}" name="${header}" class="form-select" required>
                            <option value="">Select Equipment Type</option>
                            ${equipmentTypes.map(type => 
                                `<option value="${type}">${type}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
            `;
        }
        else if (header === 'StartDate' || header === 'EndDate' || header === 'SanitiseDate') {
            return `
                <div class="form-group">
                    <label for="${header}">
                        <i class="bi ${iconClass}"></i> ${header}
                    </label>
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="bi ${iconClass}"></i>
                        </span>
                        <input type="text" 
                               id="${header}" 
                               name="${header}" 
                               class="form-control datepicker" 
                               required 
                               readonly 
                               placeholder="Select ${header}">
                    </div>
                </div>
            `;
        }
        return `
            <div class="form-group">
                <label for="${header}">
                    <i class="bi ${iconClass}"></i> ${header}
                </label>
                <div class="input-group">
                    <span class="input-group-text">
                        <i class="bi ${iconClass}"></i>
                    </span>
                    <input type="text" 
                           id="${header}" 
                           name="${header}" 
                           class="form-control" 
                           required 
                           placeholder="Enter ${header}">
                </div>
            </div>
        `;
    }).join('');
    
    form.innerHTML += `
        <div class="button-group">
            <button type="submit" class="btn btn-primary">
                <i class="bi bi-save"></i> Save
            </button>
            <button type="button" class="btn btn-secondary" onclick="closeModal()">
                <i class="bi bi-x-circle"></i> Cancel
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
    initializeDatePickers();

    if (category !== 'all') {
        const equipmentTypeSelect = document.querySelector('select[name="EquipmentType"]');
        equipmentTypeSelect.value = category;
    }
}

function initializeDatePickers() {
    const startDatePicker = flatpickr("#StartDate", {
        dateFormat: "Y-m-d",
        allowInput: false,
        onChange: function(selectedDates, dateStr) {
            endDatePicker.set('minDate', dateStr);
        }
    });

    const endDatePicker = flatpickr("#EndDate", {
        dateFormat: "Y-m-d",
        allowInput: false,
        onChange: function(selectedDates, dateStr) {
            startDatePicker.set('maxDate', dateStr);
        }
    });

    if (document.getElementById('SanitiseDate')) {
        flatpickr("#SanitiseDate", {
            dateFormat: "Y-m-d",
            allowInput: false
        });
    }
}

function closeModal() {
    const modal = document.getElementById('itemModal');
    modal.style.display = 'none';
    document.getElementById('itemForm').reset();
}

function saveFormData() {
    const form = document.getElementById('itemForm');
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
        }
    });

    if (!isValid) {
        alert('Please fill in all required fields');
        return;
    }

    const formData = new FormData(form);
    const itemData = {};
    
    formData.forEach((value, key) => {
        itemData[key] = value;
    });
    
    const existingItemIndex = inventory.findIndex(item => item.AssetNo === itemData.AssetNo);
    
    if (existingItemIndex >= 0) {
        inventory[existingItemIndex] = itemData;
    } else {
        inventory.push(itemData);
    }
    
    saveInventory();
    displayInventory();
    closeModal();
}

function handleCsvUpload() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const data = parseCsv(text);
            inventory = inventory.concat(data);
            saveInventory();
            displayInventory();
        };
        reader.readAsText(file);
    }
}

function parseCsv(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
            return obj;
        }, {});
    });
}

function filterInventory() {
    const category = document.getElementById('categoryFilter').value;
    const filteredItems = category === 'all' 
        ? inventory 
        : inventory.filter(item => item.EquipmentType === category);
    displayInventory(filteredItems);
}

function displayInventory(items = inventory) {
    const table = document.getElementById('inventoryTable');
    const category = document.getElementById('categoryFilter').value;
    const headers = category === 'SSOE' ? ssoeHeaders : standardHeaders;
    
    table.querySelector('thead').innerHTML = `
        <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
            <th>Actions</th>
        </tr>
    `;
    
    table.querySelector('tbody').innerHTML = items.map(item => `
        <tr>
            ${headers.map(header => `<td>${item[header] || ''}</td>`).join('')}
            <td>
                <button onclick="editItem('${item.AssetNo}')" class="btn btn-sm btn-warning">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button onclick="deleteItem('${item.AssetNo}')" class="btn btn-sm btn-danger">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function editItem(assetNo) {
    const item = inventory.find(i => i.AssetNo === assetNo);
    if (item) {
        showAddModal();
        Object.keys(item).forEach(key => {
            const input = document.querySelector(`#itemForm [name="${key}"]`);
            if (input) {
                if (key === 'StartDate' || key === 'EndDate' || key === 'SanitiseDate') {
                    const fp = input._flatpickr;
                    if (fp) {
                        fp.setDate(item[key]);
                    }
                } else {
                    input.value = item[key];
                }
            }
        });
    }
}

function deleteItem(assetNo) {
    if (confirm('Are you sure you want to delete this item?')) {
        inventory = inventory.filter(i => i.AssetNo !== assetNo);
        saveInventory();
        displayInventory();
    }
}

function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function loadInventory() {
    const saved = localStorage.getItem('inventory');
    inventory = saved ? JSON.parse(saved) : [];
    displayInventory();
}
