// inventory.js

function addItem(item) {
    inventory.push(item);
    saveInventory();
    createTable();
}

function updateItem(updatedItem) {
    const index = inventory.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
        inventory[index] = updatedItem;
        saveInventory();
        createTable();
    }
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        inventory = inventory.filter(item => item.id !== id);
        saveInventory();
        createTable();
    }
}
