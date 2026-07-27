(function() {
    const overlay = document.createElement('div');
    overlay.className = 'skeleton-overlay';
    overlay.innerHTML = `
        <div class="skeleton-nav"></div>
        <div class="skeleton-hero skeleton-block"></div>
        <div class="skeleton-section">
            <div class="skeleton-title skeleton-block"></div>
            <div class="skeleton-cards">
                <div class="skeleton-card skeleton-block"></div>
                <div class="skeleton-card skeleton-block"></div>
                <div class="skeleton-card skeleton-block"></div>
            </div>
            <div style="margin-top:3rem;">
                <div class="skeleton-text-line skeleton-block" style="width:80%"></div>
                <div class="skeleton-text-line skeleton-block" style="width:65%"></div>
                <div class="skeleton-text-line skeleton-block" style="width:70%"></div>
            </div>
        </div>
        <div class="skeleton-footer"></div>
    `;
    document.body.prepend(overlay);

    function hideSkeleton() {
        overlay.classList.add('fade-out');
        setTimeout(function() { overlay.remove(); }, 500);
    }

    if (document.readyState === 'complete') {
        hideSkeleton();
    } else {
        window.addEventListener('load', hideSkeleton);
    }
})();
