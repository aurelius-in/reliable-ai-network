// AutoOps Sentinel Platform JavaScript

class AutoOpsPlatform {
    constructor() {
        this.currentTab = 'overview';
        this.currentMetric = 'cpu';
        this.chart = null;
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.startDataUpdates();
        this.hideLoadingOverlay();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Metric selector
        document.querySelectorAll('.metric-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchMetric(e.target.dataset.metric);
            });
        });

        // Chat interface
        const askButton = document.getElementById('ask-button');
        const chatInput = document.getElementById('chat-input');
        
        if (askButton) {
            askButton.addEventListener('click', () => {
                this.handleChatQuery();
            });
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleChatQuery();
                }
            });
        }
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active content
        document.querySelectorAll('.demo-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;
        this.loadTabData(tabName);
    }

    switchMetric(metricName) {
        // Update active metric button
        document.querySelectorAll('.metric-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-metric="${metricName}"]`).classList.add('active');

        this.currentMetric = metricName;
        this.updateMetricsChart();
    }

    loadInitialData() {
        this.updateStatusCards();
        this.updateSummary();
        this.updateMetricsChart();
        this.loadTabData(this.currentTab);
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'overview':
                this.updateOverviewData();
                break;
            case 'ops':
                this.updateOpsData();
                break;
            case 'agent':
                this.updateAgentData();
                break;
        }
    }

    updateStatusCards() {
        // Update status card values with animation
        this.animateCounter('anomalies-count', EnterpriseData.summary.anomalies);
        this.animateCounter('actions-count', EnterpriseData.summary.actions);
        this.animateCounter('incidents-count', EnterpriseData.summary.incidents);
        
        document.getElementById('availability-value').textContent = `${EnterpriseData.slo.availability_pct}%`;
        document.getElementById('latency-value').textContent = `${EnterpriseData.slo.latency_p95_ms}ms`;
        document.getElementById('ebr-value').textContent = `${EnterpriseData.slo.error_budget_remaining_pct}%`;
        document.getElementById('cost-value').textContent = `$${EnterpriseData.business.cost_avoided.toLocaleString()}`;
    }

    updateSummary() {
        document.getElementById('summary-anomalies').textContent = EnterpriseData.summary.anomalies;
        document.getElementById('summary-actions').textContent = EnterpriseData.summary.actions;
        document.getElementById('summary-incidents').textContent = EnterpriseData.summary.incidents;
    }

    updateOverviewData() {
        // Update forecast panel
        const forecastContent = document.querySelector('.forecast-content');
        if (forecastContent) {
            // Forecast data is static in this demo
        }
    }

    updateOpsData() {
        this.updateTimeline();
        this.updateAnomaliesTable();
        this.updateActionsTable();
        this.updateRunbooks();
        this.updatePolicies();
    }

    updateAgentData() {
        this.updateActionPlan();
        this.updateNarrative();
    }

    updateTimeline() {
        const timelineContent = document.getElementById('timeline-content');
        if (!timelineContent) return;

        timelineContent.innerHTML = EnterpriseData.timeline.map(item => `
            <div class="timeline-item">
                <div class="timeline-icon ${item.type}">
                    <i class="fas fa-${this.getTimelineIcon(item.type)}"></i>
                </div>
                <div class="timeline-content-text">
                    <div class="timeline-time">${item.time}</div>
                    <div class="timeline-text">${item.message}</div>
                </div>
            </div>
        `).join('');
    }

    updateAnomaliesTable() {
        const tableBody = document.getElementById('anomalies-table');
        if (!tableBody) return;

        tableBody.innerHTML = EnterpriseData.anomalies.slice(0, 10).map(anomaly => `
            <tr>
                <td>${new Date(anomaly.created_at).toLocaleTimeString()}</td>
                <td>${anomaly.metric}</td>
                <td style="color: ${this.getSeverityColor(anomaly.severity)}">${anomaly.severity}</td>
                <td style="text-align: right">${anomaly.score.toFixed(2)}</td>
            </tr>
        `).join('');
    }

    updateActionsTable() {
        const tableBody = document.getElementById('actions-table');
        if (!tableBody) return;

        tableBody.innerHTML = EnterpriseData.actions.map(action => `
            <tr>
                <td>${new Date(action.created_at).toLocaleTimeString()}</td>
                <td>${action.action}</td>
                <td style="color: ${this.getStatusColor(action.status)}">${action.status}</td>
                <td style="color: ${this.getResultColor(action.result)}">${action.result}</td>
            </tr>
        `).join('');
    }

    updateRunbooks() {
        const runbookContent = document.getElementById('runbook-content');
        if (!runbookContent) return;

        runbookContent.innerHTML = EnterpriseData.runbooks.map(runbook => `
            <div class="runbook-item">
                <div class="runbook-name">${runbook.name}</div>
                <div class="runbook-description">${runbook.description}</div>
            </div>
        `).join('');
    }

    updatePolicies() {
        const policiesContent = document.getElementById('policies-content');
        if (!policiesContent) return;

        policiesContent.innerHTML = EnterpriseData.policies.map(policy => `
            <div class="policy-item">
                <div class="policy-name">${policy.name}</div>
                <div class="policy-status ${policy.status}">${policy.status}</div>
            </div>
        `).join('');
    }

    updateActionPlan() {
        const planContent = document.getElementById('plan-content');
        if (!planContent) return;

        const currentPlan = EnterpriseData.actionPlans[0]; // Use first plan for demo
        planContent.innerHTML = currentPlan.steps.map(step => `
            <div class="plan-step">
                <div class="plan-step-number">${step.number}</div>
                <div class="plan-step-content">
                    <div class="plan-step-title">${step.title}</div>
                    <div class="plan-step-description">${step.description}</div>
                </div>
            </div>
        `).join('');
    }

    updateNarrative() {
        const narrativeContent = document.getElementById('narrative-content');
        if (!narrativeContent) return;

        narrativeContent.innerHTML = EnterpriseData.narratives.slice(0, 5).map(narrative => `
            <div class="narrative-item">
                <div class="narrative-bullet"></div>
                <div class="narrative-text">${narrative}</div>
            </div>
        `).join('');
    }

    updateMetricsChart() {
        const canvas = document.getElementById('metricsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = EnterpriseData.metrics[this.currentMetric];
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw chart
        this.drawLineChart(ctx, data, canvas.width, canvas.height);
    }

    drawLineChart(ctx, data, width, height) {
        if (!data || data.length === 0) return;

        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        // Find min/max values
        const values = data.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue;

        // Draw axes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw grid lines
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = height - padding - ((point.value - minValue) / valueRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();

        // Draw data points
        ctx.fillStyle = '#38bdf8';
        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = height - padding - ((point.value - minValue) / valueRange) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        
        // Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const value = minValue + (valueRange / 5) * (5 - i);
            const y = padding + (chartHeight / 5) * i;
            ctx.fillText(value.toFixed(1), padding - 10, y + 4);
        }

        // X-axis labels (time)
        const timeLabels = ['-15m', '-10m', '-5m', 'now'];
        timeLabels.forEach((label, index) => {
            const x = padding + (chartWidth / 3) * index;
            ctx.fillText(label, x, height - padding + 20);
        });
    }

    handleChatQuery() {
        const input = document.getElementById('chat-input');
        const response = document.getElementById('chat-response');
        
        if (!input || !response) return;

        const query = input.value.trim();
        if (!query) return;

        // Find matching response
        let chatResponse = EnterpriseData.chatResponses.default;
        for (const [key, value] of Object.entries(EnterpriseData.chatResponses)) {
            if (query.toLowerCase().includes(key.toLowerCase())) {
                chatResponse = value;
                break;
            }
        }

        // Display response
        response.innerHTML = `
            <div class="chat-message">
                <div class="chat-message-header">Query: ${query}</div>
                <div class="chat-message-content">${chatResponse.answer}</div>
            </div>
        `;

        // Clear input
        input.value = '';

        // Scroll to bottom
        response.scrollTop = response.scrollHeight;
    }

    startDataUpdates() {
        // Update data every 5 seconds
        this.updateInterval = setInterval(() => {
            this.updateStatusCards();
            this.updateSummary();
            this.updateMetricsChart();
            
            if (this.currentTab === 'ops') {
                this.updateOpsData();
            } else if (this.currentTab === 'agent') {
                this.updateAgentData();
            }
        }, 5000);
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;
        const increment = (targetValue - currentValue) / 20;
        let current = currentValue;

        const animate = () => {
            current += increment;
            if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
                element.textContent = targetValue;
            } else {
                element.textContent = Math.round(current);
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    getTimelineIcon(type) {
        const icons = {
            info: 'info-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            success: 'check-circle'
        };
        return icons[type] || 'info-circle';
    }

    getSeverityColor(severity) {
        const colors = {
            low: '#22c55e',
            medium: '#f59e0b',
            high: '#f97316',
            critical: '#ef4444'
        };
        return colors[severity] || '#94a3b8';
    }

    getStatusColor(status) {
        const colors = {
            completed: '#22c55e',
            in_progress: '#f59e0b',
            failed: '#ef4444',
            pending: '#94a3b8'
        };
        return colors[status] || '#94a3b8';
    }

    getResultColor(result) {
        const colors = {
            Success: '#22c55e',
            Error: '#ef4444',
            Running: '#f59e0b',
            Pending: '#94a3b8'
        };
        return colors[result] || '#94a3b8';
    }

    hideLoadingOverlay() {
        setTimeout(() => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 500);
            }
        }, 2000);
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize platform when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.autoOpsPlatform = new AutoOpsPlatform();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.autoOpsPlatform) {
        window.autoOpsPlatform.destroy();
    }
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to status cards
    document.querySelectorAll('.status-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Add click effects to runbook items
    document.addEventListener('click', (e) => {
        if (e.target.closest('.runbook-item')) {
            const runbookItem = e.target.closest('.runbook-item');
            runbookItem.style.background = 'rgba(14, 165, 233, 0.1)';
            runbookItem.style.borderColor = '#0ea5e9';
            
            setTimeout(() => {
                runbookItem.style.background = 'rgba(255, 255, 255, 0.02)';
                runbookItem.style.borderColor = 'rgba(148, 163, 184, 0.12)';
            }, 1000);
        }
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    document.querySelector('[data-tab="overview"]').click();
                    break;
                case '2':
                    e.preventDefault();
                    document.querySelector('[data-tab="ops"]').click();
                    break;
                case '3':
                    e.preventDefault();
                    document.querySelector('[data-tab="agent"]').click();
                    break;
            }
        }
    });

    // Add tooltips
    const tooltips = {
        'anomalies-count': 'Total number of detected anomalies in the last 24 hours',
        'actions-count': 'Number of automated actions executed',
        'incidents-count': 'Active incidents requiring attention',
        'availability-value': 'System availability percentage',
        'latency-value': '95th percentile response time',
        'ebr-value': 'Remaining error budget percentage',
        'cost-value': 'Estimated cost savings from avoided downtime'
    };

    Object.entries(tooltips).forEach(([elementId, tooltip]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.title = tooltip;
        }
    });
});
