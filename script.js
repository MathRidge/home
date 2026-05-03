let currentIndex = 0;
const pages = ['home','services','about','results','contact','booking'];

let startX = 0;
let startY = 0;
let currentX = 0;
let isDragging = false;
let isHorizontal = false;

// 🔥 prevents swipe from triggering click bugs
let isClickCancelled = false;

let resultsInnerIndex = 0;
let isResultsInnerSwipe = false;

const resultsTrack = document.querySelector('.results-mobile-track');
const resultsPanelCount = 4;

const wrapper = document.querySelector('.pages-wrapper');

function isRotateBlocked() {
  return document.getElementById('rotateBlock')?.classList.contains('active');
}

if (!wrapper) {
  console.warn('pages-wrapper not found');
} else {

  function updateActiveNav() {
    document.querySelectorAll('.nav-links a, .side-menu a')
      .forEach(link => {
        link.classList.toggle(
          'active',
          pages[currentIndex] === link.dataset.page
        );
      });
  }

  function updateSlider() {
    wrapper.style.transform =
      `translateX(${-currentIndex * window.innerWidth}px)`;
    updateActiveNav();
  }

  updateSlider();

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

menuBtn?.addEventListener('click', (e) => {
	e.stopPropagation();
	isClickCancelled = false;
	toggleMenu();
});
  overlay?.addEventListener('click', () => toggleMenu(true));

  window.addEventListener('load', () => {
    if (window.innerWidth >= 768) {
      sideMenu?.classList.remove('active');
      overlay?.classList.remove('active');
    }
  });

  function navigate(pageId) {
    const index = pages.indexOf(pageId);
    if (index === -1) return;

    currentIndex = index;

    if (pageId !== 'results') {
      resultsInnerIndex = 0;
      if (resultsTrack) {
        resultsTrack.style.transform = 'translateX(0px)';
      }
    }

    updateSlider();
  }

  document.addEventListener('click', (e) => {
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

  window.addEventListener('touchstart', (e) => {
    if (isRotateBlocked()) return;
    if (e.touches.length > 1) return;

const interactive = e.target.closest('button, a, input, textarea, select, .card');

if (interactive) {
	isDragging = false;
	return;
}

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    currentX = startX;

    isDragging = true;
    isHorizontal = false;
    isClickCancelled = false;

    wrapper.style.transition = 'none';
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isRotateBlocked()) return;
    if (!isDragging) return;

    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;

    const diffX = x - startX;
    const diffY = y - startY;

    if (!isHorizontal) {
      if (Math.abs(diffX) > 12 && Math.abs(diffX) > Math.abs(diffY)) {
        isHorizontal = true;
      } else if (Math.abs(diffY) > 12 && Math.abs(diffY) > Math.abs(diffX)) {
        isDragging = false;
        return;
      }
    }

    if (!isHorizontal) return;

    currentX = x;

    if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
      isClickCancelled = true;
    }

    const isMobile = window.innerWidth < 768;
    const isResultsPage = pages[currentIndex] === 'results';

    if (isMobile && isResultsPage && resultsTrack) {
      const canSwipeInnerLeft =
        diffX < 0 && resultsInnerIndex < resultsPanelCount - 1;

      const canSwipeInnerRight =
        diffX > 0 && resultsInnerIndex > 0;

      if (canSwipeInnerLeft || canSwipeInnerRight) {
        isResultsInnerSwipe = true;

        resultsTrack.style.transition = 'none';
        resultsTrack.style.transform =
          `translateX(calc(${-resultsInnerIndex * 100}% + ${diffX}px))`;

        return;
      }

      isResultsInnerSwipe = false;
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

  window.addEventListener('touchend', () => {
    if (!isDragging || isRotateBlocked()) return;

    const diff = currentX - startX;

    isDragging = false;

    wrapper.style.transition =
      'transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1)';

    const threshold = window.innerWidth * 0.33;

    const isMobile = window.innerWidth < 768;
    const isResultsPage = pages[currentIndex] === 'results';

    if (isMobile && isResultsPage && isResultsInnerSwipe && resultsTrack) {
      resultsTrack.style.transition =
        'transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1)';

      if (Math.abs(diff) >= threshold) {
        if (diff < 0 && resultsInnerIndex < resultsPanelCount - 1) {
          resultsInnerIndex++;
        } else if (diff > 0 && resultsInnerIndex > 0) {
          resultsInnerIndex--;
        }
      }

      resultsTrack.style.transform =
        `translateX(${-resultsInnerIndex * 100}%)`;

      isResultsInnerSwipe = false;
      wrapper.style.filter = 'blur(0px)';
setTimeout(() => {
	isClickCancelled = false;
}, 50);

      return;
    }

    if (Math.abs(diff) >= threshold) {
      if (diff < 0 && currentIndex < pages.length - 1) {
        currentIndex++;
      } else if (diff > 0 && currentIndex > 0) {
        currentIndex--;
      }
    }

	wrapper.style.filter = 'blur(0px)';
	updateSlider();

	setTimeout(() => {
	isClickCancelled = false;
	}, 50);

  });

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
      checkOrientation();
    }, 250);
  });
}

