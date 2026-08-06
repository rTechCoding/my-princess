/* ==========================================================================
   POPUP GALLERY LIGHTBOX SLIDER & ANTI-INSPECT SECURITY MODULE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ----------------------------------------------------------------------
    // 1. ANTI-INSPECT & ANTI-DOWNLOAD SECURITY PROTECTION
    // ----------------------------------------------------------------------
    const toast = document.getElementById('toast-notification');

    function showSecurityToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // Disable Right-Click Context Menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showSecurityToast('Protected with Love 💖 Right click disabled!');
    });

    // Disable Image Drag & Drop
    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    // Block Key Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            showSecurityToast('Security Active 🔒 Developer Tools disabled!');
            return false;
        }

        if (e.ctrlKey || e.metaKey) {
            const key = e.key.toLowerCase();
            if (
                (e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
                key === 'u' ||
                key === 's' ||
                key === 'p'
            ) {
                e.preventDefault();
                showSecurityToast('Protected 🔒 Code inspect & saving disabled!');
                return false;
            }
        }
    });


    // ----------------------------------------------------------------------
    // 2. SEPARATED SECTION POPUP PHOTO GALLERY LIGHTBOX SLIDERS
    // ----------------------------------------------------------------------
    const galleryModal = document.getElementById('gallery-modal');
    const closeGalleryBtn = document.getElementById('close-gallery-btn');
    const prevSlideBtn = document.getElementById('prev-slide-btn');
    const nextSlideBtn = document.getElementById('next-slide-btn');
    const sliderImg = document.getElementById('slider-img');
    const sliderCaption = document.getElementById('slider-caption');
    const currentNumEl = document.getElementById('slide-current-num');
    const totalNumEl = document.getElementById('slide-total-num');

    let activeGallery = [];
    let currentSlide = 0;

    function buildSectionGallery(sectionSelector, itemSelector) {
        const sectionEl = document.querySelector(sectionSelector);
        if (!sectionEl) return [];

        const items = sectionEl.querySelectorAll(itemSelector);
        const sectionPhotos = [];

        items.forEach((item, index) => {
            const img = item.querySelector('img');
            const captionEl = item.querySelector('.polaroid-caption');
            const captionText = captionEl ? captionEl.textContent.trim() : (img ? img.alt || `Memory ${index + 1}` : `Memory ${index + 1}`);

            if (img && img.src) {
                const photoObj = {
                    src: img.src,
                    caption: captionText
                };
                sectionPhotos.push(photoObj);

                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    activeGallery = sectionPhotos;
                    openGalleryModal(index);
                });
            }
        });

        return sectionPhotos;
    }

    function initSeparatedGalleries() {
        // Gallery 1: Memories In Motion (Marquee Section)
        buildSectionGallery('#story-section', '.marquee-item');

        // Gallery 2: Memories We Cherish (Polaroid Grid Section)
        buildSectionGallery('.memories-section', '.polaroid-card');
    }

    function updateSlider(index) {
        if (!sliderImg || activeGallery.length === 0) return;
        currentSlide = (index + activeGallery.length) % activeGallery.length;

        const photo = activeGallery[currentSlide];

        sliderImg.style.opacity = '0';
        setTimeout(() => {
            sliderImg.src = photo.src;
            sliderImg.alt = photo.caption;
            if (sliderCaption) sliderCaption.textContent = photo.caption;
            if (currentNumEl) currentNumEl.textContent = currentSlide + 1;
            if (totalNumEl) totalNumEl.textContent = activeGallery.length;
            sliderImg.style.opacity = '1';
        }, 120);

        if (window.playChimeSound) window.playChimeSound();
    }

    function openGalleryModal(index) {
        updateSlider(index);
        if (galleryModal) galleryModal.classList.add('active');
    }

    function closeGalleryModal() {
        if (galleryModal) galleryModal.classList.remove('active');
    }

    if (closeGalleryBtn) {
        closeGalleryBtn.addEventListener('click', closeGalleryModal);
    }

    if (prevSlideBtn) {
        prevSlideBtn.addEventListener('click', () => {
            updateSlider(currentSlide - 1);
        });
    }

    if (nextSlideBtn) {
        nextSlideBtn.addEventListener('click', () => {
            updateSlider(currentSlide + 1);
        });
    }

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (galleryModal && galleryModal.classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                updateSlider(currentSlide - 1);
            } else if (e.key === 'ArrowRight') {
                updateSlider(currentSlide + 1);
            } else if (e.key === 'Escape') {
                closeGalleryModal();
            }
        }
    });

    // Touch Swipe Gesture Support
    let touchStartX = 0;
    let touchEndX = 0;

    if (galleryModal) {
        galleryModal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        galleryModal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        if (touchEndX < touchStartX - 40) {
            updateSlider(currentSlide + 1);
        } else if (touchEndX > touchStartX + 40) {
            updateSlider(currentSlide - 1);
        }
    }

    // Build separated photo galleries on DOM load
    setTimeout(initSeparatedGalleries, 200);

});
