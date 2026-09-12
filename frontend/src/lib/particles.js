// Zero-dependency lightweight particle burst for celebrations (quest completion & level-up)
export function triggerParticles({ origin = { x: window.innerWidth / 2, y: window.innerHeight / 2 }, count = 36, colors = ["#454F78", "#B0803A", "#4B7A63", "#38BDF8", "#F59E0B"] } = {}) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const particles = Array.from({ length: count }).map(() => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 8;
    return {
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: 0.015 + Math.random() * 0.02,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.4 ? "circle" : "rect",
    };
  });

  let animId;
  function render() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = false;

    for (const p of particles) {
      if (p.alpha <= 0) continue;
      alive = true;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.98; // friction
      p.alpha -= p.decay;
      p.rotation += p.rotSpeed;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }

    if (alive) {
      animId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animId);
      canvas.remove();
    }
  }

  render();
}

/* commit_stage_73_ayush */
