// ============ PAGE LOADER ============
(function () {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  const MIN_DISPLAY = 1000; // always show for at least 1 second
  const startTime = Date.now();

  function hideLoader() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_DISPLAY - elapsed);
    setTimeout(() => {
      loader.classList.add('loader-hidden');
      setTimeout(() => { loader.remove(); }, 600);
    }, remaining);
  }

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader, { once: true });
    // Safety fallback — never show loader for more than 5s
    setTimeout(hideLoader, 5000);
  }
})();

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

  // Smooth scroll for anchor links (#villa-spaces, #welcome, #gallery, etc.)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          lenis.scrollTo(targetElement, { offset: -80 });
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

// Universal Responsive Slider Factory with Auto-Scroll & Interaction Pause
function initSlider({ trackId, prevBtnId, nextBtnId, defaultVisible = 3, gap = 24, autoScroll = false, autoScrollInterval = 3500 }) {
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);

  if (!track || !prevBtn || !nextBtn) return;

  let index = 0;
  let timer = null;
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

  function startAutoScroll() {
    if (!autoScroll) return;
    stopAutoScroll();
    timer = setInterval(goNext, autoScrollInterval);
  }

  function stopAutoScroll() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function resetAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
  }

  nextBtn.addEventListener('click', () => {
    goNext();
    resetAutoScroll();
  });
  prevBtn.addEventListener('click', () => {
    goPrev();
    resetAutoScroll();
  });
  window.addEventListener('resize', update);

  // Enable Touch Swipe on mobile/touch devices
  const container = track.parentElement || track;
  addTouchSwipe(container, () => {
    goNext();
    resetAutoScroll();
  }, () => {
    goPrev();
    resetAutoScroll();
  });

  // Pause on hover / touch
  if (autoScroll) {
    container.addEventListener('mouseenter', stopAutoScroll);
    container.addEventListener('mouseleave', startAutoScroll);
    container.addEventListener('touchstart', stopAutoScroll, { passive: true });
    container.addEventListener('touchend', startAutoScroll, { passive: true });
    startAutoScroll();
  }

  update();
}

// Initialize Gallery Slider with Auto-Scroll
initSlider({ trackId: 'gTrack', prevBtnId: 'gPrev', nextBtnId: 'gNext', defaultVisible: 3, autoScroll: true, autoScrollInterval: 3500 });

// ============ THE VILLA SPACES INTERACTIVE BENTO SPOTLIGHT ============
const villaSpaces = [
  {
    title: "Master Waterfront Suite",
    badge: "Sanctuary",
    desc: "The principal bedroom looks toward the water. A king bed sits under teak finishes, with wall-to-wall sliding glass doors opening to sweeping river views. Dressing space is generous, and the suite stays fully air-conditioned through Kerala’s warm afternoons.",
    image: "images/used_under_700kb/master-waterfront-suite-bedroom.webp",
    specs: [
      { icon: "bed", text: "King waterfront bed" },
      { icon: "sun", text: "Panoramic glass doors" },
      { icon: "sparkles", text: "Teak dressing suite" },
      { icon: "wind", text: "Full AC comfort" }
    ]
  },
  {
    title: "Air-Conditioned Living Lounge",
    badge: "Gathering",
    desc: "The climate-controlled social heart of the house, featuring plush sofa seating, floor-to-ceiling windows overlooking the riverfront garden, and a seamless connection to the outdoor veranda.",
    image: "images/used_under_700kb/living-lounge-sofa.webp",
    specs: [
      { icon: "armchair", text: "Air-conditioned lounge" },
      { icon: "wind", text: "Garden & river view" },
      { icon: "utensils", text: "Family dining area" },
      { icon: "sparkles", text: "Ambient lighting" }
    ]
  },
  {
    title: "Open-Air Veranda & Sit-Out",
    badge: "Outdoor Living",
    desc: "A shaded tropical veranda equipped with ceiling fans and comfortable wicker lounge seating. Steps lead directly onto the lush lawns, offering a tranquil spot for morning coffee or afternoon breezes.",
    image: "images/used_under_700kb/open-air-veranda-sitout.webp",
    specs: [
      { icon: "sun", text: "Shaded tropical veranda" },
      { icon: "wind", text: "Overhead ceiling fans" },
      { icon: "armchair", text: "Wicker sit-out seating" },
      { icon: "trees", text: "Direct garden access" }
    ]
  },
  {
    title: "Private Riverside Deck & Water Steps",
    badge: "Waterfront",
    desc: "Dedicated timber steps and a waterfront deck platform built right on the edge of the Narakkal backwaters. Ideal for morning tea, casting a fishing line, or watching the sunset over the quiet water.",
    image: "images/used_under_700kb/riverside-deck-water-steps.webp",
    specs: [
      { icon: "waves", text: "Direct water's edge" },
      { icon: "sunset", text: "Sunset viewing deck" },
      { icon: "anchor", text: "Backwater fishing spot" },
      { icon: "flame", text: "Evening lantern deck" }
    ]
  },
  {
    title: "Modern Kitchenette & Coffee Bar",
    badge: "Refreshment",
    desc: "A stylish private kitchenette complete with coffee maker, electric kettle, induction cooktop, and high-stool bar seating. Perfect for brewing fresh morning tea, preparing snacks, or hosting evening drinks.",
    image: "images/used_under_700kb/kitchenette-pantry-counter.webp",
    specs: [
      { icon: "coffee", text: "Espresso & tea station" },
      { icon: "flame", text: "Induction cooktop" },
      { icon: "utensils", text: "High-stool bar counter" },
      { icon: "sparkles", text: "Modern pantry amenities" }
    ]
  }
];

