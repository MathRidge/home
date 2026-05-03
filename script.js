let currentIndex = 0;
const pages = ['home','services','about','results','contact','booking'];

const wrapper = document.querySelector('.pages-wrapper');

/* STATE */
let startX = 0;
let startY = 0;
let currentX = 0;
let isDragging = false;
let lockAxis = null;
let startTime = 0;

let rafId = null;
let lastMove = 0;

if (!wrapper) {
  console.warn('pages-wrapper not found');
} else {

  /* =========================
     APPLY TRANSFORM (SMOOTH CORE)
  ========================== */
  function render(offset = 0) {
    const base = -currentIndex * window.innerWidth;
    wrapper.style.transform = `translate3d(${base + offset}px, 0, 0)`;
  }

  function snapToIndex() {
    wrapper.style.transition = 'transform 420ms cubic-bezier(0.22, 0.61, 0.36, 1)';
    render(0);
    updateActiveNav();
  }

  /* =========================
     TOUCH START
  ========================== */
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) return;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    currentX = startX;
    lockAxis = null;
    isDragging = true;

    startTime = performance.now();

    wrapper.style.transition = 'none';
    cancelAnimationFrame(rafId);
  }, { passive: true });

  /* =========================
     TOUCH MOVE (iOS FEEL)
  ========================== */
  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;

    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;

    const diffX = x - startX;
    const diffY = y - startY;

    /* LOCK DIRECTION LIKE iOS */
    if (!lockAxis) {
      if (Math.abs(diffX) > 8 && Math.abs(diffX) > Math.abs(diffY)) {
        lockAxis = 'x';
      } else if (Math.abs(diffY) > 8) {
        isDragging = false;
        return;
      }
    }

    if (lockAxis !== 'x') return;

    currentX = x;

    const atStart = currentIndex === 0 && diffX > 0;
    const atEnd = currentIndex === pages.length - 1 && diffX < 0;

    let resistance = 1;

    if (atStart || atEnd) {
      resistance = 0.35; // iOS rubber band feel
    }

    const offset = diffX * resistance;

    /* RAF SMOOTH RENDER */
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      render(offset);
    });

    lastMove = offset;

  }, { passive: true });

  /* =========================
     TOUCH END (SMART SNAP)
  ========================== */
  window.addEventListener('touchend', () => {
    if (!isDragging) return;

    isDragging = false;

    const diff = currentX - startX;
    const time = Math.max(performance.now() - startTime, 16);
    const velocity = Math.abs(diff) / time;

    const threshold = window.innerWidth * 0.15;
    const fastSwipe = velocity > 0.55;

    wrapper.style.transition = 'transform 420ms cubic-bezier(0.22, 0.61, 0.36, 1)';

    if (Math.abs(diff) > threshold || fastSwipe) {
      if (diff < 0 && currentIndex < pages.length - 1) {
        currentIndex++;
      } else if (diff > 0 && currentIndex > 0) {
        currentIndex--;
      }
    }

    snapToIndex();
  });

  /* FIRST RENDER */
  render(0);
}

/* =========================
   NAVIGATION SYSTEM
========================= */
function navigate(pageId) {
  const index = pages.indexOf(pageId);
  if (index === -1) return;

  currentIndex = index;

  wrapper.style.transition = 'transform 420ms cubic-bezier(0.22, 0.61, 0.36, 1)';
  wrapper.style.transform = `translate3d(${-currentIndex * window.innerWidth}px,0,0)`;

  updateActiveNav();
}

function updateActiveNav() {
  document.querySelectorAll('.nav-links a, .side-menu a')
    .forEach(link => {
      link.classList.toggle(
        'active',
        pages[currentIndex] === link.dataset.page
      );
    });
}

/* =========================
   MENU (SAFE)
========================= */
const menuBtn = document.querySelector('.menu-btn');
const overlay = document.getElementById('overlay');
const sideMenu = document.getElementById('sideMenu');

function toggleMenu(forceClose = false) {
  if (forceClose) {
    sideMenu?.classList.remove('active');
    overlay?.classList.remove('active');
  } else {
    sideMenu?.classList.toggle('active');
    overlay?.classList.toggle('active');
  }
}

menuBtn?.addEventListener('click', () => toggleMenu());
overlay?.addEventListener('click', () => toggleMenu(true));

window.addEventListener('resize', () => {
  if (window.innerWidth >= 768) {
    sideMenu?.classList.remove('active');
    overlay?.classList.remove('active');
  }
});

/* =========================
   ORIENTATION WARNING
========================= */
function checkOrientation() {
  const rotateBlock = document.getElementById('rotateBlock');
  if (!rotateBlock) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  rotateBlock.classList.toggle(
    'active',
    isMobile && window.innerWidth > window.innerHeight
  );
}

window.addEventListener('load', checkOrientation);
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', () => {
  setTimeout(checkOrientation, 250);
});

/* INIT NAV */
updateActiveNav();
