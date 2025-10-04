
// === Theme + Motion + Reveal ==============================================
(function () {
  // Initial theme on load (reduce FOUC)
  try {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('js-dark-start');
    }
  } catch (_) {}
})();

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const themeToggle = document.querySelector('.theme-toggle');

  // Apply starting theme
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && prefersDark) || document.documentElement.classList.contains('js-dark-start')) {
    body.classList.add('dark-mode');
  }

  // Sync aria-pressed and label
  function updateToggleA11y() {
    const dark = body.classList.contains('dark-mode');
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
  updateToggleA11y();

  // Toggle handler
  themeToggle?.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const dark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    updateToggleA11y();
  });

  // Respect changes in OS setting if user has not explicitly chosen
  try {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener?.('change', (e) => {
      const explicit = localStorage.getItem('theme');
      if (!explicit) {
        body.classList.toggle('dark-mode', e.matches);
        updateToggleA11y();
      }
    });
  } catch(_) {}

  // IntersectionObserver reveal
  const elements = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
});
