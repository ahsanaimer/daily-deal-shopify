document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('dotd-header-bar');
  if (!bar) return;

  // Move bar above the site's <header> so it sits at the very top
  const header = document.querySelector('header, .shopify-section-group-header-group');
  if (header && header.parentNode) {
    header.parentNode.insertBefore(bar, header);
  }

  // 1. Live Countdown Timer
  const endTimeStr = bar.getAttribute('data-end-time');
  const endTimestamp = new Date(endTimeStr).getTime();
  const hoursEl = bar.querySelector('[data-hours]');
  const minsEl = bar.querySelector('[data-minutes]');
  const secsEl = bar.querySelector('[data-seconds]');

  if (!isNaN(endTimestamp)) {
    const updateTimer = () => {
      const now = Date.now();
      const diff = endTimestamp - now;

      if (diff <= 0) { 
        bar.style.display = 'none';
        clearInterval(timerInterval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      hoursEl.textContent = String(hours).padStart(2, '0');
      minsEl.textContent = String(minutes).padStart(2, '0');
      secsEl.textContent = String(seconds).padStart(2, '0');
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
  }

  // 2. One-Click Quick Add to Cart
  const ctaBtn = bar.querySelector('.dotd-cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', async () => {
      const variantId = ctaBtn.getAttribute('data-variant-id');
      const originalText = ctaBtn.textContent;
      ctaBtn.textContent = 'Adding...';
      ctaBtn.disabled = true;

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ id: Number(variantId), quantity: 1 }] })
        });

        if (res.ok) {
          ctaBtn.textContent = 'Added! ✓';
          setTimeout(() => {
            window.location.href = '/cart';
          }, 600);
        } else {
          throw new Error('Add to cart failed');
        }
      } catch (err) {
        ctaBtn.textContent = 'Error';
        setTimeout(() => {
          ctaBtn.textContent = originalText;
          ctaBtn.disabled = false;
        }, 1500);
      }
    });
  }
});
