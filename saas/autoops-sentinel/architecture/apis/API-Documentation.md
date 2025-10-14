# AutoOps Sentinel - API Documentation

## Overview

AutoOps Sentinel provides a comprehensive REST API that enables programmatic access to all platform capabilities. The API is designed with modern standards, comprehensive documentation, and enterprise-grade security.

### Base URL
```
Production: https://api.autoops-sentinel.com/v1
Staging: https://staging-api.autoops-sentinel.com/v1
Development: https://dev-api.autoops-sentinel.com/v1
```

### Authentication
All API requests require authentication using JWT tokens or API keys:
```bash
Authorization: Bearer <jwt_token>
# or
X-API-Key: <api_key>
```

---

## Core Services APIs

### Agent Service API

#### Query Agent
Submit natural language queries to the AI agent.

```http
POST /agent/query
Content-Type: application/json

{
  "question": "What are the top 3 error budget burn sources in the last 24 hours?",
  "context": {
    "time_range": "24h",
    "services": ["api", "web", "auth"],
    "include_reasoning": true
  }
}
```

**Response:**
```json
{
  "answer": "Summary: 3 services drove 82% of EBR burn in the last 24h...",
  "reasoning": "Analyzed error budget burn patterns across services...",
  "confidence": 0.88,
  "sources": [
    {
      "type": "metrics",
      "source": "api-cluster-01",
      "relevance": 0.95
    }
  ],
  "timestamp": "2024-01-15T14:32:15Z"
}
```

#### Get Insights
Retrieve operational insights and recommendations.

```http
GET /agent/insights?time_range=7d&category=performance
```

**Response:**
```json
{
  "insights": [
    {
      "id": "insight-001",
      "title": "CPU Usage Trending Upward",
      "description": "API cluster showing 15% increase in CPU usage over 7 days",
      "severity": "medium",
      "confidence": 0.82,
      "recommendations": [
        "Consider scaling API deployment",
        "Review recent code changes"
      ],
      "created_at": "2024-01-15T14:30:00Z"
    }
  ],
  "total_count": 1,
  "next_cursor": "eyJpZCI6Imluc2lnaHQtMDAxIn0="
}
```

### Detector Service API

#### Analyze Data
Submit data for anomaly detection analysis.

```http
POST /detector/analyze
Content-Type: application/json

{
  "data": [
    {
      "timestamp": "2024-01-15T14:30:00Z",
      "metric": "cpu_usage",
      "value": 85.2,
      "source": "api-cluster-01"
    }
  ],
  "models": ["isolation_forest", "lstm_autoencoder"],
  "threshold": 0.8
}
```

**Response:**
```json
{
  "anomalies": [
    {
      "id": "anomaly-001",
      "metric": "cpu_usage",
      "score": 0.92,
      "severity": "high",
      "confidence": 0.88,
      "detected_at": "2024-01-15T14:30:00Z",
      "models_used": ["isolation_forest", "lstm_autoencoder"],
      "explanation": "CPU usage spike detected above 95th percentile"
    }
  ],
  "processing_time_ms": 245,
  "models_performance": {
    "isolation_forest": {"accuracy": 0.99, "latency_ms": 120},
    "lstm_autoencoder": {"accuracy": 0.98, "latency_ms": 180}
  }
}
```

#### Get Models
List available anomaly detection models.

```http
GET /detector/models
```

**Response:**
```json
{
  "models": [
    {
      "id": "isolation_forest_v2",
      "name": "Isolation Forest",
      "version": "2.1.0",
      "type": "unsupervised",
      "accuracy": 0.992,
      "latency_ms": 120,
      "supported_metrics": ["cpu", "memory", "latency", "error_rate"],
      "last_trained": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### Remediator Service API

#### Execute Action
Execute a remediation action.

```http
POST /remediator/execute
Content-Type: application/json

