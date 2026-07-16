/* Cloud Industry — high-tech FX layer
   Vanilla, dependency-free, and strictly progressive: every effect
   feature-detects and honours prefers-reduced-motion. If this file
   fails to load or the browser can't run it, the site is unchanged
   and fully functional. Nothing here is load-bearing. */

(() => {
  "use strict";

  const doc = document;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const raf = window.requestAnimationFrame.bind(window);

  /* ── scroll progress rail ────────────────────────────── */
  if (!reduce) {
    const rail = doc.createElement("div");
    rail.className = "scroll-rail";
    const fill = doc.createElement("div");
    fill.className = "scroll-rail__fill";
    rail.appendChild(fill);
    doc.body.appendChild(rail);

    let ticking = false;
    const update = () => {
      const el = doc.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? Math.min(el.scrollTop / max, 1) : 0;
      fill.style.transform = `scaleX(${p})`;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; raf(update); }
    }, { passive: true });
    update();
  }

  /* ── cursor spotlight (fine pointer only) ────────────── */
  if (finePointer && !reduce) {
    const spot = doc.createElement("div");
    spot.className = "fx-spot";
    doc.body.appendChild(spot);

    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y, awake = false;

    window.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!awake) { awake = true; doc.body.classList.add("fx-on"); }
    }, { passive: true });
    window.addEventListener("pointerdown", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });

    const follow = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      spot.style.transform = `translate(${x}px, ${y}px)`;
      raf(follow);
    };
    raf(follow);
  }

  /* ── pointer-reactive glow inside cards ──────────────── */
  if (finePointer) {
    doc.querySelectorAll(".svc").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        card.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      }, { passive: true });
    });
  }

  /* ── magnetic buttons ────────────────────────────────── */
  if (finePointer && !reduce) {
    // primary CTAs only, and never full-width plan buttons
    const magnets = doc.querySelectorAll(".btn--big, .hero__cta .btn, .cta__actions .btn");
    magnets.forEach((btn) => {
      if (btn.classList.contains("btn--full")) return;
      btn.classList.add("is-magnetic");
      const pull = 0.28;
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${mx * pull}px, ${my * pull}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ── decode-on-reveal text scramble ──────────────────── */
  if (!reduce && "IntersectionObserver" in window) {
    const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*<>_[]";
    const scramble = (root) => {
      const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const parts = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.nodeValue.trim()) parts.push({ node, text: node.nodeValue });
      }
      if (!parts.length) return;
      const DURATION = 820;
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / DURATION, 1);
        for (const { node, text } of parts) {
          const revealed = Math.floor(text.length * p);
          let out = "";
          for (let i = 0; i < text.length; i++) {
            const c = text[i];
            out += (i < revealed || c === " " || c === "\n")
              ? c
              : GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
          node.nodeValue = out;
        }
        if (p < 1) raf(step);
        else for (const { node, text } of parts) node.nodeValue = text;
      };
      raf(step);
    };

    const seen = new WeakSet();
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          scramble(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.55 });
    doc.querySelectorAll("[data-scramble]").forEach((el) => io.observe(el));
  }

  /* ── hero neural canvas ──────────────────────────────── */
  const canvas = doc.querySelector(".hero__fx");
  if (canvas && canvas.getContext && !reduce) {
    const ctx = canvas.getContext("2d");
    const host = canvas.parentElement;
    let w = 0, h = 0, dpr = 1, nodes = [], frame = 0, alive = true;
    let mx = -999, my = -999;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(24, Math.min(80, Math.floor((w * h) / 15000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.5 + 0.6,
      }));
    };

    host.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    }, { passive: true });
    host.addEventListener("pointerleave", () => { mx = my = -999; });

    const LINK = 132;
    const draw = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, w, h);

      for (const p of nodes) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        if (mx > -900) {
          const dx = mx - p.x, dy = my - p.y;
          const d = Math.hypot(dx, dy);
          if (d < 170 && d > 0.01) { p.x += (dx / d) * 0.5; p.y += (dy / d) * 0.5; }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(125, 147, 255, ${(1 - d / LINK) * 0.45})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = "rgba(168, 186, 255, 0.9)";
      for (const p of nodes) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = raf(draw);
    };

    const stop = () => { alive = false; if (frame) window.cancelAnimationFrame(frame); };
    const start = () => { if (!alive) { alive = true; draw(); } };

    doc.addEventListener("visibilitychange", () => {
      if (doc.hidden) stop(); else start();
    });

    let rt = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(build, 180);
    });

    build();
    draw();
  }
})();
