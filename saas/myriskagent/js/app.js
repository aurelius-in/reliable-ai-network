// MyRiskAgent Demo - Interactive JavaScript
class MyRiskAgentDemo {
  constructor() {
    this.currentTab = 'overview';
    this.mockData = this.initializeMockData();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadTabContent(this.currentTab);
    this.animateElements();
    this.setupMockInteractions();
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Button interactions
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-download')) {
        this.handleDownload(e.target.dataset.type);
      } else if (e.target.classList.contains('btn-export')) {
        this.handleExport(e.target.dataset.format);
      } else if (e.target.classList.contains('btn-scenario')) {
        this.openScenarioModal();
      } else if (e.target.classList.contains('btn-evidence')) {
        this.showEvidence();
      }
    });

    // Form interactions
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('filter-input')) {
        this.filterData(e.target);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.altKey) {
        const keyMap = {
          '1': 'overview',
          '2': 'scores',
          '3': 'drivers',
          '4': 'documents',
          '5': 'ask',
          '6': 'providers',
          '7': 'status'
        };
        if (keyMap[e.key]) {
          e.preventDefault();
          this.switchTab(keyMap[e.key]);
        }
      }
    });
  }

  switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Show tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-content`).classList.add('active');

    this.currentTab = tabName;
    this.loadTabContent(tabName);
  }

  loadTabContent(tabName) {
    const contentContainer = document.getElementById(`${tabName}-content`);
    if (!contentContainer) return;

    // Add loading animation
    contentContainer.classList.add('loading');

    // Simulate API delay
    setTimeout(() => {
      contentContainer.classList.remove('loading');
      this.renderTabContent(tabName);
    }, 300);
  }

  renderTabContent(tabName) {
    switch (tabName) {
      case 'overview':
        this.renderOverview();
        break;
      case 'scores':
        this.renderScores();
        break;
      case 'drivers':
        this.renderDrivers();
        break;
      case 'documents':
        this.renderDocuments();
        break;
      case 'ask':
        this.renderAsk();
        break;
      case 'providers':
        this.renderProviders();
        break;
      case 'status':
        this.renderStatus();
        break;
    }
  }

  renderOverview() {
    const container = document.getElementById('overview-content');
    const data = this.mockData.overview;

    container.innerHTML = `
      <div class="row">
        <div class="col-6">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Combined Risk Index</h3>
              <div class="btn-group">
                <button class="btn btn-outline btn-sm" onclick="demo.openScenarioModal()">Scenario Testing</button>
                <button class="btn btn-outline btn-sm" onclick="demo.showEvidence()">Evidence</button>
                <button class="btn btn-primary btn-sm" onclick="demo.handleDownload('zip')">Download ZIP</button>
              </div>
            </div>
            <div class="risk-gauge-container">
              <div class="risk-gauge" style="--percentage: ${data.combinedIndex}">
                <div class="risk-gauge-value">
                  <div class="risk-gauge-number">${data.combinedIndex}</div>
                </div>
              </div>
              <div class="risk-gauge-label">Engagement Risk</div>
            </div>
            <div class="chart-container">
              <canvas id="trendChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Risk Factors</h3>
            </div>
            <div class="row">
              <div class="col-4">
                <div class="risk-gauge" style="--percentage: ${data.financialRisk}">
                  <div class="risk-gauge-value">
                    <div class="risk-gauge-number">${data.financialRisk}</div>
                  </div>
                </div>
                <div class="risk-gauge-label">Financial</div>
              </div>
              <div class="col-4">
                <div class="risk-gauge" style="--percentage: ${data.complianceRisk}">
                  <div class="risk-gauge-value">
                    <div class="risk-gauge-number">${data.complianceRisk}</div>
                  </div>
                </div>
                <div class="risk-gauge-label">Compliance</div>
              </div>
              <div class="col-4">
                <div class="risk-gauge" style="--percentage: ${data.operationalRisk}">
                  <div class="risk-gauge-value">
                    <div class="risk-gauge-number">${data.operationalRisk}</div>
                  </div>
                </div>
                <div class="risk-gauge-label">Operational</div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Social Signals</h3>
            </div>
            <div class="chart-container">
              <canvas id="socialChart" width="400" height="150"></canvas>
            </div>
            <p class="text-center">Online component: ${data.onlineComponent}</p>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Pinned Documents</h3>
              <div class="btn-group">
                <button class="btn btn-outline btn-sm" onclick="demo.handleExport('csv')">Export CSV</button>
                <button class="btn btn-outline btn-sm" onclick="demo.handleExport('copy')">Copy as CSV</button>
                <button class="btn btn-outline btn-sm" onclick="demo.openAllPinned()">Open All</button>
                <button class="btn btn-outline btn-sm" onclick="demo.clearPinned()">Clear All</button>
              </div>
            </div>
            <div id="pinned-documents">
              ${this.renderPinnedDocuments()}
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderTrendChart();
    this.renderSocialChart();
  }

  renderScores() {
    const container = document.getElementById('scores-content');
    const data = this.mockData.scores;

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Risk Scores</h3>
          <div class="btn-group">
            <button class="btn btn-primary btn-sm" onclick="demo.handleDownload('claims')">Upload Claims</button>
            <button class="btn btn-outline btn-sm" onclick="demo.handleExport('csv')">Export CSV</button>
          </div>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Score</th>
                <th>Confidence</th>
                <th>Trend</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(score => `
                <tr>
                  <td>${score.metric}</td>
                  <td><span class="stat-number">${score.score}</span></td>
                  <td>${score.confidence}%</td>
                  <td><span class="trend ${score.trend}">${score.trend === 'up' ? '↗' : score.trend === 'down' ? '↘' : '→'}</span></td>
                  <td>${score.lastUpdated}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Provider Outliers</h3>
          <div class="form-group">
            <input type="text" class="form-control filter-input" placeholder="Filter by provider name..." data-filter="providers">
          </div>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Outlier Score</th>
                <th>Industry</th>
                <th>Region</th>
                <th>Total Claims</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="provider-outliers">
              ${this.renderProviderOutliers()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderDrivers() {
    const container = document.getElementById('drivers-content');
    const data = this.mockData.drivers;

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Risk Drivers Waterfall</h3>
        </div>
        <div class="chart-container">
          <canvas id="waterfallChart" width="800" height="400"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Fraud Detection Analysis</h3>
        </div>
        <div class="chart-container">
          <canvas id="fraudChart" width="800" height="300"></canvas>
        </div>
        <div class="row mt-4">
          <div class="col-6">
            <h4>Key Indicators</h4>
            <ul>
              <li>EIN/TIN Reuse: ${data.einReuse}%</li>
              <li>Long-stay Rate: ${data.longStayRate}%</li>
              <li>Weekend Billing: ${data.weekendBilling}%</li>
              <li>Amount/Day Outliers: ${data.amountOutliers}</li>
            </ul>
          </div>
          <div class="col-6">
            <h4>Recommendations</h4>
            <ul>
              <li>Review provider ${data.topOutlier} for billing patterns</li>
              <li>Investigate weekend billing anomalies</li>
              <li>Verify EIN usage across multiple providers</li>
              <li>Schedule audit for top 5 outliers</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    this.renderWaterfallChart();
    this.renderFraudChart();
  }

  renderDocuments() {
    const container = document.getElementById('documents-content');
    const data = this.mockData.documents;

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Document Search</h3>
          <div class="btn-group">
            <button class="btn btn-outline btn-sm" onclick="demo.fetchNews()">Fetch News</button>
            <button class="btn btn-outline btn-sm" onclick="demo.fetchFilings()">Fetch Filings</button>
          </div>
        </div>
        <div class="form-group">
          <div class="row">
            <div class="col-8">
              <input type="text" class="form-control" placeholder="Search documents..." id="doc-search">
            </div>
            <div class="col-4">
              <select class="form-control">
                <option value="vector">Vector Search</option>
                <option value="keyword">Keyword Search</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Search Results</h3>
            </div>
            <div id="search-results">
              ${this.renderSearchResults(data.searchResults)}
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Document Viewer</h3>
            </div>
            <div id="document-viewer">
              <p class="text-center">Select a document to view</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupDocumentSearch();
  }

  renderAsk() {
    const container = document.getElementById('ask-content');
    const data = this.mockData.ask;

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">AI Risk Assistant</h3>
          <div class="btn-group">
            <label class="btn btn-outline btn-sm">
              <input type="checkbox" id="scope-news"> News
            </label>
            <label class="btn btn-outline btn-sm">
              <input type="checkbox" id="scope-filings"> Filings
            </label>
          </div>
        </div>
        <div class="form-group">
          <textarea class="form-control" rows="4" placeholder="Ask about risk factors, compliance issues, or any questions about the organization..." id="ask-input"></textarea>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" onclick="demo.askQuestion()">Ask Question</button>
          <button class="btn btn-outline" onclick="demo.clearAsk()">Clear</button>
        </div>
      </div>
      <div class="card" id="ask-response" style="display: none;">
        <div class="card-header">
          <h3 class="card-title">Response</h3>
          <div class="btn-group">
            <button class="btn btn-outline btn-sm" onclick="demo.copyCitations()">Copy Citations</button>
            <button class="btn btn-outline btn-sm" onclick="demo.generateReport()">Generate Report</button>
          </div>
        </div>
        <div id="response-content"></div>
        <div id="citations"></div>
      </div>
    `;

    this.setupAskInteractions();
  }

  renderProviders() {
    const container = document.getElementById('providers-content');
    const data = this.mockData.providers;

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Provider Analytics</h3>
          <div class="btn-group">
            <button class="btn btn-outline btn-sm" onclick="demo.handleExport('csv')">Export CSV</button>
            <button class="btn btn-primary btn-sm" onclick="demo.refreshProviders()">Refresh</button>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-3">
            <select class="form-control" id="industry-filter">
              <option value="">All Industries</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
          <div class="col-3">
            <select class="form-control" id="region-filter">
              <option value="">All Regions</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
            </select>
          </div>
          <div class="col-3">
            <input type="number" class="form-control" placeholder="Min Total" id="min-total">
          </div>
          <div class="col-3">
            <input type="number" class="form-control" placeholder="Min Claims" id="min-claims">
          </div>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Industry</th>
                <th>Region</th>
                <th>Total Amount</th>
                <th>Avg Amount</th>
                <th>Claims Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="providers-table">
              ${this.renderProvidersTable(data)}
            </tbody>
          </table>
        </div>
        <div class="flex-center mt-3">
          <button class="btn btn-outline" onclick="demo.loadMoreProviders()">Load More</button>
        </div>
      </div>
    `;

    this.setupProviderFilters();
  }

  renderStatus() {
    const container = document.getElementById('status-content');
    const data = this.mockData.status;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">${data.uptime}</span>
          <span class="stat-label">Uptime</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${data.responseTime}ms</span>
          <span class="stat-label">Avg Response</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${data.documentsProcessed}</span>
          <span class="stat-label">Documents</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${data.activeUsers}</span>
          <span class="stat-label">Active Users</span>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">System Health</h3>
            </div>
            <div class="health-indicators">
              ${data.health.map(service => `
                <div class="health-item">
                  <span class="service-name">${service.name}</span>
                  <span class="status-indicator ${service.status}">${service.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Recent Activity</h3>
            </div>
            <div class="activity-log">
              ${data.activity.map(item => `
                <div class="activity-item">
                  <span class="activity-time">${item.time}</span>
                  <span class="activity-message">${item.message}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Mock data initialization
  initializeMockData() {
    return {
      overview: {
        combinedIndex: 44,
        financialRisk: 42,
        complianceRisk: 35,
        operationalRisk: 50,
        onlineComponent: 2.3,
        trend: [40, 42, 38, 45, 44, 41, 43, 44]
      },
      scores: [
        { metric: 'Financial Health Risk', score: 42, confidence: 95, trend: 'down', lastUpdated: '2024-01-15' },
        { metric: 'Compliance & Reputation', score: 35, confidence: 88, trend: 'stable', lastUpdated: '2024-01-15' },
        { metric: 'Operational Risk', score: 50, confidence: 92, trend: 'up', lastUpdated: '2024-01-15' },
        { metric: 'Combined Index', score: 44, confidence: 94, trend: 'stable', lastUpdated: '2024-01-15' }
      ],
      drivers: {
        einReuse: 12.5,
        longStayRate: 8.3,
        weekendBilling: 15.2,
        amountOutliers: 23,
        topOutlier: 'MedCorp Services'
      },
      documents: {
        searchResults: [
          { title: 'SEC Filing 10-K Q4 2023', snippet: 'Financial performance and risk factors...', source: 'SEC EDGAR', date: '2024-01-10' },
          { title: 'News: Regulatory Compliance Update', snippet: 'New regulations affecting healthcare providers...', source: 'Healthcare News', date: '2024-01-12' },
          { title: 'OFAC Sanctions List Update', snippet: 'Updated sanctions list includes new entities...', source: 'OFAC', date: '2024-01-08' }
        ]
      },
      ask: {
        sampleQuestions: [
          'What are the main risk factors for this organization?',
          'Show me recent compliance issues',
          'Analyze provider billing patterns',
          'What sanctions exposure exists?'
        ]
      },
      providers: [
        { name: 'MedCorp Services', industry: 'Healthcare', region: 'North America', totalAmount: 1250000, avgAmount: 2500, claimsCount: 500 },
        { name: 'TechHealth Solutions', industry: 'Technology', region: 'Europe', totalAmount: 890000, avgAmount: 1780, claimsCount: 500 },
        { name: 'FinanceMed Inc', industry: 'Finance', region: 'Asia', totalAmount: 2100000, avgAmount: 4200, claimsCount: 500 }
      ],
      status: {
        uptime: '99.9%',
        responseTime: 245,
        documentsProcessed: 15420,
        activeUsers: 127,
        health: [
          { name: 'API Server', status: 'healthy' },
          { name: 'Database', status: 'healthy' },
          { name: 'Vector Store', status: 'healthy' },
          { name: 'Cache', status: 'warning' }
        ],
        activity: [
          { time: '10:45', message: 'New risk assessment completed' },
          { time: '10:42', message: 'Provider outlier detected' },
          { time: '10:38', message: 'Document ingested from SEC' },
          { time: '10:35', message: 'User login from IP 192.168.1.100' }
        ]
      }
    };
  }

  // Chart rendering methods
  renderTrendChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = this.mockData.overview.trend;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple line chart
    ctx.strokeStyle = '#B30700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * canvas.width;
      const y = canvas.height - (value / 100) * canvas.height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Add points
    ctx.fillStyle = '#F1A501';
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * canvas.width;
      const y = canvas.height - (value / 100) * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  renderSocialChart() {
    const canvas = document.getElementById('socialChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple bar chart for social signals
    const data = [2.1, 2.3, 1.8, 2.5, 2.2, 2.4];
    const barWidth = canvas.width / data.length;
    
    data.forEach((value, index) => {
      const barHeight = (value / 3) * canvas.height;
      const x = index * barWidth;
      const y = canvas.height - barHeight;
      
      ctx.fillStyle = '#B30700';
      ctx.fillRect(x, y, barWidth - 2, barHeight);
    });
  }

  renderWaterfallChart() {
    const canvas = document.getElementById('waterfallChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple waterfall representation
    const segments = [
      { label: 'Base Risk', value: 30, color: '#333' },
      { label: 'Financial', value: 12, color: '#B30700' },
      { label: 'Compliance', value: -5, color: '#4CAF50' },
      { label: 'Operational', value: 7, color: '#FF9800' }
    ];
    
    let currentX = 50;
    segments.forEach(segment => {
      const width = Math.abs(segment.value) * 5;
      const height = 40;
      const y = (canvas.height - height) / 2;
      
      ctx.fillStyle = segment.color;
      ctx.fillRect(currentX, y, width, height);
      
      // Label
      ctx.fillStyle = '#F1A501';
      ctx.font = '12px Century Gothic';
      ctx.textAlign = 'center';
      ctx.fillText(segment.label, currentX + width/2, y - 5);
      ctx.fillText(segment.value.toString(), currentX + width/2, y + height/2 + 5);
      
      currentX += width + 10;
    });
  }

  renderFraudChart() {
    const canvas = document.getElementById('fraudChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // SHAP-like contributions
    const contributions = [
      { name: 'EIN Reuse', value: 12.5, color: '#B30700' },
      { name: 'Long Stay', value: 8.3, color: '#FF5722' },
      { name: 'Weekend Billing', value: 15.2, color: '#FF9800' },
      { name: 'Amount Outliers', value: 23.0, color: '#F44336' }
    ];
    
    const barHeight = 30;
    const startY = 50;
    
    contributions.forEach((contrib, index) => {
      const y = startY + index * (barHeight + 10);
      const width = (contrib.value / 25) * (canvas.width - 150);
      
      ctx.fillStyle = contrib.color;
      ctx.fillRect(150, y, width, barHeight);
      
      ctx.fillStyle = '#F1A501';
      ctx.font = '12px Century Gothic';
      ctx.textAlign = 'right';
      ctx.fillText(contrib.name, 140, y + barHeight/2 + 4);
      ctx.textAlign = 'left';
      ctx.fillText(`${contrib.value}%`, 160 + width, y + barHeight/2 + 4);
    });
  }

  // Interaction methods
  setupMockInteractions() {
    // Simulate real-time updates
    setInterval(() => {
      this.updateMockData();
    }, 30000);
  }

  updateMockData() {
    // Randomly update some values for demo effect
    const variation = () => Math.random() * 4 - 2; // ±2 variation
    
    this.mockData.overview.combinedIndex = Math.max(0, Math.min(100, 
      this.mockData.overview.combinedIndex + variation()));
    
    this.mockData.status.activeUsers = Math.max(100, 
      this.mockData.status.activeUsers + Math.floor(variation()));
    
    // Re-render current tab if it uses this data
    if (['overview', 'status'].includes(this.currentTab)) {
      this.renderTabContent(this.currentTab);
    }
  }

  // Event handlers
  handleDownload(type) {
    this.showNotification(`Downloading ${type}...`, 'info');
    // Simulate download
    setTimeout(() => {
      this.showNotification(`${type} download complete`, 'success');
    }, 2000);
  }

  handleExport(format) {
    this.showNotification(`Exporting data as ${format}...`, 'info');
    setTimeout(() => {
      this.showNotification(`${format} export complete`, 'success');
    }, 1500);
  }

  openScenarioModal() {
    this.showNotification('Opening scenario testing panel...', 'info');
    // In a real app, this would open a modal
  }

  showEvidence() {
    this.showNotification('Loading evidence preview...', 'info');
    // In a real app, this would show evidence
  }

  askQuestion() {
    const input = document.getElementById('ask-input');
    const question = input.value.trim();
    
    if (!question) {
      this.showNotification('Please enter a question', 'warning');
      return;
    }

    this.showNotification('Processing question...', 'info');
    
    setTimeout(() => {
      const responseDiv = document.getElementById('ask-response');
      const contentDiv = document.getElementById('response-content');
      
      contentDiv.innerHTML = `
        <p>Based on the available data, here's what I found:</p>
        <ul>
          <li>The organization shows moderate financial health with some compliance concerns</li>
          <li>Recent SEC filings indicate improved leverage ratios</li>
          <li>Provider billing patterns show minor anomalies in weekend billing</li>
          <li>No active sanctions exposure detected</li>
        </ul>
      `;
      
      document.getElementById('citations').innerHTML = `
        <h4>Citations:</h4>
        <div class="citation-chips">
          <span class="chip">SEC 10-K Filing</span>
          <span class="chip">Provider Analytics</span>
          <span class="chip">OFAC Database</span>
        </div>
      `;
      
      responseDiv.style.display = 'block';
      this.showNotification('Response generated', 'success');
    }, 2000);
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info'}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  animateElements() {
    // Add fade-in animation to elements
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    });

    document.querySelectorAll('.card').forEach(card => {
      observer.observe(card);
    });
  }

  // Additional utility methods
  renderPinnedDocuments() {
    const pinned = [
      { title: 'SEC 10-K Filing Q4 2023', snippet: 'Annual report with financial statements...', url: '#' },
      { title: 'Compliance Audit Report', snippet: 'Internal audit findings and recommendations...', url: '#' }
    ];
    
    if (pinned.length === 0) {
      return '<p class="text-center">No pinned documents yet.</p>';
    }
    
    return pinned.map(doc => `
      <div class="document-item">
        <h4>${doc.title}</h4>
        <p>${doc.snippet}</p>
        <div class="btn-group">
          <button class="btn btn-outline btn-sm" onclick="window.open('${doc.url}', '_blank')">Open</button>
          <button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText('${doc.url}')">Copy</button>
          <button class="btn btn-outline btn-sm" onclick="demo.unpinDocument('${doc.title}')">Unpin</button>
        </div>
      </div>
    `).join('');
  }

  renderProviderOutliers() {
    const outliers = [
      { name: 'MedCorp Services', score: 85, industry: 'Healthcare', region: 'North America', claims: 500 },
      { name: 'TechHealth Solutions', score: 78, industry: 'Technology', region: 'Europe', claims: 450 },
      { name: 'FinanceMed Inc', score: 72, industry: 'Finance', region: 'Asia', claims: 320 }
    ];
    
    return outliers.map(provider => `
      <tr>
        <td>${provider.name}</td>
        <td><span class="outlier-score ${provider.score > 80 ? 'high' : provider.score > 60 ? 'medium' : 'low'}">${provider.score}</span></td>
        <td>${provider.industry}</td>
        <td>${provider.region}</td>
        <td>${provider.claims}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="demo.viewProviderDetail('${provider.name}')">View</button>
        </td>
      </tr>
    `).join('');
  }

  renderSearchResults(results) {
    return results.map(result => `
      <div class="search-result-item" onclick="demo.viewDocument('${result.title}')">
        <h4>${result.title}</h4>
        <p>${result.snippet}</p>
        <div class="result-meta">
          <span class="source">${result.source}</span>
          <span class="date">${result.date}</span>
        </div>
      </div>
    `).join('');
  }

  renderProvidersTable(providers) {
    return providers.map(provider => `
      <tr>
        <td>${provider.name}</td>
        <td>${provider.industry}</td>
        <td>${provider.region}</td>
        <td>$${provider.totalAmount.toLocaleString()}</td>
        <td>$${provider.avgAmount.toLocaleString()}</td>
        <td>${provider.claimsCount}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="demo.viewProviderDetail('${provider.name}')">Detail</button>
          <button class="btn btn-outline btn-sm" onclick="demo.exportProviderClaims('${provider.name}')">Export</button>
        </td>
      </tr>
    `).join('');
  }

  // Additional interaction methods
  setupDocumentSearch() {
    const searchInput = document.getElementById('doc-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length > 2) {
          this.performDocumentSearch(query);
        }
      });
    }
  }

  setupAskInteractions() {
    const input = document.getElementById('ask-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.askQuestion();
        }
      });
    }
  }

  setupProviderFilters() {
    document.querySelectorAll('#industry-filter, #region-filter, #min-total, #min-claims').forEach(filter => {
      filter.addEventListener('change', () => {
        this.filterProviders();
      });
    });
  }

  performDocumentSearch(query) {
    this.showNotification(`Searching for "${query}"...`, 'info');
    // Simulate search
    setTimeout(() => {
      this.showNotification(`Found 3 results for "${query}"`, 'success');
    }, 1000);
  }

  filterProviders() {
    this.showNotification('Filtering providers...', 'info');
    setTimeout(() => {
      this.showNotification('Providers filtered', 'success');
    }, 500);
  }

  filterData(input) {
    const filterType = input.dataset.filter;
    this.showNotification(`Filtering ${filterType}...`, 'info');
  }

  // Additional utility methods for demo
  copyCitations() {
    navigator.clipboard.writeText('SEC 10-K Filing, Provider Analytics, OFAC Database');
    this.showNotification('Citations copied to clipboard', 'success');
  }

  generateReport() {
    this.showNotification('Generating executive report...', 'info');
    setTimeout(() => {
      this.showNotification('Report generated successfully', 'success');
    }, 3000);
  }

  clearAsk() {
    document.getElementById('ask-input').value = '';
    document.getElementById('ask-response').style.display = 'none';
  }

  openAllPinned() {
    this.showNotification('Opening all pinned documents...', 'info');
  }

  clearPinned() {
    document.getElementById('pinned-documents').innerHTML = '<p class="text-center">No pinned documents yet.</p>';
    this.showNotification('All documents unpinned', 'success');
  }

  unpinDocument(title) {
    this.showNotification(`Unpinned "${title}"`, 'success');
  }

  viewProviderDetail(name) {
    this.showNotification(`Viewing details for ${name}...`, 'info');
  }

  exportProviderClaims(name) {
    this.showNotification(`Exporting claims for ${name}...`, 'info');
  }

  viewDocument(title) {
    document.getElementById('document-viewer').innerHTML = `
      <h4>${title}</h4>
      <p>Document content would be displayed here...</p>
    `;
  }

  fetchNews() {
    this.showNotification('Fetching latest news...', 'info');
    setTimeout(() => {
      this.showNotification('News updated successfully', 'success');
    }, 2000);
  }

  fetchFilings() {
    this.showNotification('Fetching SEC filings...', 'info');
    setTimeout(() => {
      this.showNotification('Filings updated successfully', 'success');
    }, 2000);
  }

  refreshProviders() {
    this.showNotification('Refreshing provider data...', 'info');
    setTimeout(() => {
      this.showNotification('Provider data refreshed', 'success');
    }, 1500);
  }

  loadMoreProviders() {
    this.showNotification('Loading more providers...', 'info');
    setTimeout(() => {
      this.showNotification('Additional providers loaded', 'success');
    }, 1000);
  }
}

// Initialize the demo when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.demo = new MyRiskAgentDemo();
});

// Add some CSS for additional styling
const additionalStyles = `
.chip {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: rgba(179, 7, 0, 0.2);
  border: 1px solid var(--mra-red);
  border-radius: 16px;
  font-size: 0.75rem;
  margin: 0.25rem;
  color: var(--mra-yellow);
}

.outlier-score {
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.outlier-score.high {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.outlier-score.medium {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.outlier-score.low {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.search-result-item {
  padding: 1rem;
  border-bottom: 1px solid var(--mra-gray);
  cursor: pointer;
  transition: var(--transition-fast);
}

.search-result-item:hover {
  background: rgba(179, 7, 0, 0.1);
}

.result-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--mra-light-gray);
  margin-top: 0.5rem;
}

.health-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--mra-gray);
}

.status-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: bold;
}

.status-indicator.healthy {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-indicator.warning {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-indicator.error {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.activity-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--mra-gray);
  display: flex;
  gap: 1rem;
}

.activity-time {
  color: var(--mra-light-gray);
  font-size: 0.875rem;
  min-width: 60px;
}

.document-item {
  padding: 1rem;
  border-bottom: 1px solid var(--mra-gray);
}

.document-item h4 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.document-item p {
  margin-bottom: 1rem;
  color: var(--mra-light-gray);
}

.btn-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.trend {
  font-weight: bold;
}

.trend.up {
  color: #f44336;
}

.trend.down {
  color: #4caf50;
}

.trend.stable {
  color: #ffc107;
}
`;

// Add the additional styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
