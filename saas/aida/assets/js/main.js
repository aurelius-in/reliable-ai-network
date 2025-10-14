// Main JavaScript for aiDa Demo
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initDemoTabs();
    initArchitectureTabs();
    initPricingToggle();
    initModal();
    initAnimations();
    initFormHandling();
    initScrollEffects();
});

// Navigation functionality
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Mobile menu toggle
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
}

// Demo tabs functionality
function initDemoTabs() {
    const demoTabs = document.querySelectorAll('.demo-tab');
    const demoPanels = document.querySelectorAll('.demo-panel');
    
    demoTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetPanel = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panels
            demoTabs.forEach(t => t.classList.remove('active'));
            demoPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            this.classList.add('active');
            const panel = document.getElementById(targetPanel + '-panel');
            if (panel) {
                panel.classList.add('active');
            }
        });
    });
    
    // Simulate real-time data updates
    simulateRealTimeUpdates();
}

// Architecture tabs functionality
function initArchitectureTabs() {
    const archTabs = document.querySelectorAll('.arch-tab');
    const archPanels = document.querySelectorAll('.arch-panel');
    
    archTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetPanel = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panels
            archTabs.forEach(t => t.classList.remove('active'));
            archPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            this.classList.add('active');
            const panel = document.getElementById(targetPanel + '-panel');
            if (panel) {
                panel.classList.add('active');
            }
        });
    });
}

// Pricing toggle functionality
function initPricingToggle() {
    const pricingToggle = document.getElementById('pricing-toggle');
    const monthlyPrices = document.querySelectorAll('.price-amount.monthly');
    const annualPrices = document.querySelectorAll('.price-amount.annual');
    
    if (pricingToggle) {
        pricingToggle.addEventListener('change', function() {
            if (this.checked) {
                // Show annual prices
                monthlyPrices.forEach(price => price.style.display = 'none');
                annualPrices.forEach(price => price.style.display = 'block');
            } else {
                // Show monthly prices
                monthlyPrices.forEach(price => price.style.display = 'block');
                annualPrices.forEach(price => price.style.display = 'none');
            }
        });
    }
}

// Modal functionality
function initModal() {
    const modal = document.getElementById('architecture-modal');
    const modalClose = document.querySelector('.modal-close');
    const docTabs = document.querySelectorAll('.doc-tab');
    const docPanels = document.querySelectorAll('.doc-panel');
    
    // Open modal function
    window.openArchitectureDocs = function() {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    };
    
    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });
    
    // Document tabs within modal
    docTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetDoc = this.getAttribute('data-doc');
            
            // Remove active class from all tabs and panels
            docTabs.forEach(t => t.classList.remove('active'));
            docPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            this.classList.add('active');
            const panel = document.getElementById(targetDoc);
            if (panel) {
                panel.classList.add('active');
            }
        });
    });
    
    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// Animation initialization
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .pricing-card, .dashboard-card, .agent-card');
    animateElements.forEach(el => observer.observe(el));
    
    // Counter animation for stats
    animateCounters();
}

// Counter animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .demo-stat-value, .metric-value');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
        
        // Start animation when element is visible
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

// Form handling
function initFormHandling() {
    const trialForm = document.querySelector('.trial-form');
    
    if (trialForm) {
        trialForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Simulate form submission
            showNotification('Thank you! Your free trial request has been submitted. We\'ll contact you within 24 hours.', 'success');
            
            // Reset form
            this.reset();
        });
    }
}

// Scroll effects
function initScrollEffects() {
    // Parallax effect for hero background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.gradient-orb');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    
    // Sticky navigation
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Simulate real-time updates
function simulateRealTimeUpdates() {
    const demoStats = document.querySelectorAll('.demo-stat-value');
    const activityItems = document.querySelectorAll('.activity-item');
    
    // Update stats periodically
    setInterval(() => {
        demoStats.forEach(stat => {
            const currentValue = parseInt(stat.textContent.replace(/[^\d]/g, ''));
            const newValue = currentValue + Math.floor(Math.random() * 5);
            stat.textContent = newValue.toLocaleString();
        });
    }, 10000);
    
    // Add new activity items
    setInterval(() => {
        const activities = [
            { icon: '✅', title: 'Document Processed', time: 'Just now' },
            { icon: '⚡', title: 'AI Agent Completed', time: '1 minute ago' },
            { icon: '📊', title: 'Report Generated', time: '2 minutes ago' },
            { icon: '🔍', title: 'Risk Assessment', time: '3 minutes ago' }
        ];
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const activityContainer = document.querySelector('.demo-activity');
        
        if (activityContainer) {
            const newActivity = document.createElement('div');
            newActivity.className = 'activity-item';
            newActivity.innerHTML = `
                <div class="activity-icon">${randomActivity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${randomActivity.title}</div>
                    <div class="activity-time">${randomActivity.time}</div>
                </div>
            `;
            
            // Add to top of list
            activityContainer.insertBefore(newActivity, activityContainer.firstChild);
            
            // Remove last item if more than 3
            const items = activityContainer.querySelectorAll('.activity-item');
            if (items.length > 3) {
                activityContainer.removeChild(items[items.length - 1]);
            }
        }
    }, 15000);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance monitoring
function initPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
        
        // Track Core Web Vitals
        if ('web-vitals' in window) {
            getCLS(console.log);
            getFID(console.log);
            getFCP(console.log);
            getLCP(console.log);
            getTTFB(console.log);
        }
    });
}

