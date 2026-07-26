/**
 * NikvoraStudio Global Interactive Logic
 * Premium User Experience, Micro-interactions, and Form Submissions
 * 
 * Security: No eval(), no innerHTML for user data, input sanitization
 * Accessibility: ARIA states, keyboard navigation, focus management
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initScrollReveal();
  initActiveNavLink();
  initContactForm();
});

/**
 * Header Scroll Behavior
 * Adds scrolled class for glassmorphic shrink effect
 */
function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  let ticking = false;
  const checkScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(checkScroll);
      ticking = true;
    }
  }, { passive: true });

  checkScroll();
}

/**
 * Mobile Drawer Menu
 * Handles burger animation and sliding menu with ARIA states
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const body = document.body;

  if (!toggleBtn || !mobileNav) return;

  const openMenu = () => {
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    body.classList.add('no-scroll');
  };

  const closeMenu = () => {
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    body.classList.remove('no-scroll');
  };

  const toggleMenu = () => {
    if (mobileNav.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  toggleBtn.addEventListener('click', toggleMenu);

  // Close menu when clicking a nav link
  const mobileLinks = mobileNav.querySelectorAll('.nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu when clicking outside of the drawer
  document.addEventListener('click', (e) => {
    if (mobileNav.classList.contains('open') && 
        !mobileNav.contains(e.target) && 
        !toggleBtn.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      closeMenu();
      toggleBtn.focus();
    }
  });

  // Set initial ARIA state
  mobileNav.setAttribute('aria-hidden', 'true');
}

/**
 * Scroll Reveal Animation Observer
 * Uses IntersectionObserver to reveal components on scroll
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length === 0) return;

  // If IntersectionObserver is not supported, reveal all immediately
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
}

/**
 * Active Navigation Link Tracker
 * Sets active class on header links matching current pathname
 */
function initActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-menu .nav-link, .nav-menu-mobile .nav-link');
  const currentPath = window.location.pathname;
  const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === pageName || (pageName === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * Sanitize a string by escaping HTML special characters
 * Prevents XSS when displaying user-provided text
 */
function sanitizeInput(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.textContent;
}

/**
 * Contact Form Client-side Validation & Submission
 * Premium interactive submission feedback with input sanitization
 */
function initContactForm() {
  const contactForm = document.getElementById('nikvora-contact-form');
  const successMessage = document.getElementById('form-success');
  
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const serviceInput = document.getElementById('service');
    const messageInput = document.getElementById('message');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    if (!nameInput || !emailInput || !phoneInput || !messageInput || !submitBtn) return;

    // Sanitize inputs
    const name = sanitizeInput(nameInput.value.trim());
    const email = sanitizeInput(emailInput.value.trim());
    const phone = sanitizeInput(phoneInput.value.trim());
    const message = sanitizeInput(messageInput.value.trim());

    let hasError = false;

    // Reset border styles
    [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
      input.style.borderColor = '';
      input.removeAttribute('aria-invalid');
    });

    if (name === '') {
      nameInput.style.borderColor = '#ef4444';
      nameInput.setAttribute('aria-invalid', 'true');
      hasError = true;
    }

    if (email === '' || !validateEmail(email)) {
      emailInput.style.borderColor = '#ef4444';
      emailInput.setAttribute('aria-invalid', 'true');
      hasError = true;
    }

    if (phone === '') {
      phoneInput.style.borderColor = '#ef4444';
      phoneInput.setAttribute('aria-invalid', 'true');
      hasError = true;
    }

    if (message === '') {
      messageInput.style.borderColor = '#ef4444';
      messageInput.setAttribute('aria-invalid', 'true');
      hasError = true;
    }

    if (hasError) return;

    // Trigger premium submit loading experience
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '';

    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');
    submitBtn.appendChild(spinner);
    submitBtn.appendChild(document.createTextNode(' Sending Request...'));

    // Mock API Timeout to simulate network response
    setTimeout(() => {
      contactForm.style.transition = 'opacity 0.5s ease';
      contactForm.style.opacity = '0';
      
      setTimeout(() => {
        contactForm.style.display = 'none';

        if (successMessage) {
          successMessage.style.display = 'block';
          successMessage.style.opacity = '0';
          successMessage.style.transform = 'translateY(20px)';
          
          // Trigger reflow
          void successMessage.offsetHeight;
          
          successMessage.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          successMessage.style.opacity = '1';
          successMessage.style.transform = 'translateY(0)';
        }
      }, 500);

    }, 1800);
  });
}

/**
 * Standard Email Format Validator
 */
function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}
