// Preloader
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('loaded');
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 500);
    setTimeout(() => {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            if (!section.classList.contains('visible') && section.getBoundingClientRect().top < window.innerHeight) {
                section.classList.add('visible');
            }
        });
    }, 550);
});

// Smooth Scroll with Immediate Visibility for Button Targets
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            // Force visibility immediately for reliable button functionality
            target.classList.add('visible');
            // Then perform the smooth scroll
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// Contact Form (Demo Alert)
document.getElementById('contact-form')?.addEventListener('submit', e => {
    e.preventDefault();
    alert('Message sent successfully! (This is a demo)');
    e.target.reset();
});

// Scroll-Triggered Animations
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Add .visible to h1 and h2 within the section for text reveal
                const headings = entry.target.querySelectorAll('h1, h2');
                headings.forEach(heading => heading.classList.add('visible'));
                observer.unobserve(entry.target); // One-time for performance
            }
        });
    }, { threshold: 0.1 });
    sections.forEach(section => observer.observe(section));

    // Initialize AOS with global settings for futuristic minimalism
    AOS.init({
        duration: 1200, // Smooth, longer transitions for a high-tech feel
        easing: 'ease-in-out-cubic', // Curved easing for modern fluidity
        once: true, // Animate only once per scroll for performance
        offset: 100 // Trigger slightly earlier for anticipation
    });
});

// Advanced Parallax Scrolling
function updateParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    parallaxElements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed')) || 0.5; // Default speed
        const offset = window.pageYOffset * speed;
        el.style.backgroundPositionY = `${offset}px`;
    });
}

// Use requestAnimationFrame for smoother performance
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateParallax();
            ticking = false;
        });
        ticking = true;
    }
});

// Initial call on load
window.addEventListener('load', updateParallax);
