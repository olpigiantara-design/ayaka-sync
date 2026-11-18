export function goTo(id) {
  const pages = document.querySelectorAll('.page');
  const navBtns = document.querySelectorAll('.nav-btn');
  const sideLinks = document.querySelectorAll('.side-link');

  const protectedPages = ['aktivasi', 'riwayat', 'dashboard', 'bulk'];
  if (protectedPages.includes(id) && !localStorage.getItem('am_token')) {
    document.getElementById('mainApp').classList.remove('logged-in');
    document.getElementById('loginScreen').style.display = 'flex';
    return;
  }

  pages.forEach(p => p.classList.toggle('active', p.id === id));
  navBtns.forEach(b => b.classList.toggle('active', b.dataset.target === id));
  sideLinks.forEach(link => link.classList.toggle('active', link.dataset.target === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const active = document.getElementById(id);
  if (!active) return;
  active.querySelectorAll('.reveal').forEach(el => el.classList.remove('in'));
  requestAnimationFrame(() => {
    active.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), 60 + i * 70);
    });
  });
}

export function setupNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => goTo(btn.dataset.target));
  });
  document.querySelectorAll('.side-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(link.dataset.target);
      toggleSidebar();
    });
  });
}

export function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}