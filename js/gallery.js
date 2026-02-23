'use strict';

document.addEventListener('DOMContentLoaded', function () {

  // =========================================================================
  // Configuration & State
  // =========================================================================

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var currentFilter = 'all';
  var currentIndex = 0;
  var visibleItems = [];
  var triggerElement = null;

  // =========================================================================
  // DOM References
  // =========================================================================

  var filterButtons = document.querySelectorAll('.gallery-filters__btn');
  var allGalleryItems = document.querySelectorAll('.gallery-grid__item');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxCounter = document.getElementById('lightbox-counter');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');

  // Focusable elements inside the lightbox for focus trapping
  var focusableElements = [lightboxClose, lightboxPrev, lightboxNext];

  // =========================================================================
  // Utility: Build Visible Items Array
  // =========================================================================

  function buildVisibleItems() {
    visibleItems = [];
    allGalleryItems.forEach(function (item) {
      if (item.style.display !== 'none') {
        visibleItems.push(item);
      }
    });
  }

  // =========================================================================
  // Utility: Preload an Image
  // =========================================================================

  function preloadImage(src) {
    if (src) {
      var img = new Image();
      img.src = src;
    }
  }

  // =========================================================================
  // Utility: Preload Adjacent Images
  // =========================================================================

  function preloadAdjacentImages(index) {
    if (visibleItems.length === 0) return;

    var prevIndex = (index - 1 + visibleItems.length) % visibleItems.length;
    var nextIndex = (index + 1) % visibleItems.length;

    var prevSrc = visibleItems[prevIndex].querySelector('img').getAttribute('data-full');
    var nextSrc = visibleItems[nextIndex].querySelector('img').getAttribute('data-full');

    preloadImage(prevSrc);
    preloadImage(nextSrc);
  }

  // =========================================================================
  // Gallery Filtering
  // =========================================================================

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var filter = this.getAttribute('data-filter');

      // Update active button state
      filterButtons.forEach(function (btn) {
        btn.classList.remove('gallery-filters__btn--active');
      });
      this.classList.add('gallery-filters__btn--active');

      currentFilter = filter;

      // Filter gallery items
      allGalleryItems.forEach(function (item) {
        var category = item.getAttribute('data-category');
        var shouldShow = filter === 'all' || category === filter;

        if (shouldShow) {
          item.style.display = '';

          // Add fade-in animation unless user prefers reduced motion
          if (!prefersReducedMotion) {
            item.style.opacity = '0';
            item.style.transform = 'translateY(12px)';

            // Use requestAnimationFrame for smooth transition
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              });
            });
          }
        } else {
          item.style.display = 'none';
        }
      });

      // Rebuild visible items list
      buildVisibleItems();
    });
  });

  // =========================================================================
  // Lightbox: Open
  // =========================================================================

  function openLightbox(item, index) {
    triggerElement = item;
    currentIndex = index;

    var img = item.querySelector('img');
    var caption = item.querySelector('.gallery-grid__caption');

    var fullSrc = img.getAttribute('data-full');
    var altText = img.getAttribute('alt');
    var captionText = caption ? caption.textContent : '';

    lightboxImg.setAttribute('src', fullSrc);
    lightboxImg.setAttribute('alt', altText);
    lightboxCaption.textContent = captionText;
    lightboxCounter.textContent = (index + 1) + ' of ' + visibleItems.length;

    lightbox.classList.add('lightbox--open');
    document.body.style.overflow = 'hidden';

    // Focus the close button for accessibility
    lightboxClose.focus();

    // Preload adjacent images
    preloadAdjacentImages(index);
  }

  // =========================================================================
  // Lightbox: Close
  // =========================================================================

  function closeLightbox() {
    lightbox.classList.remove('lightbox--open');
    document.body.style.overflow = '';

    // Clear the image source to stop loading
    lightboxImg.setAttribute('src', '');
    lightboxImg.setAttribute('alt', '');

    // Return focus to the element that opened the lightbox
    if (triggerElement) {
      triggerElement.focus();
      triggerElement = null;
    }
  }

  // =========================================================================
  // Lightbox: Navigate
  // =========================================================================

  function navigateLightbox(direction) {
    if (visibleItems.length === 0) return;

    currentIndex = (currentIndex + direction + visibleItems.length) % visibleItems.length;

    var item = visibleItems[currentIndex];
    var img = item.querySelector('img');
    var caption = item.querySelector('.gallery-grid__caption');

    var fullSrc = img.getAttribute('data-full');
    var altText = img.getAttribute('alt');
    var captionText = caption ? caption.textContent : '';

    lightboxImg.setAttribute('src', fullSrc);
    lightboxImg.setAttribute('alt', altText);
    lightboxCaption.textContent = captionText;
    lightboxCounter.textContent = (currentIndex + 1) + ' of ' + visibleItems.length;

    // Preload adjacent images
    preloadAdjacentImages(currentIndex);
  }

  // =========================================================================
  // Gallery Item Click Handlers
  // =========================================================================

  allGalleryItems.forEach(function (item) {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');

    item.addEventListener('click', function () {
      buildVisibleItems();
      var index = visibleItems.indexOf(this);
      if (index !== -1) {
        openLightbox(this, index);
      }
    });

    // Allow keyboard activation with Enter and Space
    item.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        buildVisibleItems();
        var index = visibleItems.indexOf(this);
        if (index !== -1) {
          openLightbox(this, index);
        }
      }
    });
  });

  // =========================================================================
  // Lightbox: Close Button
  // =========================================================================

  lightboxClose.addEventListener('click', function () {
    closeLightbox();
  });

  // =========================================================================
  // Lightbox: Arrow Navigation
  // =========================================================================

  lightboxPrev.addEventListener('click', function () {
    navigateLightbox(-1);
  });

  lightboxNext.addEventListener('click', function () {
    navigateLightbox(1);
  });

  // =========================================================================
  // Lightbox: Click Outside to Close (Backdrop Click)
  // =========================================================================

  lightbox.addEventListener('click', function (event) {
    // Close only if clicking on the lightbox backdrop itself,
    // not on the image, arrows, close button, or their children
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  // =========================================================================
  // Lightbox: Keyboard Navigation
  // =========================================================================

  document.addEventListener('keydown', function (event) {
    if (!lightbox.classList.contains('lightbox--open')) return;

    switch (event.key) {
      case 'Escape':
        closeLightbox();
        break;

      case 'ArrowLeft':
        event.preventDefault();
        navigateLightbox(-1);
        break;

      case 'ArrowRight':
        event.preventDefault();
        navigateLightbox(1);
        break;

      case 'Tab':
        // Focus trap within lightbox
        handleFocusTrap(event);
        break;
    }
  });

  // =========================================================================
  // Focus Trap
  // =========================================================================

  function handleFocusTrap(event) {
    var firstFocusable = focusableElements[0];
    var lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift+Tab: if on first element, wrap to last
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab: if on last element, wrap to first
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  // =========================================================================
  // Touch / Swipe Support
  // =========================================================================

  var touchStartX = 0;
  var touchStartY = 0;
  var touchEndX = 0;
  var touchEndY = 0;
  var swipeThreshold = 50;

  lightbox.addEventListener('touchstart', function (event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
  }, { passive: true });

  lightbox.addEventListener('touchmove', function (event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
  }, { passive: true });

  lightbox.addEventListener('touchend', function () {
    var deltaX = touchEndX - touchStartX;
    var deltaY = touchEndY - touchStartY;

    // Only register as a swipe if horizontal movement exceeds threshold
    // and horizontal movement is greater than vertical movement
    if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swipe left: go to next
        navigateLightbox(1);
      } else {
        // Swipe right: go to previous
        navigateLightbox(-1);
      }
    }

    // Reset touch values
    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;
  }, { passive: true });

  // =========================================================================
  // Initialize
  // =========================================================================

  // Build the initial list of visible items
  buildVisibleItems();

});
