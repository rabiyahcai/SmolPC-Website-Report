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
  const cardW = track.children[0].offsetWidth + 16;
  track.style.transform = `translateX(-${offset * cardW}px)`;
  document.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === offset));
  prev.disabled = offset === 0;
  next.disabled = offset >= max;
}

prev.onclick = () => go(offset - 1);
next.onclick = () => go(offset + 1);
go(0);