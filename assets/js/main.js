// Easy Habit Tracker - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initScrollAnimations();
    initSmoothScrolling();
    initNavbar();
    initFormHandling();
});

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navbar scroll effect
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add shadow on scroll
        if (scrollTop > 10) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        // Hide/show navbar on scroll (mobile)
        if (window.innerWidth <= 768) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
        }

        lastScrollTop = scrollTop;
    });
}

// Form handling and validation with AJAX
function initFormHandling() {
    const form = document.querySelector('form[name="contact"]');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Always prevent default form submission

        // Basic form validation
        const name = form.querySelector('input[name="name"]');
        const email = form.querySelector('input[name="email"]');
        const message = form.querySelector('textarea[name="message"]');

        // Clear previous error states and messages
        clearFormErrors();
        hideFormMessages();

        let isValid = true;

        // Validate required fields
        if (!name.value.trim()) {
            showFieldError(name, 'Name is required');
            isValid = false;
        }

        if (!email.value.trim()) {
            showFieldError(email, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email.value)) {
            showFieldError(email, 'Please enter a valid email address');
            isValid = false;
        }

        if (!message.value.trim()) {
            showFieldError(message, 'Message is required');
            isValid = false;
        }

        if (!isValid) {
            return false;
        }

        // Start AJAX submission
        handleFormSubmission(form);
    });
}

// Handle AJAX form submission
function handleFormSubmission(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;

    // Show loading state
    setFormLoading(submitButton, true);

    // Prepare form data
    const formData = new FormData(form);

    // Submit via AJAX to Netlify
    fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    })
    .then(response => {
        if (response.ok) {
            showFormSuccess();
            form.reset(); // Clear the form
        } else {
            throw new Error(`Form submission failed with status: ${response.status}`);
        }
    })
    .catch(error => {
        console.error('Form submission error:', error);
        showFormError('There was a problem submitting your message. Please try again or contact us directly at support@luispa.dev');
    })
    .finally(() => {
        // Reset button state
        setFormLoading(submitButton, false, originalText);
    });
}

// Set form loading state
function setFormLoading(button, isLoading, originalText = '') {
    if (isLoading) {
        button.innerHTML = '<span class="loading-spinner">⏳</span>Sending...';
        button.disabled = true;
        button.style.opacity = '0.7';
        button.style.cursor = 'not-allowed';
    } else {
        button.innerHTML = originalText || '<span>📧</span>Send Message';
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// Show success message
function showFormSuccess() {
    const successContainer = document.getElementById('form-success-message');
    if (successContainer) {
        successContainer.style.display = 'block';
        successContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            hideFormMessages();
        }, 10000);
    }
}

// Show error message
function showFormError(errorMessage) {
    const errorContainer = document.getElementById('form-error-message');
    const errorText = document.getElementById('form-error-text');

    if (errorContainer && errorText) {
        errorText.textContent = errorMessage;
        errorContainer.style.display = 'block';
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Hide form messages (make it globally available)
window.hideFormMessages = function() {
    const successContainer = document.getElementById('form-success-message');
    const errorContainer = document.getElementById('form-error-message');

    if (successContainer) successContainer.style.display = 'none';
    if (errorContainer) errorContainer.style.display = 'none';
};

// Form validation helpers
function showFieldError(field, message) {
    field.style.borderColor = '#FF3B30';

    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#FF3B30';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFormErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.remove();
    });

    document.querySelectorAll('input, textarea, select').forEach(field => {
        field.style.borderColor = '';
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Screenshot carousel functionality (if needed)
function initScreenshotCarousel() {
    const screenshots = document.querySelectorAll('.screenshot-card');
    let currentIndex = 0;

    function showScreenshot(index) {
        screenshots.forEach((screenshot, i) => {
            if (i === index) {
                screenshot.style.opacity = '1';
                screenshot.style.transform = 'scale(1.05)';
            } else {
                screenshot.style.opacity = '0.7';
                screenshot.style.transform = 'scale(1)';
            }
        });
    }

    // Auto-rotate screenshots every 5 seconds
    setInterval(() => {
        currentIndex = (currentIndex + 1) % screenshots.length;
        showScreenshot(currentIndex);
    }, 5000);
}

// Add hover effects to cards
document.addEventListener('DOMContentLoaded', function() {
    // Feature cards hover effect
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Screenshot cards hover effect
    document.querySelectorAll('.screenshot-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px)';
            this.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
        });
    });
});

// Performance optimization: Lazy loading for images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Mobile menu toggle (if you decide to add a hamburger menu later)
function initMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuButton.classList.toggle('active');
        });
    }
}

// Add some Easter eggs for fun
document.addEventListener('keydown', function(e) {
    // Konami code easter egg
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up, Up, Down, Down, Left, Right, Left, Right, B, A
    let konamiIndex = 0;

    if (e.keyCode === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            // Easter egg activated!
            document.body.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3)';
            document.body.style.backgroundSize = '400% 400%';
            document.body.style.animation = 'gradient 3s ease infinite';

            // Reset after 5 seconds
            setTimeout(() => {
                document.body.style.background = '';
                document.body.style.animation = '';
            }, 5000);

            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

// Add gradient animation for easter egg
const style = document.createElement('style');
style.textContent = `
@keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
`;
document.head.appendChild(style);