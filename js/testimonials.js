'use strict';

document.addEventListener('DOMContentLoaded', function () {

  // =========================================================================
  // Testimonials Carousel
  // =========================================================================

  var carousel = document.querySelector('.testimonials-carousel');
  if (!carousel) return;

  var track = carousel.querySelector('.testimonials-carousel__track');
  var slides = carousel.querySelectorAll('.testimonials-carousel__slide');
  var dots = carousel.querySelectorAll('.testimonials-carousel__dot');
  var prevArrow = carousel.querySelector('.testimonials-carousel__arrow--prev');
  var nextArrow = carousel.querySelector('.testimonials-carousel__arrow--next');

  if (!track || slides.length === 0) return;

  var currentIndex = 0;
  var totalSlides = slides.length;
  var autoPlayInterval = null;
  var autoPlayDelay = 5000;
  var isTransitioning = false;

  // Check for reduced motion preference
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -----------------------------------------------------------------------
  // Go to a specific slide
  // -----------------------------------------------------------------------

  function goToSlide(index) {
    if (index < 0) {
      index = totalSlides - 1;
    } else if (index >= totalSlides) {
      index = 0;
    }

    currentIndex = index;

    var translateValue = -currentIndex * 100;

    if (prefersReducedMotion) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.5s ease-in-out';
    }

    track.style.transform = 'translateX(' + translateValue + '%)';

    // Update dots
    dots.forEach(function (dot, i) {
      dot.classList.toggle('testimonials-carousel__dot--active', i === currentIndex);
      dot.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
    });

    // Update aria-live region for screen readers
    slides.forEach(function (slide, i) {
      slide.setAttribute('aria-hidden', i !== currentIndex ? 'true' : 'false');
    });
  }

  // -----------------------------------------------------------------------
  // Next / Previous
  // -----------------------------------------------------------------------

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // -----------------------------------------------------------------------
  // Auto-play
  // -----------------------------------------------------------------------

  function startAutoPlay() {
    if (prefersReducedMotion) return;
    stopAutoPlay();
    autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  // -----------------------------------------------------------------------
  // Arrow button event listeners
  // -----------------------------------------------------------------------

  if (prevArrow) {
    prevArrow.addEventListener('click', function () {
      prevSlide();
      stopAutoPlay();
      startAutoPlay();
    });
  }

  if (nextArrow) {
    nextArrow.addEventListener('click', function () {
      nextSlide();
      stopAutoPlay();
      startAutoPlay();
    });
  }

  // -----------------------------------------------------------------------
  // Dot navigation event listeners
  // -----------------------------------------------------------------------

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = parseInt(this.getAttribute('data-index'), 10);
      goToSlide(index);
      stopAutoPlay();
      startAutoPlay();
    });
  });

  // -----------------------------------------------------------------------
  // Pause on hover
  // -----------------------------------------------------------------------

  carousel.addEventListener('mouseenter', function () {
    stopAutoPlay();
  });

  carousel.addEventListener('mouseleave', function () {
    startAutoPlay();
  });

  // -----------------------------------------------------------------------
  // Keyboard navigation
  // -----------------------------------------------------------------------

  carousel.setAttribute('tabindex', '0');
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-roledescription', 'carousel');

  carousel.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prevSlide();
      stopAutoPlay();
      startAutoPlay();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextSlide();
      stopAutoPlay();
      startAutoPlay();
    }
  });

  // -----------------------------------------------------------------------
  // Touch / Swipe support
  // -----------------------------------------------------------------------

  var touchStartX = 0;
  var touchStartY = 0;
  var touchEndX = 0;
  var touchEndY = 0;
  var isSwiping = false;
  var swipeThreshold = 50;

  carousel.addEventListener('touchstart', function (event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
    isSwiping = true;
    stopAutoPlay();
  }, { passive: true });

  carousel.addEventListener('touchmove', function (event) {
    if (!isSwiping) return;
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
  }, { passive: true });

  carousel.addEventListener('touchend', function () {
    if (!isSwiping) return;
    isSwiping = false;

    var diffX = touchStartX - touchEndX;
    var diffY = touchStartY - touchEndY;

    // Only register horizontal swipes (not vertical scrolling)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0) {
        // Swiped left — go to next slide
        nextSlide();
      } else {
        // Swiped right — go to previous slide
        prevSlide();
      }
    }

    startAutoPlay();
  }, { passive: true });

  // -----------------------------------------------------------------------
  // Initialize
  // -----------------------------------------------------------------------

  // Set initial slide state
  goToSlide(0);

  // Start auto-play
  startAutoPlay();

  // Pause auto-play when the page is not visible
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });

});