// Initialize performance monitoring
initPerformanceMonitoring();

// Architecture document content
const architectureDocs = {
    'solution-design': {
        title: 'Solution Design',
        content: `
            <h3>Solution Design Architecture</h3>
            <p>aiDa is a next-generation intelligent document processing platform built on a modern, cloud-native architecture that leverages advanced AI agents to transform enterprise document workflows.</p>
            
            <h4>High-Level Architecture</h4>
            <div class="architecture-diagram">
                <div class="arch-layer">
                    <h5>Presentation Layer</h5>
                    <div class="arch-components">
                        <div class="arch-component">React Frontend</div>
                        <div class="arch-component">Mobile Apps</div>
                        <div class="arch-component">API Gateway</div>
                        <div class="arch-component">CDN</div>
                    </div>
                </div>
                
                <div class="arch-layer">
                    <h5>Application Layer</h5>
                    <div class="arch-components">
                        <div class="arch-component">AI Agent Orchestrator</div>
                        <div class="arch-component">Document Processor</div>
                        <div class="arch-component">Analytics Engine</div>
                        <div class="arch-component">Auth Service</div>
                    </div>
                </div>
                
                <div class="arch-layer">
                    <h5>Data Layer</h5>
                    <div class="arch-components">
                        <div class="arch-component">Vector Database</div>
                        <div class="arch-component">Document Store</div>
                        <div class="arch-component">Analytics DB</div>
                        <div class="arch-component">Cache Layer</div>
                    </div>
                </div>
            </div>
            
            <h4>Core Design Principles</h4>
            <ul>
                <li><strong>Microservices Architecture:</strong> Loosely coupled, independently deployable services</li>
                <li><strong>Event-Driven Design:</strong> Asynchronous processing with message queues</li>
                <li><strong>API-First Approach:</strong> RESTful APIs with OpenAPI specifications</li>
                <li><strong>Cloud-Native:</strong> Containerized services with Kubernetes orchestration</li>
                <li><strong>Security by Design:</strong> Zero-trust architecture with end-to-end encryption</li>
            </ul>
            
            <h4>Performance Metrics</h4>
            <div class="metrics-grid">
                <div class="metric-item">
                    <div class="metric-value">99.9%</div>
                    <div class="metric-label">Uptime SLA</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">&lt;2s</div>
                    <div class="metric-label">Response Time</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">10,000+</div>
                    <div class="metric-label">Documents/Minute</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">10,000+</div>
                    <div class="metric-label">Concurrent Users</div>
                </div>
            </div>
        `
    },
    'data-flow': {
        title: 'Data Flow Architecture',
        content: `
            <h3>Data Flow Architecture</h3>
            <p>The aiDa data flow architecture is designed to handle high-volume, real-time document processing with end-to-end data lineage tracking, ensuring data integrity, security, and compliance throughout the entire processing pipeline.</p>
            
            <h4>Data Flow Overview</h4>
            <div class="flow-diagram">
                <div class="flow-step">
                    <div class="step-icon">📄</div>
                    <div class="step-title">Document Input</div>
                    <div class="step-description">Multi-format document ingestion</div>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                    <div class="step-icon">🔍</div>
                    <div class="step-title">Validation</div>
                    <div class="step-description">Security & format validation</div>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                    <div class="step-icon">⚙️</div>
                    <div class="step-title">Processing</div>
                    <div class="step-description">AI agent processing</div>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                    <div class="step-icon">💾</div>
                    <div class="step-title">Storage</div>
                    <div class="step-description">Multi-tier storage</div>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                    <div class="step-icon">📊</div>
                    <div class="step-title">Output</div>
                    <div class="step-description">Results delivery</div>
                </div>
            </div>
            
            <h4>Processing Performance</h4>
            <div class="performance-stats">
                <div class="stat-item">
                    <div class="stat-number">1M+</div>
                    <div class="stat-label">Documents Processed Daily</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">&lt;2s</div>
                    <div class="stat-label">Average Processing Time</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">99.7%</div>
                    <div class="stat-label">Processing Accuracy</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">15min</div>
                    <div class="stat-label">Recovery Point Objective</div>
                </div>
            </div>
            
            <h4>Data Security</h4>
            <ul>
                <li><strong>Encryption at Rest:</strong> AES-256 encryption for all stored data</li>
                <li><strong>Encryption in Transit:</strong> TLS 1.3 for all data transmission</li>
                <li><strong>Data Lineage:</strong> Complete audit trail for all data transformations</li>
                <li><strong>Access Controls:</strong> Role-based access with principle of least privilege</li>
            </ul>
        `
    },
    'security': {
        title: 'Security Architecture',
        content: `
            <h3>Security Architecture</h3>
            <p>The aiDa security architecture implements a comprehensive, defense-in-depth approach to protect enterprise data and ensure regulatory compliance. Built on zero-trust principles, the system provides end-to-end encryption, multi-layered access controls, and continuous monitoring.</p>
            
            <h4>Security Framework</h4>
            <div class="security-layers">
                <div class="security-layer">
                    <h5>Application Security</h5>
                    <div class="security-features">
                        <span class="feature-tag">API Security</span>
                        <span class="feature-tag">Authentication</span>
                        <span class="feature-tag">Authorization</span>
                        <span class="feature-tag">WAF</span>
                    </div>
                </div>
                
                <div class="security-layer">
                    <h5>Network Security</h5>
                    <div class="security-features">
                        <span class="feature-tag">VPC Isolation</span>
                        <span class="feature-tag">Firewalls</span>
                        <span class="feature-tag">DDoS Protection</span>
                        <span class="feature-tag">VPN</span>
                    </div>
                </div>
                
                <div class="security-layer">
                    <h5>Data Security</h5>
                    <div class="security-features">
                        <span class="feature-tag">Encryption</span>
                        <span class="feature-tag">Key Management</span>
                        <span class="feature-tag">Data Masking</span>
                        <span class="feature-tag">Backup</span>
                    </div>
                </div>
                
                <div class="security-layer">
                    <h5>Infrastructure Security</h5>
                    <div class="security-features">
                        <span class="feature-tag">Container Security</span>
                        <span class="feature-tag">OS Hardening</span>
                        <span class="feature-tag">Monitoring</span>
                        <span class="feature-tag">SIEM</span>
                    </div>
                </div>
            </div>
            
            <h4>Compliance Certifications</h4>
            <div class="compliance-badges">
                <div class="compliance-badge">
                    <div class="badge-icon">🏛️</div>
                    <div class="badge-title">SOC 2 Type II</div>
                    <div class="badge-status">Certified</div>
                </div>
                <div class="compliance-badge">
                    <div class="badge-icon">🇪🇺</div>
                    <div class="badge-title">GDPR Compliant</div>
                    <div class="badge-status">Certified</div>
                </div>
                <div class="compliance-badge">
                    <div class="badge-icon">🇺🇸</div>
                    <div class="badge-title">HIPAA Ready</div>
                    <div class="badge-status">Certified</div>
                </div>
                <div class="compliance-badge">
                    <div class="badge-icon">🔒</div>
                    <div class="badge-title">ISO 27001</div>
                    <div class="badge-status">Certified</div>
                </div>
            </div>
            
            <h4>Security Features</h4>
            <ul>
                <li><strong>Multi-Factor Authentication:</strong> TOTP, SMS, and hardware token support</li>
                <li><strong>Role-Based Access Control:</strong> Granular permissions and access management</li>
                <li><strong>Data Encryption:</strong> AES-256 at rest, TLS 1.3 in transit</li>
                <li><strong>Audit Logging:</strong> Comprehensive audit trails for compliance</li>
                <li><strong>Threat Detection:</strong> Real-time security monitoring and alerting</li>
            </ul>
        `
    },
    'deployment': {
        title: 'Deployment Architecture',
        content: `
            <h3>Deployment Architecture</h3>
            <p>The aiDa deployment architecture is designed for enterprise-scale, cloud-native deployment with high availability, scalability, and disaster recovery capabilities. The system supports both cloud and hybrid deployments with automated CI/CD pipelines.</p>
            
            <h4>Deployment Models</h4>
            <div class="deployment-models">
                <div class="deployment-model">
                    <h5>Cloud-Native (Primary)</h5>
                    <p>Fully managed cloud deployment with auto-scaling and high availability</p>
                    <div class="model-features">
                        <span class="feature-tag">AWS/GCP/Azure</span>
                        <span class="feature-tag">Kubernetes</span>
                        <span class="feature-tag">Auto-scaling</span>
                    </div>
                </div>
                
                <div class="deployment-model">
                    <h5>Hybrid Cloud</h5>
                    <p>On-premise + cloud hybrid deployment for data sovereignty</p>
                    <div class="model-features">
                        <span class="feature-tag">On-premise</span>
                        <span class="feature-tag">Cloud Integration</span>
                        <span class="feature-tag">Data Sync</span>
                    </div>
                </div>
                
                <div class="deployment-model">
                    <h5>Multi-Cloud</h5>
                    <p>Cross-cloud provider deployment for maximum resilience</p>
                    <div class="model-features">
                        <span class="feature-tag">Multi-region</span>
                        <span class="feature-tag">Disaster Recovery</span>
                        <span class="feature-tag">Load Balancing</span>
                    </div>
                </div>
            </div>
            
            <h4>CI/CD Pipeline</h4>
            <div class="pipeline-flow">
                <div class="pipeline-step">
                    <div class="step-icon">📝</div>
                    <div class="step-title">Git</div>
                </div>
                <div class="pipeline-arrow">→</div>
                <div class="pipeline-step">
                    <div class="step-icon">🔨</div>
                    <div class="step-title">Build</div>
                </div>
                <div class="pipeline-arrow">→</div>
                <div class="pipeline-step">
                    <div class="step-icon">🧪</div>
                    <div class="step-title">Test</div>
                </div>
                <div class="pipeline-arrow">→</div>
                <div class="pipeline-step">
                    <div class="step-icon">🔒</div>
                    <div class="step-title">Security Scan</div>
                </div>
                <div class="pipeline-arrow">→</div>
                <div class="pipeline-step">
                    <div class="step-icon">🚀</div>
                    <div class="step-title">Deploy</div>
                </div>
                <div class="pipeline-arrow">→</div>
                <div class="pipeline-step">
                    <div class="step-icon">📊</div>
                    <div class="step-title">Monitor</div>
                </div>
            </div>
            
            <h4>Infrastructure as Code</h4>
            <ul>
                <li><strong>Terraform:</strong> Infrastructure provisioning and management</li>
                <li><strong>Kubernetes:</strong> Container orchestration and management</li>
                <li><strong>Helm:</strong> Application packaging and deployment</li>
                <li><strong>ArgoCD:</strong> GitOps-based continuous deployment</li>
            </ul>
            
            <h4>Disaster Recovery</h4>
            <div class="dr-metrics">
                <div class="dr-metric">
                    <div class="metric-value">4 hours</div>
                    <div class="metric-label">Recovery Time Objective (RTO)</div>
                </div>
                <div class="dr-metric">
                    <div class="metric-value">15 minutes</div>
                    <div class="metric-label">Recovery Point Objective (RPO)</div>
                </div>
                <div class="dr-metric">
                    <div class="metric-value">99.9%</div>
                    <div class="metric-label">Availability SLA</div>
                </div>
            </div>
        `
    }
};

// Enhanced modal functionality with document content
function initModal() {
    const modal = document.getElementById('architecture-modal');
    const modalClose = document.querySelector('.modal-close');
    const docTabs = document.querySelectorAll('.doc-tab');
    const docPanels = document.querySelectorAll('.doc-panel');
    
    // Open modal function
    window.openArchitectureDocs = function() {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            loadDocumentContent('solution-design');
        }
    };
    
    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });
    
    // Document tabs within modal
    docTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetDoc = this.getAttribute('data-doc');
            
            // Remove active class from all tabs and panels
            docTabs.forEach(t => t.classList.remove('active'));
            docPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            this.classList.add('active');
            loadDocumentContent(targetDoc);
        });
    });
    
    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    function loadDocumentContent(docType) {
        const docContent = document.querySelector('.docs-content');
        if (docContent && architectureDocs[docType]) {
            const doc = architectureDocs[docType];
            docContent.innerHTML = `
                <div class="doc-panel active" id="${docType}">
                    ${doc.content}
                </div>
            `;
        }
    }
}

// Export functions for global access
window.aiDaDemo = {
    showNotification,
    openArchitectureDocs,
    debounce,
    throttle
};
