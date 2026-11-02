/* =========================================================
   PROJETS — rendu des cartes, filtres et fenêtre de détails
   Les données viennent de data/projects.json
========================================================= */

const CATEGORIES = [
    { id: 'all', label: 'Tous' },
    { id: 'data', label: 'Data Engineering' },
    { id: 'ml', label: 'ML & NLP' },
    { id: 'dev', label: 'Développement' }
];

let allProjects = [];
let visibleProjects = [];
let currentFilter = 'all';
let modalIndex = -1;
let lastFocused = null;


function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


async function loadProjects() {
    const container = document.getElementById('projects-grid');

    if (!container) {
        return;
    }

    try {
        const response = await fetch('data/projects.json');

        if (!response.ok) {
            throw new Error('Impossible de charger data/projects.json');
        }

        allProjects = await response.json();

        renderFilters();
        renderProjects();
        bindModalEvents();
    } catch (error) {
        console.error('Erreur lors du chargement des projets :', error);

        container.innerHTML = `
            <div class="card project-error">
                <p>Impossible de charger les projets pour le moment.</p>
                <small>
                    Vérifie que le fichier <strong>data/projects.json</strong> existe
                    et que le projet est lancé avec un serveur local (Live Server).
                </small>
            </div>
        `;
    }
}


/* ---------- Filtres ---------- */

function renderFilters() {
    const bar = document.getElementById('project-filters');

    if (!bar) {
        return;
    }

    bar.innerHTML = CATEGORIES
        .map(category => {
            const count = category.id === 'all'
                ? allProjects.length
                : allProjects.filter(p => p.category === category.id).length;

            if (count === 0) {
                return '';
            }

            return `
                <button type="button"
                        class="filter-chip ${category.id === currentFilter ? 'active' : ''}"
                        data-filter="${category.id}"
                        aria-pressed="${category.id === currentFilter}">
                    ${escapeHtml(category.label)} <span>${count}</span>
                </button>
            `;
        })
        .join('');

    bar.querySelectorAll('.filter-chip').forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.dataset.filter;

            bar.querySelectorAll('.filter-chip').forEach(chip => {
                const active = chip === button;
                chip.classList.toggle('active', active);
                chip.setAttribute('aria-pressed', String(active));
            });

            renderProjects();
        });
    });
}


/* ---------- Cartes ---------- */

