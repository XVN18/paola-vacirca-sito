(function() {
    if (localStorage.getItem('cookieConsent')) return;

    const css = document.createElement('style');
    css.textContent = `
        .cookie-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 10000;
            background: rgba(26, 18, 11, 0.95);
            backdrop-filter: blur(12px);
            border-top: 1px solid rgba(196, 146, 58, 0.2);
            padding: 1.25rem 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
            animation: cookieSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes cookieSlideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .cookie-banner-text {
            color: rgba(255,255,255,0.85);
            font-size: 0.875rem;
            line-height: 1.5;
            max-width: 600px;
        }
        .cookie-banner-text a {
            color: #E8B86D;
            text-decoration: underline;
            text-underline-offset: 2px;
        }
        .cookie-banner-text a:hover {
            color: #C4923A;
        }
        .cookie-banner-actions {
            display: flex;
            gap: 0.75rem;
            flex-shrink: 0;
        }
        .cookie-btn {
            padding: 0.6rem 1.5rem;
            border-radius: 9999px;
            font-size: 0.8125rem;
            font-weight: 600;
            font-family: 'Inter', system-ui, sans-serif;
            cursor: pointer;
            border: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cookie-btn-accept {
            background: linear-gradient(135deg, #C4923A, #8B6420);
            color: white;
            box-shadow: 0 4px 16px rgba(196, 146, 58, 0.3);
        }
        .cookie-btn-accept:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(196, 146, 58, 0.4);
        }
        .cookie-btn-decline {
            background: transparent;
            color: rgba(255,255,255,0.6);
            border: 1px solid rgba(255,255,255,0.15);
        }
        .cookie-btn-decline:hover {
            color: rgba(255,255,255,0.9);
            border-color: rgba(255,255,255,0.3);
        }
        .cookie-banner.hidden {
            animation: cookieSlideDown 0.4s ease-in forwards;
        }
        @keyframes cookieSlideDown {
            to { transform: translateY(100%); opacity: 0; }
        }
        @media (max-width: 768px) {
            .cookie-banner {
                flex-direction: column;
                padding: 1rem 1.25rem;
                gap: 1rem;
                padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
            }
            .cookie-banner-text { text-align: center; font-size: 0.8125rem; }
            .cookie-banner-actions { width: 100%; justify-content: center; }
        }
    `;
    document.head.appendChild(css);

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
        <div class="cookie-banner-text">
            🍪 Utilizziamo cookie per migliorare la tua esperienza. Consulta la nostra
            <a href="/cookies">Cookie Policy</a> per maggiori informazioni.
        </div>
        <div class="cookie-banner-actions">
            <button class="cookie-btn cookie-btn-accept" onclick="acceptCookies()">Accetta</button>
            <button class="cookie-btn cookie-btn-decline" onclick="declineCookies()">Rifiuta</button>
        </div>
    `;
    document.body.appendChild(banner);

    window.acceptCookies = function() {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.classList.add('hidden');
        setTimeout(() => banner.remove(), 400);
    };

    window.declineCookies = function() {
        localStorage.setItem('cookieConsent', 'declined');
        banner.classList.add('hidden');
        setTimeout(() => banner.remove(), 400);
    };
})();