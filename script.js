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

// Parallax Effect
const isMobile = window.innerWidth <= 768;
const parallaxSpeed = isMobile ? 0.2 : 0.5; // Slower on mobile

function updateParallax() {
    const sections = document.querySelectorAll('.parallax');
    sections.forEach(section => {
        const inner = section.querySelector('.parallax-inner');
        if (inner) {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const offset = (rect.top / window.innerHeight) * 100 * parallaxSpeed;
                inner.style.transform = `translate3d(0, ${offset}%, 0) scale(1.1)`;
            }
        }
    });
    requestAnimationFrame(updateParallax);
}

updateParallax();
window.addEventListener('scroll', updateParallax, { passive: true });
window.addEventListener('resize', updateParallax);
