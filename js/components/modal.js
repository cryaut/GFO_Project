const overlay = document.getElementById('modal-overlay');

export function showModal(title, bodyHTML, footerHTML = '') {
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" data-close-modal>&times;</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
    </div>`;
  overlay.classList.remove('hidden');

  const closeBtn = overlay.querySelector('[data-close-modal]');
  if (closeBtn) closeBtn.addEventListener('click', hideModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideModal();
  });
}

export function hideModal() {
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
}
