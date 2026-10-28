
import * as THREE from "three";

// ==========================================
// 1. INTERACTIVE 3D PARTICLE SCULPTURE
// ==========================================

const canvas = document.getElementById("spaceCanvas");
const heroVisual = document.getElementById("heroVisual");

if (canvas && heroVisual) {
  let scene, camera, renderer, core, particles, rings;
  let animationId;
  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;

  try {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 8;

    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    // Central luminous sphere
    const coreGeometry = new THREE.IcosahedronGeometry(1.35, 5);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x7954db,
      emissive: 0x38146d,
      emissiveIntensity: 1.5,
      metalness: 0.45,
      roughness: 0.27,
      wireframe: true
    });

    core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Inner glowing sphere
    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(0.92, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x38216b,
        transparent: true,
        opacity: 0.23
      })
    );
    scene.add(inner);

    // Lights
    scene.add(new THREE.AmbientLight(0x9999ff, 1.8));

    const purpleLight = new THREE.PointLight(0xa16bff, 65, 12);
    purpleLight.position.set(3, 2, 4);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x45edff, 45, 12);
    cyanLight.position.set(-3, -2, 3);
    scene.add(cyanLight);

    // Orbiting rings
    rings = new THREE.Group();

    const ringColors = [0x9a76ff, 0x53eaff, 0xb29aff];

    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.75 + i * 0.2, 0.008, 8, 180),
        new THREE.MeshBasicMaterial({
          color: ringColors[i],
          transparent: true,
          opacity: 0.5 - i * 0.08
        })
      );

      ring.rotation.x = Math.PI * (0.35 + i * 0.18);
      ring.rotation.y = i * 0.8;
      rings.add(ring);
    }

    scene.add(rings);

    // Floating star particles
    const particleCount = 1600;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const purple = new THREE.Color(0xa78bfa);
    const cyan = new THREE.Color(0x65f4ff);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 3.1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] =
        radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] =
        radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = Math.random() > 0.5 ? purple : cyan;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: 0.025,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        depthWrite: false
      })
    );

    scene.add(particles);

    // Responsive canvas
    function resizeScene() {
      if (!renderer || !camera) return;

      const width = heroVisual.clientWidth;
      const height = heroVisual.clientHeight;

      if (!width || !height) return;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 500 ? 9.5 : 8;
      camera.updateProjectionMatrix();
    }

    resizeScene();

    const resizeObserver = new ResizeObserver(resizeScene);
    resizeObserver.observe(heroVisual);

    // Mouse and touch interaction
    heroVisual.addEventListener("pointermove", (event) => {
      const rect = heroVisual.getBoundingClientRect();

      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    heroVisual.addEventListener("pointerleave", () => {
      pointerX = 0;
      pointerY = 0;
    });

    // Animation loop
    const clock = new THREE.Clock();

    function animate() {
      animationId = requestAnimationFrame(animate);

      const t = clock.getElapsedTime();

      targetX += (pointerY * 0.25 - targetX) * 0.035;
      targetY += (pointerX * 0.35 - targetY) * 0.035;

      core.rotation.x += 0.0025;
      core.rotation.y += 0.004;

      core.rotation.x += (targetX - core.rotation.x) * 0.008;
      core.rotation.y += (targetY - core.rotation.y) * 0.008;

      rings.rotation.y = t * 0.12 + targetY;
      rings.rotation.x = Math.sin(t * 0.2) * 0.12;

      particles.rotation.y = t * 0.025;
      particles.rotation.x = Math.sin(t * 0.12) * 0.07;

      inner.scale.setScalar(1 + Math.sin(t * 1.5) * 0.025);

      renderer.render(scene, camera);
    }

    animate();

    // Avoid wasting resources when the tab is hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        clock.getDelta();
        animate();
      }
    });

  } catch (error) {
    console.error("3D scene could not start:", error);
    heroVisual.classList.add("scene-fallback");
  }
}

// ==========================================
// 2. ROTATING HERO TEXT
// ==========================================

const typedRole = document.getElementById("typedRole");

if (typedRole) {
  const roles = [
    "intelligent systems.",
    "GenAI applications.",
    "machine learning models.",
    "data-driven solutions.",
    "full-stack products."
  ];

  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = false;

  function typeEffect() {
    const current = roles[roleIndex];

    if (deleting) {
      charIndex--;
    } else {
      charIndex++;
    }

    typedRole.textContent = current.slice(0, charIndex);

    let delay = deleting ? 35 : 65;

    if (!deleting && charIndex === current.length) {
      deleting = true;
      delay = 1500;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 350;
    }

    setTimeout(typeEffect, delay);
  }

  setTimeout(typeEffect, 1400);
}

// ==========================================
// 3. SCROLL REVEAL ANIMATIONS
// ==========================================

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

// ==========================================
// 4. MOBILE NAVIGATION
// ==========================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.textContent = isOpen ? "✕" : "☰";
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.textContent = "☰";
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ==========================================
// 5. SCROLL PROGRESS BAR
// ==========================================

const scrollProgress = document.getElementById("scrollProgress");

function updateScrollProgress() {
  const scrollable =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress =
    scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;

  if (scrollProgress) {
    scrollProgress.style.width = `${progress}%`;
  }
}

window.addEventListener("scroll", updateScrollProgress, {
  passive: true
});

updateScrollProgress();

// ==========================================
// 6. FOOTER YEAR
// ==========================================

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
