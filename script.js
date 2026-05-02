let currentIndex = 0;
const pages = ['home','services','about','results','contact','booking'];
const menuBtn = document.querySelector('.menu-btn');
const overlay = document.getElementById('overlay');
const sideMenu = document.getElementById('sideMenu');

function toggleMenu(forceClose = false){
  if(forceClose){
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
  } else {
    sideMenu.classList.toggle('active');
    overlay.classList.toggle('active');
  }
}

menuBtn.addEventListener('click', () => toggleMenu());
overlay.addEventListener('click', () => toggleMenu(true));

window.addEventListener('load', () => {
  if (window.innerWidth >= 768) {
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
  }
});

/* NAV LINKS */
document.querySelectorAll('.nav-links a, .side-menu a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    navigate(link.dataset.page);
  });
});

/* HERO BUTTON */
document.querySelectorAll('.hero-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    navigate(btn.dataset.page);
  });
});
document.querySelectorAll('.results-cta button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    navigate(btn.dataset.page);
  });
});


/* PAGE SWITCH */
function showPage(pageId, newIndex){
  const currentPage = document.querySelector('.page.active');
  const nextPage = document.getElementById(pageId);

  if(currentPage === nextPage) return;

  const goingForward = pages.indexOf(pageId) > currentIndex;
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
function navigate(pageId, fromMenu = false){
  const newIndex = pages.indexOf(pageId);
  showPage(pageId, newIndex);

  // ONLY close menu if it was actually opened (mobile only)
  if (window.innerWidth < 768 && sideMenu.classList.contains('active')) {
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
/*Result successStories*/
function toggleStories() {
  const results = document.getElementById("results");
  const btn = document.getElementById("storiesBtn");

  results.classList.toggle("show-stories");

  btn.textContent = results.classList.contains("show-stories")
    ? "← Hide Stories"
    : "View Success Stories";
}

/* CONTACT INPUT */
function handleSelection(){
  const select = document.getElementById('contact-consult');
  const otherInput = document.getElementById('contact-otherInput');
  const messageBox = document.getElementById("contact-messageBox");

  const templates = {
    "General question": "Hi, I have a general question about your program.",
    "Website feedback": "Hi, I'd like to share some feedback about your website.",
    "Feedback on lessons/service": "Hi, I wanted to give feedback on your lessons.",
    "Math question help": "Hi, I'm stuck on a math problem.",
    "Just saying hello 🙂": "Hi! Just saying hello 🙂"
  };

  // Show textarea
  messageBox.style.display = select.value ? "block" : "none";

  // Other field
  otherInput.style.display = select.value === "Other" ? "block" : "none";

  // Autofill ONLY if user hasn't typed
  if (!messageBox.dataset.edited && templates[select.value]) {
    messageBox.value = templates[select.value];
  }
}



const messageBox = document.getElementById("contact-messageBox");

messageBox.addEventListener("input", () => {
  messageBox.dataset.edited = "true";
});

/* OTHER INPUT */
function handleOther(){
  const select = document.getElementById('booking-concern');
  const input = document.getElementById('booking-otherInput');
  input.style.display = select.value === 'Other' ? 'block' : 'none';
}


/* SWIPE (UPGRADED - smooth + stable) */
let startX = 0;
let isSwiping = false;
let isAnimating = false;
let isRotating = false;

window.addEventListener('touchstart', e => {
  if (isAnimating || isRotating || isZoomed()) return;

  if (e.touches.length > 1) return;
  if (e.target.closest('.card')) return;

  startX = e.changedTouches[0].clientX;
  isSwiping = true;
});

window.addEventListener('touchend', e => {
  if (!isSwiping || isAnimating || isRotating || isZoomed()) return;

  if (e.target.closest('.card')) return;

  let endX = e.changedTouches[0].clientX;
  let diff = startX - endX;

  if (Math.abs(diff) > 60) {
    isAnimating = true;

    if (diff > 0 && currentIndex < pages.length - 1) {
      showPage(pages[currentIndex + 1], currentIndex + 1);
    } 
    else if (diff < 0 && currentIndex > 0) {
      showPage(pages[currentIndex - 1], currentIndex - 1);
    }

    setTimeout(() => {
      isAnimating = false;
    }, 500);
  }

  isSwiping = false;
  startX = 0;
});
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    if (isZoomed()) {
      isSwiping = false;
    }
  });
}

