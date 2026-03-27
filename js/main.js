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

//sliding cards
const blocks = document.querySelectorAll(".uc-block");
const track = document.getElementById("track");
const dotsEl = document.getElementById("dots");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const VISIBLE = 1;
let offset = 0;

const trackWrap = document.querySelector(".cards-track-wrap");

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

const personaTrack = document.getElementById("personas-track");
const personaDotsEl = document.getElementById("personas-dots");
const personaPrev = document.getElementById("personas-prev");
const personaNext = document.getElementById("personas-next");
const personaCards = personaTrack.querySelectorAll(".card");
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