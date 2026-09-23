document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const stage = document.querySelector('.stage');
  const floatingCards = document.querySelectorAll('.floating-card, .device-shell');

  if (stage && floatingCards.length) {
    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      floatingCards.forEach((card) => {
        const rotateY = (x - 0.5) * 18;
        const rotateX = (0.5 - y) * 18;
        card.style.transform = `${card.style.transform.includes('rotate') ? card.style.transform : ''} rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    });

    stage.addEventListener('pointerleave', () => {
      floatingCards.forEach((card) => {
        if (card.classList.contains('device-shell')) {
          card.style.transform = 'rotateX(8deg) rotateY(-16deg) rotateZ(-6deg)';
        } else if (card.classList.contains('small-card')) {
          card.style.transform = 'translateZ(14px) translateY(0px) rotateY(14deg) rotateX(8deg)';
        } else if (card.classList.contains('medium-card')) {
          card.style.transform = 'translateZ(26px) translateY(0px) rotateY(-14deg) rotateX(8deg)';
        }
      });
    });
  }

  document.querySelectorAll('.btn').forEach((button) => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = '';
    });
  });
});
