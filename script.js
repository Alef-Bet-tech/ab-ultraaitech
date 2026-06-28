/* ============================================
   AB Ultra AI Tech — JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Navbar scroll behavior ----
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });

    // ---- Mobile nav toggle ----
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // ---- Scroll reveal for service cards ----
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation by card index
                const card = entry.target;
                const cardIndex = Array.from(card.parentElement.children).indexOf(card);
                setTimeout(() => {
                    card.classList.add('visible');
                }, cardIndex * 100);
                revealObserver.unobserve(card);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card').forEach(card => {
        revealObserver.observe(card);
    });

    // ---- Animated counter ----
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        counterObserver.observe(statsSection);
    }

    function animateCounters() {
        document.querySelectorAll('.stat-number[data-count]').forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'), 10);
            const duration = 1800;
            const start = performance.now();

            function step(timestamp) {
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(easedProgress * target);
                counter.textContent = current;
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }

            requestAnimationFrame(step);
        });
    }

    // ---- Mouse-follow glow on cards ----
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            card.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(108, 92, 231, 0.06), var(--bg-card) 60%)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.background = '';
        });
    });

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ---- Parallax subtle for bg glows ----
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const glow1 = document.querySelector('.bg-glow-1');
                const glow2 = document.querySelector('.bg-glow-2');
                if (glow1) glow1.style.transform = `translate(0, ${scrolled * 0.05}px)`;
                if (glow2) glow2.style.transform = `translate(0, ${-scrolled * 0.03}px)`;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

});
