'use strict';

document.addEventListener('DOMContentLoaded', function () {

  // =========================================================================
  // Mobile Navigation Toggle
  // =========================================================================

  var menuToggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('nav');
  var header = document.getElementById('header');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('header__nav--open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when clicking a nav link
    var navLinks = nav.querySelectorAll('.header__nav-link');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('header__nav--open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside the header
    document.addEventListener('click', function (event) {
      if (!header.contains(event.target) && nav.classList.contains('header__nav--open')) {
        nav.classList.remove('header__nav--open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // =========================================================================
  // Sticky Header Enhancement
  // =========================================================================

  if (header) {
    var scrollThreshold = 100;

    function handleHeaderScroll() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });

    // Run once on load in case page is already scrolled
    handleHeaderScroll();
  }

  // =========================================================================
  // Smooth Scroll for Anchor Links
  // =========================================================================

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var targetElement = document.querySelector(targetId);
      if (targetElement) {
        event.preventDefault();
        targetElement.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });

        // Update focus for accessibility
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus({ preventScroll: true });
      }
    });
  });

  // =========================================================================
  // Active Navigation Highlighting
  // =========================================================================

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var allNavLinks = document.querySelectorAll('.header__nav-link');

  allNavLinks.forEach(function (link) {
    // Remove any existing active class
    link.classList.remove('header__nav-link--active');

    // Get the href filename
    var linkPage = link.getAttribute('href').split('/').pop();

    if (linkPage === currentPage) {
      link.classList.add('header__nav-link--active');
    }
  });

  // =========================================================================
  // Intersection Observer for Scroll Animations
  // =========================================================================

  if (!prefersReducedMotion) {
    var sections = document.querySelectorAll('.section, .hero, .trust-bar, .cta-banner');

    if (sections.length > 0 && 'IntersectionObserver' in window) {
      var sectionObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('fade-in');
              sectionObserver.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -60px 0px',
          threshold: 0.1
        }
      );

      sections.forEach(function (section) {
        section.classList.add('fade-in--ready');
        sectionObserver.observe(section);
      });
    }
  }

});
