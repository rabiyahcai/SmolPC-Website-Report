/* ===================================================================
   THEME TOGGLE
   Persists to localStorage. Default is light mode.
   =================================================================== */
(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}


/* ===================================================================
   FADE-IN ON SCROLL
   =================================================================== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.01 });

document.querySelectorAll('section, .card, .team-member').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});


/* ===================================================================
   ACTIVE NAV LINK HIGHLIGHT
   =================================================================== */
const currentPage = window.location.pathname.split('/').pop();
document.querySelectorAll('nav a').forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});


/* ===================================================================
   NAV DROPDOWN (touch / keyboard)
   =================================================================== */
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


/* ===================================================================
   PAGE SIDEBAR — flat list of h2 section links with scroll-spy
   =================================================================== */
(function initSidebar() {
  const navEl = document.querySelector('nav');
  function updateNavHeight() {
    const h = navEl ? navEl.offsetHeight : 64;
    document.documentElement.style.setProperty('--nav-height', h + 'px');
  }
  updateNavHeight();
  window.addEventListener('resize', updateNavHeight);

  const main = document.querySelector('main');
  if (!main) return;

  const headings = main.querySelectorAll('h2');
  if (headings.length < 2) return;

  /* ---- Build entries ---- */
  const entries = [];
  headings.forEach(heading => {
    const section = heading.closest('section');
    const targetId = (section && section.id) || heading.id ||
      (() => { const s = heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); heading.id = s; return s; })();
    if (!targetId) return;
    entries.push({ id: targetId, text: heading.textContent.trim(), element: heading });
  });

  if (entries.length < 2) return;

  /* ---- Build sidebar DOM ---- */
  const aside = document.createElement('aside');
  aside.className = 'page-sidebar';
  aside.setAttribute('aria-label', 'Page sections');

  const sidebarNav = document.createElement('nav');
  sidebarNav.className = 'sidebar-nav';

  const linkById = new Map();

  entries.forEach(entry => {
    const a = document.createElement('a');
    a.href = '#' + entry.id;
    a.className = 'sidebar-link';
    a.textContent = entry.text;
    sidebarNav.appendChild(a);
    linkById.set(entry.id, a);
  });

  aside.appendChild(sidebarNav);
  main.parentNode.insertBefore(aside, main);
  document.body.classList.add('has-sidebar');

  /* ---- Scroll spy ---- */
  let activeLink = null;

  function setActive(id) {
    if (activeLink) activeLink.classList.remove('active');
    const link = linkById.get(id);
    if (!link) return;
    link.classList.add('active');
    activeLink = link;
  }

  const scrollSpyObserver = new IntersectionObserver((observerEntries) => {
    const visible = [];
    observerEntries.forEach(entry => {
      if (entry.isIntersecting) visible.push(entry.target);
    });
    if (visible.length > 0) {
      visible.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      const h = visible[0];
      const targetId = h.closest('section')?.id || h.id;
      if (targetId) setActive(targetId);
    }
  }, { rootMargin: '0px 0px -70% 0px', threshold: 0 });

  entries.forEach(entry => scrollSpyObserver.observe(entry.element));

  const hash = window.location.hash.slice(1);
  if (hash && linkById.has(hash)) setActive(hash);
  else setActive(entries[0].id);
})();


/* ===================================================================
   SLIDING CARDS (requirements page only)
   Guarded — only runs if the required DOM elements exist.
   =================================================================== */
(function initSlidingCards() {
  const blocks = document.querySelectorAll(".uc-block");
  const track = document.getElementById("track");
  const dotsEl = document.getElementById("dots");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");

  if (!track || !dotsEl || !prev || !next || blocks.length === 0) return;

  const VISIBLE = 1;
  let offset = 0;

  blocks.forEach(block => {
    const title = block.querySelector("h3").textContent;
    const rows = block.querySelectorAll("table tr");
    const card = document.createElement("div");
    card.className = "card";

    let html = `<div class="card-title">${title}</div>`;

    rows.forEach(row => {
      const label = row.querySelector(".uc-label");
      const value = row.cells[1];
      if (!label || !value) return;
      const key = label.textContent.trim();
      if (key === "Main Flow") {
        const steps = [...value.querySelectorAll("li")].map(li => `<li>${li.textContent.trim()}</li>`).join("");
        html += `<div class="card-label">${key}</div><ol class="card-steps">${steps}</ol>`;
      } else {
        html += `<div class="card-row"><div class="card-label">${key}</div><div class="card-value">${value.textContent.trim()}</div></div>`;
      }
    });

    card.innerHTML = html;
    track.appendChild(card);
  });

  const max = blocks.length - VISIBLE;

  blocks.forEach((_, i) => {
    const d = document.createElement("div");
    d.className = "dot" + (i === 0 ? " active" : "");
    d.onclick = () => go(i);
    dotsEl.appendChild(d);
  });

  function go(n) {
    offset = Math.max(0, Math.min(n, max));
    const cardW = track.children[0].getBoundingClientRect().width + 16;
    track.style.transform = `translateX(-${offset * cardW}px)`;
    document.querySelectorAll("#track ~ .dots .dot, #dots .dot").forEach((d, i) => d.classList.toggle("active", i === offset));
    document.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === offset));
    prev.disabled = offset === 0;
    next.disabled = offset >= max;
  }

  prev.onclick = () => go(offset - 1);
  next.onclick = () => go(offset + 1);
  go(0);
})();


/* ===================================================================
   PERSONA CARDS (requirements page only)
   Guarded — only runs if the required DOM elements exist.
   =================================================================== */
(function initPersonaCards() {
  const personaTrack = document.getElementById("personas-track");
  const personaDotsEl = document.getElementById("personas-dots");
  const personaPrev = document.getElementById("personas-prev");
  const personaNext = document.getElementById("personas-next");

  if (!personaTrack || !personaDotsEl || !personaPrev || !personaNext) return;

  const personaCards = personaTrack.querySelectorAll(".card");
  if (personaCards.length === 0) return;

  let personaOffset = 0;
  const personaMax = personaCards.length - 1;

  personaCards.forEach((_, i) => {
    const d = document.createElement("div");
    d.className = "dot" + (i === 0 ? " active" : "");
    d.onclick = () => gotoPersona(i);
    personaDotsEl.appendChild(d);
  });

  function gotoPersona(n) {
    personaOffset = Math.max(0, Math.min(n, personaMax));
    const cardW = personaCards[0].offsetWidth + 16;
    personaTrack.style.transform = `translateX(-${personaOffset * cardW}px)`;
    personaDotsEl.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === personaOffset));
    personaPrev.disabled = personaOffset === 0;
    personaNext.disabled = personaOffset >= personaMax;
  }

  personaPrev.onclick = () => gotoPersona(personaOffset - 1);
  personaNext.onclick = () => gotoPersona(personaOffset + 1);
  gotoPersona(0);
})();
