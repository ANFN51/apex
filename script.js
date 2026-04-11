// script.js - Apex Realty Centers website interactivity
// @ts-nocheck

// ── Zillow Search Redirect ────────────────────────────────
function zillowSearch(e) {
  e.preventDefault();
  const loc = (document.getElementById("zillow-location")?.value || "Garden City, MI").trim();
  const encoded = encodeURIComponent(loc);
  window.open(`https://www.zillow.com/homes/for_sale/${encoded}_rb/`, "_blank", "noopener,noreferrer");
}

function scrollListings(direction) {
  const slider = document.getElementById("listings-slider");
  if (!slider) return;
  const scrollAmount = slider.clientWidth * 0.8;
  slider.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
}

(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobileDevice = () =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 991;

  // ── DOM Ready ───────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {

    // ── Smooth Scroll for anchor links ──────────────────
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

    // ── Dynamic Greeting ────────────────────────────────
    const greeting = document.getElementById("dynamic-greeting");
    if (greeting) {
      const hour = new Date().getHours();
      let message = "Exclusive properties tailored for discerning clients.";
      if (hour < 12) message = "Good morning. Premium properties await.";
      else if (hour < 18) message = "Good afternoon. Let's find your dream home.";
      greeting.textContent = message;
    }

    // ── Navbar scroll class (passive + rAF-gated) ──────
    const navbar = document.querySelector(".navbar");
    let lastScrollY = 0;
    let ticking = false;

    const updateNavbar = () => {
      if (navbar) {
        navbar.classList.toggle("scrolled", lastScrollY > 50);
      }
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    }, { passive: true });
    updateNavbar();

    // ── Animated Counters (IntersectionObserver) ────────
    const counters = document.querySelectorAll(".counter");
    if (counters.length) {
      const countUp = (el) => {
        const target = Number(el.getAttribute("data-target")) || 0;
        if (!target) return;
        const duration = 1800;
        const startTime = performance.now();
        const animate = (time) => {
          const progress = Math.min((time - startTime) / duration, 1);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.ceil(eased * target).toLocaleString();
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      };

      const cObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            countUp(entry.target);
            cObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

      counters.forEach(c => cObserver.observe(c));
    }

    // ── Testimonials (fetch JSON) ────────────────────────
    fetch("testimonials.json")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load testimonials");
        return res.json();
      })
      .then(data => {
        const container = document.getElementById("testimonials-row");
        if (!container || !Array.isArray(data)) return;

        const escapeHTML = str =>
          String(str).replace(/[<>&"']/g, c =>
            ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c]));

        const frag = document.createDocumentFragment();
        data.forEach((test, index) => {
          const item = document.createElement("div");
          item.className = `carousel-item ${index === 0 ? "active" : ""}`;
          item.innerHTML = `
            <div class="testimonial-card mx-auto" style="max-width:680px;">
              <div class="quote">${escapeHTML(test.quote || "")}</div>
              <div class="author">— ${escapeHTML(test.author || "")}</div>
            </div>
          `;
          frag.appendChild(item);
        });
        container.appendChild(frag);
      })
      .catch(err => console.warn("Testimonials:", err.message));

    // ── Mortgage Calculator ──────────────────────────────
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
          result.innerHTML = "Please enter valid positive values."; return;
        }
        const loanAmount = homePrice - downPayment;
        if (loanAmount <= 0) { result.innerHTML = "Down payment cannot exceed home price."; return; }

        const monthlyRate = interestRate / 100 / 12;
        const months = loanTerm * 12;
        const monthly = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);

        result.innerHTML = `Estimated Monthly Payment: <strong>$${monthly.toFixed(2)}</strong>`;
        result.style.display = "block";
      });
    }

    // ── Dark Mode Toggle ─────────────────────────────────
    const themeToggle = document.getElementById("theme-toggle");
    const syncThemeToggle = (enabled) => {
      if (!themeToggle) return;
      const nextMode = enabled ? "light" : "dark";
      const icon = enabled ? "bi-sun-fill" : "bi-moon-stars";
      const label = enabled ? "Light Mode" : "Dark Mode";

      themeToggle.innerHTML = `<i class="bi ${icon} me-1"></i> ${label}`;
      themeToggle.setAttribute("aria-label", `Switch to ${nextMode} mode`);
      themeToggle.setAttribute("title", `Switch to ${nextMode} mode`);
      themeToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    };

    const applyDarkMode = enabled => {
      document.body.classList.toggle("dark-mode", enabled);
      localStorage.setItem("darkMode", enabled ? "true" : "false");
      syncThemeToggle(enabled);
    };
    if (themeToggle) {
      themeToggle.addEventListener("click", () =>
        applyDarkMode(!document.body.classList.contains("dark-mode")));
    }
    applyDarkMode(localStorage.getItem("darkMode") === "true");

    // ── Copyright Year ───────────────────────────────────
    document.querySelectorAll("#copyright-year").forEach(el =>
      el.textContent = new Date().getFullYear());

    // ── AOS init (after DOM ready) ───────────────────────
    if (typeof AOS !== "undefined" && !prefersReducedMotion) {
      AOS.init({ once: true, duration: 650, easing: "ease-out", offset: 60 });
    }

    // ── Real Estate Genie (properties page only) ────────
    const genieForm = document.getElementById("genie-form");
    const genieResponse = document.getElementById("genie-response");
    const genieMessage = document.getElementById("genie-message");
    if (genieForm) {
      genieForm.addEventListener("submit", e => {
        e.preventDefault();
        const type = document.getElementById("genie-type")?.value;
        const price = document.getElementById("genie-price")?.value;
        const area = document.getElementById("genie-area")?.value;
        const timeline = document.getElementById("genie-timeline")?.value;

        if (!type || !price || !timeline) {
          if (genieMessage) genieMessage.innerHTML = '<span class="text-danger">The Genie needs a bit more information…</span>';
          if (genieResponse) genieResponse.style.display = "block";
          return;
        }

        const areaLabel = area === "both" ? "the Detroit & Garden City realms"
          : area === "detroit" ? "vibrant Detroit" : "serene Garden City";

        let message = `Ah, seeker of luxury in ${areaLabel}...`;
        message += (type.includes("single-family") || type.includes("condo"))
          ? `<br><br>I see a stunning ${type.replace("-", " ")} in your future, valued around ${price.replace("-", "–")}.`
          : `<br><br>Your vision for ${type} is wise — excellent opportunities await.`;

        if (timeline === "soon") message += ` The stars align quickly — properties matching your desire are moving fast.`;
        else if (timeline === "1-2yr") message += ` In 1–2 years, values here are likely to rise 12–22% based on current trends.`;
        else message += ` Patience will be rewarded — long-term holds here have historically performed strongly.`;

        message += `<br><br>Shall we make this vision real? Reach out to the Apex team.`;

        if (genieMessage) genieMessage.innerHTML = message;
        if (genieResponse) {
          genieResponse.style.display = "block";
          genieResponse.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
        }
      });
    }
  }); // end DOMContentLoaded

  // ── Preloader (non-index pages legacy support) ──────────
  window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    if (!preloader || preloader.dataset.managed === "true") return;
    preloader.style.transition = "opacity 0.4s ease";
    preloader.style.opacity = "0";
    setTimeout(() => preloader.style.display = "none", 420);
  });

  // ── Unified Parallax (rAF + translate3d, no repaints) ───────────
  const parallaxBgElements = document.querySelectorAll(".parallax-bg");
  let parallaxTicking = false;
  let mobile = isMobileDevice();

  const updateParallax = () => {
    if (mobile || prefersReducedMotion) { parallaxTicking = false; return; }
    const scrollY = window.scrollY;
    
    parallaxBgElements.forEach(bg => {
      // Get the nearest ancestor section wrapping this bg
      const section = bg.closest("section") || bg.parentElement;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const st = scrollY;
      const ot = rect.top + st; 
      
      // Check if section is within the viewport
      if (st > ot - window.innerHeight && st < ot + section.offsetHeight) {
        // Distance from center of screen
        const centerOffset = window.innerHeight / 2 - (rect.top + rect.height / 2);
        const yOffset = centerOffset * 0.15; // The parallax vertical travel
        // Slight scale to prevent edge bleeding over borders and add D-o-F depth
        const scaleVal = 1 + Math.abs(centerOffset) * 0.00015;
        
        bg.style.transform = `translate3d(0, ${yOffset}px, 0) scale(${scaleVal})`;
      }
    });

    parallaxTicking = false;
  };

  window.addEventListener("scroll", () => {
    if (!parallaxTicking) {
      requestAnimationFrame(updateParallax);
      parallaxTicking = true;
    }
  }, { passive: true });

  // Recalculate on resize
  window.addEventListener("resize", () => {
    mobile = isMobileDevice();
    if (mobile) {
      parallaxBgElements.forEach(bg => bg.style.transform = "translate3d(0, 0, 0) scale(1)");
    }
  });

  // ── AOS-like fade-in via IntersectionObserver (no lib needed) ──
  // Only runs if AOS is NOT loaded (fallback)
  if (typeof AOS === "undefined" && !prefersReducedMotion) {
    const aosLike = document.querySelectorAll("[data-aos]");
    if (aosLike.length) {
      const style = document.createElement("style");
      style.textContent = `
        [data-aos]{opacity:0;transform:translateY(20px);transition:opacity 0.6s ease,transform 0.6s ease}
        [data-aos].aos-visible{opacity:1;transform:none}
      `;
      document.head.appendChild(style);

      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add("aos-visible"); obs.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -60px 0px" });

      aosLike.forEach(el => obs.observe(el));
    }
  }
})();