function cardTemplate(project, position) {
    const number = String(allProjects.indexOf(project) + 1).padStart(2, '0');
    const tags = (project.tags || []).slice(0, 4);
    const title = escapeHtml(project.title || 'Projet');

    return `
        <article class="project-card reveal"
                 data-position="${position}"
                 style="--d:${position * 90}ms"
                 tabindex="0"
                 role="button"
                 aria-label="Voir les détails du projet ${title}">

            <div class="project-media">
                ${project.image
                    ? `<div class="cover-art"
                            data-src="${escapeHtml(project.image)}"
                            data-alt="${escapeHtml(project.imageAlt || project.title)}"
                            role="img"
                            aria-label="${escapeHtml(project.imageAlt || project.title)}"></div>`
                    : ''}
            </div>

            <div class="project-top">
                <span class="project-type">${escapeHtml(project.type || 'Projet')}</span>
                <span class="project-index">${number}</span>
            </div>

            <div class="project-overlay">
                <h3>${title}</h3>

                <div class="project-reveal">
                    <div class="project-reveal-inner">
                        <p>${escapeHtml(project.description || '')}</p>

                        <div class="tags">
                            ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                        </div>

                        <div class="project-footer">
                            <span class="project-cta">
                                Voir les détails <i class="fas fa-arrow-right"></i>
                            </span>

                            <div class="project-links">
                                ${project.github ? `
                                    <a href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer"
                                       class="icon-link" aria-label="Voir le code sur GitHub">
                                        <i class="fab fa-github"></i>
                                    </a>` : ''}
                                ${project.demo ? `
                                    <a href="${escapeHtml(project.demo)}" target="_blank" rel="noopener noreferrer"
                                       class="icon-link" aria-label="Voir la démonstration">
                                        <i class="fas fa-arrow-up-right-from-square"></i>
                                    </a>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    `;
}


function renderProjects() {
    const container = document.getElementById('projects-grid');

    visibleProjects = currentFilter === 'all'
        ? allProjects.slice()
        : allProjects.filter(project => project.category === currentFilter);

    container.innerHTML = visibleProjects.map(cardTemplate).join('');

    container.querySelectorAll('.project-card').forEach(card => {
        const position = Number(card.dataset.position);

        card.addEventListener('click', event => {
            if (event.target.closest('.project-links')) {
                return;
            }

            openProjectModal(position);
        });

        card.addEventListener('keydown', event => {
            if (event.target === card && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                openProjectModal(position);
            }
        });

        // une fois apparue, la carte passe en transition rapide (inclinaison 3D)
        card.addEventListener('transitionend', event => {
            if (event.propertyName === 'opacity') {
                card.classList.add('settled');
            }
        });

        bindCardTilt(card);
    });

    hydrateCovers(container);
    observeReveals();
}


/* ---------- Illustrations animées (SVG injectés dans la page) ----------
   Les SVG sont chargés puis insérés en ligne : leurs animations peuvent ainsi
   démarrer quand la carte devient visible (voir css/animations.css). */

const coverCache = new Map();

function fetchCover(src) {
    if (!coverCache.has(src)) {
        coverCache.set(src, fetch(src).then(response => {
            if (!response.ok) {
                throw new Error('Image introuvable : ' + src);
            }

            return response.text();
        }));
    }

    return coverCache.get(src);
}

// évite les doublons d'identifiants quand la même illustration est affichée deux fois
function uniqueIds(svg, suffix) {
    return svg.replace(/\b(p\d)(bg|g1|g2|grid|acc|up|dn|am|ap)\b/g, `$1${suffix}$2`);
}

function hydrateCovers(root) {
    root.querySelectorAll('.cover-art[data-src]').forEach(el => {
        fetchCover(el.dataset.src)
            .then(svg => {
                el.innerHTML = svg;
                const node = el.querySelector('svg');

                if (node) {
                    node.setAttribute('aria-hidden', 'true');
                }
            })
            .catch(() => {
                const img = document.createElement('img');
                img.src = el.dataset.src;
                img.alt = el.dataset.alt || '';
                el.replaceChildren(img);
            });
    });
}


/* ---------- Inclinaison 3D + reflet qui suit le curseur ---------- */

function bindCardTilt(card) {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!canHover) {
        return;
    }

    card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);

        if (!reduced) {
            card.style.setProperty('--ry', `${(x - 0.5) * 7}deg`);
            card.style.setProperty('--rx', `${(0.5 - y) * 7}deg`);
        }
    });

    card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
    });
}


/* ---------- Fenêtre de détails ---------- */

function openProjectModal(position) {
    const modal = document.getElementById('project-modal');
    const project = visibleProjects[position];

    if (!modal || !project) {
        return;
    }

    if (!modal.classList.contains('open')) {
        lastFocused = document.activeElement;
    }

    modalIndex = position;

    const set = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    set('modal-counter', `${String(allProjects.indexOf(project) + 1).padStart(2, '0')} / ${String(allProjects.length).padStart(2, '0')}`);
    set('modal-type', escapeHtml(project.type || 'Projet'));
    set('modal-title', escapeHtml(project.title || ''));
    set('modal-description', escapeHtml(project.description || ''));

    set('modal-tags', (project.tags || [])
        .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join(''));

    set('modal-highlights', (project.highlights && project.highlights.length)
        ? `
            <h4 style="margin-bottom:.65rem;">Points clés</h4>
            <ul class="modal-list">
                ${project.highlights.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>`
        : '');

    set('modal-links', `
        ${project.github ? `
            <a href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                <i class="fab fa-github"></i> GitHub
            </a>` : ''}
        ${project.demo ? `
            <a href="${escapeHtml(project.demo)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                <i class="fas fa-arrow-up-right-from-square"></i> Démonstration
            </a>` : ''}
    `);

    set('modal-gallery', '');

    if (project.image) {
        const current = position;

        fetchCover(project.image)
            .then(svg => {
                if (modalIndex !== current) {
                    return;
                }

                set('modal-gallery', `<div class="cover-art" role="img" aria-label="${escapeHtml(project.imageAlt || project.title)}">${uniqueIds(svg, 'm').replace('viewBox="0 0 800 520"', 'viewBox="0 52 800 360"')}</div>`);
            })
            .catch(() => {
                set('modal-gallery', `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.imageAlt || project.title)}" class="modal-gallery-main">`);
            });
    }

    const multiple = visibleProjects.length > 1;
    document.getElementById('modal-prev').hidden = !multiple;
    document.getElementById('modal-next').hidden = !multiple;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('modal-close').focus();
}


function stepModal(direction) {
    if (modalIndex < 0 || visibleProjects.length < 2) {
        return;
    }

    const next = (modalIndex + direction + visibleProjects.length) % visibleProjects.length;
    openProjectModal(next);
}


function closeProjectModal() {
    const modal = document.getElementById('project-modal');

    if (!modal || !modal.classList.contains('open')) {
        return;
    }

    modal.classList.remove('open');
    document.body.style.overflow = '';
    modalIndex = -1;

    if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
    }
}


function bindModalEvents() {
    const modal = document.getElementById('project-modal');

    if (!modal) {
        return;
    }

    document.getElementById('modal-close').addEventListener('click', closeProjectModal);
    document.getElementById('modal-prev').addEventListener('click', () => stepModal(-1));
    document.getElementById('modal-next').addEventListener('click', () => stepModal(1));

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeProjectModal();
        }
    });

    document.addEventListener('keydown', event => {
        if (!modal.classList.contains('open')) {
            return;
        }

        if (event.key === 'Escape') closeProjectModal();
        if (event.key === 'ArrowLeft') stepModal(-1);
        if (event.key === 'ArrowRight') stepModal(1);
    });
}


document.addEventListener('DOMContentLoaded', loadProjects);
