/* Cloud Industry — hosting platform interactions
   Motion stack: GSAP ScrollTrigger + Lenis (CDN), feature-detected.
   Everything degrades gracefully without them and respects
   prefers-reduced-motion. */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const hasLenis = typeof window.Lenis !== "undefined";
  const useGSAP = hasGSAP && !reduceMotion;

  if (useGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("gsap-on");
  }

  /* ── Lenis smooth scrolling ──────────────────────────── */
  if (hasLenis && !reduceMotion) {
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1.05 });
    if (useGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    // keep anchor links working through Lenis
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (href === "#") return; // placeholder links (querySelector("#") throws)
        const target = document.querySelector(href);
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -70 }); }
      });
    });
  }

  /* ── theme toggle ────────────────────────────────────── */
  const rootEl = document.documentElement;
  const themeButtons = document.querySelectorAll(".theme-toggle");
  const applyTheme = (t) => {
    rootEl.dataset.theme = t;
    themeButtons.forEach((b) => { b.textContent = t === "light" ? "☾" : "☀"; });
  };
  applyTheme(rootEl.dataset.theme || "light");
  themeButtons.forEach((b) =>
    b.addEventListener("click", () => {
      const next = rootEl.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch (_) { /* private mode */ }
    })
  );

  /* ── nav scroll state ────────────────────────────────── */
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── mobile menu ─────────────────────────────────────── */
  const burger = document.querySelector(".nav__burger");
  const menu = document.querySelector(".mobile-menu");
  const closeMenu = () => {
    menu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  };
  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ── scroll reveals ──────────────────────────────────── */
  const revealEls = document.querySelectorAll(".reveal");
  const cascades = [".services", ".plans", ".quotes", ".steps"];
  if (useGSAP) {
    // grid children are animated as group cascades below, not individually
    revealEls.forEach((el) => {
      if (cascades.some((sel) => el.matches(`${sel} > *`))) return;
      gsap.from(el, {
        y: 36, opacity: 0, duration: 0.9, ease: "power3.out", clearProps: "transform,opacity",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
    // service / plan / quote grids cascade as groups
    cascades.forEach((sel) => {
      const wrap = document.querySelector(sel);
      if (!wrap) return;
      gsap.from(wrap.children, {
        y: 40, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.07,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: wrap, start: "top 85%", once: true },
      });
    });
  } else if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ── hero terminal: provisioning sequence ────────────── */
  const termBody = document.getElementById("termBody");
  if (termBody) {
    const CMD = "cloud deploy llama-3-70b";
    const LINES = [
      '<span class="t-dim">→ allocating H100 node …</span> <span class="t-ok">done (9s)</span>',
      '<span class="t-dim">→ weights pulled from edge cache …</span> <span class="t-ok">done</span>',
      '<span class="t-dim">→ endpoint scaled to 210 regions …</span> <span class="t-ok">done</span>',
      '<span class="t-ok">✓ serving in 41s</span> <span class="t-dim">— first token 24ms</span>',
    ];
    const renderAll = () => {
      termBody.innerHTML =
        `<p><span class="t-prompt">$</span> ${CMD}</p>` +
        LINES.map((l) => `<p>${l}</p>`).join("") +
        '<p><span class="t-prompt">$</span> <span class="t-cursor">▊</span></p>';
    };
    if (reduceMotion) {
      renderAll();
    } else {
      const cmdLine = document.createElement("p");
      const typed = document.createElement("span");
      const cursor = '<span class="t-cursor">▊</span>';
      let started = false;

      const printLines = (i) => {
        if (i >= LINES.length) {
          const done = document.createElement("p");
          done.innerHTML = `<span class="t-prompt">$</span> ${cursor}`;
          termBody.appendChild(done);
          return;
        }
        const line = document.createElement("p");
        line.innerHTML = LINES[i];
        termBody.appendChild(line);
        setTimeout(() => printLines(i + 1), 550);
      };

      const typeCmd = (i) => {
        typed.textContent = CMD.slice(0, i);
        cmdLine.innerHTML = `<span class="t-prompt">$</span> ${typed.textContent}${i < CMD.length ? cursor : ""}`;
        if (i < CMD.length) setTimeout(() => typeCmd(i + 1), 34 + Math.random() * 40);
        else setTimeout(() => printLines(0), 420);
      };

      const start = () => {
        if (started) return;
        started = true;
        termBody.innerHTML = "";
        termBody.appendChild(cmdLine);
        typeCmd(0);
      };

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry], obs) => {
          if (entry.isIntersecting) { start(); obs.disconnect(); }
        }, { threshold: 0.4 }).observe(termBody);
      } else {
        setTimeout(start, 600);
      }
    }
  }

  /* ── uptime ledger: one tick per day, last 90 days ───── */
  const ledgerTicks = document.getElementById("ledgerTicks");
  if (ledgerTicks) {
    const DAYS = 90;
    const WARN_DAY = 68; // June 23 — the honest amber bar; keep within the last 30 so it stays visible on mobile
    for (let i = 0; i < DAYS; i++) {
      const tick = document.createElement("i");
      tick.className = "ledger__tick" + (i === WARN_DAY ? " ledger__tick--warn" : "");
      tick.style.transitionDelay = `${i * 9}ms`;
      ledgerTicks.appendChild(tick);
    }
    if (reduceMotion || !("IntersectionObserver" in window)) {
      ledgerTicks.classList.add("is-on");
    } else {
      new IntersectionObserver(([entry], obs) => {
        if (entry.isIntersecting) { ledgerTicks.classList.add("is-on"); obs.disconnect(); }
      }, { threshold: 0.5 }).observe(ledgerTicks);
    }
  }

  /* ── live latency ticker ─────────────────────────────── */
  const mLatency = document.getElementById("mLatency");
  if (mLatency) {
    const set = () => { mLatency.innerHTML = `${19 + Math.floor(Math.random() * 7)}<i>ms</i>`; };
    set();
    if (!reduceMotion) setInterval(set, 2200);
  }

  /* ── animated counters ───────────────────────────────── */
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const fmt = (n) => n.toLocaleString("en-US");
    if (reduceMotion) {
      el.textContent = prefix + fmt(target) + suffix;
      return;
    }
    const dur = 1400;
    const t0 = performance.now();
    const tickC = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tickC);
    };
    requestAnimationFrame(tickC);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  /* ── billing period toggle ───────────────────────────── */
  const billingOpts = document.querySelectorAll(".billing__opt");
  billingOpts.forEach((btn) =>
    btn.addEventListener("click", () => {
      const period = btn.dataset.billing;
      billingOpts.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      document.querySelectorAll(".plan__num").forEach((num) => {
        num.textContent = num.dataset[period];
      });
      document.querySelectorAll(".plan__was").forEach((was) => {
        was.textContent = was.dataset[period === "yearly" ? "wasYearly" : "wasMonthly"];
      });
    })
  );

  /* ── single-open FAQ accordion ───────────────────────── */
  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) faqItems.forEach((other) => { if (other !== item) other.open = false; });
    });
  });
})();
