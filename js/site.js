document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('nav a[href]').forEach((link) => {
    if (link.classList.contains('nav-logo')) {
      return;
    }

    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#')) {
      return;
    }

    if (href === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
});
