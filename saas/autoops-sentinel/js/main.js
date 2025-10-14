// Main JavaScript for AutoOps Sentinel Demo

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initDemoTabs();
    initSmoothScrolling();
    initAnimations();
    initTypingEffect();
});

// Demo Tabs Functionality
function initDemoTabs() {
    const tabs = document.querySelectorAll('.demo-tab');
    const panels = document.querySelectorAll('.demo-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remove active class from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            tab.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Intersection Observer for Animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .stat-item, .demo-panel');
    animateElements.forEach(el => observer.observe(el));
}

// Typing Effect for Hero Title
function initTypingEffect() {
    const titleLines = document.querySelectorAll('.title-line');
    let currentLine = 0;
    
    function typeNextLine() {
        if (currentLine < titleLines.length) {
            const line = titleLines[currentLine];
            const text = line.textContent;
            line.textContent = '';
            line.style.opacity = '1';
            
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    line.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                    currentLine++;
                    setTimeout(typeNextLine, 500);
                }
            }, 100);
        }
    }
    
    // Start typing effect after a short delay
    setTimeout(typeNextLine, 1000);
}

// Counter Animation for Stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        const suffix = counter.textContent.replace(/[\d]/g, '');
        let current = 0;
        const increment = target / 100;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + suffix;
            }
        };
        
        updateCounter();
    });
}

// Parallax Effect for Hero Background
function initParallax() {
    const orbs = document.querySelectorAll('.gradient-orb');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 0.3;
            orb.style.transform = `translateY(${rate * speed}px)`;
        });
    });
}

// Initialize parallax effect
initParallax();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .feature-card, .stat-item, .demo-panel {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .feature-card.animate-in, .stat-item.animate-in, .demo-panel.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .title-line {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .title-line.animate-in {
        opacity: 1;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .brand-icon {
        animation: pulse 2s ease-in-out infinite;
    }
    
    .metric-card {
        transition: all 0.3s ease;
    }
    
    .metric-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }
    
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }
    
    .btn:hover::before {
        left: 100%;
    }
    
    .demo-gif {
        transition: transform 0.3s ease;
    }
    
    .demo-video:hover .demo-gif {
        transform: scale(1.02);
    }
    
    .gradient-orb {
        will-change: transform;
    }
    
    .feature-card::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(34, 197, 94, 0.1));
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    }
    
    .feature-card:hover::after {
        opacity: 1;
    }
    
    .nav-link {
        position: relative;
    }
    
    .nav-link::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(14, 165, 233, 0.1);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
    }
    
    .nav-link:hover::before {
        width: 100px;
        height: 100px;
    }
    
    .play-button {
        position: relative;
        overflow: hidden;
    }
    
    .play-button::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
    }
    
    .play-button:hover::before {
        width: 100%;
        height: 100%;
    }
    
    .stat-item {
        position: relative;
        overflow: hidden;
    }
    
    .stat-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.1), transparent);
        transition: left 0.6s ease;
    }
    
    .stat-item:hover::before {
        left: 100%;
    }
    
    .hero-title {
        background: linear-gradient(135deg, #0ea5e9, #22c55e, #a78bfa);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradientShift 3s ease-in-out infinite;
    }
    
    @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }
    
    .section-title {
        background: linear-gradient(135deg, #0ea5e9, #22c55e, #a78bfa);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradientShift 3s ease-in-out infinite;
    }
    
    .cta-title {
        background: linear-gradient(135deg, #0ea5e9, #22c55e, #a78bfa);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradientShift 3s ease-in-out infinite;
    }
    
    .brand-text {
        background: linear-gradient(135deg, #0ea5e9, #22c55e, #a78bfa);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradientShift 3s ease-in-out infinite;
    }
`;

document.head.appendChild(style);

// Add scroll-triggered counter animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Add loaded class styles
    const loadedStyle = document.createElement('style');
    loadedStyle.textContent = `
        body {
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        
        body.loaded {
            opacity: 1;
        }
    `;
    document.head.appendChild(loadedStyle);
});

// Add keyboard navigation for demo tabs
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const activeTab = document.querySelector('.demo-tab.active');
        const tabs = Array.from(document.querySelectorAll('.demo-tab'));
        const currentIndex = tabs.indexOf(activeTab);
        
        let nextIndex;
        if (e.key === 'ArrowLeft') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
            nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }
        
        tabs[nextIndex].click();
    }
});

// Add touch/swipe support for mobile demo navigation
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        const activeTab = document.querySelector('.demo-tab.active');
        const tabs = Array.from(document.querySelectorAll('.demo-tab'));
        const currentIndex = tabs.indexOf(activeTab);
        
        let nextIndex;
        if (diff > 0) {
            // Swipe left - next tab
            nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        } else {
            // Swipe right - previous tab
            nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        }
        
        tabs[nextIndex].click();
    }
}

// Add performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
            console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart, 'ms');
        }
    }
});

performanceObserver.observe({ entryTypes: ['navigation'] });

// Add error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
});

// Add resize handler for responsive adjustments
window.addEventListener('resize', () => {
    // Recalculate any size-dependent elements
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && window.innerWidth < 768) {
        heroContent.style.gridTemplateColumns = '1fr';
    } else if (heroContent) {
        heroContent.style.gridTemplateColumns = '1fr 1fr';
    }
});

// Add accessibility improvements
document.addEventListener('keydown', (e) => {
    // Add focus management for demo tabs
    if (e.key === 'Tab' && e.target.classList.contains('demo-tab')) {
        e.target.style.outline = '2px solid #0ea5e9';
        e.target.style.outlineOffset = '2px';
    }
});

// Remove outline when clicking
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('demo-tab')) {
        e.target.style.outline = 'none';
    }
});

// Add reduced motion support
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Disable animations for users who prefer reduced motion
    const reducedMotionStyle = document.createElement('style');
    reducedMotionStyle.textContent = `
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    `;
    document.head.appendChild(reducedMotionStyle);
}