{
  "action": "scale_deployment",
  "target": "api-deployment",
  "parameters": {
    "replicas": 5,
    "reason": "High CPU usage detected"
  },
  "safety_checks": {
    "max_replicas": 10,
    "min_replicas": 2,
    "approval_required": false
  }
}
```

**Response:**
```json
{
  "execution_id": "exec-001",
  "status": "in_progress",
  "action": "scale_deployment",
  "target": "api-deployment",
  "parameters": {
    "replicas": 5,
    "reason": "High CPU usage detected"
  },
  "estimated_duration": "2m 30s",
  "created_at": "2024-01-15T14:32:15Z",
  "updated_at": "2024-01-15T14:32:15Z"
}
```

#### Get Execution Status
Check the status of a remediation action.

```http
GET /remediator/executions/{execution_id}
```

**Response:**
```json
{
  "execution_id": "exec-001",
  "status": "completed",
  "action": "scale_deployment",
  "target": "api-deployment",
  "result": {
    "success": true,
    "replicas_before": 3,
    "replicas_after": 5,
    "duration": "2m 15s",
    "impact": {
      "cpu_reduction": 25.3,
      "latency_improvement": 15.2
    }
  },
  "created_at": "2024-01-15T14:32:15Z",
  "completed_at": "2024-01-15T14:34:30Z"
}
```

### Policy Engine API

#### List Policies
Get all active policies.

```http
GET /policies?status=active&category=performance
```

**Response:**
```json
{
  "policies": [
    {
      "id": "policy-001",
      "name": "CPU Threshold Policy",
      "description": "Trigger actions when CPU usage exceeds 80%",
      "category": "performance",
      "status": "active",
      "rules": [
        {
          "condition": "cpu_usage > 80",
          "action": "scale_deployment",
          "parameters": {"replicas": "+2"}
        }
      ],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  ],
  "total_count": 1
}
```

#### Create Policy
Create a new policy.

```http
POST /policies
Content-Type: application/json

{
  "name": "Memory Leak Detection",
  "description": "Detect and remediate memory leaks automatically",
  "category": "performance",
  "rules": [
    {
      "condition": "memory_usage > 90 AND memory_growth_rate > 5",
      "action": "restart_service",
      "parameters": {"service": "web-service"}
    }
  ],
  "enabled": true
}
```

**Response:**
```json
{
  "id": "policy-002",
  "name": "Memory Leak Detection",
  "description": "Detect and remediate memory leaks automatically",
  "category": "performance",
  "status": "active",
  "rules": [
    {
      "id": "rule-001",
      "condition": "memory_usage > 90 AND memory_growth_rate > 5",
      "action": "restart_service",
      "parameters": {"service": "web-service"}
    }
  ],
  "created_at": "2024-01-15T14:35:00Z",
  "updated_at": "2024-01-15T14:35:00Z"
}
```

---

## Data APIs

### Metrics API

#### Get Metrics
Retrieve time-series metrics data.

```http
GET /metrics?metric=cpu_usage&start_time=2024-01-15T00:00:00Z&end_time=2024-01-15T23:59:59Z&interval=1m
```

**Response:**
```json
{
  "metric": "cpu_usage",
  "data": [
    {
      "timestamp": "2024-01-15T00:00:00Z",
      "value": 45.2,
      "source": "api-cluster-01"
    },
    {
      "timestamp": "2024-01-15T00:01:00Z",
      "value": 47.8,
      "source": "api-cluster-01"
    }
  ],
  "aggregation": {
    "min": 42.1,
    "max": 89.3,
    "avg": 58.7,
    "p95": 78.2,
    "p99": 85.1
  }
}
```

#### Get Available Metrics
List all available metrics.

```http
GET /metrics/available
```

**Response:**
```json
{
  "metrics": [
    {
      "name": "cpu_usage",
      "description": "CPU utilization percentage",
      "unit": "percent",
      "type": "gauge",
      "sources": ["api-cluster-01", "web-cluster-01"]
    },
    {
      "name": "memory_usage",
      "description": "Memory utilization percentage",
      "unit": "percent",
      "type": "gauge",
      "sources": ["api-cluster-01", "web-cluster-01"]
    }
  ]
}
```

### Anomalies API

#### Get Anomalies
Retrieve detected anomalies.

```http
GET /anomalies?severity=high&limit=50&offset=0
```

**Response:**
```json
{
  "anomalies": [
    {
      "id": "anomaly-001",
      "metric": "cpu_usage",
      "score": 0.92,
      "severity": "high",
      "confidence": 0.88,
      "source": "api-cluster-01",
      "detected_at": "2024-01-15T14:30:00Z",
      "description": "CPU usage spike detected above 95th percentile",
      "status": "active"
    }
  ],
  "total_count": 1,
  "has_more": false
}
```

#### Update Anomaly Status
Update the status of an anomaly.

```http
PUT /anomalies/{anomaly_id}
Content-Type: application/json

{
  "status": "resolved",
  "resolution_notes": "Issue resolved by scaling deployment"
}
```

### Actions API

#### Get Actions
Retrieve executed actions.

```http
GET /actions?status=completed&limit=50&offset=0
```

**Response:**
```json
{
  "actions": [
    {
      "id": "action-001",
      "type": "scale_deployment",
      "target": "api-deployment",
      "status": "completed",
      "parameters": {
        "replicas": 5,
        "reason": "High CPU usage detected"
      },
      "result": {
        "success": true,
        "replicas_before": 3,
        "replicas_after": 5,
        "duration": "2m 15s"
      },
      "created_at": "2024-01-15T14:32:15Z",
      "completed_at": "2024-01-15T14:34:30Z"
    }
  ],
  "total_count": 1,
  "has_more": false
}
```

---

## Webhook APIs

### Webhook Management

#### Create Webhook
Create a new webhook endpoint.

```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://example.com/webhook",
  "events": ["anomaly.detected", "action.completed"],
  "secret": "webhook_secret_key",
  "enabled": true
}
```

**Response:**
```json
{
  "id": "webhook-001",
  "url": "https://example.com/webhook",
  "events": ["anomaly.detected", "action.completed"],
  "secret": "webhook_secret_key",
  "enabled": true,
  "created_at": "2024-01-15T14:35:00Z"
}
```

#### Webhook Payload Example
```json
{
  "event": "anomaly.detected",
  "timestamp": "2024-01-15T14:30:00Z",
  "data": {
    "anomaly_id": "anomaly-001",
    "metric": "cpu_usage",
    "score": 0.92,
    "severity": "high",
    "source": "api-cluster-01"
  },
  "signature": "sha256=abc123..."
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request parameters are invalid",
    "details": {
      "field": "metric",
      "reason": "Metric name is required"
    },
    "request_id": "req-123456789"
  }
}
```

### HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable

### Rate Limiting
- **Standard Tier**: 1,000 requests per hour
- **Professional Tier**: 10,000 requests per hour
- **Enterprise Tier**: 100,000 requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## SDKs and Libraries

### Python SDK
```python
from autoops_sentinel import AutoOpsClient

