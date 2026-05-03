make it feel like native ios app with full copy paste script entire: let currentIndex = 0;
const pages = ['home','services','about','results','contact','booking'];

let startX = 0;
let startY = 0;
let currentX = 0;
let isDragging = false;
let isHorizontal = false;
let startTime = 0;
let isRotating = false;

const wrapper = document.querySelector('.pages-wrapper');

if (!wrapper) {
  console.warn('pages-wrapper not found');
} else {

  /* =========================
     TOUCH START
  ========================== */
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) return;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    currentX = startX;

    isDragging = true;
    isHorizontal = false;
    startTime = performance.now();

    wrapper.style.transition = 'none';
  }, { passive: true });

  /* =========================
     TOUCH MOVE
  ========================== */
  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;

    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;

    const diffX = x - startX;
    const diffY = y - startY;

    // lock direction
    if (!isHorizontal) {
      if (Math.abs(diffX) > 12 && Math.abs(diffX) > Math.abs(diffY)) {
        isHorizontal = true;
      } else if (Math.abs(diffY) > 12) {
        isDragging = false;
        return;
      }
    }

    if (!isHorizontal) return;

    currentX = x;

    const atStart = currentIndex === 0 && diffX > 0;
    const atEnd = currentIndex === pages.length - 1 && diffX < 0;

    let move = diffX;

    if (atStart || atEnd) {
      move *= 0.3;
    }

    wrapper.style.transform =
      `translateX(${(-currentIndex * window.innerWidth) + move}px)`;

  }, { passive: true });

  /* =========================
     TOUCH END (SNAP LOGIC)
  ========================== */
  window.addEventListener('touchend', () => {
    if (!isDragging) return;

    const diff = currentX - startX;
    const duration = Math.max(performance.now() - startTime, 16);

    const velocity = Math.abs(diff) / duration;

    isDragging = false;

    wrapper.style.transition =
      'transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1)';

    const threshold = window.innerWidth * 0.18;
    const fastSwipe = velocity > 0.55;

    if (Math.abs(diff) > threshold || fastSwipe) {
      if (diff < 0 && currentIndex < pages.length - 1) {
        currentIndex++;
      } else if (diff > 0 && currentIndex > 0) {
        currentIndex--;
      }
    }

    updateSlider();
  });

  /* =========================
     UPDATE SLIDER
  ========================== */
  function updateSlider() {
    wrapper.style.transform =
      `translateX(${-currentIndex * window.innerWidth}px)`;
    updateActiveNav();
  }

  // IMPORTANT: initial sync
  updateSlider();
}

/* =========================
   MENU
========================== */
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

window.addEventListener('load', () => {
  if (window.innerWidth >= 768) {
    sideMenu?.classList.remove('active');
    overlay?.classList.remove('active');
  }
});

/* =========================
   NAVIGATION
========================== */
function navigate(pageId) {
  const index = pages.indexOf(pageId);
  if (index === -1) return;

  currentIndex = index;
  updateSlider();
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

/* INIT */
updateActiveNav();

te this UNDER your NAVIGATION section:

/* =========================
   CLICK NAVIGATION (FIX)
========================= */

document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-page]');
  if (!link) return;

  const page = link.dataset.page;
  if (!page) return;

  e.preventDefault();

  navigate(page);

  // close menu if open (mobile UX like iOS apps)
  sideMenu?.classList.remove('active');
  overlay?.classList.remove('active');
});


/* =========================
   ORIENTATION
========================== */
function checkOrientation() {
  const rotateBlock = document.getElementById('rotateBlock');
  if (!rotateBlock) return;

  const isMobile =
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile && window.innerWidth > window.innerHeight) {
    rotateBlock.classList.add('active');
  } else {
    rotateBlock.classList.remove('active');
  }
}

window.addEventListener('load', checkOrientation);
window.addEventListener('resize', checkOrientation);

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    isRotating = true;
    checkOrientation();
  }, 250);
});
