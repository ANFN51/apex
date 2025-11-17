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

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            target.classList.add('visible');
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
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    sections.forEach(section => observer.observe(section));

    AOS.init({
        duration: 1200,
        easing: 'ease-in-out-cubic',
        once: true,
        offset: 100
    });
});
