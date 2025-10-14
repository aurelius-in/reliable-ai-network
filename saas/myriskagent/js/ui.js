// MyRiskAgent Demo - UI Components and Interactions
// This file handles UI-specific functionality and component interactions

class UIManager {
    constructor() {
        this.setupEventListeners();
        this.initializeComponents();
    }

    setupEventListeners() {
        // What If Analysis form
        const whatIfForm = document.querySelector('.what-if-form');
        if (whatIfForm) {
            const analyzeBtn = whatIfForm.querySelector('.btn');
            if (analyzeBtn) {
                analyzeBtn.addEventListener('click', this.handleWhatIfAnalysis.bind(this));
            }
        }

        // Ask tab form
        const askForm = document.querySelector('#ask .card');
        if (askForm) {
            const askBtn = askForm.querySelector('.btn');
            if (askBtn) {
                askBtn.addEventListener('click', this.handleAskQuestion.bind(this));
            }
        }

        // Document cards
        document.querySelectorAll('.document-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const title = card.querySelector('.document-title').textContent;
                this.showDocumentModal(title);
            });
        });
    }

    initializeComponents() {
        this.updateRiskGauges();
        this.updateProviderList();
        this.updateRiskDrivers();
        this.updateSystemStatus();
        this.setupSparklines();
    }

    updateRiskGauges() {
        const orgData = window.MockData.getCurrentOrgData();
        
        // Update combined risk gauge
        const combinedGauge = document.querySelector('#overview .gauge-circle');
        if (combinedGauge) {
            const score = orgData.riskScores.combined;
            const riskLevel = window.MockData.getRiskLevel(score);
            
            combinedGauge.className = `gauge-circle gauge-${riskLevel.level}`;
            combinedGauge.querySelector('.gauge-text').textContent = score;
            combinedGauge.nextElementSibling.textContent = riskLevel.label;
        }

        // Update family risk gauge
        const familyGauge = document.querySelector('#overview .gauge-circle:nth-of-type(2)');
        if (familyGauge) {
            const score = orgData.riskScores.family;
            const riskLevel = window.MockData.getRiskLevel(score);
            
            familyGauge.className = `gauge-circle gauge-${riskLevel.level}`;
            familyGauge.querySelector('.gauge-text').textContent = score;
            familyGauge.nextElementSibling.textContent = riskLevel.label;
        }

        // Update individual risk scores in Scores tab
        this.updateIndividualRiskScores(orgData);
    }

    updateIndividualRiskScores(orgData) {
        const scoreCards = document.querySelectorAll('#scores .card');
        const scores = ['financial', 'operational', 'regulatory', 'reputational'];
        
        scoreCards.forEach((card, index) => {
            if (scores[index]) {
                const score = orgData.riskScores[scores[index]];
                const riskLevel = window.MockData.getRiskLevel(score);
                
                const gauge = card.querySelector('.gauge-circle');
                if (gauge) {
                    gauge.className = `gauge-circle gauge-${riskLevel.level}`;
                    gauge.querySelector('.gauge-text').textContent = score;
                }
            }
        });
    }

    updateProviderList() {
        const providerCard = document.querySelector('#providers .card');
        if (providerCard) {
            const providerList = providerCard.querySelector('div[style*="margin: 20px 0"]');
            if (providerList) {
                providerList.innerHTML = '';
                
                window.MockData.providers.forEach(provider => {
                    const providerDiv = document.createElement('div');
                    providerDiv.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 8px;';
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = provider.name;
                    
                    const riskSpan = document.createElement('span');
                    riskSpan.textContent = provider.risk;
                    riskSpan.style.color = provider.riskLevel === 'high' ? 'var(--mra-red)' : 
                                          provider.riskLevel === 'medium' ? 'var(--mra-yellow)' : 'green';
                    
                    providerDiv.appendChild(nameSpan);
                    providerDiv.appendChild(riskSpan);
                    providerList.appendChild(providerDiv);
                });
            }
        }
    }

    updateRiskDrivers() {
        const driversCard = document.querySelector('#drivers .card');
        if (driversCard) {
            const driversContainer = driversCard.querySelector('div[style*="margin: 20px 0"]');
            if (driversContainer) {
                driversContainer.innerHTML = '';
                
                window.MockData.riskDrivers.forEach(driver => {
                    const driverDiv = document.createElement('div');
                    driverDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;';
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = driver.name;
                    
                    const barContainer = document.createElement('div');
                    barContainer.style.cssText = `background: ${driver.color}; height: 8px; width: ${driver.score}%; border-radius: 4px;`;
                    
                    driverDiv.appendChild(nameSpan);
                    driverDiv.appendChild(barContainer);
                    driversContainer.appendChild(driverDiv);
                });
            }
        }
    }

    updateSystemStatus() {
        const statusCard = document.querySelector('#status .card');
        if (statusCard) {
            const statusList = statusCard.querySelector('div[style*="margin: 20px 0"]');
            if (statusList) {
                statusList.innerHTML = '';
                
                window.MockData.systemStatus.services.forEach(service => {
                    const serviceDiv = document.createElement('div');
                    serviceDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;';
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = service.name;
                    
                    const statusSpan = document.createElement('span');
                    statusSpan.textContent = `✓ ${service.status.charAt(0).toUpperCase() + service.status.slice(1)}`;
                    statusSpan.style.color = service.color;
                    
                    serviceDiv.appendChild(nameSpan);
                    serviceDiv.appendChild(statusSpan);
                    statusList.appendChild(serviceDiv);
                });
            }
        }

        // Update metrics
        const metricsCard = document.querySelector('#status .card:nth-of-type(2)');
        if (metricsCard) {
            const metricsList = metricsCard.querySelector('div[style*="margin: 20px 0"]');
            if (metricsList) {
                metricsList.innerHTML = '';
                
                Object.entries(window.MockData.systemStatus.metrics).forEach(([key, value]) => {
                    const metricDiv = document.createElement('div');
                    metricDiv.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 8px;';
                    
                    const keySpan = document.createElement('span');
                    keySpan.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    
                    const valueSpan = document.createElement('span');
                    valueSpan.textContent = value;
                    valueSpan.style.color = 'green';
                    
                    metricDiv.appendChild(keySpan);
                    metricDiv.appendChild(valueSpan);
                    metricsList.appendChild(metricDiv);
                });
            }
        }
    }

    setupSparklines() {
        // Add animated sparklines to all sparkline elements
        document.querySelectorAll('.sparkline').forEach(sparkline => {
            this.animateSparkline(sparkline);
        });
    }

    animateSparkline(element) {
        // Create a simple animated sparkline effect
        const data = window.MockData.generateSparklineData();
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min;
        
        // Create SVG sparkline
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((value - min) / range) * 100;
            return `${x},${y}`;
        }).join(' L');
        
        path.setAttribute('d', `M ${points}`);
        path.setAttribute('stroke', 'var(--mra-yellow)');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.style.opacity = '0.7';
        
        svg.appendChild(path);
        element.appendChild(svg);
    }

    handleWhatIfAnalysis() {
        const scenarioSelect = document.querySelector('.what-if-form select:first-of-type');
        const timeframeSelect = document.querySelector('.what-if-form select:nth-of-type(2)');
        
        if (scenarioSelect && timeframeSelect) {
            const scenario = scenarioSelect.value;
            const timeframe = timeframeSelect.value;
            
            // Find matching scenario in mock data
            const scenarioData = window.MockData.whatIfScenarios.find(s => 
                s.name === scenario && s.timeframe === timeframe
            );
            
            if (scenarioData) {
                this.showWhatIfResults(scenarioData);
            } else {
                alert('What If Analysis would run here in the real application. This would show projected risk scores based on the selected scenario.');
            }
        }
    }

    showWhatIfResults(scenarioData) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 10000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: var(--mra-black); border: 2px solid var(--mra-red);
            border-radius: 12px; padding: 24px; max-width: 500px;
            color: var(--mra-yellow);
        `;
        
        content.innerHTML = `
            <h3 style="color: var(--mra-red); margin-bottom: 16px;">What If Analysis Results</h3>
            <p><strong>Scenario:</strong> ${scenarioData.name}</p>
            <p><strong>Timeframe:</strong> ${scenarioData.timeframe}</p>
            <p><strong>Projected Risk Score:</strong> <span style="color: var(--mra-red); font-weight: bold;">${scenarioData.projectedRisk}</span></p>
            <p><strong>Impact:</strong> ${scenarioData.impact}</p>
            <button class="btn" onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="margin-top: 16px;">Close</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    handleAskQuestion() {
        const textarea = document.querySelector('#ask textarea');
        if (textarea && textarea.value.trim()) {
            const question = textarea.value.trim();
            this.showAIResponse(question);
            textarea.value = '';
        } else {
            alert('Please enter a question first.');
        }
    }

    showAIResponse(question) {
        const responses = [
            "Based on the current data, your organization shows moderate risk levels with some areas requiring attention.",
            "The main risk drivers are provider billing anomalies and regulatory compliance concerns.",
            "I recommend focusing on the top 3 risk factors: billing patterns, compliance training, and market competition.",
            "Your risk profile has improved 5% over the last quarter, primarily due to better operational controls.",
            "The AI analysis suggests implementing additional monitoring for weekend billing patterns."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 10000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: var(--mra-black); border: 2px solid var(--mra-red);
            border-radius: 12px; padding: 24px; max-width: 600px;
            color: var(--mra-yellow);
        `;
        
        content.innerHTML = `
            <h3 style="color: var(--mra-red); margin-bottom: 16px;">AI Assistant Response</h3>
            <p><strong>Your Question:</strong> ${question}</p>
            <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p><strong>AI Response:</strong> ${randomResponse}</p>
            </div>
            <button class="btn" onclick="this.closest('div[style*=\"position: fixed\"]').remove()">Close</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showDocumentModal(title) {
        const doc = window.MockData.documents[title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '')];
        
        if (!doc) {
            alert('Document viewer would open here in the real application. Document: ' + title);
            return;
        }
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 10000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: var(--mra-black); border: 2px solid var(--mra-red);
            border-radius: 12px; padding: 24px; max-width: 700px; max-height: 80vh;
            color: var(--mra-yellow); overflow-y: auto;
        `;
        
        let keyPointsHtml = '';
        if (doc.keyPoints) {
            keyPointsHtml = `
                <h4 style="color: var(--mra-red); margin: 16px 0 8px 0;">Key Points:</h4>
                <ul style="margin-left: 20px;">
                    ${doc.keyPoints.map(point => `<li>${point}</li>`).join('')}
                </ul>
            `;
        }
        
        let referencesHtml = '';
        if (doc.references) {
            referencesHtml = `
                <h4 style="color: var(--mra-red); margin: 16px 0 8px 0;">References:</h4>
                <ul style="margin-left: 20px;">
                    ${doc.references.map(ref => `<li>${ref}</li>`).join('')}
                </ul>
            `;
        }
        
        content.innerHTML = `
            <h3 style="color: var(--mra-red); margin-bottom: 16px;">${doc.title}</h3>
            <p><strong>Type:</strong> ${doc.type} | <strong>Date:</strong> ${doc.date}</p>
            <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p>${doc.content}</p>
            </div>
            ${keyPointsHtml}
            ${referencesHtml}
            <button class="btn" onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="margin-top: 16px;">Close</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// Initialize UI Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});
