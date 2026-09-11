async function loadProjects() {

    const container = document.getElementById('projects-grid');

    if (!container) {
        return;
    }

    try {

        const response = await fetch('data/projects.json');

        if (!response.ok) {
            throw new Error(
                'Impossible de charger data/projects.json'
            );
        }

        const projects = await response.json();


        container.innerHTML = projects
            .map((project, index) => {

                const projectNumber = String(index + 1).padStart(2, '0');

                return `
                    <article
                        class="card project-card ${index === 0 ? 'featured' : ''} reveal"
                        data-project-index="${index}"
                        tabindex="0"
                        role="button"
                        aria-label="Voir les détails du projet ${escapeHtml(project.title)}"
                    >

                        <div class="project-card-header">

                            <div>

                                <span class="project-type">
                                    ${escapeHtml(
                                        project.type || 'Projet'
                                    )}
                                </span>

                                <h3>
                                    ${escapeHtml(
                                        project.title || 'Projet'
                                    )}
                                </h3>

                            </div>

                            <span class="project-index">
                                ${projectNumber}
                            </span>

                        </div>


                        ${
                            project.image
                                ? `
                                    <img
                                        src="${escapeHtml(project.image)}"
                                        alt="${escapeHtml(project.title)}"
                                        class="project-image"
                                    >
                                `
                                : ''
                        }


                        <p>
                            ${escapeHtml(
                                project.description || ''
                            )}
                        </p>


                        <div class="tags">

                            ${(project.tags || [])
                                .slice(0, 5)
                                .map(tag => `
                                    <span class="tag">
                                        ${escapeHtml(tag)}
                                    </span>
                                `)
                                .join('')
                            }

                        </div>


                        <div class="project-footer">

                            <span class="project-cta">
                                Voir les détails
                                <i class="fas fa-arrow-right"></i>
                            </span>


                            <div
                                class="project-links"
                                onclick="event.stopPropagation()"
                            >

                                ${
                                    project.github
                                        ? `
                                            <a
                                                href="${escapeHtml(project.github)}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="icon-link"
                                                aria-label="Voir le projet sur GitHub"
                                                onclick="event.stopPropagation()"
                                            >
                                                <i class="fab fa-github"></i>
                                            </a>
                                        `
                                        : ''
                                }


                                ${
                                    project.demo
                                        ? `
                                            <a
                                                href="${escapeHtml(project.demo)}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="icon-link"
                                                aria-label="Voir la démonstration"
                                                onclick="event.stopPropagation()"
                                            >
                                                <i class="fas fa-arrow-up-right-from-square"></i>
                                            </a>
                                        `
                                        : ''
                                }

                            </div>

                        </div>

                    </article>
                `;

            })
            .join('');


        bindProjectCards(projects);

        observeReveals();

        bindModalEvents();


    } catch (error) {

        console.error(
            'Erreur lors du chargement des projets :',
            error
        );

        container.innerHTML = `
            <div class="card project-error">

                <p>
                    Impossible de charger les projets pour le moment.
                </p>

                <small>
                    Vérifie que le fichier
                    <strong>data/projects.json</strong>
                    existe et que le projet est lancé avec Live Server.
                </small>

            </div>
        `;

    }
}


/* =========================================================
   PROJECT CARDS
========================================================= */

function bindProjectCards(projects) {

    const cards = document.querySelectorAll(
        '.project-card'
    );


    cards.forEach(card => {

        const index = Number(
            card.dataset.projectIndex
        );


        card.addEventListener(
            'click',
            () => {
                openProjectModal(projects[index]);
            }
        );


        card.addEventListener(
            'keydown',
            event => {

                if (
                    event.key === 'Enter' ||
                    event.key === ' '
                ) {

                    event.preventDefault();

                    openProjectModal(
                        projects[index]
                    );

                }

            }
        );

    });

}


/* =========================================================
   MODAL
========================================================= */

function openProjectModal(project) {

    const modal =
        document.getElementById('project-modal');

    if (!modal || !project) {
        return;
    }


    const modalType =
        document.getElementById('modal-type');

    const modalTitle =
        document.getElementById('modal-title');

    const modalDescription =
        document.getElementById('modal-description');

    const modalTags =
        document.getElementById('modal-tags');

    const modalHighlights =
        document.getElementById('modal-highlights');

    const modalLinks =
        document.getElementById('modal-links');

    const modalGallery =
        document.getElementById('modal-gallery');


    if (modalType) {

        modalType.textContent =
            project.type || 'Projet';

    }


    if (modalTitle) {

        modalTitle.textContent =
            project.title || '';

    }


    if (modalDescription) {

        modalDescription.textContent =
            project.description || '';

    }


    if (modalTags) {

        modalTags.innerHTML =
            (project.tags || [])
                .map(tag => `
                    <span class="tag">
                        ${escapeHtml(tag)}
                    </span>
                `)
                .join('');

    }


    if (modalHighlights) {

        if (
            project.highlights &&
            project.highlights.length > 0
        ) {

            modalHighlights.innerHTML = `

                <h4 style="margin-bottom: .65rem;">
                    Points clés
                </h4>

                <ul
                    style="
                        list-style: disc;
                        padding-left: 1.1rem;
                        color: var(--text-secondary);
                    "
                >

                    ${project.highlights
                        .map(item => `
                            <li style="margin-bottom: .45rem;">
                                ${escapeHtml(item)}
                            </li>
                        `)
                        .join('')
                    }

                </ul>
            `;

        } else {

            modalHighlights.innerHTML = '';

        }

    }


    if (modalLinks) {

        modalLinks.innerHTML = `

            ${
                project.github
                    ? `
                        <a
                            href="${escapeHtml(project.github)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-primary"
                        >
                            <i class="fab fa-github"></i>
                            GitHub
                        </a>
                    `
                    : ''
            }


            ${
                project.demo
                    ? `
                        <a
                            href="${escapeHtml(project.demo)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-outline"
                        >
                            <i class="fas fa-arrow-up-right-from-square"></i>
                            Démonstration
                        </a>
                    `
                    : ''
            }

        `;

    }


    if (modalGallery) {

        modalGallery.innerHTML =
            project.image
                ? `
                    <img
                        src="${escapeHtml(project.image)}"
                        alt="${escapeHtml(project.title)}"
                        class="modal-gallery-main"
                    >
                `
                : '';

    }


    modal.classList.add('open');

    document.body.style.overflow = 'hidden';

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeProjectModal() {

    const modal =
        document.getElementById('project-modal');

    if (!modal) {
        return;
    }

    modal.classList.remove('open');

    document.body.style.overflow = '';

}


/* =========================================================
   MODAL EVENTS
========================================================= */

function bindModalEvents() {

    const modal =
        document.getElementById('project-modal');

    const closeButton =
        document.getElementById('modal-close');


    if (!modal || !closeButton) {
        return;
    }


    closeButton.addEventListener(
        'click',
        closeProjectModal
    );


    modal.addEventListener(
        'click',
        event => {

            if (
                event.target === modal
            ) {

                closeProjectModal();

            }

        }
    );


    document.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Escape'
            ) {

                closeProjectModal();

            }

        }
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    loadProjects
);