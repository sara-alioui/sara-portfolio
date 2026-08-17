async function loadProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    try {
        const response = await fetch('data/projects.json');
        const projects = await response.json();

        container.innerHTML = projects.map(project => `
            <article class="card project-card reveal">
                ${project.image ? `<img src="${project.image}" alt="Capture d'écran — ${project.title}" class="project-image">` : ''}
                <div class="project-card-header">
                    <h3>${project.title}</h3>
                    <div class="project-links">
                        ${project.github ? `
                        <a href="${project.github}" target="_blank" rel="noopener" class="icon-link" aria-label="Voir le code sur GitHub">
                            <i class="fab fa-github"></i>
                        </a>` : ''}
                        ${project.demo ? `
                        <a href="${project.demo}" target="_blank" rel="noopener" class="icon-link" aria-label="Voir la démo">
                            <i class="fas fa-arrow-up-right-from-square"></i>
                        </a>` : ''}
                    </div>
                </div>
                <p>${project.description}</p>
                <div class="tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </article>
        `).join('');

        // Réactive les animations d'apparition pour les cartes injectées
        observeReveals();
    } catch (error) {
        container.innerHTML = '<p>Impossible de charger les projets pour le moment.</p>';
        console.error('Erreur de chargement des projets :', error);
    }
}

document.addEventListener('DOMContentLoaded', loadProjects);
