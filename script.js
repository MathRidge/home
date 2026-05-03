let currentIndex = 0;
const pages = ['home','services','about','results','contact','booking'];

let startX = 0;
let startY = 0;
let currentX = 0;
let isDragging = false;
let isHorizontal = false;
let startTime = 0;
let isRotating = false;

// 🔥 NEW: prevents swipe from triggering click bugs
let isClickCancelled = false;

const wrapper = document.querySelector('.pages-wrapper');

if (!wrapper) {
  console.warn('pages-wrapper not found');
} else {

  /* =========================
     UPDATE NAV (ONLY ONE VERSION)
  ========================== */
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
     UPDATE SLIDER
  ========================== */
  function updateSlider() {
    wrapper.style.transform =
      `translateX(${-currentIndex * window.innerWidth}px)`;
    updateActiveNav();
  }

  /* INITIAL SYNC */
  updateSlider();

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

  /* =========================
     CLICK NAVIGATION (FIXED)
  ========================== */
  document.addEventListener('click', (e) => {

    // 🔥 prevent swipe → click glitch
    if (isClickCancelled) return;

    const link = e.target.closest('[data-page]');
    if (!link) return;

    const page = link.dataset.page;
    if (!page) return;

    e.preventDefault();

    navigate(page);

    sideMenu?.classList.remove('active');
    overlay?.classList.remove('active');
  });

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

    isClickCancelled = false; // 🔥 reset click lock

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

    // lock gesture direction
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

    // 🔥 cancel click if swipe detected
    if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
      isClickCancelled = true;
    }

    const atStart = currentIndex === 0 && diffX > 0;
    const atEnd = currentIndex === pages.length - 1 && diffX < 0;

    let move = diffX;

    if (atStart || atEnd) {
      move *= 0.3;
    }

    const progress = Math.min(Math.abs(diffX) / window.innerWidth, 1);
    const blurAmount = progress * 6;

    wrapper.style.transform =
      `translateX(${(-currentIndex * window.innerWidth) + move}px)`;

    wrapper.style.filter = `blur(${blurAmount}px)`;


  }, { passive: true });

  /* =========================
     TOUCH END (SNAP)
  ========================== */
  window.addEventListener('touchend', () => {
    if (!isDragging) return;

    const diff = currentX - startX;
    const duration = Math.max(performance.now() - startTime, 16);

    const velocity = Math.abs(diff) / duration;

    isDragging = false;

    wrapper.style.transition =
      'transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1)';

    const threshold = window.innerWidth * 0.5;

    if (Math.abs(diff) >= threshold) {
    if (diff < 0 && currentIndex < pages.length - 1) {
    currentIndex++;
  } else if (diff > 0 && currentIndex > 0) {
    currentIndex--;
  }
}
    wrapper.style.filter = 'blur(0px)';
    updateSlider();
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
}
