// @ts-check

document.addEventListener('DOMContentLoaded', () => {

    /** @type {number} */
    let currentSlide = 0;

    /** @type {HTMLElement | null} */
    const container = document.getElementById('container');
    /** @type {NodeListOf<HTMLElement>} */
    const slides = document.querySelectorAll('.slide');
    /** @type {HTMLElement | null} */
    const dotsContainer = document.getElementById('dots');
    /** @type {HTMLElement | null} */
    const progress = document.getElementById('progress');
    
    if (!container || !slides.length) {
        console.error("Essential slide components are missing.");
        return;
    }

    /**
     * Updates the UI elements (progress bar, navigation dots, buttons).
     * @returns {void}
     */
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
        
        const prevButton = document.querySelector('.nav-btn.prev');
        const nextButton = document.querySelector('.nav-btn.next');

        if (prevButton) {
            /** @type {HTMLElement} */(prevButton).style.opacity = currentSlide === 0 ? '0' : '1';
            /** @type {HTMLButtonElement} */(prevButton).disabled = currentSlide === 0;
        }
        if (nextButton) {
            /** @type {HTMLElement} */(nextButton).style.opacity = currentSlide === slides.length - 1 ? '0' : '1';
            /** @type {HTMLButtonElement} */(nextButton).disabled = currentSlide === slides.length - 1;
        }
    };

    /**
     * Moves to the next or previous slide.
     * @param {number} dir - Direction to move (-1 for prev, 1 for next).
     * @returns {void}
     */
    const moveSlide = (dir) => {
        const newSlideIndex = currentSlide + dir;
        goToSlide(newSlideIndex);
    };

    /**
     * Jumps to a specific slide index.
     * @param {number} index - The index of the slide to go to.
     * @returns {void}
     */
    const goToSlide = (index) => {
        currentSlide = Math.max(0, Math.min(slides.length - 1, index));
        if (container) {
            container.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        updateUI();
    };

    // --- Initialization ---
    
    // Initialize dots if the container exists
    if (dotsContainer) {
        dotsContainer.innerHTML = ''; // Clear any existing dots
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = `dot ${i === 0 ? 'active' : ''}`;
            dot.onclick = () => goToSlide(i);
            dotsContainer.appendChild(dot);
        });
    }

    // --- Event Listeners ---

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
        const threshold = 50; // Minimum swipe distance
        if (touchEndX < touchStartX - threshold) {
            moveSlide(1);
        } else if (touchEndX > touchStartX + threshold) {
            moveSlide(-1);
        }
    };
    
    // Keyboard navigation support
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') {
            moveSlide(1);
        } else if (e.key === 'ArrowLeft') {
            moveSlide(-1);
        }
    });
    
    // --- Make functions globally available for inline `onclick` ---
    // This is necessary for the `onclick` attributes in the HTML
    
    // @ts-ignore
    window.moveSlide = moveSlide;
    // @ts-ignore
    window.goToSlide = goToSlide;

    /**
     * Logic for the "Forgot Injection" calculator.
     * @param {number} hoursDelayed - The number of hours the injection was delayed.
     */
    const calcMissedDose = (hoursDelayed) => {
        const resEl = document.getElementById('res');
        if (!resEl) return;

        resEl.classList.remove('hidden');
        if (hoursDelayed <= 96) { // 4 days or less
            resEl.className = "rounded-2xl p-6 border-2 bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
            resEl.innerHTML = "✅ 建議補打<br><span class='text-sm font-normal'>發現後儘快補打，之後恢復原日期。</span>";
        } else { // More than 4 days
            resEl.className = "rounded-2xl p-6 border-2 bg-amber-50 border-amber-300 text-amber-800 font-bold";
            resEl.innerHTML = "⏩ 跳過此劑<br><span class='text-sm font-normal text-red-600'>超過 4 天請跳過，不可打兩倍量！</span>";
        }
    };

    // @ts-ignore
    window.calc = calcMissedDose; // Renamed for clarity, but exposed as `calc`

    // --- Final UI Update ---
    updateUI();
});