/* =========================
   FORM + SUCCESS (GLOBAL)
========================== */

function setSuccessMessage(title, line1, line2){
	document.getElementById('successTitle').textContent = title;
	document.getElementById('successLine1').textContent = line1;
	document.getElementById('successLine2').textContent = line2;
}

document.getElementById('contactForm')?.addEventListener('submit', function(e){
	e.preventDefault();

	const choice = document.getElementById('contact-consult')?.value;

	if (choice === "Website feedback") {
		setSuccessMessage("✅ Feedback Received!","Thank you for helping improve Math Ridge.","I’ll review your suggestion carefully.");
	} else if (choice === "Math question help") {
		setSuccessMessage("✅ Math Question Received!","Thanks for sending your math question.","I’ll take a look and reply with guidance soon.");
	} else if (choice === "Just saying hello 🙂") {
		setSuccessMessage("👋 Hello Received!","Thank you for stopping by Math Ridge.","I’m glad you reached out.");
	} else {
		setSuccessMessage("✅ Message Sent!","Thank you for reaching out.","I’ll get back to you as soon as possible.");
	}

	document.getElementById('success').classList.add('active');
});

document.getElementById('bookingForm')?.addEventListener('submit', function(e){
	e.preventDefault();

	const concern = document.getElementById('booking-concern')?.value;

	if (concern === "Falling behind") {
		setSuccessMessage("✅ Diagnostic Request Sent!","Thank you for sharing your concern.","I’ll help identify the learning gaps and next steps.");
	} else if (concern === "SAT Prep") {
		setSuccessMessage("✅ SAT Prep Request Sent!","Thank you for requesting SAT support.","I’ll help build a focused score-improvement plan.");
	} else {
		setSuccessMessage("✅ Booking Request Sent!","Thank you for requesting a free diagnostic.","I’ll review your information and get back to you soon.");
	}

	document.getElementById('success').classList.add('active');
});

document.getElementById('successBackBtn')?.addEventListener('click', () => {
	document.getElementById('success').classList.remove('active');
	currentIndex = 0;
	document.querySelector('.pages-wrapper').style.transform = 'translateX(0px)';
});
/* CONTACT INPUT */
function handleSelection(){
	const select = document.getElementById('contact-consult');
	const otherInput = document.getElementById('contact-otherInput');
	const messageBox = document.getElementById('contact-messageBox');

	if (!select || !otherInput || !messageBox) return;

	if (select.value !== "") {
		messageBox.style.display = "block";
	} else {
		messageBox.style.display = "none";
	}

	if (select.value === "Other") {
		otherInput.style.display = "block";
		otherInput.focus();
	} else {
		otherInput.style.display = "none";
		otherInput.value = "";
	}
}

/* BOOKING INPUT */
function handleOther(){
	const select = document.getElementById('booking-concern');
	const otherInput = document.getElementById('booking-otherInput');

	if (!select || !otherInput) return;

	if (select.value === "Other") {
		otherInput.style.display = "block";
		otherInput.focus();
	} else {
		otherInput.style.display = "none";
		otherInput.value = "";
	}
}



document.querySelectorAll('.card').forEach(card => {
	card.addEventListener('click', () => {
		card.classList.toggle('flipped');
	});
});
document.addEventListener('gesturestart', function(e) {
	e.preventDefault();
});

document.addEventListener('gesturechange', function(e) {
	e.preventDefault();
});

document.addEventListener('gestureend', function(e) {
	e.preventDefault();
});

document.addEventListener('touchmove', function(e) {
	if (e.touches.length > 1) {
		e.preventDefault();
	}
}, { passive: false });
