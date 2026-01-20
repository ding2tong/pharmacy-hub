// @ts-check

/**
 * Initializes the slide navigation logic.
 * This can be called manually (useful for React) or automatically on DOMContentLoaded.
 */
const initSlides = () => {
    let currentSlide = 0;
    let fontScale = parseFloat(localStorage.getItem('slideFontScale')) || 1.0;
    const container = document.getElementById('container');
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('dots');
    const progress = document.getElementById('progress');

    if (!container || !slides.length) return;

    // Initialize dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = `dot ${i === 0 ? 'active' : ''}`;
            dot.onclick = () => goToSlide(i);
            dotsContainer.appendChild(dot);
        });
    }

    const updateUI = () => {
        if (progress) {
            const percent = slides.length > 1 ? (currentSlide / (slides.length - 1)) * 100 : 0;
            progress.style.width = percent + '%';
        }

        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.className = `dot ${i === currentSlide ? 'active' : ''}`;
            });
        }

        const prevBtn = document.querySelector('.nav-btn.prev');
        const nextBtn = document.querySelector('.nav-btn.next');
        if (prevBtn) /** @type {HTMLElement} */(prevBtn).style.opacity = currentSlide === 0 ? '0' : '1';
        if (nextBtn) /** @type {HTMLElement} */(nextBtn).style.opacity = currentSlide === slides.length - 1 ? '0' : '1';
    };

    /** @param {number} index */
    const goToSlide = (index) => {
        currentSlide = Math.max(0, Math.min(slides.length - 1, index));
        container.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateUI();
    };

    /** @param {number} dir */
    const moveSlide = (dir) => {
        goToSlide(currentSlide + dir);
    };

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;
    document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) moveSlide(1);
        if (touchEndX > touchStartX + threshold) moveSlide(-1);
    }, { passive: true });

    // Keyboard support
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') moveSlide(1);
        if (e.key === 'ArrowLeft') moveSlide(-1);
    });

    // Make available globally
    // @ts-ignore
    window.moveSlide = moveSlide;
    Object.assign(window, { moveSlide, goToSlide });

    updateUI();
};

/**
 * Changes the font scale globally
 * @param {number} delta
 */
function changeFontSize(delta) {
    let fontScale = parseFloat(localStorage.getItem('slideFontScale') || '1.0');
    fontScale = Math.max(0.8, Math.min(2.0, fontScale + delta));
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());
    localStorage.setItem('slideFontScale', fontScale.toString());
}

// Initialize font scale on load
let initialFontScale = parseFloat(localStorage.getItem('slideFontScale') || '1.0');
document.documentElement.style.setProperty('--font-scale', initialFontScale.toString());

// Export to window
Object.assign(window, { initSlides, changeFontSize });

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initSlides);
