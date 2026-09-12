import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SparklesIcon } from "./Icons.jsx";

export default function RpgHero3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x2d3748, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xb0803a, 2.8);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x454f78, 2.2);
    fillLight.position.set(-4, -2, -3);
    scene.add(fillLight);

    // Cursor tracking dynamic point light
    const cursorLight = new THREE.PointLight(0x38bdf8, 3.5, 12);
    cursorLight.position.set(0, 0, 3);
    scene.add(cursorLight);

    // --- MATERIALS ---
    const armorMaterial = new THREE.MeshStandardMaterial({
      color: 0x141a29,
      metalness: 0.9,
      roughness: 0.22,
    });

    const goldAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.18,
      emissive: 0x7c5a10,
      emissiveIntensity: 0.3,
    });

    const glowCoreMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 3.2,
      roughness: 0.1,
    });

    const visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x38bdf8,
      emissiveIntensity: 4.5,
      roughness: 0.05,
    });

    // --- HERO MODEL RIG HIERARCHY ---
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const heroGroup = new THREE.Group();
    rootGroup.add(heroGroup);

    // 1. Torso
    const torsoGroup = new THREE.Group();
    heroGroup.add(torsoGroup);

    const chestGeometry = new THREE.CylinderGeometry(0.68, 0.46, 1.15, 6);
    const chestMesh = new THREE.Mesh(chestGeometry, armorMaterial);
    chestMesh.position.y = 0.25;
    torsoGroup.add(chestMesh);

    // Gold collar plate
    const collarGeometry = new THREE.CylinderGeometry(0.55, 0.65, 0.2, 6);
    const collarMesh = new THREE.Mesh(collarGeometry, goldAccentMaterial);
    collarMesh.position.y = 0.85;
    torsoGroup.add(collarMesh);

    // Glowing Chest Core (Crystal Heart)
    const coreGeometry = new THREE.OctahedronGeometry(0.2, 0);
    const coreMesh = new THREE.Mesh(coreGeometry, glowCoreMaterial);
    coreMesh.position.set(0, 0.35, 0.52);
    torsoGroup.add(coreMesh);

    // Point light radiating from crystal heart
    const coreLight = new THREE.PointLight(0x38bdf8, 2, 4);
    coreLight.position.set(0, 0.35, 0.6);
    torsoGroup.add(coreLight);

    // 2. Head & Visor
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.1, 0);
    torsoGroup.add(headGroup);

    // Helmet
    const helmetGeometry = new THREE.DodecahedronGeometry(0.44, 1);
    const helmetMesh = new THREE.Mesh(helmetGeometry, armorMaterial);
    headGroup.add(helmetMesh);

    // Helmet crest / horn
    const crestGeometry = new THREE.ConeGeometry(0.12, 0.45, 4);
    const crestMesh = new THREE.Mesh(crestGeometry, goldAccentMaterial);
    crestMesh.position.set(0, 0.45, 0);
    headGroup.add(crestMesh);

    // Glowing Visor Eyes
    const visorGeometry = new THREE.BoxGeometry(0.42, 0.1, 0.22);
    const visorMesh = new THREE.Mesh(visorGeometry, visorMaterial);
    visorMesh.position.set(0, 0.05, 0.34);
    headGroup.add(visorMesh);

    // 3. Floating Shoulder Pauldrons
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.95, 0.72, 0);
    const shoulderGeo = new THREE.ConeGeometry(0.35, 0.55, 5);
    const leftShoulderMesh = new THREE.Mesh(shoulderGeo, armorMaterial);
    leftShoulderMesh.rotation.z = -0.55;
    leftShoulder.add(leftShoulderMesh);
    torsoGroup.add(leftShoulder);

    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.95, 0.72, 0);
    const rightShoulderMesh = new THREE.Mesh(shoulderGeo, armorMaterial);
    rightShoulderMesh.rotation.z = 0.55;
    rightShoulder.add(rightShoulderMesh);
    torsoGroup.add(rightShoulder);

    // Floating Arm Gauntlets
    const gauntletGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.65, 6);
    const leftGauntlet = new THREE.Mesh(gauntletGeo, armorMaterial);
    leftGauntlet.position.set(-0.92, -0.15, 0.1);
    leftGauntlet.rotation.z = -0.2;
    torsoGroup.add(leftGauntlet);

    const rightGauntlet = new THREE.Mesh(gauntletGeo, armorMaterial);
    rightGauntlet.position.set(0.92, -0.15, 0.1);
    rightGauntlet.rotation.z = 0.2;
    torsoGroup.add(rightGauntlet);

    // 4. Floating Celestial Gyroscopic Rings
    const ringGroup = new THREE.Group();
    heroGroup.add(ringGroup);

    const ring1Geo = new THREE.TorusGeometry(1.65, 0.024, 16, 100);
    const ring1 = new THREE.Mesh(ring1Geo, goldAccentMaterial);
    ring1.rotation.x = Math.PI / 3;
    ringGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.05, 0.02, 16, 100);
    const ring2 = new THREE.Mesh(ring2Geo, glowCoreMaterial);
    ring2.rotation.y = Math.PI / 4;
    ringGroup.add(ring2);

    // 5. Floating Hexagonal Rune Pedestal
    const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.15, 6);
    const baseMesh = new THREE.Mesh(baseGeo, armorMaterial);
    baseMesh.position.y = -1.35;
    heroGroup.add(baseMesh);

    const runeRingsGeo = new THREE.RingGeometry(0.8, 1.15, 6);
    const runeRingMesh = new THREE.Mesh(runeRingsGeo, goldAccentMaterial);
    runeRingMesh.position.y = -1.26;
    runeRingMesh.rotation.x = -Math.PI / 2;
    heroGroup.add(runeRingMesh);

    // 6. Orbiting Mana Star Particles
    const particleCount = 700;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 2.0 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = radius * Math.cos(phi);
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.035,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- MOUSE & SCROLL INTERACTION STATE ---
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragRotX = 0;
    let dragRotY = 0;
    let targetDragRotX = 0;
    let targetDragRotY = 0;

    let scrollSpinVelocity = 0;
    let scrollCameraZoom = 0;
    let targetZoom = 6.2;

    function onMouseMove(e) {
      const rect = container.getBoundingClientRect();
      // Normalized between -1 and 1
      targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        targetDragRotY += deltaX * 0.008;
        targetDragRotX += deltaY * 0.008;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    }

    function onMouseDown(e) {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    }

    function onMouseUp() {
      isDragging = false;
    }

    function onWheel(e) {
      e.preventDefault();
      // Mouse scroll accelerates celestial rings and creates vertical levitation surge
      scrollSpinVelocity += e.deltaY * 0.003;
      targetZoom += e.deltaY * 0.0025;
      targetZoom = Math.max(4.8, Math.min(7.5, targetZoom));
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("wheel", onWheel, { passive: false });

    // Touch support for mobile
    function onTouchMove(e) {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        targetMouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        targetMouseY = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
      }
    }
    container.addEventListener("touchmove", onTouchMove);

    // Resize Handler
    function onResize() {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    }
    window.addEventListener("resize", onResize);

    // --- ANIMATION LOOP ---
    let animId;
    const clock = new THREE.Clock();

    function animate() {
      animId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Damping towards target mouse
      currentMouseX += (targetMouseX - currentMouseX) * 0.07;
      currentMouseY += (targetMouseY - currentMouseY) * 0.07;

      // Drag inertia
      dragRotX += (targetDragRotX - dragRotX) * 0.08;
      dragRotY += (targetDragRotY - dragRotY) * 0.08;

      // Camera smooth zoom
      camera.position.z += (targetZoom - camera.position.z) * 0.08;

      // Move dynamic light with mouse
      cursorLight.position.x = currentMouseX * 3.5;
      cursorLight.position.y = currentMouseY * 3.0 + 0.5;

      // 1. HEAD TRACKING (Follows mouse cursor smoothly)
      headGroup.rotation.y = currentMouseX * 0.85;
      headGroup.rotation.x = -currentMouseY * 0.55;

      // 2. TORSO POSTURE (Twists naturally with cursor)
      torsoGroup.rotation.y = currentMouseX * 0.35 + dragRotY;
      torsoGroup.rotation.x = -currentMouseY * 0.2 + dragRotX;

      // 3. IDLE BREATHING & HOVER MOTION
      const hoverY = Math.sin(elapsed * 1.8) * 0.1;
      heroGroup.position.y = hoverY;

      // Pulse core crystal heart
      const corePulse = 1 + Math.sin(elapsed * 3.2) * 0.12;
      coreMesh.scale.set(corePulse, corePulse, corePulse);
      coreLight.intensity = 1.8 + Math.sin(elapsed * 3.2) * 0.8;

      // Float shoulders subtly with breathing
      leftShoulder.position.y = 0.72 + Math.sin(elapsed * 1.8 + 0.5) * 0.03;
      rightShoulder.position.y = 0.72 + Math.sin(elapsed * 1.8 + 0.5) * 0.03;

      // 4. SCROLL ACCELERATION & GYROSCOPIC RINGS
      scrollSpinVelocity *= 0.93; // Damping
      const ringSpin = 0.008 + Math.abs(scrollSpinVelocity);

      ring1.rotation.x += ringSpin;
      ring1.rotation.y += ringSpin * 0.8;
      ring2.rotation.y -= ringSpin * 1.2;
      ring2.rotation.z += ringSpin * 0.5;

      // 5. STARFIELD ROTATION
      particles.rotation.y = elapsed * 0.04;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchmove", onTouchMove);

      // Clean up Three.js WebGL resources
      renderer.dispose();
      chestGeometry.dispose();
      collarGeometry.dispose();
      coreGeometry.dispose();
      helmetGeometry.dispose();
      crestGeometry.dispose();
      visorGeometry.dispose();
      shoulderGeo.dispose();
      gauntletGeo.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      baseGeo.dispose();
      runeRingsGeo.dispose();
      particleGeo.dispose();
      armorMaterial.dispose();
      goldAccentMaterial.dispose();
      glowCoreMaterial.dispose();
      visorMaterial.dispose();
      particleMat.dispose();

      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[420px] flex items-center justify-center select-none">
      <div
        ref={mountRef}
        className="w-full h-full min-h-[420px] cursor-grab active:cursor-grabbing"
      />

      {/* Floating 3D interaction hints */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface/70 backdrop-blur-md border border-hairline/80 text-[11px] text-mute shadow-xs">
          <span className="flex items-center gap-1 text-amber">
            <SparklesIcon className="w-3.5 h-3.5" />
          </span>
          <span>Move cursor to guide hero</span>
          <span className="text-hairline">•</span>
          <span>Scroll to surge</span>
        </div>
      </div>
    </div>
  );
}
