let currentIndex = 0;
const pages = ['home','services','about','workshops','contact'];
// 🔒 HARD BLOCK pinch zoom (ALL browsers)
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());
/* PAGE SWITCH */
function showPage(pageId, newIndex){
  const currentPage = document.querySelector('.page.active');
  const nextPage = document.getElementById(pageId);

  if(currentPage === nextPage) return;

  const goingForward = newIndex > currentIndex;
  const outDirection = goingForward ? '-100%' : '100%';
  const inStart = goingForward ? '100%' : '-100%';

  // prepare next page
  nextPage.style.transition = 'none';
  nextPage.style.transform = `translateX(${inStart})`;
  nextPage.style.opacity = 1;
  nextPage.classList.add('active');

  document.body.offsetHeight; // force reflow

  // animate
  currentPage.style.transition = 'all 0.5s ease';
  nextPage.style.transition = 'all 0.5s ease';

  currentPage.style.transform = `translateX(${outDirection})`;
  currentPage.style.opacity = 0;

  nextPage.style.transform = 'translateX(0)';

  setTimeout(()=>{
    currentPage.classList.remove('active');
    currentPage.style.transform = 'translateX(0)';
  },500);

  currentIndex = newIndex;

  updateActiveNav(); // ⭐ NEW
}

/* MENU TOGGLE */
function toggleMenu(){
  document.getElementById('sideMenu').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
}

/* NAVIGATION (FIXED) */
function navigate(pageId, index, fromMenu = false){
  showPage(pageId, index);

  // ONLY close menu if click came FROM menu
  if(fromMenu && window.innerWidth < 768){
    toggleMenu();
  }
}

/* ACTIVE NAV HIGHLIGHT ⭐ */
function updateActiveNav(){
  const navLinks = document.querySelectorAll('.nav-links a, .side-menu a');

  navLinks.forEach((link, i)=>{
    link.classList.remove('active');
    if(i === currentIndex){
      link.classList.add('active');
    }
  });
}
/* CARD INTERACTION ⭐ TOGGLE VERSION */
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('touchend', e => {
    e.preventDefault();
    e.stopPropagation();
    const isAlreadyOpen = card.classList.contains('flipped');
    // close all first
    document.querySelectorAll('.card').forEach(c => c.classList.remove('flipped'));
    // reopen only if it was NOT already open
    if (!isAlreadyOpen) {
      card.classList.add('flipped');
    }
  }, { passive: false });
  card.addEventListener('click', e => {
    e.stopPropagation();
    const isAlreadyOpen = card.classList.contains('flipped');
    document.querySelectorAll('.card').forEach(c => c.classList.remove('flipped'));
    card.classList.toggle('flipped', !isAlreadyOpen);
    }
  );
});

/* OTHER INPUT */
function handleOther(){
  const select = document.getElementById('concern');
  const input = document.getElementById('otherInput');
  input.style.display = select.value === 'Other' ? 'block' : 'none';
}

/* SWIPE (UPGRADED - smooth + stable) */
let startX = 0;
let isSwiping = false;
let isAnimating = false;
let isRotating = false;

window.addEventListener('touchstart', e=>{
  if(isAnimating || isRotating) return;

  if(e.touches.length > 1) return; // ⭐ BLOCK multi-touch (pinch)

  if(e.target.closest('.card')) return;

  startX = e.changedTouches[0].clientX;
  isSwiping = true;
});

window.addEventListener('touchend', e=>{
  if(!isSwiping || isAnimating || isRotating) return;

  // ⭐ BLOCK swipe if touch ended on card
  if(e.target.closest('.card')) return;

  let endX = e.changedTouches[0].clientX;
  let diff = startX - endX;

  if(Math.abs(diff) > 60){
    isAnimating = true;

    if(diff > 0 && currentIndex < pages.length - 1){
      showPage(pages[currentIndex + 1], currentIndex + 1);
    } 
    else if(diff < 0 && currentIndex > 0){
      showPage(pages[currentIndex - 1], currentIndex - 1);
    }

    // unlock after animation
    setTimeout(()=>{
      isAnimating = false;
    }, 500);
  }

  isSwiping = false;
  startX = 0;
});


/* FORM SUBMIT */
document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();

  const form = e.target;
  const data = new FormData(form);

  fetch(form.action, {
    method: 'POST',
    body: data
  })
  .then(response => {
    if(response.ok){
      showPage('success', 5);
      form.reset();
    } else {
      alert('Something went wrong. Please try again.');
    }
  })
  .catch(() => {
    alert('Network error. Please try again.');
  });
});

/* INIT */
updateActiveNav();

// Prevent pinch zoom
document.addEventListener('touchmove', function(e) {
  if (e.scale !== 1) {
    e.preventDefault();
  }
}, { passive: false });

// Prevent double tap zoom
let lastTouchEnd = 0;

document.addEventListener('touchend', function (e) {
  const now = Date.now();
  if (now - lastTouchEnd < 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, { passive: false });

//Rotate Block
function checkOrientation(){
  const rotateBlock = document.getElementById('rotateBlock');
  const isLandscape = window.matchMedia("(orientation: landscape)").matches;
  if(isLandscape){
    rotateBlock.classList.add('active');
  } else {
    rotateBlock.classList.remove('active');
  }
}
window.addEventListener('load', checkOrientation);
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', () => {
  isRotating = true;
  checkOrientation();
  setTimeout(() => {
    isRotating = false;
  }, 400);
});
