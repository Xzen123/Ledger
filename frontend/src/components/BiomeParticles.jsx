import { useEffect, useRef } from "react";

// Biome-specific particle configurations
const BIOME_CONFIGS = {
  1: {
    // Medieval village at dawn
    count: 65,
    colors: ["#F59E0B", "#FBBF24", "#FDE68A", "#D97706"],
    speedY: -0.4,
    speedX: 0.2,
    sizeRange: [2, 5],
    shape: "circle",
    glow: "rgba(245, 158, 11, 0.3)",
  },
  2: {
    // Enchanted forest clearing
    count: 75,
    colors: ["#34D399", "#10B981", "#6EE7B7", "#A7F3D0"],
    speedY: -0.6,
    speedX: 0.3,
    sizeRange: [2, 6],
    shape: "firefly",
    glow: "rgba(52, 211, 153, 0.4)",
  },
  3: {
    // Volcanic forge & cavern
    count: 85,
    colors: ["#EF4444", "#F97316", "#F59E0B", "#DC2626"],
    speedY: -1.4,
    speedX: 0.5,
    sizeRange: [2, 5.5],
    shape: "ember",
    glow: "rgba(239, 68, 68, 0.5)",
  },
  4: {
    // Castle throne room & treasure vault
    count: 90,
    colors: ["#FFD700", "#F59E0B", "#C084FC", "#F472B6", "#38BDF8"],
    speedY: -0.5,
    speedX: 0.2,
    sizeRange: [2.5, 6.5],
    shape: "sparkle",
    glow: "rgba(255, 215, 0, 0.45)",
  },
};

export default function BiomeParticles({ activeBiome = 1 }) {
  const canvasRef = useRef(null);
  const activeBiomeRef = useRef(activeBiome);

  useEffect(() => {
    activeBiomeRef.current = activeBiome;
  }, [activeBiome]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    function onResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", onResize);

    // Initialize particle pool
    const particles = Array.from({ length: 100 }).map(() => {
      const cfg = BIOME_CONFIGS[activeBiomeRef.current] || BIOME_CONFIGS[1];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8 + cfg.speedX,
        vy: (Math.random() - 0.5) * 0.5 + cfg.speedY,
        size: cfg.sizeRange[0] + Math.random() * (cfg.sizeRange[1] - cfg.sizeRange[0]),
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
        alpha: 0.2 + Math.random() * 0.7,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseAngle: Math.random() * Math.PI * 2,
      };
    });

    function render() {
      ctx.clearRect(0, 0, width, height);

      const cfg = BIOME_CONFIGS[activeBiomeRef.current] || BIOME_CONFIGS[1];

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
        } else if (p.y > height + 10) {
          p.y = -10;
        }

        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;

        p.pulseAngle += p.pulseSpeed;
        const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulseAngle) * 0.25);

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = cfg.glow;
        ctx.shadowBlur = p.size * 2;

        if (cfg.shape === "sparkle") {
          // 4-point star sparkle
          const s = p.size;
          ctx.translate(p.x, p.y);
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.3, -s * 0.3);
          ctx.lineTo(s, 0);
          ctx.lineTo(s * 0.3, s * 0.3);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.3, s * 0.3);
          ctx.lineTo(-s, 0);
          ctx.lineTo(-s * 0.3, -s * 0.3);
          ctx.closePath();
          ctx.fill();
        } else if (cfg.shape === "ember") {
          // Sharp irregular diamond ember
          ctx.translate(p.x, p.y);
          ctx.rotate(p.pulseAngle);
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.2);
          ctx.lineTo(p.size * 0.6, 0);
          ctx.lineTo(0, p.size * 0.8);
          ctx.lineTo(-p.size * 0.6, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          // Soft circular spore / firefly
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      aria-hidden="true"
    />
  );
}
