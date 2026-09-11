function observeReveals() {
    const revealEls = document.querySelectorAll('.reveal:not(.visible)');

    if (!('IntersectionObserver' in window)) {
        revealEls.forEach(el => {
            el.classList.add('visible');
        });

        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12
        }
    );

    revealEls.forEach(el => {
        observer.observe(el);
    });
}


document.addEventListener(
    'DOMContentLoaded',
    observeReveals
);