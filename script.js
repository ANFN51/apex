// script.js - Apex Realty Centers website interactivity
// @ts-nocheck   ← keeps VS Code TypeScript checker quiet on plain JS file

// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('loaded');
        setTimeout(() => preloader.style.display = 'none', 500);
    }
});

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Navbar scroll effect (adds .scrolled class when page is scrolled)
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
});

// Dynamic Greeting (if element exists)
const greeting = document.getElementById('dynamic-greeting');
if (greeting) {
    const hour = new Date().getHours();
    let message = 'Good Evening';
    if (hour < 12) message = 'Good Morning';
    else if (hour < 18) message = 'Good Afternoon';
    greeting.textContent = `${message}. Exclusive properties tailored for discerning clients.`;
}

// Animated Counters (Properties sold, Customers, Years of experience, etc.)
const counters = document.querySelectorAll('.counter');
const countUp = (el) => {
    const target = +el.getAttribute('data-target');
    let count = 0;
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    const animate = (time) => {
        const progress = (time - startTime) / duration;
        count = Math.min(Math.ceil(progress * target), target);
        el.textContent = count;
        if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
};

if (counters.length > 0) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                observer.unobserve(entry.target); // animate only once
            }
        });
    }, { threshold: 0.1 });

    counters.forEach(counter => observer.observe(counter));
}

// Dynamic Testimonials from JSON
fetch('testimonials.json')
    .then(res => {
        if (!res.ok) throw new Error('Failed to load testimonials');
        return res.json();
    })
    .then(data => {
        const container = document.getElementById('testimonials-row');
        if (container) {
            data.forEach((test, index) => {
                const item = document.createElement('div');
                item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                item.innerHTML = `
                    <div class="d-block w-100 text-center">
                        <p class="lead">"${test.quote}"</p>
                        <p>- ${test.author}</p>
                    </div>
                `;
                container.appendChild(item);
            });
        }
    })
    .catch(err => console.error('Testimonials error:', err));

// Mortgage Calculator (on buy.html)
const mortgageForm = document.getElementById('mortgage-form');
if (mortgageForm) {
    mortgageForm.addEventListener('submit', e => {
        e.preventDefault();

        const homePrice    = parseFloat(document.getElementById('homePrice')?.value)    || 0;
        const downPayment  = parseFloat(document.getElementById('downPayment')?.value)  || 0;
        const interestRate = parseFloat(document.getElementById('interestrate')?.value) || 0;
        const loanTerm     = parseFloat(document.getElementById('loanterm')?.value)     || 30;

        if (homePrice <= 0 || interestRate < 0 || loanTerm <= 0) {
            document.getElementById('mortgage-result').innerHTML = 'Please enter valid positive values.';
            return;
        }

        const loanAmount = homePrice - downPayment;
        if (loanAmount <= 0) {
            document.getElementById('mortgage-result').innerHTML = 'Down payment cannot exceed home price.';
            return;
        }

        const monthlyRate = interestRate / 100 / 12;
        const months      = loanTerm * 12;

        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
                               (Math.pow(1 + monthlyRate, months) - 1);

        document.getElementById('mortgage-result').innerHTML = 
            `Estimated Monthly Payment: $${monthlyPayment.toFixed(2)}`;
        document.getElementById('mortgage-result').style.display = 'block';
    });
}

// Theme / Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        // Optional: save preference
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Restore saved preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

// Update copyright year in footer
document.querySelectorAll('#copyright-year').forEach(el => {
    el.textContent = new Date().getFullYear();
});

// Parallax effect (desktop only)
const isMobile = /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent) || window.innerWidth <= 991;
const parallaxSections = document.querySelectorAll('.parallax');
const parallaxSpeed = 0.3; // adjust for desired effect strength

function updateParallax() {
    if (isMobile) return;

    parallaxSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const inner = section.querySelector('.parallax-inner');
            if (inner) {
                const offset = (rect.top / window.innerHeight) * 100 * parallaxSpeed;
                inner.style.transform = `translate3d(0, ${offset}%, 0) scale(1.05)`;
            }
        }
    });
}

// Throttle function (lightweight)
function throttle(fn, limit) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            fn(...args);
        }
    };
}

const throttledUpdate = throttle(updateParallax, 16); // ~60fps

if (!isMobile) {
    window.addEventListener('scroll', throttledUpdate, { passive: true });
    window.addEventListener('resize', throttledUpdate);
    updateParallax(); // initial call
}

// Optional: AOS init (if you're using AOS library)
if (typeof AOS !== 'undefined') {
    AOS.init({
        once: true,
        duration: 800,
        easing: 'ease-out'
    });
}
// ────────────────────────────────────────────────
// Real Estate Genie – properties.html only
// ────────────────────────────────────────────────
const genieForm = document.getElementById('genie-form');
const genieResponse = document.getElementById('genie-response');
const genieMessage = document.getElementById('genie-message');

if (genieForm) {
    genieForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const type    = document.getElementById('genie-type')?.value;
        const price   = document.getElementById('genie-price')?.value;
        const area    = document.getElementById('genie-area')?.value;
        const timeline = document.getElementById('genie-timeline')?.value;

        if (!type || !price || !timeline) {
            genieMessage.innerHTML = '<span class="text-danger">The Genie needs a bit more information to grant your wish...</span>';
            genieResponse.style.display = 'block';
            return;
        }

        // Simple template responses – expand with more logic later
        let message = `Ah, seeker of luxury in ${area === 'both' ? 'the Detroit & Garden City realms' : area === 'detroit' ? 'vibrant Detroit' : 'serene Garden City'}...`;

        if (type.includes('single-family') || type.includes('condo')) {
            message += `<br><br>I see a stunning ${type.replace('-', ' ')} in your future, valued around ${price.replace('-', '–')}.`;
        } else {
            message += `<br><br>Your vision for ${type} is wise — excellent opportunities await.`;
        }

        if (timeline === 'soon') {
            message += ` The stars align quickly — properties matching your desire are moving fast right now.`;
        } else if (timeline === '1-2yr') {
            message += ` In 1–2 years, values in this market are likely to rise 12–22% based on current trends. A smart time to prepare.`;
        } else {
            message += ` Patience will be rewarded — long-term holds in this area have historically performed strongly.`;
        }

        message += `<br><br>Shall we make this vision real? Reach out to the Apex team — your wish is but one conversation away. ✨`;

        genieMessage.innerHTML = message;
        genieResponse.style.display = 'block';

        // Optional: smooth scroll to response
        genieResponse.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}