/* FORM SUBMIT */
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', function(e){
    e.preventDefault();

    const data = new FormData(form);

    // ⭐ NEW: detect form type

    let formType = form.id === 'contactForm' ? 'contact' : 'booking';

    // ⭐ NEW: get dropdown value ONLY for contact form
    let extraData = null;
    if(formType === 'contact'){
      extraData = document.getElementById('contact-consult').value;
    }


    fetch(form.action, {
      method: 'POST',
      body: data
    })
    .then(res => {
      if(res.ok){

        // ⭐ NEW: set correct message BEFORE showing page
        setSuccessMessage(formType);

        showPage('success', 5);
        form.reset();

      } else {
        alert('Something went wrong.');
      }
    })
    .catch(() => alert('Network error.'));
  });
});

/* SUCCESS MESSAGE CONTROL ⭐ (UPGRADED) */
function setSuccessMessage(type, extra = null){
  const title = document.querySelector('#success h2');
  const paragraphs = document.querySelectorAll('#success p');

  // BOOKING (unchanged)
  if(type === 'booking'){
    title.textContent = "✅ Request Sent!";
    paragraphs[0].textContent = "Your free assessment request has been submitted.";
    paragraphs[1].textContent = "I will contact you shortly to schedule your session.";
  }

  // CONTACT (dynamic based on selection)
  else if(type === 'contact'){

    switch(extra){

      case "Website feedback":
        title.textContent = "✅ Feedback Received!";
        paragraphs[0].textContent = "Thank you for your feedback.";
        paragraphs[1].textContent = "I truly appreciate you helping improve the experience.";
        break;

      case "Feedback on lessons/service":
        title.textContent = "✅ Feedback Received!";
        paragraphs[0].textContent = "Thank you for sharing your thoughts.";
        paragraphs[1].textContent = "Your input helps me improve my teaching and service.";
        break;

      case "Math question help":
        title.textContent = "✅ Message Sent!";
        paragraphs[0].textContent = "Got your question!";
        paragraphs[1].textContent = "I’ll take a look and get back to you with help shortly.";
        break;

      case "Just saying hello 🙂":
        title.textContent = "✅ Message Sent!";
        paragraphs[0].textContent = "Message received 🙂";
        paragraphs[1].textContent = "I’ll say hello back soon!";
        break;

      case "General question":
        title.textContent = "✅ Message Sent!";
        paragraphs[0].textContent = "Thanks for your question.";
        paragraphs[1].textContent = "I’ll get back to you shortly with an answer.";
        break;

      default:
        // fallback (Other or empty)
        title.textContent = "✅ Message Sent!";
        paragraphs[0].textContent = "Thank you for reaching out.";
        paragraphs[1].textContent = "I’ll get back to you as soon as possible.";
    }
  }
}
/* INIT */
updateActiveNav();


//Rotate Block
function checkOrientation(){
  const rotateBlock = document.getElementById('rotateBlock');
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if(isMobile && window.innerWidth > window.innerHeight){
    rotateBlock.classList.add('active');
  } else {
    rotateBlock.classList.remove('active');
  }
}

window.addEventListener('load', checkOrientation);
window.addEventListener('resize', checkOrientation);

window.addEventListener('orientationchange', () => {
  isRotating = true;

  setTimeout(() => {
    isRotating = false;
    checkOrientation();
  }, 300);
});

function isZoomed() {
  return window.visualViewport && window.visualViewport.scale !== 1;
}
function resetViewportZoom() {
  let meta = document.querySelector("meta[name=viewport]");
  if (!meta) return;
  // Force reset zoom
  meta.setAttribute(
    "content",
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
  );
  // iOS needs a slight delay to apply correctly
  setTimeout(() => {
    meta.setAttribute(
      "content",
      "width=device-width, initial-scale=1"
    );
  }, 50);
}
