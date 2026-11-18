export function setupAccordion() {
  document.querySelectorAll('.acc-head').forEach(head => {
    head.addEventListener('click', () => {
      const acc = head.parentElement;
      const isOpen = acc.classList.contains('open');
      document.querySelectorAll('.accordion').forEach(a => a.classList.remove('open'));
      if (!isOpen) acc.classList.add('open');
    });
  });
}