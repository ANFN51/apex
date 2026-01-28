// Preloader – Robust version with fallback timeout
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('loaded');
        console.log('Preloader faded – should hide now');
        setTimeout(() => {
            preloader.style.display = 'none';
            console.log('Preloader fully removed');
            document.body.style.opacity = '1'; // Safety net
        }, 600); // Slightly longer to ensure transition
    } else {
        console.warn('Preloader element not found');
    }
});

// Fallback: Force remove preloader after 8 seconds if load hangs
setTimeout(() => {
    const pre = document.getElementById('preloader');
    if (pre && pre.style.display !== 'none') {
        pre.classList.add('loaded');
        pre.style.display = 'none';
        console.warn('Forced preloader removal after timeout');
    }
}, 8000);

// Smooth Scroll (Existing)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(anchor.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
});

// Navbar Scroll Effect (Existing)
window.addEventListener('scroll', () => {
    document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// Dynamic Greeting (Professional Time-Based Personalization)
const greeting = document.getElementById('dynamic-greeting');
const hour = new Date().getHours();
greeting.textContent = `${hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'}. Exclusive properties tailored for discerning clients. Over 15 years of unparalleled expertise.`;

// Animated Counters (Futuristic Scroll-Trigger)
const counters = document.querySelectorAll('.counter');
const countUp = (el) => {
    const target = parseInt(el.textContent);
    let count = 0;
    const interval = setInterval(() => {
        count += Math.ceil(target / 50);
        el.textContent = count;
        if (count >= target) clearInterval(interval);
    }, 40);
};
const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && countUp(entry.target)));
counters.forEach(counter => counterObserver.observe(counter));

// Dynamic Testimonials (Fetch from JSON)
fetch('testimonials.json')
    .then(res => res.json())
    .then(data => {
        const row = document.getElementById('testimonials-row');
        data.forEach(test => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            col.innerHTML = `<div class="card p-3"><p>"${test.quote}"</p><footer class="blockquote-footer">${test.author}</footer></div>`;
            row.appendChild(col);
        });
    });

// Dynamic IDX (Professional Search Integration – Assume IDX Broker JS; Update with Your Key)
function loadIDX(query = '') {
    const container = document.getElementById('idx-container');
    container.innerHTML = ''; // Clear for refresh
    const iframe = document.createElement('iframe');
    iframe.src = `https://your-idx-provider.com/search-widget?mls=your-mls-id&client=your-key&query=${encodeURIComponent(query)}`;
    iframe.width = '100%';
    iframe.height = '750';
    iframe.frameBorder = '0';
    iframe.style = 'border-radius: 16px; box-shadow: 0 15px 40px rgba(0, 212, 255, 0.2); backdrop-filter: blur(8px);';
    container.appendChild(iframe);
}
loadIDX(); // Initial load
document.getElementById('property-search').addEventListener('input', e => loadIDX(e.target.value)); // Dynamic update

// Theme Toggle (Futuristic Dark Mode – Uses localStorage for Persistence)
const toggle = document.getElementById('theme-toggle');
const body = document.body;
toggle.addEventListener('click', () => {
    body.classList.toggle('body-dark');
    toggle.textContent = body.classList.contains('body-dark') ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('theme', body.classList.contains('body-dark') ? 'dark' : 'light');
});
if (localStorage.getItem('theme') === 'dark') body.classList.add('body-dark');

// Contact Form (Dynamic Submission with EmailJS – Professional Backend-Less)
emailjs.init('your_emailjs_user_id'); // Add your EmailJS User ID
document.getElementById('contact-form')?.addEventListener('submit', e => {
    e.preventDefault();
    emailjs.sendForm('your_service_id', 'your_template_id', e.target)
        .then(() => alert('Message sent successfully!'), err => alert('Error: ' + err.text));
    e.target.reset();
});

// Scroll-Triggered Animations – More forgiving
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    if (sections.length === 0) {
        console.warn('No sections found for observer');
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); // Comment out to allow re-trigger if needed
                console.log('Section visible:', entry.target.id);
            }
        });
    }, { threshold: 0.05 }); // Lower threshold = triggers sooner

    sections.forEach(section => observer.observe(section));

    // Safety fallback: Make all sections visible after 4 seconds if observer fails
    setTimeout(() => {
        sections.forEach(s => {
            if (!s.classList.contains('visible')) {
                s.classList.add('visible');
                console.warn('Fallback visibility applied to:', s.id);
            }
        });
    }, 4000);
});
function calculateMortgage() {
    const P = parseFloat(document.getElementById('loanAmount').value);
    const r = parseFloat(document.getElementById('interestRate').value) / 100 / 12;
    const n = parseFloat(document.getElementById('loanTerm').value) * 12;
    if (isNaN(P) || isNaN(r) || isNaN(n) || n <= 0) {
        document.getElementById('result').innerHTML = 'Please enter valid numbers.';
        return;
    }
    const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    document.getElementById('result').innerHTML = `Estimated Monthly Payment: <span style="font-size: 1.6rem;">$${M.toFixed(2)}</span>`;
}

// Mobile Detection & Optimizations
const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth <= 767;
if (isMobile) {
    // Disable parallax effect via JS if needed (fallback to CSS)
    document.querySelectorAll('.parallax').forEach(el => el.style.backgroundAttachment = 'scroll');
    // Reduce counter animation speed
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        counter.textContent = counter.getAttribute('data-target'); // Skip animation, show final value
    });
}
// Aggressive Mobile Safety Net
if (window.innerWidth <= 991 || /Mobi|Android/i.test(navigator.userAgent)) {
    document.querySelectorAll('.parallax').forEach(el => {
        el.style.backgroundAttachment = 'scroll';
        el.style.minHeight = '40vh';
    });
    document.querySelectorAll('.about-overlay-img').forEach(el => {
        el.style.position = 'relative';
        el.style.transform = 'none';
        el.style.margin = '0 auto 2rem';
    });
    // Optional: Skip heavy animations
    document.body.classList.add('mobile-optimized');
}

// Ensure body is visible even if JS partially fails
document.body.style.transition = 'opacity 0.8s ease';
document.body.style.opacity = '0';
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});