// Value Proposition Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initCounterAnimations();
    initScrollAnimations();
    initParallaxEffects();
    initInteractiveElements();
});

// Counter Animation for Statistics
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number, .metric-value, .roi-value');
    
    const animateCounter = (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format the number based on its type
            if (element.textContent.includes('%')) {
                element.textContent = Math.floor(current) + '%';
            } else if (element.textContent.includes('$')) {
                element.textContent = '$' + Math.floor(current).toLocaleString();
            } else if (element.textContent.includes('M')) {
                element.textContent = Math.floor(current) + 'M';
            } else if (element.textContent.includes('B')) {
                element.textContent = Math.floor(current) + 'B';
            } else if (element.textContent.includes('K')) {
                element.textContent = Math.floor(current) + 'K';
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    };
    
    // Intersection Observer for counter animations
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent;
                let target = 0;
                
                // Extract numeric value from text
                if (text.includes('820%')) target = 820;
                else if (text.includes('$2.3M')) target = 2.3;
                else if (text.includes('99.2%')) target = 99.2;
                else if (text.includes('85%')) target = 85;
                else if (text.includes('$28.7B')) target = 28.7;
                else if (text.includes('500+')) target = 500;
                else if (text.includes('$1.2M')) target = 1.2;
                else if (text.includes('700%')) target = 700;
                else if (text.includes('188%')) target = 188;
                else if (text.includes('443%')) target = 443;
                else if (text.includes('$4.1M')) target = 4.1;
                else if (text.includes('$1.4M')) target = 1.4;
                else if (text.includes('$2.7M')) target = 2.7;
                else if (text.includes('$3.5M')) target = 3.5;
                else if (text.includes('$4.3M')) target = 4.3;
                else if (text.includes('$8.2M')) target = 8.2;
                else if (text.includes('92%')) target = 92;
                else if (text.includes('$3.2M')) target = 3.2;
                else if (text.includes('99.998%')) target = 99.998;
                else if (text.includes('98%')) target = 98;
                else if (text.includes('$12.5M')) target = 12.5;
                else if (text.includes('42%')) target = 42;
                else if (text.includes('100%')) target = 100;
                else if (text.includes('99%')) target = 99;
                else if (text.includes('75%')) target = 75;
                else if (text.includes('3.2s')) target = 3.2;
                else if (text.includes('15%')) target = 15;
                else if (text.includes('1M+')) target = 1000000;
                else if (text.includes('10K+')) target = 10000;
                else if (text.includes('4.2')) target = 4.2;
                else if (text.includes('8.7')) target = 8.7;
                
                animateCounter(element, target);
                counterObserver.unobserve(element);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.market-card, .tech-card, .success-card, .roi-card, .competitive-card, .highlight-card');
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                animationObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        animationObserver.observe(element);
    });
}

// Parallax Effects
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.gradient-orb');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        parallaxElements.forEach((element, index) => {
            const speed = (index + 1) * 0.3;
            element.style.transform = `translateY(${rate * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    });
}

// Interactive Elements
function initInteractiveElements() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.market-card, .tech-card, .success-card, .roi-card, .competitive-card, .highlight-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-12px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add typing effect to hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const titleLines = heroTitle.querySelectorAll('.title-line');
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
        
        setTimeout(typeNextLine, 1000);
    }
}

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .title-line {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .title-line.animate-in {
        opacity: 1;
    }
    
    .gradient-orb {
        will-change: transform;
    }
    
    .market-card,
    .tech-card,
    .success-card,
    .roi-card,
    .competitive-card,
    .highlight-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .market-card:hover,
    .tech-card:hover,
    .success-card:hover,
    .roi-card:hover,
    .competitive-card:hover,
    .highlight-card:hover {
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
    }
    
    .hero-stats .stat-item {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .hero-stats .stat-item:hover {
        transform: translateY(-8px) scale(1.05);
    }
    
    .roi-badge {
        animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .competitive-icon,
    .market-icon,
    .tech-icon {
        transition: all 0.3s ease;
    }
    
    .competitive-card:hover .competitive-icon,
    .market-card:hover .market-icon,
    .tech-card:hover .tech-icon {
        transform: scale(1.1) rotate(5deg);
    }
    
    .success-metrics .metric {
        transition: all 0.3s ease;
    }
    
    .success-metrics .metric:hover {
        transform: scale(1.05);
        background: rgba(255, 255, 255, 0.05);
    }
    
    .highlight-number {
        transition: all 0.3s ease;
    }
    
    .highlight-card:hover .highlight-number {
        transform: scale(1.1) rotate(360deg);
    }
`;

document.head.appendChild(style);

// Add performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
            console.log('Value Proposition Page load time:', entry.loadEventEnd - entry.loadEventStart, 'ms');
        }
    }
});

performanceObserver.observe({ entryTypes: ['navigation'] });

// Add error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error on value proposition page:', e.error);
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any open modals or overlays
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
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
