// fade in elements on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

// observe all sections and cards
document.querySelectorAll('section, .card, .team-member').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// highlight active nav link
const currentPage = window.location.pathname.split('/').pop();
document.querySelectorAll('nav a').forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});

// make nav dropdowns usable on touch devices and keyboard focus
const navItems = document.querySelectorAll('.nav-item');

function usesTapDropdowns() {
  return window.matchMedia('(hover: none), (pointer: coarse), (max-width: 960px)').matches;
}

function closeNavDropdowns(except = null) {
  navItems.forEach(item => {
    if (item !== except) {
      item.classList.remove('open');
    }
  });
}

navItems.forEach(item => {
  const trigger = item.querySelector('a');
  const dropdown = item.querySelector('.nav-dropdown');

  if (!trigger || !dropdown) {
    return;
  }

  trigger.addEventListener('click', (event) => {
    if (!usesTapDropdowns()) {
      return;
    }

    const isOpen = item.classList.contains('open');
    const href = trigger.getAttribute('href');
    const isCurrentPageLink = href === currentPage || (href === 'index.html' && currentPage === '');

    closeNavDropdowns(item);

    if (!isOpen) {
      event.preventDefault();
      item.classList.add('open');
      return;
    }

    if (isCurrentPageLink) {
      event.preventDefault();
      item.classList.remove('open');
    }
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('nav')) {
    closeNavDropdowns();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeNavDropdowns();
  }
});

window.addEventListener('resize', () => {
  if (!usesTapDropdowns()) {
    closeNavDropdowns();
  }
});
