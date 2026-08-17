function observeReveals() {
    const revealEls = document.querySelectorAll('.reveal:not(.visible)');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(el => observer.observe(el));
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-check"></i> Message envoyé';
        btn.disabled = true;

        // Remplace cette simulation par un vrai envoi (ex: Formspree, EmailJS, backend perso)
        setTimeout(() => {
            form.reset();
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2500);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    observeReveals();
    initContactForm();
});
