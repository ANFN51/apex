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

// Property Oracle Teaser
document.getElementById('property-oracle')?.addEventListener('click', () => {
    const properties = [
        'A futuristic eco-mansion in the hills with solar-powered infinity pools and drone delivery pads—yours for $2.5M!',
        'An urban loft with holographic art walls and voice-activated everything, overlooking Detroit\'s skyline at $950K.',
        'A serene lakeside estate with private yacht dock and AI-managed gardens—prime luxury at $1.8M.',
        'A high-tech penthouse with VR tour capabilities and smart climate control, valued at $1.2M in the heart of the city.',
        'A custom villa with underground cinema and electric vehicle charging hub—dream big for $3M!'
    ];
    const randomProp = properties[Math.floor(Math.random() * properties.length)];
    const resultDiv = document.getElementById('oracle-result');
    resultDiv.innerHTML = `<p class="fw-bold">The Oracle predicts: ${randomProp}</p><p>Intrigued? <a href="index.html#contact">Contact us</a> for the real deal!</p>`;
    resultDiv.style.display = 'block';
    resultDiv.style.opacity = 0;
    resultDiv.style.transition = 'opacity 0.5s ease-in-out';
    setTimeout(() => { resultDiv.style.opacity = 1; }, 10); // Fade-in animation
});
