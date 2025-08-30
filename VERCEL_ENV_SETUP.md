# Vercel Environment Variables Setup

## Required Environment Variables

You MUST set these environment variables in your Vercel project settings before deployment:

### 1. Go to Vercel Dashboard
1. Navigate to your project
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar

### 2. Add These Required Variables

#### WooCommerce API Configuration (REQUIRED)
```
WP_BASE_URL = https://your-wordpress-site.com
WOO_CONSUMER_KEY = ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOO_CONSUMER_SECRET = cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**How to get these:**
1. Log into your WordPress admin
2. Go to WooCommerce → Settings → Advanced → REST API
3. Click "Add key"
4. Set description (e.g., "Vercel Production")
5. Set permissions to "Read"
6. Click "Generate API key"
7. Copy the Consumer key and Consumer secret immediately (they won't be shown again)

#### NextAuth Configuration (REQUIRED)
```
NEXTAUTH_URL = https://your-vercel-app.vercel.app
NEXTAUTH_SECRET = [generate with: openssl rand -base64 32]
```

**To generate NEXTAUTH_SECRET:**
Run this command in your terminal:
```bash
openssl rand -base64 32
```

### 3. Optional Variables

#### For Webhook Auto-Rebuilds
```
WEBHOOK_SECRET = [generate with: openssl rand -hex 32]
VERCEL_DEPLOY_HOOK = https://api.vercel.com/v1/integrations/deploy/xxxxx
```

#### For Revalidation
```
REVALIDATE_SECRET = [generate with: openssl rand -hex 32]
```

### 4. Example Values (DO NOT USE IN PRODUCTION)
```
WP_BASE_URL = https://blackboard.example.com
WOO_CONSUMER_KEY = ck_a5f9c8b7d6e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0
WOO_CONSUMER_SECRET = cs_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b
NEXTAUTH_URL = https://blackboard-headless.vercel.app
NEXTAUTH_SECRET = kH8Q2M5vR9wX3nY6pT1sL4jG7fD0aZ8cV2bN5mK9
```

## Troubleshooting

### Build Error: "Failed to parse URL"
This means the WP_BASE_URL is not set. Make sure you've added all required variables.

### Build Error: "WooCommerce API error"
This means either:
- Your API keys are incorrect
- Your WordPress site is not accessible from Vercel
- WooCommerce REST API is not enabled

### Authentication Not Working
- Ensure NEXTAUTH_URL matches your actual Vercel deployment URL
- Ensure NEXTAUTH_SECRET is set and is a random string

## Testing Your Configuration

After setting environment variables:
1. Trigger a new deployment in Vercel
2. Check the build logs for any errors
3. Visit your deployed site and test:
   - Product listing on /shop
   - Individual product pages
   - Cart functionality
   - Login (if WordPress JWT is configured)

## Security Notes

- Never commit these values to your repository
- Use different API keys for development and production
- Regularly rotate your API keys
- Set WooCommerce API permissions to "Read" only unless you need write access