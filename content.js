// Script de contenido - Inyección del botón de info, tooltips dinámicos con clases exclusivas y aislamiento estructural

let globalTooltip = null;
let injectDebounceTimer = null;

// Determina el texto del tooltip en base al contenido de la tarjeta (Película vs Serie)
function getTooltipText(cardElement) {
  const cardText = cardElement.textContent || "";
  const textLower = cardText.toLowerCase();

  if (
    textLower.includes("episodio") ||
    textLower.includes("temporada") ||
    textLower.includes("ep.") ||
    textLower.includes("eps.") ||
    textLower.includes("episode") ||
    textLower.includes("season")
  ) {
    return "Episodios e Info";
  }

  return "Más información";
}

// Función para mostrar el tooltip
function showTooltip(targetElement, text) {
  if (!globalTooltip) {
    globalTooltip = document.createElement('div');
    globalTooltip.className = 'nflx-custom-tooltip';
    globalTooltip.innerHTML = `
      <div class="nflx-custom-tooltip-content"></div>
      <div class="nflx-custom-tooltip-caret"></div>
    `;
    document.body.appendChild(globalTooltip);
  }

  const contentEl = globalTooltip.querySelector('.nflx-custom-tooltip-content');
  if (contentEl) {
    contentEl.textContent = text;
  }

  const rect = targetElement.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  globalTooltip.style.visibility = 'hidden';
  globalTooltip.style.display = 'block';
  globalTooltip.classList.add('show');

  const contentRect = contentEl.getBoundingClientRect();
  const caretEl = globalTooltip.querySelector('.nflx-custom-tooltip-caret');
  const caretRect = caretEl.getBoundingClientRect();

  const totalHeight = contentRect.height + caretRect.height;
  const GAP = 8;

  const left = rect.left + scrollLeft + (rect.width - contentRect.width) / 2;
  const top = rect.top + scrollTop - totalHeight - GAP;

  globalTooltip.style.left = `${left}px`;
  globalTooltip.style.top = `${top}px`;
  globalTooltip.style.visibility = '';
}

// Función para ocultar el tooltip
function hideTooltip() {
  if (globalTooltip) {
    globalTooltip.classList.remove('show');
    setTimeout(() => {
      if (!globalTooltip.classList.contains('show')) {
        globalTooltip.style.display = 'none';
        globalTooltip.style.visibility = 'hidden';
      }
    }, 200);
  }
}

// Oculta de inmediato cualquier tooltip nativo de Netflix residual
function forceHideNetflixTooltips() {
  const tooltips = document.querySelectorAll('.css-c4ifhj, [data-id="toolTip"]');
  tooltips.forEach(t => {
    t.style.setProperty('display', 'none', 'important');
    t.classList.remove('show');
  });

  const nativeTooltipWrappers = document.querySelectorAll('div:has(> [data-id="toolTip"]), div:has(> div > [data-id="toolTip"]), div[class*="css-"]:has([data-id="toolTip"])');
  nativeTooltipWrappers.forEach(w => {
    w.style.setProperty('display', 'none', 'important');
    w.style.setProperty('opacity', '0', 'important');
    w.style.setProperty('visibility', 'hidden', 'important');
  });
}

// ==========================================
// Interceptores de Eventos en Fase de Captura
// ==========================================

window.addEventListener('mouseover', (e) => {
  const infoBtn = e.target.closest && e.target.closest('[data-uia="info-button"]');
  if (infoBtn) {
    e.stopPropagation();
    forceHideNetflixTooltips();

    const fromEl = e.relatedTarget;
    if (!fromEl || !fromEl.closest || !fromEl.closest('[data-uia="info-button"]')) {
      const cardEl = infoBtn.closest('.titleCard--container, [data-uia="titleCard--container"]');
      const tooltipText = cardEl ? getTooltipText(cardEl) : "Más información";
      showTooltip(infoBtn, tooltipText);
    }
  }
}, true);

window.addEventListener('mouseout', (e) => {
  const infoBtn = e.target.closest && e.target.closest('[data-uia="info-button"]');
  if (infoBtn) {
    e.stopPropagation();

    const toEl = e.relatedTarget;
    if (!toEl || !toEl.closest || !toEl.closest('[data-uia="info-button"]')) {
      hideTooltip();
    }
  }
}, true);

