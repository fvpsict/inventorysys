// modal.js

function closeModal() {
    document.getElementById('itemModal').style.display = 'none';
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
