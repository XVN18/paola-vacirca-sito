(function() {
    const css = document.createElement('style');
    css.textContent = `
        .lightbox-overlay {
            position: fixed;
            inset: 0;
            z-index: 10001;
            background: rgba(0, 0, 0, 0.92);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            cursor: zoom-out;
        }
        .lightbox-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        .lightbox-overlay img {
            max-width: 90vw;
            max-height: 85vh;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            transform: scale(0.9);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            cursor: default;
        }
        .lightbox-overlay.active img {
            transform: scale(1);
        }
        .lightbox-close {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.15);
            color: white;
            font-size: 1.25rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            z-index: 10002;
        }
        .lightbox-close:hover {
            background: rgba(255,255,255,0.2);
            transform: rotate(90deg);
        }
        .lightbox-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            color: white;
            font-size: 1.125rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            z-index: 10002;
        }
        .lightbox-nav:hover {
            background: rgba(196, 146, 58, 0.3);
            border-color: rgba(196, 146, 58, 0.5);
        }
        .lightbox-prev { left: 1.5rem; }
        .lightbox-next { right: 1.5rem; }
        .lightbox-caption {
            position: absolute;
            bottom: 1.5rem;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(255,255,255,0.7);
            font-size: 0.875rem;
            text-align: center;
            max-width: 80vw;
            z-index: 10002;
        }
        .lightbox-counter {
            position: absolute;
            top: 1.5rem;
            left: 1.5rem;
            color: rgba(255,255,255,0.5);
            font-size: 0.8125rem;
            z-index: 10002;
        }
        @media (max-width: 768px) {
            .lightbox-nav { display: none; }
            .lightbox-overlay img { max-width: 95vw; max-height: 80vh; }
        }
    `;
    document.head.appendChild(css);

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <button class="lightbox-close"><i class="fas fa-times"></i></button>
        <button class="lightbox-nav lightbox-prev"><i class="fas fa-chevron-left"></i></button>
        <button class="lightbox-nav lightbox-next"><i class="fas fa-chevron-right"></i></button>
        <span class="lightbox-counter"></span>
        <img src="" alt="">
        <div class="lightbox-caption"></div>
    `;
    document.body.appendChild(overlay);

    const img = overlay.querySelector('img');
    const caption = overlay.querySelector('.lightbox-caption');
    const counter = overlay.querySelector('.lightbox-counter');
    const prevBtn = overlay.querySelector('.lightbox-prev');
    const nextBtn = overlay.querySelector('.lightbox-next');
    let currentGroup = [];
    let currentIndex = 0;

    function openLightbox(e) {
        const clicked = e.target.closest('[data-lightbox]');
        if (!clicked) return;
        e.preventDefault();

        const group = clicked.getAttribute('data-lightbox');
        currentGroup = Array.from(document.querySelectorAll(`[data-lightbox="${group}"]`));
        currentIndex = currentGroup.indexOf(clicked);
        showImage();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function showImage() {
        const el = currentGroup[currentIndex];
        const imgEl = el.querySelector('img');
        img.src = el.getAttribute('href') || el.getAttribute('data-src') || imgEl?.src || el.src;
        img.alt = el.getAttribute('title') || imgEl?.alt || '';
        caption.textContent = el.getAttribute('title') || '';
        counter.textContent = currentGroup.length > 1 ? `${currentIndex + 1} / ${currentGroup.length}` : '';
        prevBtn.style.display = currentGroup.length > 1 ? 'flex' : 'none';
        nextBtn.style.display = currentGroup.length > 1 ? 'flex' : 'none';
    }

    function closeLightbox() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function navigate(dir) {
        currentIndex = (currentIndex + dir + currentGroup.length) % currentGroup.length;
        showImage();
    }

    document.addEventListener('click', openLightbox);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeLightbox();
    });
    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', function(e) { e.stopPropagation(); navigate(-1); });
    nextBtn.addEventListener('click', function(e) { e.stopPropagation(); navigate(1); });

    document.addEventListener('keydown', function(e) {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });
})();