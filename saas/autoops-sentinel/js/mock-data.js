// Enterprise data for AutoOps Sentinel Platform

const EnterpriseData = {
    // Summary data
    summary: {
        anomalies: 23,
        actions: 8,
        incidents: 2
    },

    // Business metrics
    business: {
        downtime_avoided_min: 45,
        cost_avoided: 46000
    },

    // SLO metrics
    slo: {
        availability_pct: 99.8,
        latency_p95_ms: 245,
        error_budget_remaining_pct: 84.2
    },

    // Anomaly statistics
    anomalyStats: {
        mem: {
            low: 12,
            medium: 8,
            high: 2,
            critical: 1
        }
    },

    // Timeline events
    timeline: [
        {
            time: "14:32:15",
            type: "info",
            message: "System health check completed successfully"
        },
        {
            time: "14:28:42",
            type: "warning",
            message: "CPU usage spike detected in API cluster"
        },
        {
            time: "14:25:18",
            type: "success",
            message: "Auto-scaling action completed: +2 instances"
        },
        {
            time: "14:22:05",
            type: "error",
            message: "High error rate detected in payment service"
        },
        {
            time: "14:18:33",
            type: "info",
            message: "Memory optimization runbook executed"
        },
        {
            time: "14:15:21",
            type: "warning",
            message: "Database connection pool near capacity"
        },
        {
            time: "14:12:47",
            type: "success",
            message: "Load balancer configuration updated"
        },
        {
            time: "14:09:14",
            type: "info",
            message: "Scheduled maintenance window started"
        }
    ],

    // Anomalies data
    anomalies: [
        { id: "a-001", metric: "cpu", score: 2.3, severity: "high", created_at: "2024-01-15T14:32:15Z" },
        { id: "a-002", metric: "mem", score: 1.8, severity: "medium", created_at: "2024-01-15T14:28:42Z" },
        { id: "a-003", metric: "error_rate", score: 3.1, severity: "critical", created_at: "2024-01-15T14:25:18Z" },
        { id: "a-004", metric: "latency", score: 1.5, severity: "low", created_at: "2024-01-15T14:22:05Z" },
        { id: "a-005", metric: "cpu", score: 2.7, severity: "high", created_at: "2024-01-15T14:18:33Z" },
        { id: "a-006", metric: "mem", score: 1.2, severity: "low", created_at: "2024-01-15T14:15:21Z" },
        { id: "a-007", metric: "failed_logins", score: 2.9, severity: "high", created_at: "2024-01-15T14:12:47Z" },
        { id: "a-008", metric: "cpu", score: 1.7, severity: "medium", created_at: "2024-01-15T14:09:14Z" },
        { id: "a-009", metric: "mem", score: 2.1, severity: "medium", created_at: "2024-01-15T14:05:52Z" },
        { id: "a-010", metric: "error_rate", score: 1.4, severity: "low", created_at: "2024-01-15T14:02:38Z" },
        { id: "a-011", metric: "latency", score: 2.6, severity: "high", created_at: "2024-01-15T13:59:25Z" },
        { id: "a-012", metric: "cpu", score: 1.9, severity: "medium", created_at: "2024-01-15T13:56:12Z" },
        { id: "a-013", metric: "mem", score: 3.2, severity: "critical", created_at: "2024-01-15T13:52:59Z" },
        { id: "a-014", metric: "failed_logins", score: 1.6, severity: "medium", created_at: "2024-01-15T13:49:46Z" },
        { id: "a-015", metric: "error_rate", score: 2.4, severity: "high", created_at: "2024-01-15T13:46:33Z" },
        { id: "a-016", metric: "cpu", score: 1.3, severity: "low", created_at: "2024-01-15T13:43:20Z" },
        { id: "a-017", metric: "mem", score: 2.8, severity: "high", created_at: "2024-01-15T13:40:07Z" },
        { id: "a-018", metric: "latency", score: 1.8, severity: "medium", created_at: "2024-01-15T13:36:54Z" },
        { id: "a-019", metric: "cpu", score: 2.2, severity: "high", created_at: "2024-01-15T13:33:41Z" },
        { id: "a-020", metric: "mem", score: 1.5, severity: "low", created_at: "2024-01-15T13:30:28Z" }
    ],

    // Actions data
    actions: [
        { id: "act-001", action: "Scale Deployment", status: "completed", result: "Success", created_at: "2024-01-15T14:25:18Z" },
        { id: "act-002", action: "Restart Service", status: "completed", result: "Success", created_at: "2024-01-15T14:18:33Z" },
        { id: "act-003", action: "Quarantine Host", status: "completed", result: "Success", created_at: "2024-01-15T14:12:47Z" },
        { id: "act-004", action: "Rollout Undo", status: "completed", result: "Success", created_at: "2024-01-15T14:05:52Z" },
        { id: "act-005", action: "Scale Deployment", status: "in_progress", result: "Running", created_at: "2024-01-15T14:02:38Z" },
        { id: "act-006", action: "Restart Service", status: "completed", result: "Success", created_at: "2024-01-15T13:59:25Z" },
        { id: "act-007", action: "Quarantine Host", status: "failed", result: "Error", created_at: "2024-01-15T13:56:12Z" },
        { id: "act-008", action: "Rollout Undo", status: "completed", result: "Success", created_at: "2024-01-15T13:52:59Z" }
    ],

    // Runbooks
    runbooks: [
        {
            name: "Scale Deployment",
            description: "Automatically scale deployment based on CPU/memory usage",
            category: "scaling"
        },
        {
            name: "Restart Service",
            description: "Gracefully restart a service to resolve memory leaks",
            category: "maintenance"
        },
        {
            name: "Quarantine Host",
            description: "Isolate a compromised or problematic host",
            category: "security"
        },
        {
            name: "Rollout Undo",
            description: "Rollback a deployment to the previous stable version",
            category: "deployment"
        },
        {
            name: "Clear Cache",
            description: "Clear application and system caches",
            category: "performance"
        },
        {
            name: "Database Optimization",
            description: "Optimize database connections and queries",
            category: "database"
        }
    ],

    // Policies
    policies: [
        {
            name: "CPU Threshold Policy",
            status: "active",
            description: "Trigger actions when CPU usage exceeds 80%"
        },
        {
            name: "Memory Leak Detection",
            status: "active",
            description: "Detect and remediate memory leaks automatically"
        },
        {
            name: "Error Rate Monitoring",
            status: "active",
            description: "Monitor error rates and trigger rollbacks"
        },
        {
            name: "Security Incident Response",
            status: "active",
            description: "Automated response to security incidents"
        },
        {
            name: "Performance Degradation",
            status: "inactive",
            description: "Detect and respond to performance issues"
        }
    ],

    // Chat responses
    chatResponses: {
        "top 3 error budget burn": {
            answer: `Summary: 3 services drove 82% of EBR burn in the last 24h; auto-remediation cut post-action burn by ~58%; EBR remaining 84%; estimated cost avoided $46,000.

Top 1 — API (Error Rate)
Burn contributed: 36% of total
Before: error rate 12.4% → p95 420 ms
Action: Rollout Undo at 11:03
After: error rate 2.1% → p95 210 ms (within SLO in 14 min)
Burn avoided: ~19% EBR; Confidence: 0.88; Next: tighten canary threshold to 5% err for 5m; cooldown 10m

Top 2 — Web (CPU Saturation)
Burn contributed: 28% of total
Before: CPU 91% → p95 510 ms
Action: Scale Deployment +2 at 15:27
After: CPU 61% → p95 260 ms (stable in 9 min)
Burn avoided: ~14% EBR; Confidence: 0.84; Next: autoscale min replicas 4 during peak; cooldown 2m

Top 3 — Auth (Login Failures)
Burn contributed: 18% of total
Before: failed logins 27/min → error rate 7.8%
Action: Quarantine Host + enforce MFA at 19:42
After: failures 3/min → error rate 1.2% (normalized in 11 min)
Burn avoided: ~9% EBR; Confidence: 0.81; Next: rate-limit /login 50 req/min per IP; cooldown 10m

Totals: incidents mitigated 3 · actions executed 5 (SR 90%) · median time-to-stability 11 min · EBR remaining 84% · cost avoided $46,000
Method: correlated anomaly windows to EBR deltas; compared pre/post metrics ±15m; estimated burn avoided from slope change after actions.`,
            reasoning: "Analyzed error budget burn patterns across services and correlated with remediation actions"
        },
        "deployments highest latency regression week": {
            answer: `Summary: 3 deployments accounted for 79% of this week's latency regression; post‑remediation p95 dropped ~55% on average; SLOs recovered within 15–25 minutes; estimated cost avoided $38,000.

Top 1 — API v2.14.3 (deployed Tue 11:05)
Regression: +68% p95
Before: 210 ms → After deploy: 354 ms
Blast radius: 42% of API traffic, peak 12:10–12:40
Action: Rollout Undo at 12:18
Result: p95 198 ms in 17 min; error rate steady (≤1.6%)
Confidence: 0.91; Next: gate promotions on p95 ≤ 230 ms during canary (10 min); add pre‑deploy load test

Top 2 — Web v1.9.7 (deployed Thu 16:22)
Regression: +47% p95
Before: 270 ms → After deploy: 397 ms
Blast radius: 28% of requests (US‑East), CDN cache miss surge
Action: Scale Deployment +2 at 16:35; warm CDN routes
Result: p95 248 ms in 12 min; cache hit +19 pp
Confidence: 0.86; Next: pre‑warm top 50 routes; autoscale min replicas 4 during peak

Top 3 — Auth v3.3.1 (deployed Mon 09:41)
Regression: +31% p95
Before: 180 ms → After deploy: 236 ms
Blast radius: login and token refresh paths
Action: Optimize DB pool + revert JWT lib patch at 10:02
Result: p95 172 ms in 21 min; DB wait −35%
Confidence: 0.83; Next: raise pool floor by +20% during traffic spikes; add connection warm‑up

Totals: affected deployments 3 · actions executed 4 (SR 100%) · median time‑to‑recovery 17 min · SLOs back within targets · cost avoided $38,000
Method: correlated deploy timestamps with p95 deltas (±60 min); compared against 24h pre‑baseline; attributed by traffic share; validated improvement from slope change after actions.`,
            reasoning: "Analyzed deployment history and correlated latency regressions with remediation actions"
        },
        "default": {
            answer: "I can help you analyze your infrastructure metrics, incidents, and operational patterns. Try asking about:\n\n• Top error budget burn sources\n• Deployment latency regressions\n• Anomaly patterns and trends\n• Action effectiveness analysis\n• System health overview\n\nWhat would you like to know about your operations?",
            reasoning: "General help response for unrecognized queries"
        }
    },

    // Action plans
    actionPlans: [
        {
            title: "CPU Spike Remediation",
            steps: [
                {
                    number: 1,
                    title: "Scale API Deployment",
                    description: "Increase replica count by 2 to handle increased load"
                },
                {
                    number: 2,
                    title: "Monitor Response",
                    description: "Watch CPU metrics for 5 minutes to validate scaling"
                },
                {
                    number: 3,
                    title: "Optimize Queries",
                    description: "Review and optimize slow database queries if needed"
                }
            ]
        },
        {
            title: "Memory Leak Resolution",
            steps: [
                {
                    number: 1,
                    title: "Restart Affected Service",
                    description: "Gracefully restart the service to clear memory leaks"
                },
                {
                    number: 2,
                    title: "Verify Memory Usage",
                    description: "Confirm memory usage returns to normal levels"
                },
                {
                    number: 3,
                    title: "Schedule Investigation",
                    description: "Plan root cause analysis for the memory leak"
                }
            ]
        }
    ],

    // Narrative content
    narratives: [
        "System detected CPU spike in API cluster at 14:28:42, triggering automatic scaling action",
        "Memory usage trending upward across multiple services, monitoring for potential leaks",
        "Error rate within normal bounds, no immediate action required",
        "Database connection pool approaching capacity, considering optimization",
        "Load balancer configuration updated successfully, improved traffic distribution",
        "Scheduled maintenance window completed without issues",
        "Security scan completed, no vulnerabilities detected",
        "Performance metrics showing improvement after recent optimizations"
    ],

    // Metrics data for charts
    metrics: {
        cpu: generateMockMetricsData('cpu', 45, 20, 4),
        mem: generateMockMetricsData('mem', 60, 10, 3),
        latency: generateMockMetricsData('latency', 180, 80, 15),
        error_rate: generateMockMetricsData('error_rate', 1, 1.5, 0.6),
        failed_logins: generateMockMetricsData('failed_logins', 5, 10, 3)
    }
};

// Helper function to generate mock metrics data
function generateMockMetricsData(metric, base, amplitude, noise) {
    const length = 120; // ~last 10-15 minutes
    const data = [];
    const now = Date.now();
    
    for (let i = 0; i < length; i++) {
        const timestamp = now - (length - i) * 5000;
        const phase = i / 12;
        const noiseValue = (Math.random() - 0.5) * noise;
        
        let value = base;
        if (metric === 'cpu') {
            value = base + amplitude * Math.sin(phase) + noiseValue;
        } else if (metric === 'mem') {
            value = base + amplitude * Math.cos(phase / 2) + noiseValue;
        } else if (metric === 'latency') {
            value = base + amplitude * Math.abs(Math.sin(phase / 1.5)) + noiseValue;
        } else if (metric === 'error_rate') {
            value = Math.max(0, base + amplitude * Math.abs(Math.sin(phase * 1.8)) + noiseValue);
        } else if (metric === 'failed_logins') {
            value = Math.max(0, base + amplitude * Math.max(0, Math.sin(phase * 0.9)) + noiseValue);
        }
        
        data.push({
            timestamp: timestamp,
            value: Number(value.toFixed(2))
        });
    }
    
    return data;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnterpriseData;
}
