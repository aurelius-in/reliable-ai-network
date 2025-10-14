#!/usr/bin/env python3
"""
Simple HTTP server for MyRiskAgent Demo
Run this script to serve the demo locally
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to allow local file access
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to the demo directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"🚀 Starting MyRiskAgent Demo Server...")
    print(f"📍 Serving from: {os.getcwd()}")
    print(f"🌐 URL: http://localhost:{PORT}")
    print(f"📱 Open your browser to: http://localhost:{PORT}")
    print(f"⏹️  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://localhost:{PORT}')
            except:
                pass
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use. Try a different port:")
            print(f"   python serve.py --port 8081")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Simple argument parsing
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print("MyRiskAgent Demo Server")
        print("Usage: python serve.py [--port PORT]")
        print("Default port: 8080")
        sys.exit(0)
    
    if len(sys.argv) > 2 and sys.argv[1] == "--port":
        try:
            PORT = int(sys.argv[2])
        except ValueError:
            print("❌ Invalid port number")
            sys.exit(1)
    
    main()
