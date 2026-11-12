// ==================================================
// SIDEBAR OPEN / CLOSE
// ==================================================
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('translate-x-full');
    if (backdrop) backdrop.classList.remove('opacity-0', 'pointer-events-none');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.add('translate-x-full');
    if (backdrop) backdrop.classList.add('opacity-0', 'pointer-events-none');
}