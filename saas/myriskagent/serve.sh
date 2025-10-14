#!/bin/bash

echo "🚀 Starting MyRiskAgent Demo Server..."
echo ""
echo "📍 This will serve the demo at http://localhost:8080"
echo "📱 Your browser should open automatically"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Python not found. Please install Python 3.6+ and try again."
        echo "   On Ubuntu/Debian: sudo apt install python3"
        echo "   On macOS: brew install python3"
        echo "   On CentOS/RHEL: sudo yum install python3"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# Make the script executable and start the server
chmod +x "$0"
$PYTHON_CMD serve.py