client = AutoOpsClient(api_key="your_api_key")

# Query the agent
response = client.agent.query(
    question="What are the top anomalies in the last hour?",
    context={"time_range": "1h"}
)

# Get anomalies
anomalies = client.anomalies.list(severity="high", limit=10)

# Execute action
execution = client.remediator.execute(
    action="scale_deployment",
    target="api-deployment",
    parameters={"replicas": 5}
)
```

### JavaScript SDK
```javascript
import { AutoOpsClient } from '@autoops/sentinel-sdk';

const client = new AutoOpsClient({
  apiKey: 'your_api_key'
});

// Query the agent
const response = await client.agent.query({
  question: 'What are the top anomalies in the last hour?',
  context: { time_range: '1h' }
});

// Get anomalies
const anomalies = await client.anomalies.list({
  severity: 'high',
  limit: 10
});

// Execute action
const execution = await client.remediator.execute({
  action: 'scale_deployment',
  target: 'api-deployment',
  parameters: { replicas: 5 }
});
```

### Go SDK
```go
package main

import (
    "context"
    "github.com/autoops/sentinel-go"
)

func main() {
    client := sentinel.NewClient("your_api_key")
    
    // Query the agent
    response, err := client.Agent.Query(context.Background(), &sentinel.QueryRequest{
        Question: "What are the top anomalies in the last hour?",
        Context: map[string]interface{}{
            "time_range": "1h",
        },
    })
    
    // Get anomalies
    anomalies, err := client.Anomalies.List(context.Background(), &sentinel.AnomalyListRequest{
        Severity: "high",
        Limit:    10,
    })
    
    // Execute action
    execution, err := client.Remediator.Execute(context.Background(), &sentinel.ExecuteRequest{
        Action: "scale_deployment",
        Target: "api-deployment",
        Parameters: map[string]interface{}{
            "replicas": 5,
        },
    })
}
```

---

## API Versioning

### Version Strategy
- **Major versions** (v1, v2): Breaking changes
- **Minor versions** (v1.1, v1.2): New features, backward compatible
- **Patch versions** (v1.1.1, v1.1.2): Bug fixes, backward compatible

### Deprecation Policy
- **6 months notice** for API deprecation
- **12 months support** for deprecated versions
- **Migration guides** provided for major version changes

### Current Versions
- **v1**: Current stable version
- **v2**: Beta version (available for testing)

---

## Testing and Development

### Postman Collection
Download our Postman collection for easy API testing:
```
https://api.autoops-sentinel.com/docs/postman/collection.json
```

### OpenAPI Specification
Access our OpenAPI 3.0 specification:
```
https://api.autoops-sentinel.com/docs/openapi.json
```

### Interactive Documentation
Try our APIs directly in the browser:
```
https://api.autoops-sentinel.com/docs
```

---

*Document Version: 1.0*  
*Last Updated: January 2024*  
*Classification: Public API Documentation*