function initVillaSpotlight() {
  const spotlightImg = document.getElementById('spotlightImg');
  const spotlightBadge = document.getElementById('spotlightBadge');
  const spotlightTitle = document.getElementById('spotlightTitle');
  const spotlightDesc = document.getElementById('spotlightDesc');
  const spotlightSpecs = document.getElementById('spotlightSpecs');
  const bentoCards = document.querySelectorAll('.bento-card');

  if (!spotlightImg || !bentoCards.length) return;

  function setSpace(index) {
    const data = villaSpaces[index];
    if (!data) return;

    bentoCards.forEach((c, idx) => {
      c.classList.toggle('active', idx === index);
    });

    const spotlightDisplay = document.getElementById('spotlightDisplay');
    if (spotlightDisplay) {
      spotlightDisplay.classList.add('is-transitioning');
    }

    setTimeout(() => {
      spotlightImg.src = data.image;
      spotlightImg.alt = data.title;
      spotlightBadge.textContent = data.badge;
      spotlightTitle.textContent = data.title;
      spotlightDesc.textContent = data.desc;

      if (spotlightSpecs) {
        spotlightSpecs.innerHTML = data.specs.map(s => 
          `<span class="spec-chip"><i data-lucide="${s.icon}"></i> ${s.text}</span>`
        ).join('');
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }

      if (spotlightDisplay) {
        spotlightDisplay.classList.remove('is-transitioning');
      }
    }, 180);
  }

  bentoCards.forEach((card, idx) => {
    card.addEventListener('click', () => setSpace(idx));
  });
}

initVillaSpotlight();

