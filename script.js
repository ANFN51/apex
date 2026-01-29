// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('loaded');
    setTimeout(() => preloader.style.display = 'none', 500);
});

// Smooth Scroll (Already present for anchors)
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
const copyrightYear = document.getElementById('copyright-year');
if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
}

// AOS Init
AOS.init();

// Mobile Parallax Simulation (Optimized for Smooth Scrolling)
const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
const parallaxSpeed = isMobile ? 0.3 : 0.7; // Slower on mobile for less jank

function updateParallax() {
    const sections = document.querySelectorAll('.parallax');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) { // Only update visible sections
            const offset = (window.pageYOffset - rect.top) * parallaxSpeed;
            section.style.backgroundPositionY = `${offset}px`;
        }
    });
}

window.addEventListener('scroll', () => {
    requestAnimationFrame(updateParallax); // Throttled for 60fps perf
});
updateParallax(); // Initial call
