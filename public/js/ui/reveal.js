const io = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

export function observeReveals() {
  document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
}