// AI Innovation Showcase JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Animate metrics on scroll
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Animate metric bars
                if (entry.target.classList.contains('metric-card')) {
                    const fill = entry.target.querySelector('.metric-fill');
                    if (fill) {
                        const width = fill.style.width;
                        fill.style.width = '0';
                        setTimeout(() => {
                            fill.style.width = width;
                        }, 100);
                    }
                }
                
                // Animate chart bars
                if (entry.target.classList.contains('chart-item')) {
                    const fill = entry.target.querySelector('.chart-fill');
                    if (fill) {
                        const width = fill.style.width;
                        fill.style.width = '0';
                        setTimeout(() => {
                            fill.style.width = width;
                        }, 100);
                    }
                }
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.metric-card, .chart-item, .project-card, .insight-card').forEach(el => {
        observer.observe(el);
        el.classList.add('fade-in');
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add hover effects to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Animate numbers on scroll
    const animateNumbers = () => {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const finalValue = stat.textContent;
            const numericValue = parseInt(finalValue.replace(/[^0-9]/g, ''));
            const suffix = finalValue.replace(/[0-9]/g, '');
            
            if (!stat.classList.contains('animated')) {
                stat.classList.add('animated');
                let currentValue = 0;
                const increment = numericValue / 50;
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= numericValue) {
                        currentValue = numericValue;
                        clearInterval(timer);
                    }
                    stat.textContent = Math.floor(currentValue) + suffix;
                }, 30);
            }
        });
    };

    // Trigger number animation when hero section is visible
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
            }
        });
    }, { threshold: 0.5 });

    const heroSection = document.querySelector('.showcase-hero');
    if (heroSection) {
        heroObserver.observe(heroSection);
    }

    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.showcase-hero');
        if (parallax) {
            parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Project filter functionality (if needed in future)
    const addProjectFilters = () => {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.dataset.filter;
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filter projects
                projectCards.forEach(card => {
                    if (filter === 'all' || card.classList.contains(filter)) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 100);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    };

    // Initialize tooltips for tech tags
    const initTooltips = () => {
        const techTags = document.querySelectorAll('.tech-tag');
        techTags.forEach(tag => {
            tag.addEventListener('mouseenter', function(e) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = `Click to see all ${this.textContent} projects`;
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.position = 'absolute';
                tooltip.style.top = `${rect.top - 40}px`;
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.transform = 'translateX(-50%)';
            });
            
            tag.addEventListener('mouseleave', function() {
                const tooltips = document.querySelectorAll('.tooltip');
                tooltips.forEach(t => t.remove());
            });
        });
    };

    // Initialize features
    initTooltips();
    
    // Add loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
    });

    // Handle mobile menu (if needed)
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            document.querySelector('.nav-menu').classList.toggle('active');
        });
    }
});

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add resize handler for responsive adjustments
window.addEventListener('resize', debounce(() => {
    // Adjust any responsive elements if needed
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        // Mobile-specific adjustments
        document.querySelectorAll('.project-card').forEach(card => {
            card.style.transform = 'none';
        });
    }
}, 250));