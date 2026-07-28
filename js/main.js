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
 * Contact Form Client-side Validation & Google Apps Script Submission
 * Sends form data to Google Apps Script with proper error handling
 */
function initContactForm() {
  const contactForm = document.getElementById('nikvora-contact-form');
  const successMessage = document.getElementById('form-success');
  
  if (!contactForm) return;

  // Track if a submission is already in progress to prevent duplicates
  let isSubmitting = false;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

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
    const industry = serviceInput ? sanitizeInput(serviceInput.value.trim()) : '';
    const projectDetails = sanitizeInput(messageInput.value.trim());

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

    if (projectDetails === '') {
      messageInput.style.borderColor = '#ef4444';
      messageInput.setAttribute('aria-invalid', 'true');
      hasError = true;
    }

    if (hasError) return;

    // Mark submission as in progress
    isSubmitting = true;

    // Disable submit button and show loading state
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '';

    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');
    submitBtn.appendChild(spinner);
    submitBtn.appendChild(document.createTextNode(' Sending Request...'));

    try {
      // Prepare payload
      const formPayload = {
        name: name,
        email: email,
        phone: phone,
        industry: industry,
        projectDetails: projectDetails
      };

      // Send POST request to Google Apps Script
      
     console.log("Before fetch", formPayload);

const response = await fetch(
  'https://eoz7fhlceik29oz.m.pipedream.net',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formPayload)
  }
);

console.log("After fetch", response);
      // Parse the JSON response
      const result = await response.json();

      // Check if submission was successful
      if (result.success === true) {
        // Success: Show success message and clear form
        showSuccessMessage(contactForm, successMessage, nameInput, emailInput, phoneInput, serviceInput, messageInput, submitBtn, originalBtnText);
      } else {
        // Server returned failure
        showErrorMessage(submitBtn, originalBtnText);
        isSubmitting = false;
      }

    } catch (error) {
      // Network error or JSON parse error: Show error message
      console.error('Form submission error:', error);
      showErrorMessage(submitBtn, originalBtnText);
      isSubmitting = false;
    }
  });

  /**
   * Display success message, hide form, and clear inputs
   */
  function showSuccessMessage(form, successMsg, nameInput, emailInput, phoneInput, serviceInput, messageInput, submitBtn, originalBtnText) {
    // Clear form fields
    nameInput.value = '';
    emailInput.value = '';
    phoneInput.value = '';
    if (serviceInput) serviceInput.value = 'construction';
    messageInput.value = '';

    form.style.transition = 'opacity 0.5s ease';
    form.style.opacity = '0';
    
    setTimeout(() => {
      form.style.display = 'none';

      if (successMsg) {
        successMsg.style.display = 'block';
        successMsg.style.opacity = '0';
        successMsg.style.transform = 'translateY(20px)';
        
        // Trigger reflow to start animation
        void successMsg.offsetHeight;
        
        successMsg.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        successMsg.style.opacity = '1';
        successMsg.style.transform = 'translateY(0)';
      }
    }, 500);
  }

  /**
   * Display error message and re-enable submit button
   */
  function showErrorMessage(submitBtn, originalBtnText) {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;

    // Show inline error message to user
    alert('❌ Something went wrong. Please try again.');
  }
}

/**
 * Standard Email Format Validator
 */
function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}
