// Preloader
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('loaded');
    setTimeout(function() {
        preloader.style.display = 'none';
    }, 500);
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(anchor.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
});

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