// Testimonial carousel
const testimonials = [
  {
    quote: "Mayyattil Waterfront Villa is truly a hidden gem on the Narakkal backwaters. Waking up to the gentle water, cool breezes, and lush greenery with the whole estate to ourselves was unforgettable. The air-conditioned villa-spaces and warm Kerala hospitality made our family vacation truly special.",
    name: "Vijay Anandh",
    loc: "Goa",
    avatar: "https://i.pravatar.cc/150?img=12"
  },
  {
    quote: "A flawless waterfront escape. Having the entire villa and private pool completely to ourselves was pure luxury. The kids loved the open lawns and play area, and being just minutes from the toddy pub and Cherai Beach gave us the perfect balance of relaxation and adventure.",
    name: "Anjali Menon",
    loc: "Bengaluru",
    avatar: "https://i.pravatar.cc/150?img=47"
  },
  {
    quote: "Quiet, lush, and genuinely peaceful right along the backwaters. From morning tea by the riverbank to sunset swims, Mayyattil Waterfront Villa felt like our own private sanctuary in coastal Kerala.",
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

// ============ AVAILABILITY CHECK & WHATSAPP INTEGRATION ============
(function initAvailabilityForm() {
  const checkInInput = document.getElementById('checkInDate');
  const checkOutInput = document.getElementById('checkOutDate');
  const adultsHidden = document.getElementById('adultsCount');
  const childrenHidden = document.getElementById('childrenCount');
  const form = document.getElementById('availabilityForm');

  if (!checkInInput || !checkOutInput || !form) return;

  // Counter helper
  function setupCounter(decrId, incrId, valSpanId, hiddenInputId, minVal = 0, maxVal = 20) {
    const decrBtn = document.getElementById(decrId);
    const incrBtn = document.getElementById(incrId);
    const valSpan = document.getElementById(valSpanId);
    const hiddenInput = document.getElementById(hiddenInputId);

    if (!decrBtn || !incrBtn || !valSpan || !hiddenInput) return;

    function updateState(val) {
      valSpan.textContent = val;
      hiddenInput.value = val;
      decrBtn.disabled = (val <= minVal);
      incrBtn.disabled = (val >= maxVal);
    }

    decrBtn.addEventListener('click', (e) => {
      e.preventDefault();
      let current = parseInt(hiddenInput.value, 10) || minVal;
      if (current > minVal) {
        updateState(current - 1);
      }
    });

    incrBtn.addEventListener('click', (e) => {
      e.preventDefault();
      let current = parseInt(hiddenInput.value, 10) || minVal;
      if (current < maxVal) {
        updateState(current + 1);
      }
    });

    updateState(parseInt(hiddenInput.value, 10) || minVal);
  }

  setupCounter('adultsDecr', 'adultsIncr', 'adultsVal', 'adultsCount', 1, 20);
  setupCounter('childrenDecr', 'childrenIncr', 'childrenVal', 'childrenCount', 0, 10);

  function formatDateISO(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const today = new Date();
  const defaultCheckIn = new Date();
  defaultCheckIn.setDate(today.getDate() + 1); // Tomorrow

  const defaultCheckOut = new Date();
  defaultCheckOut.setDate(today.getDate() + 3); // 2 nights stay

  const minDateStr = formatDateISO(today);
  checkInInput.min = minDateStr;
  checkOutInput.min = minDateStr;

  checkInInput.value = formatDateISO(defaultCheckIn);
  checkOutInput.value = formatDateISO(defaultCheckOut);

  checkInInput.addEventListener('change', () => {
    if (checkInInput.value) {
      const inDate = new Date(checkInInput.value);
      const minOut = new Date(inDate);
      minOut.setDate(minOut.getDate() + 1);
      const minOutStr = formatDateISO(minOut);
      checkOutInput.min = minOutStr;

      if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
        checkOutInput.value = minOutStr;
      }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const checkInVal = checkInInput.value;
    const checkOutVal = checkOutInput.value;
    const adultsVal = adultsHidden ? adultsHidden.value : '2';
    const childrenVal = childrenHidden ? childrenHidden.value : '0';

    if (!checkInVal || !checkOutVal) {
      alert('Please select both Check-in and Check-out dates.');
      return;
    }

    const formattedIn = formatDateDisplay(checkInVal);
    const formattedOut = formatDateDisplay(checkOutVal);

    const phone = '919876543210';
    const message = `Hello Mayyattil Waterfront Villa! 🌴\nI would like to check availability for an exclusive private stay.\n\n📅 Check-in: ${formattedIn}\n📅 Check-out: ${formattedOut}\n👥 Guests: ${adultsVal} Adult(s), ${childrenVal} Child(ren)\n\nPlease confirm live availability and pricing for our stay.`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMsg}`;

    window.open(whatsappUrl, '_blank');
  });
})();

// ============ GALLERY LIGHTBOX POPUP MODAL ============
function initGalleryLightbox() {
  const modal = document.getElementById('galleryModal');
  const overlay = document.getElementById('galleryModalOverlay');
  const closeBtn = document.getElementById('galleryModalClose');
  const prevBtn = document.getElementById('galleryModalPrev');
  const nextBtn = document.getElementById('galleryModalNext');
  const modalImg = document.getElementById('galleryModalImg');
  const modalTag = document.getElementById('galleryModalTag');
  const modalTitle = document.getElementById('galleryModalTitle');

  if (!modal || !modalImg) return;

  let galleryItems = [];
  let currentIndex = 0;

  function collectItems() {
    galleryItems = [];
    
    // Check gallery page brick cards first
    const brickCards = document.querySelectorAll('.gallery-brick-card');
    if (brickCards.length > 0) {
      brickCards.forEach((card, idx) => {
        const img = card.querySelector('img');
        const tag = card.querySelector('.gallery-tag');
        const title = card.querySelector('.gallery-title');
        if (img) {
          galleryItems.push({
            src: img.getAttribute('src') || img.src,
            tag: tag ? tag.textContent.trim() : 'Gallery Sanctuary',
            title: title ? title.textContent.trim() : (img.alt || 'Mayyattil Waterfront Villa')
          });
          card.addEventListener('click', () => openModal(idx));
        }
      });
      return;
    }

    // Check homepage gallery carousel items
    const carouselItems = document.querySelectorAll('.gallery-carousel .gallery-item');
    if (carouselItems.length > 0) {
      carouselItems.forEach((item, idx) => {
        let src = item.getAttribute('data-src') || item.getAttribute('href');
        if (!src || src === '#') {
          const bg = item.style.backgroundImage || window.getComputedStyle(item).backgroundImage;
          if (bg && bg !== 'none') {
            src = bg.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
          }
        }
        const ariaLabel = item.getAttribute('aria-label') || 'Gallery Photo';
        galleryItems.push({
          src: src,
          tag: 'Waterfront Sanctuary',
          title: ariaLabel
        });
        item.addEventListener('click', (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          openModal(idx);
        });
      });
    }
  }

  function renderModal(index) {
    if (!galleryItems[index]) return;
    const item = galleryItems[index];

    modalImg.style.opacity = '0';
    setTimeout(() => {
      modalImg.src = item.src;
      modalImg.alt = item.title;
      if (modalTag) modalTag.textContent = item.tag;
      if (modalTitle) modalTitle.textContent = item.title;
      modalImg.style.opacity = '1';
    }, 120);
  }

  function openModal(index) {
    currentIndex = index;
    renderModal(currentIndex);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
  }

  function showNext() {
    if (galleryItems.length === 0) return;
    currentIndex = (currentIndex + 1) % galleryItems.length;
    renderModal(currentIndex);
  }

  function showPrev() {
    if (galleryItems.length === 0) return;
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    renderModal(currentIndex);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);
  if (nextBtn) nextBtn.addEventListener('click', showNext);

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  collectItems();
}

initGalleryLightbox();

// Initialize Lucide Icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}
