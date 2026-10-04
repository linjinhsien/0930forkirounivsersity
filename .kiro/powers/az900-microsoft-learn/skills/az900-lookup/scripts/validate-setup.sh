#!/usr/bin/env sh
# validate-setup.sh
# Verifies prerequisites for the az900-microsoft-learn power

set -e

echo "🔍 Checking prerequisites for az900-microsoft-learn power..."

# 1. Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is not installed. Please install Node.js 18+."
  exit 1
fi

NODE_VERSION=$(node -e "process.stdout.write(process.version.slice(1).split('.')[0])")
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js $NODE_VERSION found, but 18+ is required."
  exit 1
fi
echo "✅ Node.js v$(node --version | tr -d v) found."

# 2. Check MCP server file exists
MCP_SERVER=".kiro/powers/az900-microsoft-learn/mcp-server/index.cjs"
if [ ! -f "$MCP_SERVER" ]; then
  echo "❌ MCP server not found at $MCP_SERVER"
  exit 1
fi
echo "✅ MCP server found at $MCP_SERVER"

# 3. Check network connectivity to Microsoft Learn API
if command -v curl >/dev/null 2>&1; then
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "https://learn.microsoft.com/api/catalog/?locale=en-us&certifications=az-900" 2>/dev/null || echo "000")
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Microsoft Learn API is reachable (HTTP $HTTP_STATUS)."
  else
    echo "⚠️  Microsoft Learn API returned HTTP $HTTP_STATUS. Check your network connection."
  fi
elif command -v node >/dev/null 2>&1; then
  node -e "
    const https = require('https');
    const req = https.get('https://learn.microsoft.com/api/catalog/?locale=en-us&certifications=az-900', (res) => {
      process.stdout.write('✅ Microsoft Learn API is reachable (HTTP ' + res.statusCode + ').\n');
      process.exit(0);
    });
    req.on('error', () => {
      process.stdout.write('⚠️  Cannot reach Microsoft Learn API. Check your network.\n');
      process.exit(0);
    });
    req.setTimeout(5000, () => { req.destroy(); process.exit(0); });
  "
fi

echo ""
echo "✅ All checks passed. az900-microsoft-learn power is ready."
