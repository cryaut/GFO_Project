import { escapeHTML } from '../utils/html.js';

let cleanup;
let previousFocus;

export function showModal(title, bodyHTML, footerHTML = '') {
  cleanup?.();
  const overlay = document.getElementById('modal-overlay');
  previousFocus = document.activeElement;
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
      <div class="modal-header">
        <h3 class="modal-title" id="modal-title">${escapeHTML(title)}</h3>
        <button class="modal-close" data-close-modal aria-label="Cerrar diálogo">&times;</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
    </div>`;
  overlay.classList.remove('hidden');

  overlay.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', hideModal));
  const outsideClick = event => { if (event.target === overlay) hideModal(); };
  const onKey = event => {
    if (event.key === 'Escape') { event.preventDefault(); hideModal(); return; }
    if (event.key !== 'Tab') return;
    const controls = [...overlay.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]')];
    const first = controls[0];
    const last = controls.at(-1);
    if (!first) { event.preventDefault(); overlay.querySelector('.modal')?.focus(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  overlay.addEventListener('click', outsideClick);
  document.addEventListener('keydown', onKey);
  cleanup = () => {
    overlay.removeEventListener('click', outsideClick);
    document.removeEventListener('keydown', onKey);
  };
  (overlay.querySelector('input, select, textarea') || overlay.querySelector('.modal'))?.focus();
}

export function hideModal() {
  cleanup?.();
  cleanup = undefined;
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
  previousFocus?.focus();
  previousFocus = undefined;
}
