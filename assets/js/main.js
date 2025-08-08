// Utility Functions
// ==================

// Throttle function to limit how often a function can fire
function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
        const currentTime = Date.now();
        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
}

// Smooth scroll to element with offset for navbar
function smoothScrollTo(targetSelector, offset = 80) {
    const target = typeof targetSelector === 'string' 
        ? document.querySelector(targetSelector) 
        : targetSelector;
    
    if (target) {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Add ripple effect to buttons
function addRippleEffect(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Navigation & Scrolling
// =======================

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') {
            // Scroll to top for hash-only links
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            smoothScrollTo(targetId);
        }
    });
});

// Logo click functionality - navigate to home/top
document.addEventListener('DOMContentLoaded', () => {
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
        navLogo.style.cursor = 'pointer';
        navLogo.addEventListener('click', (e) => {
            e.preventDefault();
            // If on the home page, scroll to top
            if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Navigate to home page
                window.location.href = '/';
            }
        });
    }
});

// Enhanced navbar scroll effect with throttling
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

const handleScroll = throttle(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Background opacity effect
    if (scrollTop > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.classList.add('scrolled');
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.9)';
        navbar.classList.remove('scrolled');
    }
    
    // Hide/show navbar on scroll
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down & past threshold - hide navbar
        navbar.classList.add('hidden');
    } else {
        // Scrolling up - show navbar
        navbar.classList.remove('hidden');
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, 100); // Throttle to execute at most once every 100ms

window.addEventListener('scroll', handleScroll);

// Button Handlers
// ===============

// Initialize all button handlers with event delegation
document.addEventListener('DOMContentLoaded', () => {
    // Handle all button clicks through delegation
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        
        // Add ripple effect to all buttons
        addRippleEffect(button, e);
        
        // CTA Button - "Let's Talk" in navbar
        if (button.classList.contains('cta-button')) {
            e.preventDefault();
            smoothScrollTo('#contact');
        }
        
        // Learn More Button - scroll to services
        else if (button.classList.contains('learn-more-btn')) {
            e.preventDefault();
            smoothScrollTo('#services');
        }
        
        // Get in Touch Button - scroll to contact
        else if (button.classList.contains('get-in-touch-btn')) {
            e.preventDefault();
            smoothScrollTo('#contact');
        }
        
        // Solution CTA Buttons - scroll to contact instead of mailto
        else if (button.classList.contains('solution-cta')) {
            e.preventDefault();
            smoothScrollTo('#contact');
        }
        
        // Contact Primary Button - Schedule consultation
        else if (button.classList.contains('contact-primary')) {
            e.preventDefault();
            // You can integrate with Calendly or another scheduling service
            // For now, we'll open an email with subject line
            window.location.href = 'mailto:hello@noahq.ai?subject=Schedule%20Free%20Consultation';
        }
        
        // Contact Secondary Button - Send message
        else if (button.classList.contains('contact-secondary')) {
            e.preventDefault();
            // Open email client with template
            window.location.href = 'mailto:hello@noahq.ai?subject=Inquiry%20from%20NoahQ%20Website';
        }
    });
});

// Animation & Observers
// ======================

// Enhanced Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Add staggered delay for elements in the same container
            const delay = index * 100;
            setTimeout(() => {
                entry.target.classList.add('visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, delay);
        }
    });
}, observerOptions);

// Initialize animations on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in');
    
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
    
    // Special handling for tech items with staggered animation
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 1000 + (index * 150)); // Start after 1s, then stagger
    });
    
    // Special animation for process steps (sequential reveal)
    const processSteps = document.querySelectorAll('.process-step');
    const processObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const steps = Array.from(processSteps);
                const currentIndex = steps.indexOf(entry.target);
                
                // Animate current step and previous ones if not already animated
                for (let i = 0; i <= currentIndex; i++) {
                    setTimeout(() => {
                        steps[i].classList.add('visible');
                        steps[i].style.opacity = '1';
                        steps[i].style.transform = 'translateY(0)';
                    }, i * 200);
                }
            }
        });
    }, { threshold: 0.3 });
    
    processSteps.forEach(step => {
        processObserver.observe(step);
    });
});

// Parallax Effects
// =================

// Enhanced mouse move parallax effect for hero with throttling
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let animationFrameId = null;

const handleMouseMove = throttle((e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
}, 50);

document.addEventListener('mousemove', handleMouseMove);

// Smooth parallax animation
function animateParallax() {
    targetX += (mouseX - targetX) * 0.1;
    targetY += (mouseY - targetY) * 0.1;
    
    const dotPattern = document.querySelector('.dot-pattern');
    if (dotPattern) {
        dotPattern.style.transform = `translate(${targetX * 15}px, ${targetY * 15}px)`;
    }
    
    animationFrameId = requestAnimationFrame(animateParallax);
}

// Start parallax animation only if not on mobile
if (window.innerWidth > 768) {
    animateParallax();
}

// Mobile Menu
// ===========

// Mobile menu functionality
const createMobileMenu = () => {
    const navMenu = document.querySelector('.nav-menu');
    const navContainer = document.querySelector('.nav-container');
    
    // Check if hamburger already exists
    if (document.querySelector('.mobile-menu-toggle')) return;
    
    // Create hamburger button
    const hamburger = document.createElement('button');
    hamburger.className = 'mobile-menu-toggle';
    hamburger.setAttribute('aria-label', 'Toggle mobile menu');
    hamburger.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    
    // Insert hamburger before nav menu
    navContainer.insertBefore(hamburger, navMenu);
    
    // Toggle menu functionality
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('mobile-open');
        hamburger.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Close menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('mobile-open');
            hamburger.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navContainer.contains(e.target)) {
            navMenu.classList.remove('mobile-open');
            hamburger.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
};

