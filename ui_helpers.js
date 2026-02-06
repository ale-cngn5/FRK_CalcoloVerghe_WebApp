// UI helpers: showToast and global remove helper
function showToast(title, message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast
    const toastId = 'toast_' + Date.now();
    const bgColor = type === 'success' ? 'bg-success' : 
                    type === 'danger' ? 'bg-danger' : 
                    type === 'warning' ? 'bg-warning' : 'bg-info';

    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header ${bgColor} text-white">
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function removeTubolarDirect(type, length) {
    if (!tubolarList[type]) return;
    
    const index = tubolarList[type].findIndex(t => t.length === length);
    if (index >= 0) {
        tubolarList[type].splice(index, 1);
        if (tubolarList[type].length === 0) {
            delete tubolarList[type];
        }
        updateTubolarList();
        showToast('Successo', 'Tubolare rimosso', 'success');
    }
}

// Expose helper globally for inline onclick usage
window.removeTubolarDirect = removeTubolarDirect;
