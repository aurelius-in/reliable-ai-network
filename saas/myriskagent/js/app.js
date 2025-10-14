// MyRiskAgent Demo - Main Application Logic
// This file handles the core application initialization and coordination

class MyRiskAgentDemo {
    constructor() {
        this.currentTab = 'overview';
        this.currentOrg = 'demo-org';
        this.init();
    }

    init() {
        this.setupSplashScreen();
        this.setupTabs();
        this.setupOrgSelector();
        this.setupKeyboardShortcuts();
        this.setupAnimations();
        console.log('MyRiskAgent Demo initialized');
    }

    setupSplashScreen() {
        // Hide splash screen after 5 seconds
        setTimeout(() => {
            const splash = document.getElementById('splash');
            const app = document.getElementById('app');
            
            if (splash && app) {
                splash.style.opacity = '0';
                setTimeout(() => {
                    splash.style.display = 'none';
                    app.style.display = 'flex';
                }, 500);
            }
        }, 5000);
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(tabName);
        
        if (activeTab) activeTab.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
        
        this.currentTab = tabName;
        console.log('Switched to tab:', tabName);
    }

    setupOrgSelector() {
        const orgSelector = document.getElementById('orgSelector');
        if (orgSelector) {
            orgSelector.addEventListener('change', (e) => {
                this.currentOrg = e.target.value;
                console.log('Organization changed to:', this.currentOrg);
                this.refreshData();
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                const tabMap = {
                    '1': 'overview',
                    '2': 'scores',
                    '3': 'drivers',
                    '4': 'documents',
                    '5': 'ask',
                    '6': 'providers',
                    '7': 'status'
                };
                
                const targetTab = tabMap[e.key];
                if (targetTab) {
                    e.preventDefault();
                    this.switchTab(targetTab);
                }
            }
        });
    }

    setupAnimations() {
        // Gauge circle hover effects
        const gaugeCircles = document.querySelectorAll('.gauge-circle');
        gaugeCircles.forEach(circle => {
            circle.addEventListener('mouseenter', () => {
                circle.style.transform = 'scale(1.1)';
                circle.style.transition = 'transform 0.3s ease';
            });
            circle.addEventListener('mouseleave', () => {
                circle.style.transform = 'scale(1)';
            });
        });

        // Document card interactions
        const documentCards = document.querySelectorAll('.document-card');
        documentCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
                card.style.transition = 'transform 0.3s ease';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    refreshData() {
        // In a real app, this would refresh data based on selected organization
        console.log('Refreshing data for organization:', this.currentOrg);
    }

    // Public methods for external use
    runWhatIfAnalysis() {
        alert('What If Analysis would run here in the real application. This would show projected risk scores based on the selected scenario.');
    }

    viewDocument(docId) {
        alert('Document viewer would open here in the real application. Document ID: ' + docId);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.myRiskAgent = new MyRiskAgentDemo();
});

// Global functions for HTML onclick handlers
function runWhatIf() {
    if (window.myRiskAgent) {
        window.myRiskAgent.runWhatIfAnalysis();
    }
}

function viewDocument(docId) {
    if (window.myRiskAgent) {
        window.myRiskAgent.viewDocument(docId);
    }
}
