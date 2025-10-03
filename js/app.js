// app.js - gestion fetch, affichage, filtres, modal, formulaire
const API_URL = 'https://gabistam.github.io/Demo_API/data/projects.json';

const loader = document.getElementById('loader');
const errorBox = document.getElementById('error-message');
const grid = document.getElementById('projects-grid');
const techFilters = document.getElementById('tech-filters');
const modal = document.getElementById('project-modal');
const modalContent = modal.querySelector('.modal-content');
const modalClose = modal.querySelector('.modal-close');

// set year
document.getElementById('year').textContent = new Date().getFullYear();
if (document.getElementById('year-contact')) document.getElementById('year-contact').textContent = new Date().getFullYear();

// helper
function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function showLoader() { loader.style.display = 'block'; loader.setAttribute('aria-hidden', 'false') }
function hideLoader() { loader.style.display = 'none'; loader.setAttribute('aria-hidden', 'true') }

async function loadProjects() {
  try {
    showLoader();
    errorBox.textContent = '';
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Erreur HTTP: ' + res.status);
    const data = await res.json();
    window.__projects = data.projects || [];
    populateTechnologyFilter(data.technologies || []);
    displayProjects(window.__projects);
  } catch (err) {
    console.error(err);
    errorBox.textContent = 'Impossible de charger les projets. Vérifiez votre connexion.';
    grid.innerHTML = '';
  } finally {
    hideLoader();
  }
}

function populateTechnologyFilter(technologies) {
  techFilters.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn active';
  allBtn.textContent = 'Tous';
  allBtn.dataset.tech = 'all';
  techFilters.appendChild(allBtn);

  technologies.forEach(t => {
    const b = document.createElement('button');
    b.className = 'filter-btn';
    b.textContent = t;
    b.dataset.tech = t;
    techFilters.appendChild(b);
  });

  techFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    techFilters.querySelectorAll('button').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    filterByTechnology(btn.dataset.tech);
  });
}

function displayProjects(projects) {
  grid.innerHTML = '';
  if (!projects || projects.length === 0) {
    grid.innerHTML = '<p class="no-results">Aucun projet trouvé.</p>';
    return;
  }

  projects.forEach(project => {
    const article = document.createElement('article');
    article.className = 'project-card';
    article.setAttribute('role', 'listitem');
    article.innerHTML = `
      <img src="${project.image}" alt="${escapeHTML(project.title)} — aperçu" loading="lazy" onerror="this.style.display='none'">
      <div class="card-body">
        <h3>${escapeHTML(project.title)}</h3>
        <p class="client">${escapeHTML(project.client)} • ${escapeHTML(project.category || '')}</p>
        <div class="badges">${(project.technologies || []).map(t => '<span class="badge" aria-hidden="true">' + escapeHTML(t) + '</span>').join('')}</div>
        <button class="btn-details" data-id="${project.id}" aria-haspopup="dialog">Voir détails</button>
      </div>
    `;
    grid.appendChild(article);
  });

  document.querySelectorAll('.btn-details').forEach(btn => btn.addEventListener('click', () => openProjectModal(btn.dataset.id)));
}

function filterByTechnology(tech) {
  const all = window.__projects || [];
  if (tech === 'all') return displayProjects(all);
  const filtered = all.filter(p => (p.technologies || []).includes(tech));
  displayProjects(filtered);
}

function openProjectModal(id) {
  const project = (window.__projects || []).find(p => p.id == id);
  if (!project) return;
  modalContent.innerHTML = `
    <h2 id="modal-title">${escapeHTML(project.title)}</h2>
    <p class="client">${escapeHTML(project.client)} — ${escapeHTML(String(project.year || ''))}</p>
    ${project.image ? `<img src="${project.image}" alt="${escapeHTML(project.title)} — aperçu" style="max-width:100%;height:auto;border-radius:8px;margin:0.5rem 0">` : ''}
    <p>${escapeHTML(project.description || '')}</p>
    <h3>Fonctionnalités</h3>
    <ul>${(project.features || []).map(f => '<li>' + escapeHTML(f) + '</li>').join('')}</ul>
    <p><a href="${project.url || '#'}" target="_blank" rel="noopener noreferrer">Visiter le site</a></p>
  `;
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  modalClose.focus();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// modal events
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// contact form validation
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name=name]').value.trim();
    const email = form.querySelector('[name=email]').value.trim();
    const message = form.querySelector('[name=message]').value.trim();

    let valid = true;
    clearErrors();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) { showFieldError('err-name', 'Le nom est requis'); valid = false; }
    if (!email || !emailRegex.test(email)) { showFieldError('err-email', 'Email invalide'); valid = false; }
    if (!message) { showFieldError('err-message', 'Le message est requis'); valid = false; }

    if (!valid) return;

    // simulation d'envoi
    const status = document.getElementById('form-status');
    status.textContent = 'Envoi simulé — message enregistré localement.';
    form.reset();
    setTimeout(() => status.textContent = '', 4000);
  });
}

function showFieldError(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function clearErrors() { ['err-name', 'err-email', 'err-message'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; }) }

// init
document.addEventListener('DOMContentLoaded', loadProjects);
