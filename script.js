// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('loaded');
    setTimeout(() => preloader.style.display = 'none', 500);
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(anchor.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// Dynamic Greeting
const greeting = document.getElementById('dynamic-greeting');
if (greeting) {
    const hour = new Date().getHours();
    greeting.textContent = `${hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'}. Exclusive properties tailored for discerning clients.`;
}

// Animated Counters
const counters = document.querySelectorAll('.counter');
const countUp = (el) => {
    const target = +el.getAttribute('data-target');
    let count = 0;
    const interval = setInterval(() => {
        count += Math.ceil(target / 50);
        el.textContent = count;
        if (count >= target) clearInterval(interval);
    }, 40);
};
counters.forEach(counter => {
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) countUp(counter);
    });
    observer.observe(counter);
});

// Dynamic Testimonials
fetch('testimonials.json')
    .then(res => res.json())
    .then(data => {
        const row = document.getElementById('testimonials-row');
        data.forEach((test, index) => {
            const item = document.createElement('div');
            item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            item.innerHTML = `
                <div class="d-block w-100 text-center">
                    <p class="lead">"${test.quote}"</p>
                    <p>- ${test.author}</p>
                </div>
            `;
            row.appendChild(item);
        });
    });

// Mortgage Calculator
const mortgageForm = document.getElementById('mortgage-form');
if (mortgageForm) {
    mortgageForm.addEventListener('submit', e => {
        e.preventDefault();
        const homePrice = parseFloat(document.getElementById('homePrice').value);
        const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
        const interestRate = parseFloat(document.getElementById('interestrate').value) / 100 / 12;
        const loanTerm = parseFloat(document.getElementById('loanterm').value) * 12;

        if (isNaN(homePrice) || isNaN(downPayment) || isNaN(interestRate) || isNaN(loanTerm)) {
            document.getElementById('mortgage-result').innerHTML = 'Please enter valid numbers.';
            return;
        }

        const loanAmount = homePrice - downPayment;
        const monthlyPayment = loanAmount * (interestRate * Math.pow(1 + interestRate, loanTerm)) / (Math.pow(1 + interestRate, loanTerm) - 1);
        document.getElementById('mortgage-result').innerHTML = `Monthly Payment: $${monthlyPayment.toFixed(2)}`;
        document.getElementById('mortgage-result').style.display = 'block';
    });
}

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
}

// Copyright Year
const copyrightYears = document.querySelectorAll('#copyright-year');
copyrightYears.forEach(year => {
    year.textContent = new Date().getFullYear();
});

// AOS Init
AOS.init();

// Optimized Parallax Effect - Smoother & More Performant
const isMobile = window.innerWidth <= 768;
const parallaxSpeed = isMobile ? 0.15 : 0.4; // Even slower on mobile for ultra-smooth feel

// Cache sections once
const parallaxSections = document.querySelectorAll('.parallax');

// IntersectionObserver for lazy updates (only process visible elements)
const parallaxObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        entry.target.dataset.visible = entry.isIntersecting ? 'true' : 'false';
    });
}, { threshold: 0.1 }); // Start observing slightly before fully visible

parallaxSections.forEach(section => parallaxObserver.observe(section));

// Throttle function (pure JS, lightweight)
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

// Animated Parallax with lerp + requestAnimationFrame (smooth & performant)

// Config
const parallaxSpeed = window.innerWidth <= 768 ? 0.12 : 0.35; // Slower on mobile
const lerpFactor = 0.08; // 0.05–0.12 range; lower = smoother/slower catch-up

// Cache
const parallaxSections = document.querySelectorAll('.parallax');
let scrollY = window.scrollY;
let targetScrollY = window.scrollY;
let rafId = null;

// Observer to only process visible sections
const parallaxObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        entry.target.dataset.visible = entry.isIntersecting ? 'true' : 'false';
    });
}, { rootMargin: '100px' }); // Start/stop a bit before/after viewport

parallaxSections.forEach(sec => parallaxObserver.observe(sec));

// Lerp helper
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Update function (called via rAF)
function updateParallax() {
    scrollY = lerp(scrollY, targetScrollY, lerpFactor);

    parallaxSections.forEach(section => {
        if (section.dataset.visible !== 'true') return;

        const inner = section.querySelector('.parallax-inner');
        if (!inner) return;

        const rect = section.getBoundingClientRect();
        // How far the section top is from viewport top (normalized)
        const progress = rect.top / window.innerHeight;
        // Parallax offset: negative for classic "background moves slower"
        const offset = progress * 100 * parallaxSpeed;

        // Apply smooth transform
        inner.style.transform = `translate3d(0, ${offset}%, 0) scale(1.04)`; // Slight scale adds depth
    });

    rafId = requestAnimationFrame(updateParallax);
}

// Scroll handler — just update target, let rAF smooth it
function onScroll() {
    targetScrollY = window.scrollY;
}

// Throttle scroll event (still good to reduce calls)
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            onScroll();
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// Resize handler
window.addEventListener('resize', () => {
    // Optional: recalculate speed on resize
    const isMobile = window.innerWidth <= 768;
    // You can dynamically adjust parallaxSpeed here if desired
});

// Start the animation loop
updateParallax(); // Kick off rAF

// Cleanup (good practice)
window.addEventListener('beforeunload', () => {
    if (rafId) cancelAnimationFrame(rafId);
});

// Throttled scroll listener
const throttledUpdate = throttle(updateParallax, 16); // ~60fps cap
window.addEventListener('scroll', throttledUpdate, { passive: true });
window.addEventListener('resize', throttledUpdate);
updateParallax(); // Initial
