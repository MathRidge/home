let storyIndex = 0;

let startX = 0;
let startY = 0;
let currentX = 0;

let isDragging = false;
let isHorizontal = false;
let isClickCancelled = false;

const storyTrack = document.getElementById("storyTrack");
const storyViewport = document.getElementById("storyViewport");
const storyCounter = document.getElementById("storyCounter");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const storyMenu = document.getElementById("storyMenu");
const storyMenuBtn = document.getElementById("storyMenuBtn");

const storyPages = document.querySelectorAll(".story-page");
const totalStoryPages = storyPages.length;

function updateStory() {
	storyTrack.style.transition =
		"transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1)";

	storyTrack.style.transform =
		`translate3d(${-storyIndex * 100}%, 0, 0)`;

	storyCounter.textContent = `${storyIndex + 1} / ${totalStoryPages}`;
}

function nextStory() {
	if (storyIndex < totalStoryPages - 1) {
		storyIndex++;
		updateStory();
	}
}

function prevStory() {
	if (storyIndex > 0) {
		storyIndex--;
		updateStory();
	}
}

function goStoryPage(pageNumber) {
	if (pageNumber < 0 || pageNumber >= totalStoryPages) return;

	storyIndex = pageNumber;
	updateStory();
	storyMenu.classList.remove("active");
}

nextBtn.addEventListener("click", function(e) {
	e.stopPropagation();
	nextStory();
});

prevBtn.addEventListener("click", function(e) {
	e.stopPropagation();
	prevStory();
});

storyMenuBtn.addEventListener("click", function(e) {
	e.stopPropagation();
	storyMenu.classList.toggle("active");
});

document.querySelectorAll("[data-story-page]").forEach(button => {
	button.addEventListener("click", function(e) {
		e.stopPropagation();
		goStoryPage(Number(this.dataset.storyPage));
	});
});

storyViewport.addEventListener("click", function() {
	if (isClickCancelled) return;
	nextStory();
});

storyViewport.addEventListener("touchstart", function(e) {
	if (e.touches.length > 1) return;

	startX = e.touches[0].clientX;
	startY = e.touches[0].clientY;
	currentX = startX;

	isDragging = true;
	isHorizontal = false;
	isClickCancelled = false;

	storyTrack.style.transition = "none";
}, { passive: true });

storyViewport.addEventListener("touchmove", function(e) {
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
	isClickCancelled = true;

	let move = diffX;

	if ((storyIndex === 0 && diffX > 0) || 
		(storyIndex === totalStoryPages - 1 && diffX < 0)) {
		move *= 0.3;
	}

	storyTrack.style.transform =
		`translate3d(calc(${-storyIndex * 100}% + ${move}px), 0, 0)`;
}, { passive: true });

storyViewport.addEventListener("touchend", function() {
	if (!isDragging) return;

	const diff = currentX - startX;
	const threshold = storyViewport.offsetWidth * 0.22;

	isDragging = false;

	if (Math.abs(diff) >= threshold) {
		if (diff < 0 && storyIndex < totalStoryPages - 1) {
			storyIndex++;
		} else if (diff > 0 && storyIndex > 0) {
			storyIndex--;
		}
	}

	updateStory();

	setTimeout(function() {
		isClickCancelled = false;
	}, 80);
});

document.addEventListener("keydown", function(e) {
	if (e.key === "ArrowRight") nextStory();
	if (e.key === "ArrowLeft") prevStory();
});

updateStory();
