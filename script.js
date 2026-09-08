// Initialize Lenis Smooth Inertia Scroll for ultra-smooth 60fps/120fps scrolling
if (typeof Lenis !== 'undefined') {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    infinite: false,
  });

  const imgBack = document.querySelector('.welcome-images .img-back-inner');

  function updateParallax() {
    if (!imgBack) return;
    const rect = imgBack.closest('.welcome').getBoundingClientRect();
    const winH  = window.innerHeight || document.documentElement.clientHeight;
    if (rect.bottom > 0 && rect.top < winH) {
      const offset = (rect.top + rect.height / 2) - winH / 2;
      // Clamp to ±50px → exactly 100px total drift
      const drift = Math.max(-50, Math.min(50, offset * 0.1));
      imgBack.style.transform = 'translateY(' + drift.toFixed(1) + 'px)';
    }
  }

  function raf(time) {
    lenis.raf(time);
    updateParallax();       // runs every frame in sync with Lenis
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Smooth scroll for anchor links (#rooms, #welcome, #gallery, etc.)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          lenis.scrollTo(targetElement);
        }
      }
    });
  });
}

// Mobile menu toggle
const burger = document.getElementById('burgerBtn');
const nav = document.querySelector('nav.primary');

if (burger && nav) {
  burger.addEventListener('click', () => {
    nav.classList.toggle('active');
    burger.classList.toggle('active');
  });

  // Automatically close mobile menu when clicking any nav link
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      burger.classList.remove('active');
    });
  });
}

// Touch Swipe Gesture Helper
function addTouchSwipe(element, onSwipeLeft, onSwipeRight) {
  if (!element) return;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  element.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  element.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    // Check if horizontal swipe is significant and exceeds vertical movement
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        onSwipeLeft && onSwipeLeft(); // Swipe Left -> Go Next
      } else {
        onSwipeRight && onSwipeRight(); // Swipe Right -> Go Prev
      }
    }
  }
}

// Universal Responsive Slider Factory
function initSlider({ trackId, prevBtnId, nextBtnId, defaultVisible = 3, gap = 24 }) {
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);

  if (!track || !prevBtn || !nextBtn) return;

  let index = 0;
  const items = track.querySelectorAll('.slide-item, .gallery-item');
  if (items.length === 0) return;

  function getVisibleCount() {
    const w = window.innerWidth;
    if (w <= 640) return 1; // Strictly 1 card at a time on mobile
    if (w <= 900) return 2; // 2 cards on tablet
    return defaultVisible;  // Default on desktop
  }

  function update() {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, items.length - visible);
    if (index > maxIndex) index = maxIndex;

    const itemWidth = items[0].getBoundingClientRect().width;
    const offset = index * (itemWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    // Auto-toggle button visibility on desktop if all items fit
    if (items.length <= visible && window.innerWidth > 900) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    } else {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    }
  }

  function goNext() {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, items.length - visible);
    index = index >= maxIndex ? 0 : index + 1;
    update();
  }

  function goPrev() {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, items.length - visible);
    index = index <= 0 ? maxIndex : index - 1;
    update();
  }

  nextBtn.addEventListener('click', goNext);
  prevBtn.addEventListener('click', goPrev);
  window.addEventListener('resize', update);

  // Enable Touch Swipe on mobile/touch devices
  addTouchSwipe(track.parentElement || track, goNext, goPrev);

  update();
}

// Initialize Sliders
initSlider({ trackId: 'rTrack', prevBtnId: 'rPrev', nextBtnId: 'rNext', defaultVisible: 3 });
initSlider({ trackId: 'gTrack', prevBtnId: 'gPrev', nextBtnId: 'gNext', defaultVisible: 3 });

// Testimonial carousel
const testimonials = [
  {
    quote: "Mayyattil Waterfront Villa is truly a hidden gem in Kerala! We went there for a short trip and ended up wishing we could stay longer. The place is surrounded by nature and beautiful waterfront views. The rooms are cozy, and the atmosphere is peaceful. The staff took great care of us — such warm hospitality is rare these days.",
    name: "Vijay Anandh",
    loc: "Goa",
    avatar: "https://i.pravatar.cc/150?img=12"
  },
  {
    quote: "A perfect waterfront escape. The pool villa was spotless, the farm-to-table breakfast was a lovely touch, and the kids didn't want to leave the play area. We're already planning our next visit to Mayyattil Waterfront Villa.",
    name: "Anjali Menon",
    loc: "Bengaluru",
    avatar: "https://i.pravatar.cc/150?img=47"
  },
  {
    quote: "Quiet, green, and genuinely peaceful right by the water. The staff remembered our names by the second day and the private pool made the whole trip feel like our own little retreat.",
    name: "Rahul Iyer",
    loc: "Chennai",
    avatar: "https://i.pravatar.cc/150?img=53"
  }
];
let tIndex = 0;
const tQuote = document.getElementById('tQuote');
const tName = document.getElementById('tName');
const tLoc = document.getElementById('tLoc');
const tAvatar = document.getElementById('tAvatar');

function renderTestimonial(i){
  tQuote.style.opacity = 0;
  setTimeout(() => {
    const t = testimonials[i];
    tQuote.textContent = t.quote;
    tName.textContent = t.name;
    tLoc.textContent = t.loc;
    tAvatar.src = t.avatar;
    tQuote.style.opacity = 1;
  }, 200);
}

if (document.getElementById('tPrev') && document.getElementById('tNext')) {
  function nextTestimonial() {
    tIndex = (tIndex + 1) % testimonials.length;
    renderTestimonial(tIndex);
  }
  function prevTestimonial() {
    tIndex = (tIndex - 1 + testimonials.length) % testimonials.length;
    renderTestimonial(tIndex);
  }

  document.getElementById('tPrev').addEventListener('click', prevTestimonial);
  document.getElementById('tNext').addEventListener('click', nextTestimonial);

  // Testimonial swipe gesture
  const tContainer = document.querySelector('.testimonial .t-body');
  if (tContainer) {
    addTouchSwipe(tContainer, nextTestimonial, prevTestimonial);
  }
}

// Initialize Lucide Icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

