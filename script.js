// script.js - Apex Realty Centers website interactivity
// @ts-nocheck

(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // DOM Ready
  document.addEventListener("DOMContentLoaded", () => {
    // Smooth Scroll for anchor links (skip if reduced motion)
    if (!prefersReducedMotion) {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", e => {
          const targetId = anchor.getAttribute("href");
          if (!targetId || targetId === "#") return;
          const target = document.querySelector(targetId);
          if (!target) return;
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }

    // Dynamic Greeting
    const greeting = document.getElementById("dynamic-greeting");
    if (greeting) {
      const hour = new Date().getHours();
      let message = "Good Evening";
      if (hour < 12) message = "Good Morning";
      else if (hour < 18) message = "Good Afternoon";
      greeting.textContent = `${message}. Exclusive properties tailored for discerning clients.`;
    }

    // Navbar scroll effect
    const navbar = document.querySelector(".navbar");
    const onScroll = () => {
      if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Animated Counters
    const counters = document.querySelectorAll(".counter");
    const countUp = (el) => {
      const target = Number(el.getAttribute("data-target")) || 0;
      if (!target) return;
      const duration = 2000;
      const startTime = performance.now();

      const animate = (time) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const value = Math.ceil(progress * target);
        el.textContent = value.toLocaleString();
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    };

    if (counters.length > 0) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            countUp(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      counters.forEach(counter => observer.observe(counter));
    }

    // Dynamic Testimonials (from JSON)
    fetch("testimonials.json")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load testimonials");
        return res.json();
      })
      .then(data => {
        const container = document.getElementById("testimonials-row");
        if (!container || !Array.isArray(data)) return;

        data.forEach((test, index) => {
          const item = document.createElement("div");
          item.className = `carousel-item ${index === 0 ? "active" : ""}`;
          item.innerHTML = `
            <div class="d-block w-100 text-center">
              <p class="lead">"${test.quote}"</p>
              <p>- ${test.author}</p>
            </div>
          `;
          container.appendChild(item);
        });
      })
      .catch(err => console.error("Testimonials error:", err));

    // Mortgage Calculator
    const mortgageForm = document.getElementById("mortgage-form");
    if (mortgageForm) {
      mortgageForm.addEventListener("submit", e => {
        e.preventDefault();
        const homePrice = parseFloat(document.getElementById("homePrice")?.value) || 0;
        const downPayment = parseFloat(document.getElementById("downPayment")?.value) || 0;
        const interestRate = parseFloat(document.getElementById("interestrate")?.value) || 0;
        const loanTerm = parseFloat(document.getElementById("loanterm")?.value) || 30;

        const result = document.getElementById("mortgage-result");
        if (!result) return;

        if (homePrice <= 0 || interestRate < 0 || loanTerm <= 0) {
          result.innerHTML = "Please enter valid positive values.";
          return;
        }

        const loanAmount = homePrice - downPayment;
        if (loanAmount <= 0) {
          result.innerHTML = "Down payment cannot exceed home price.";
          return;
        }

        const monthlyRate = interestRate / 100 / 12;
        const months = loanTerm * 12;
        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
                               (Math.pow(1 + monthlyRate, months) - 1);

        result.innerHTML = `Estimated Monthly Payment: $${monthlyPayment.toFixed(2)}`;
        result.style.display = "block";
      });
    }

    // Dark Mode Toggle + Persistence
    const themeToggle = document.getElementById("theme-toggle");
    const applyDarkMode = (enabled) => {
      document.body.classList.toggle("dark-mode", enabled);
      localStorage.setItem("darkMode", enabled ? "true" : "false");
    };

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        applyDarkMode(!document.body.classList.contains("dark-mode"));
      });
    }
    applyDarkMode(localStorage.getItem("darkMode") === "true");

    // Copyright Year
    document.querySelectorAll("#copyright-year").forEach(el => {
      el.textContent = new Date().getFullYear();
    });

    // AOS init
    if (typeof AOS !== "undefined") {
      AOS.init({
        once: true,
        duration: 800,
        easing: "ease-out"
      });
    }

    // Real Estate Genie – properties.html only
    const genieForm = document.getElementById("genie-form");
    const genieResponse = document.getElementById("genie-response");
    const genieMessage = document.getElementById("genie-message");

    if (genieForm) {
      genieForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const type = document.getElementById("genie-type")?.value;
        const price = document.getElementById("genie-price")?.value;
        const area = document.getElementById("genie-area")?.value;
        const timeline = document.getElementById("genie-timeline")?.value;

        if (!type || !price || !timeline) {
          if (genieMessage) genieMessage.innerHTML = '<span class="text-danger">The Genie needs a bit more information to grant your wish...</span>';
          if (genieResponse) genieResponse.style.display = "block";
          return;
        }

        let message = `Ah, seeker of luxury in ${area === "both" ? "the Detroit & Garden City realms" : area === "detroit" ? "vibrant Detroit" : "serene Garden City"}...`;

        if (type.includes("single-family") || type.includes("condo")) {
          message += `<br><br>I see a stunning ${type.replace("-", " ")} in your future, valued around ${price.replace("-", "–")}.`;
        } else {
          message += `<br><br>Your vision for ${type} is wise — excellent opportunities await.`;
        }

        if (timeline === "soon") {
          message += ` The stars align quickly — properties matching your desire are moving fast right now.`;
        } else if (timeline === "1-2yr") {
          message += ` In 1–2 years, values in this market are likely to rise 12–22% based on current trends. A smart time to prepare.`;
        } else {
          message += ` Patience will be rewarded — long-term holds in this area have historically performed strongly.`;
        }

        message += `<br><br>Shall we make this vision real? Reach out to the Apex team — your wish is but one conversation away.`;

        if (genieMessage) genieMessage.innerHTML = message;
        if (genieResponse) {
          genieResponse.style.display = "block";
          genieResponse.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
        }
      });
    }
  });

  // Preloader (after full load)
  window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;
    preloader.classList.add("loaded");
    setTimeout(() => { preloader.style.display = "none"; }, 500);
  });

  // Parallax – desktop only, skip on mobile
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth <= 991;

  const parallaxSections = document.querySelectorAll(".parallax");
  const parallaxSpeed = 0.3;

  const updateParallax = () => {
    if (isMobile || prefersReducedMotion) return;

    parallaxSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top >= window.innerHeight || rect.bottom <= 0) return;

      const inner = section.querySelector(".parallax-inner");
      if (!inner) return;

      const offset = (rect.top / window.innerHeight) * 100 * parallaxSpeed;
      inner.style.transform = `translate3d(0, ${offset}%, 0) scale(1.05)`;
    });
  };

  const throttle = (fn, limit) => {
    let lastCall = 0;
    return function() {
      const now = Date.now();
      if (now - lastCall < limit) return;
      lastCall = now;
      fn();
    };
  };

  const throttledUpdate = throttle(updateParallax, 16);
  if (!isMobile && !prefersReducedMotion) {
    window.addEventListener("scroll", throttledUpdate, { passive: true });
    window.addEventListener("resize", throttledUpdate);
    updateParallax();
  } else {
    document.querySelectorAll(".parallax-inner").forEach(el => {
      el.style.transform = "none";
      el.style.transition = "none";
    });
  }

  window.addEventListener("resize", () => {
    const currentIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || window.innerWidth <= 991;

    if (currentIsMobile !== isMobile) {
      isMobile = currentIsMobile;
      if (isMobile) {
        document.querySelectorAll(".parallax-inner").forEach(el => el.style.transform = "none");
      } else {
        updateParallax();
      }
    }
  });
})();
