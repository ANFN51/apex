// Preloader
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('loaded');
    setTimeout(function() {
        preloader.style.display = 'none';
    }, 500);
});

// Helper function to check if an element is in the viewport
function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    const threshold = 0.1; // Matches your observer threshold
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < windowHeight * (1 - threshold) && rect.bottom > windowHeight * threshold;
}

// Debounce function for scroll end detection
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Smooth Scroll with Scroll-End Trigger
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });

            // Set up a one-time scroll listener to detect end of scroll
            const handleScrollEnd = debounce(() => {
                if (!target.classList.contains('visible') && isInViewport(target)) {
                    target.classList.add('visible');
                }
                window.removeEventListener('scroll', handleScrollEnd); // Clean up
            }, 150); // 150ms debounce; adjust if scrolls are very slow

            window.addEventListener('scroll', handleScrollEnd);
            
            // Fallback timeout in case scroll event misses
            setTimeout(handleScrollEnd, 800); // Call after ~800ms
        }
    });
});
});
// Custom smooth scroll function with easing
function smoothScrollTo(targetPosition, duration) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Easing function: easeInOutQuad for smooth start and end
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
    document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// Contact Form (Demo Alert)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Message sent successfully! (This is a demo)');
        e.target.reset();
    });
}

// Scroll-Triggered Animations
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // One-time trigger
            }
        });
    }, { threshold: 0.1 }); // Trigger when 10% visible

    sections.forEach(function(section) {
        observer.observe(section);
    });

    // Initialize AOS with global settings for futuristic minimalism
    AOS.init({
        duration: 1200, // Smooth, longer transitions for a high-tech feel
        easing: 'ease-in-out-cubic', // Curved easing for modern fluidity
        once: true, // Animate only once per scroll for performance
        offset: 100 // Trigger slightly earlier for anticipation
    });
});