// Initialize mobile menu on smaller screens
if (window.innerWidth <= 768) {
    createMobileMenu();
}

// Reinitialize mobile menu on resize with debouncing
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const existingToggle = document.querySelector('.mobile-menu-toggle');
        if (window.innerWidth <= 768 && !existingToggle) {
            createMobileMenu();
            // Stop parallax on mobile
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        } else if (window.innerWidth > 768) {
            if (existingToggle) {
                existingToggle.remove();
                document.querySelector('.nav-menu').classList.remove('mobile-open');
                document.body.classList.remove('menu-open');
            }
            // Restart parallax on desktop
            if (!animationFrameId) {
                animateParallax();
            }
        }
    }, 250);
});

// FAQ Functionality
// =================

// Enhanced expandable FAQ functionality with better mobile support
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item.expandable');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            // Add visual feedback immediately
            question.style.cursor = 'pointer';
            question.style.userSelect = 'none';
            
            // Create toggle icon if it doesn't exist
            if (!question.querySelector('.faq-toggle')) {
                const toggle = document.createElement('span');
                toggle.className = 'faq-toggle';
                toggle.innerHTML = '+';
                question.appendChild(toggle);
            }
            
            const handleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = item.classList.contains('active');
                const toggle = question.querySelector('.faq-toggle');
                
                // Close all other FAQ items with smooth transition
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherToggle = otherItem.querySelector('.faq-toggle');
                        if (otherToggle) {
                            otherToggle.innerHTML = '+';
                            otherToggle.style.transform = 'rotate(0deg)';
                        }
                    }
                });
                
                // Toggle current item with animation
                if (isActive) {
                    item.classList.remove('active');
                    if (toggle) {
                        toggle.innerHTML = '+';
                        toggle.style.transform = 'rotate(0deg)';
                    }
                } else {
                    item.classList.add('active');
                    if (toggle) {
                        toggle.innerHTML = '×';
                        toggle.style.transform = 'rotate(45deg)';
                    }
                }
                
                // Add visual feedback
                item.style.transform = 'translateY(-1px)';
                setTimeout(() => {
                    item.style.transform = '';
                }, 200);
            };
            
            // Support both click and touch events
            question.addEventListener('click', handleClick);
            question.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleClick(e);
            });
            
            // Add hover effects for desktop
            question.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    question.style.opacity = '0.8';
                }
            });
            
            question.addEventListener('mouseleave', () => {
                question.style.opacity = '1';
            });
        }
    });
});

// CSS Styles
// ==========

// Add ripple animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    /* Ensure logo is clickable */
    .nav-logo {
        cursor: pointer;
        transition: opacity 0.3s ease;
    }
    
    .nav-logo:hover {
        opacity: 0.8;
    }
    
    /* Button interaction states */
    button {
        position: relative;
        overflow: hidden;
    }
    
    button:active {
        transform: scale(0.98);
    }
    
    /* Mobile menu improvements */
    @media (max-width: 768px) {
        .mobile-menu-toggle {
            z-index: 1001;
        }
        
        .nav-menu.mobile-open {
            z-index: 1000;
        }
    }
`;
document.head.appendChild(style);

// Performance Monitoring
// ======================

// Log performance metrics in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Performance:', {
            'DOM Content Loaded': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            'Load Complete': perfData.loadEventEnd - perfData.loadEventStart,
            'Total Load Time': perfData.loadEventEnd - perfData.fetchStart
        });
    });
}

// Error Handling
// ==============

// Global error handler for debugging
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Mobile-Specific Optimizations
// =============================

// Prevent zoom on iOS when focusing inputs
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }
}

// Enhanced scroll performance for mobile
let ticking = false;
const optimizedScrollHandler = () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
        });
        ticking = true;
    }
};

// Replace the existing scroll handler with optimized version on mobile
if (window.innerWidth <= 768) {
    window.removeEventListener('scroll', handleScroll);
    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
}

// Fix for mobile touch scrolling issues
document.addEventListener('touchstart', function() {}, { passive: true });
document.addEventListener('touchmove', function() {}, { passive: true });

// Prevent horizontal scroll on mobile
function preventHorizontalScroll() {
    const body = document.body;
    const html = document.documentElement;
    
    if (window.innerWidth <= 768) {
        body.style.overflowX = 'hidden';
        html.style.overflowX = 'hidden';
        body.style.maxWidth = '100vw';
        html.style.maxWidth = '100vw';
    }
}

// Apply on load and resize
preventHorizontalScroll();
window.addEventListener('resize', throttle(preventHorizontalScroll, 250));

// Enhanced button feedback for mobile
document.addEventListener('touchstart', (e) => {
    const button = e.target.closest('button, .cta-button, .learn-more-btn, .get-in-touch-btn');
    if (button) {
        button.style.transform = 'scale(0.95)';
        button.style.opacity = '0.8';
    }
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const button = e.target.closest('button, .cta-button, .learn-more-btn, .get-in-touch-btn');
    if (button) {
        setTimeout(() => {
            button.style.transform = '';
            button.style.opacity = '';
        }, 150);
    }
}, { passive: true });

// Initialization Complete
console.log('NoahQ website initialized successfully with mobile optimizations');

// ShapeBlur is now handled by shapeblur-vanilla.js with Three.js WebGL implementation