# Environment Setup Guide

This guide explains how to configure the BlackBoard Training headless Next.js application for different environments.

## Environment Configuration

The application can run in three different environments:
- **Local Development** - Using Local by Flywheel (blackboard-local.local)
- **Staging** - For testing before production
- **Production** - Live site

## Quick Setup

### 1. Edit `.env.local` File

Open `/Users/gregorwallner/WebstormProjects/blackboard-headless/.env.local` and:

1. **Comment out** the environment you don't want to use (add `#` at the start of each line)
2. **Uncomment** the environment you want to use (remove `#` from the start of each line)

### 2. Local Development Setup (Default)

Currently configured for local development. No changes needed if using Local by Flywheel with:
- Site name: `blackboard-local`
- Port: `10074`

```bash
# Already active in .env.local
WP_BASE_URL=http://blackboard-local.local
WORDPRESS_API_URL=http://localhost:10074
NEXT_PUBLIC_WORDPRESS_API_URL=http://localhost:10074
NEXT_PUBLIC_WOO_API_URL=http://localhost:10074/wp-json/wc/v3
WOO_CONSUMER_KEY=ck_1fb8d1f5c245956e7c3ab2cd34edc0c081d30413
WOO_CONSUMER_SECRET=cs_075b44c145e1d110d004ae9f04d4241cb05083cc
```

### 3. Staging Setup

To use staging:

1. In `.env.local`, **comment out** the Local Development block
2. **Uncomment** the Staging Environment block
3. Update the credentials:

```bash
# Uncomment and update these lines:
WP_BASE_URL=https://staging.blackboard-training.com
WORDPRESS_API_URL=https://staging.blackboard-training.com
NEXT_PUBLIC_WORDPRESS_API_URL=https://staging.blackboard-training.com
NEXT_PUBLIC_WOO_API_URL=https://staging.blackboard-training.com/wp-json/wc/v3

# Get these from WP Admin → WooCommerce → Settings → Advanced → REST API
WOO_CONSUMER_KEY=your_staging_consumer_key_here
WOO_CONSUMER_SECRET=your_staging_consumer_secret_here
```

### 4. Production Setup

To use production:

1. In `.env.local`, **comment out** the Local Development block
2. **Uncomment** the Production Environment block
3. Update the credentials:

```bash
# Uncomment and update these lines:
WP_BASE_URL=https://blackboard-training.com
WORDPRESS_API_URL=https://blackboard-training.com
NEXT_PUBLIC_WORDPRESS_API_URL=https://blackboard-training.com
NEXT_PUBLIC_WOO_API_URL=https://blackboard-training.com/wp-json/wc/v3

# Get these from WP Admin → WooCommerce → Settings → Advanced → REST API
WOO_CONSUMER_KEY=your_production_consumer_key_here
WOO_CONSUMER_SECRET=your_production_consumer_secret_here
```

## Getting WooCommerce API Keys

1. Log into WordPress Admin
2. Go to **WooCommerce → Settings → Advanced → REST API**
3. Click **Add Key**
4. Set:
   - Description: "Next.js Headless App"
   - User: Select an admin user
   - Permissions: **Read/Write**
5. Click **Generate API Key**
6. Copy the **Consumer Key** and **Consumer Secret**
7. Add them to your `.env.local` file

⚠️ **Security Note**: Never commit the actual API keys to Git. The `.env.local` file is in `.gitignore`.

## Restart Development Server

After changing environment variables:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Verifying Your Setup

Check which environment is active:

```bash
# Look at the console when starting the dev server
npm run dev

# You should see:
# - Loading products from: [YOUR_API_URL]
```

## Image Configuration

The `next.config.mjs` file is already configured to handle images from:
- ✅ Local development (localhost:10074)
- ✅ Staging (*.blackboard-training.com)
- ✅ Production (blackboard-training.com)
- ✅ Vimeo thumbnails (i.vimeocdn.com)

No changes needed for images.

## Troubleshooting

### Products/Courses Not Loading

1. Check that WordPress is running (Local by Flywheel app should be open)
2. Verify the API URL in `.env.local` matches your Local site
3. Test the API directly:
   ```bash
   curl http://localhost:10074/wp-json/wc/v3/products?consumer_key=YOUR_KEY&consumer_secret=YOUR_SECRET
   ```

### API Authentication Errors

1. Regenerate your WooCommerce API keys
2. Update `.env.local` with new keys
3. Restart the dev server

### Image Loading Issues

1. Check `next.config.mjs` includes your domain in `remotePatterns`
2. Verify images exist in WordPress Media Library
3. Check browser console for CORS errors

## Files That Reference Environment URLs

All WordPress/WooCommerce API connections use environment variables from `.env.local`:

- ✅ `/lib/woocommerce/courses.ts` - Uses `WORDPRESS_API_URL`
- ✅ `/app/api/courses/check-access/route.ts` - Uses `WORDPRESS_API_URL`
- ✅ All other API files - Use environment variables

**No hardcoded production URLs remain in the codebase.**

## Need Help?

- Check WordPress is running
- Verify API keys are correct
- Test API endpoint directly with curl
- Check browser console for errors
- Restart the dev server after environment changes