/* ============================================
   AB Ultra AI Tech — 3D Engine
   Three.js Scene + GSAP ScrollTrigger + 3D Card Tilt
   ============================================ */

(function () {
    'use strict';

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

    // =========================================
    // 1. THREE.JS 3D BACKGROUND
    // =========================================
    let scene, camera, renderer, particles, geometries = [];
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const clock = new THREE.Clock();

    function initThree() {
        const canvas = document.getElementById('bg3d');
        if (!canvas || isReduced) return;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x06060f, 0.0008);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(0, 0, 500);

        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: !isMobile,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

        createParticles();
        createFloatingGeometries();
        createLights();

        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
    }

    function createParticles() {
        const count = isMobile ? 800 : 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const color1 = new THREE.Color(0x6c5ce7);
        const color2 = new THREE.Color(0x00cec9);
        const color3 = new THREE.Color(0xa855f7);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 2000;
            positions[i3 + 1] = (Math.random() - 0.5) * 2000;
            positions[i3 + 2] = (Math.random() - 0.5) * 1500;

            const t = Math.random();
            const c = t < 0.33 ? color1 : t < 0.66 ? color2 : color3;
            colors[i3] = c.r;
            colors[i3 + 1] = c.g;
            colors[i3 + 2] = c.b;

            sizes[i] = Math.random() * 3 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);
    }

    function createFloatingGeometries() {
        const geoTypes = [
            () => new THREE.IcosahedronGeometry(25, 1),
            () => new THREE.OctahedronGeometry(20, 0),
            () => new THREE.TorusGeometry(18, 5, 8, 16),
            () => new THREE.TetrahedronGeometry(22, 0),
            () => new THREE.DodecahedronGeometry(18, 0),
            () => new THREE.TorusKnotGeometry(15, 4, 64, 8, 2, 3),
        ];

        const colors = [0x6c5ce7, 0x00cec9, 0xa855f7, 0x6c5ce7, 0x00cec9, 0xa855f7];
        const count = isMobile ? 3 : 6;

        for (let i = 0; i < count; i++) {
            const geo = geoTypes[i % geoTypes.length]();
            const mat = new THREE.MeshPhongMaterial({
                color: colors[i % colors.length],
                wireframe: true,
                transparent: true,
                opacity: 0.15 + Math.random() * 0.1,
                emissive: colors[i % colors.length],
                emissiveIntensity: 0.1,
            });

            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                (Math.random() - 0.5) * 800,
                (Math.random() - 0.5) * 800,
                (Math.random() - 0.5) * 400 - 200
            );

            mesh.userData = {
                rotSpeed: { x: (Math.random() - 0.5) * 0.005, y: (Math.random() - 0.5) * 0.005, z: (Math.random() - 0.5) * 0.003 },
                driftSpeed: { x: (Math.random() - 0.5) * 0.15, y: (Math.random() - 0.5) * 0.15 },
                originalPos: mesh.position.clone()
            };

            geometries.push(mesh);
            scene.add(mesh);
        }
    }

    function createLights() {
        const ambient = new THREE.AmbientLight(0x222244, 0.5);
        scene.add(ambient);

        const dir1 = new THREE.DirectionalLight(0x6c5ce7, 0.4);
        dir1.position.set(100, 200, 300);
        scene.add(dir1);

        const dir2 = new THREE.DirectionalLight(0x00cec9, 0.3);
        dir2.position.set(-100, -100, 200);
        scene.add(dir2);

        const point = new THREE.PointLight(0xa855f7, 0.3, 1000);
        point.position.set(0, 0, 300);
        scene.add(point);
    }

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();

        // Smooth mouse follow
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;

        // Camera parallax
        camera.position.x = mouse.x * 50;
        camera.position.y = -mouse.y * 30;
        camera.lookAt(scene.position);

        // Scroll-driven camera Y offset
        const scrollY = window.scrollY || window.pageYOffset;
        camera.position.z = 500 - scrollY * 0.15;

        // Rotate particles
        if (particles) {
            particles.rotation.y = time * 0.02;
            particles.rotation.x = time * 0.01;
        }

        // Animate floating geometries
        geometries.forEach((mesh) => {
            const d = mesh.userData;
            mesh.rotation.x += d.rotSpeed.x;
            mesh.rotation.y += d.rotSpeed.y;
            mesh.rotation.z += d.rotSpeed.z;
            mesh.position.x = d.originalPos.x + Math.sin(time * 0.3 + d.originalPos.x * 0.01) * 30;
            mesh.position.y = d.originalPos.y + Math.cos(time * 0.25 + d.originalPos.y * 0.01) * 25;
        });

        renderer.render(scene, camera);
    }

    // =========================================
    // 2. GSAP SCROLL ANIMATIONS
    // =========================================
    function initScrollAnimations() {
        if (isReduced || typeof gsap === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        // Hero entrance
        gsap.to('[data-scroll-anim="hero"]', {
            opacity: 1, y: 0, rotateX: 0,
            duration: 1.4, ease: 'power3.out',
            delay: 0.3
        });

        // Section headers
        gsap.utils.toArray('[data-scroll-anim="header"]').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
                opacity: 1, y: 0, duration: 0.9, ease: 'power3.out'
            });
        });

        // Cards stagger
        const cards = gsap.utils.toArray('[data-scroll-anim="card"]');
        cards.forEach((card, i) => {
            gsap.to(card, {
                scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' },
                opacity: 1, y: 0, rotateY: 0, scale: 1,
                duration: 0.8,
                delay: (i % 3) * 0.12,
                ease: 'power3.out'
            });
        });

        // CTA
        gsap.utils.toArray('[data-scroll-anim="cta"]').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
                opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out'
            });
        });
    }

    // =========================================
    // 3. 3D CARD TILT EFFECT
    // =========================================
    function initCardTilt() {
        if (isMobile || isReduced) return;

        const cards = document.querySelectorAll('.card-3d');

        cards.forEach(card => {
            const shine = card.querySelector('.card-shine');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

                if (shine) {
                    const percentX = (x / rect.width) * 100;
                    const percentY = (y / rect.height) * 100;
                    shine.style.setProperty('--mouse-x', percentX + '%');
                    shine.style.setProperty('--mouse-y', percentY + '%');
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }

    // =========================================
    // 4. COUNTER ANIMATIONS
    // =========================================
    function initCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        if (!counters.length) return;

        const animateCounter = (el) => {
            const target = parseInt(el.getAttribute('data-count'));
            const duration = 2000;
            const start = performance.now();

            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 4);
                el.textContent = Math.round(target * eased);
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            counters.forEach(c => observer.observe(c));
        } else {
            counters.forEach(animateCounter);
        }
    }

    // =========================================
    // 5. NAVIGATION
    // =========================================
    function initNavigation() {
        const navbar = document.getElementById('navbar');
        const toggle = document.getElementById('navToggle');
        const links = document.getElementById('navLinks');

        // Scroll effect
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const scroll = window.scrollY;
            if (scroll > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
            lastScroll = scroll;
        }, { passive: true });

        // Mobile toggle
        if (toggle && links) {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                links.classList.toggle('active');
            });

            links.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    toggle.classList.remove('active');
                    links.classList.remove('active');
                });
            });
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // =========================================
    // INIT
    // =========================================
    document.addEventListener('DOMContentLoaded', () => {
        initThree();
        initScrollAnimations();
        initCardTilt();
        initCounters();
        initNavigation();
    });

})();
