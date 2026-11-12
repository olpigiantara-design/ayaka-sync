// ==================================================
// CUSTOM MODAL
// ==================================================
function showModal(title, message, iconClass = 'fa-info') {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    document.getElementById('modalIcon').className = `fa-solid ${iconClass} text-neo-border`;
    document.getElementById('customModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('customModal').classList.add('hidden');
}