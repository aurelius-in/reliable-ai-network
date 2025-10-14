// MyRiskAgent Demo - Mock Data
// This file contains all the mock data used in the demo

const MockData = {
    organizations: {
        'demo-org': {
            name: 'Demo Organization',
            riskScores: {
                combined: 72,
                family: 34,
                financial: 68,
                operational: 42,
                regulatory: 75,
                reputational: 28
            },
            trends: {
                combined: '+5%',
                family: '-2%'
            }
        },
        'acme-corp': {
            name: 'ACME Corporation',
            riskScores: {
                combined: 85,
                family: 45,
                financial: 78,
                operational: 55,
                regulatory: 82,
                reputational: 35
            },
            trends: {
                combined: '+12%',
                family: '+3%'
            }
        },
        'health-systems': {
            name: 'Health Systems Inc',
            riskScores: {
                combined: 58,
                family: 28,
                financial: 52,
                operational: 38,
                regulatory: 65,
                reputational: 22
            },
            trends: {
                combined: '-8%',
                family: '-5%'
            }
        }
    },

    documents: {
        'executive-brief': {
            title: 'Executive Brief',
            type: 'Risk Analysis',
            date: 'Today',
            content: 'The client shows solid operational performance with manageable compliance exposure. Financial signals are stable. No critical adverse media detected in the last 60 days.',
            keyPoints: [
                'SEC filing (10-K) indicates improved leverage ratio YoY',
                'Press release confirms expansion of outpatient services',
                'Provider billing trend: minor weekend billing increase within expected bounds'
            ],
            references: [
                'Q4 Results — internal analyst summary and SEC 10‑K excerpt',
                'Litigation Update — legal counsel memo (non‑material impact)'
            ]
        },
        'q4-results': {
            title: 'Q4 Results Summary',
            type: 'Finance',
            date: 'Internal Report',
            content: 'SEC filing (10-K) indicates improved leverage ratio YoY. Press release confirms expansion of outpatient services.',
            keyPoints: [
                'Revenue increased 8% year-over-year',
                'Operating margin improved to 12.5%',
                'Debt-to-equity ratio decreased from 0.45 to 0.38'
            ]
        },
        'litigation-update': {
            title: 'Litigation Update',
            type: 'Compliance',
            date: 'Legal Counsel',
            content: 'Legal counsel memo indicates non-material impact from ongoing litigation. Settlement negotiations progressing.',
            keyPoints: [
                'Three active cases, all non-material',
                'Settlement discussions ongoing for two cases',
                'Insurance coverage adequate for all claims'
            ]
        }
    },

    providers: [
        {
            name: 'Dr. Smith - Cardiology',
            risk: 'High',
            riskLevel: 'high',
            billingAnomalies: 15,
            complianceScore: 65
        },
        {
            name: 'Dr. Johnson - Orthopedics',
            risk: 'Medium',
            riskLevel: 'medium',
            billingAnomalies: 8,
            complianceScore: 78
        },
        {
            name: 'Dr. Williams - Internal Med',
            risk: 'Low',
            riskLevel: 'low',
            billingAnomalies: 2,
            complianceScore: 92
        },
        {
            name: 'Dr. Brown - Emergency',
            risk: 'Medium',
            riskLevel: 'medium',
            billingAnomalies: 12,
            complianceScore: 71
        }
    ],

    riskDrivers: [
        { name: 'Provider Billing Anomalies', score: 75, color: 'var(--mra-red)' },
        { name: 'Regulatory Compliance', score: 60, color: 'var(--mra-yellow)' },
        { name: 'Market Competition', score: 45, color: 'var(--mra-yellow)' },
        { name: 'Technology Infrastructure', score: 30, color: 'green' },
        { name: 'Staff Turnover', score: 25, color: 'green' },
        { name: 'Supply Chain', score: 35, color: 'green' }
    ],

    systemStatus: {
        services: [
            { name: 'API Gateway', status: 'operational', color: 'green' },
            { name: 'Risk Engine', status: 'operational', color: 'green' },
            { name: 'AI Agents', status: 'operational', color: 'green' },
            { name: 'Vector Database', status: 'operational', color: 'green' },
            { name: 'External APIs', status: 'monitoring', color: 'var(--mra-yellow)' },
            { name: 'Message Queue', status: 'operational', color: 'green' }
        ],
        metrics: {
            responseTime: '145ms avg',
            uptime: '99.9%',
            dataProcessing: '2.3M records/hour',
            activeUsers: '1,247',
            apiCalls: '45.2K/hour'
        }
    },

    whatIfScenarios: [
        {
            name: 'Increase provider volume by 20%',
            timeframe: '3 months',
            projectedRisk: 78,
            impact: 'Medium increase in operational risk due to capacity constraints'
        },
        {
            name: 'Add new service line',
            timeframe: '6 months',
            projectedRisk: 65,
            impact: 'Initial compliance overhead, then risk reduction through diversification'
        },
        {
            name: 'Regulatory changes',
            timeframe: '12 months',
            projectedRisk: 82,
            impact: 'Significant compliance burden, potential penalties if not addressed'
        },
        {
            name: 'Market expansion',
            timeframe: '12 months',
            projectedRisk: 70,
            impact: 'Increased operational complexity, but improved financial stability'
        }
    ],

    sampleQuestions: [
        "What are the main risk drivers for this organization?",
        "How does our compliance score compare to industry benchmarks?",
        "What regulatory changes should we be monitoring?",
        "Show me the latest adverse media mentions",
        "Which providers have the highest billing anomalies?",
        "What is our projected risk score for next quarter?",
        "Are there any sanctions or OFAC matches?",
        "How has our risk profile changed over the last 6 months?"
    ],

    // Helper functions
    getCurrentOrgData() {
        const orgSelector = document.getElementById('orgSelector');
        const currentOrg = orgSelector ? orgSelector.value : 'demo-org';
        return this.organizations[currentOrg] || this.organizations['demo-org'];
    },

    getRiskLevel(score) {
        if (score >= 70) return { level: 'high', color: 'var(--mra-red)', label: 'High Risk' };
        if (score >= 40) return { level: 'medium', color: 'var(--mra-yellow)', label: 'Medium Risk' };
        return { level: 'low', color: 'green', label: 'Low Risk' };
    },

    generateSparklineData() {
        // Generate random but realistic sparkline data
        const data = [];
        for (let i = 0; i < 30; i++) {
            data.push(Math.random() * 100);
        }
        return data;
    }
};

// Make MockData available globally
window.MockData = MockData;
