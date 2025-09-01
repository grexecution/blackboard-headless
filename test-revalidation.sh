#!/bin/bash

# Test revalidation endpoint
echo "Testing Next.js Revalidation Endpoint"
echo "======================================"
echo ""

# Your site URL (update this)
SITE_URL="http://localhost:3000"
# SITE_URL="https://your-site.vercel.app"

# Your secret (from .env.local)
SECRET="1JAGOKOt+SKB4MgSVMVh/SMCZAB8BGiYEKjnOp63EOI="

echo "Testing revalidation at: $SITE_URL/api/revalidate"
echo ""

# Test with curl
curl -X POST "$SITE_URL/api/revalidate" \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: $SECRET" \
  -d '{
    "type": "all",
    "action": "manual.sync"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n"

echo ""
echo "Check your Next.js console for [Revalidation] logs"
echo ""
echo "To test from WordPress:"
echo "1. Go to WooCommerce → Next.js Sync"
echo "2. Enter your Next.js URL: $SITE_URL"
echo "3. Enter your secret: $SECRET"
echo "4. Click 'Trigger Manual Sync'"