const extraEvents = ['mousemove', 'mouseenter', 'mouseleave', 'pointerover', 'pointerout', 'pointerenter', 'pointerleave', 'pointermove'];
extraEvents.forEach(eventName => {
  window.addEventListener(eventName, (e) => {
    if (e.target && e.target.closest && e.target.closest('[data-uia="info-button"]')) {
      e.stopPropagation();
      forceHideNetflixTooltips();
    }
  }, true);
});

// ==========================================
// Inyección Dinámica del Botón de Info
// ==========================================

function injectInfoButtons() {
  const cards = document.querySelectorAll('.titleCard--container, [data-uia="titleCard--container"]');

  cards.forEach(card => {
    if (card.querySelector('[data-uia="info-button"]')) return;

    const addToListBtn = card.querySelector('[data-uia="add-to-my-list"]');
    if (!addToListBtn) return;

    // Verificación rápida del contexto usando clases nativas de los modales de Netflix
    const isInsideDetailModal = card.closest('.detail-modal') ||
                                (card.closest('.previewModal--container') && !card.closest('.mini-modal'));
    if (!isInsideDetailModal) return;

    const trackingEl = card.querySelector('[data-ui-tracking-context]');
    if (!trackingEl) return;

    const parent = addToListBtn.parentNode;
    if (!parent) return;

    const grandparent = parent.parentNode;
    if (!grandparent) return;

    const grandparentParent = grandparent.parentNode;
    if (!grandparentParent) return;

    const infoBtn = document.createElement('button');
    infoBtn.className = addToListBtn.className;
    infoBtn.classList.add('nflx-info-button');
    infoBtn.setAttribute('data-uia', 'info-button');
    infoBtn.setAttribute('aria-label', 'Ver más información');
    infoBtn.setAttribute('type', 'button');

    const nativeWrapper1 = addToListBtn.querySelector('div');
    const nativeWrapper2 = nativeWrapper1 ? nativeWrapper1.querySelector('div') : null;

    const wrapper1 = document.createElement('div');
    wrapper1.className = nativeWrapper1 ? nativeWrapper1.className : 'nflx-info-wrapper-1';

    const wrapper2 = document.createElement('div');
    wrapper2.className = nativeWrapper2 ? nativeWrapper2.className : 'small nflx-info-wrapper-2';
    wrapper2.setAttribute('role', 'presentation');

    wrapper2.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    `;

    wrapper1.appendChild(wrapper2);
    infoBtn.appendChild(wrapper1);

    infoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        const contextStr = trackingEl.getAttribute('data-ui-tracking-context');
        const context = JSON.parse(decodeURIComponent(contextStr));

        let videoId = context.video_id;
        if (!videoId && context.unifiedEntityId) {
          const match = context.unifiedEntityId.match(/Video:(\d+)/);
          if (match) {
            videoId = parseInt(match[1], 10);
          }
        }

        if (videoId) {
          history.pushState(null, '', `/browse?jbv=${videoId}`);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      } catch (err) {
        // silencioso en producción
      }
    });

    grandparentParent.style.display = 'flex';
    grandparentParent.style.flexDirection = 'row';
    grandparentParent.style.alignItems = 'center';
    grandparentParent.style.gap = '6px';

    parent.style.display = 'flex';
    parent.style.alignItems = 'center';

    grandparentParent.appendChild(infoBtn);
  });
}

// Inyección inicial
injectInfoButtons();

// MutationObserver con debounce para no dispararse en cada micro-cambio del DOM
const observer = new MutationObserver((mutations) => {
  let hasNewNodes = false;
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      hasNewNodes = true;
      break;
    }
  }
  if (hasNewNodes) {
    clearTimeout(injectDebounceTimer);
    injectDebounceTimer = setTimeout(injectInfoButtons, 100);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Ocultar tooltips activos al navegar o cambiar visibilidad para evitar tooltips flotantes huérfanos
window.addEventListener('popstate', hideTooltip);
document.addEventListener('visibilitychange', hideTooltip);