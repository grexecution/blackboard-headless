# Static Generation & Revalidation Setup

This guide explains how to set up automatic static generation and on-demand revalidation for your BlackBoard Next.js site.

## Overview

The site is configured for maximum performance using:
- **Static Generation**: All pages are pre-rendered at build time
- **On-Demand Revalidation**: Pages are rebuilt when content changes in WordPress
- **Webhook Integration**: Automatic updates when products change in WooCommerce

## Benefits

- ⚡ **Lightning Fast**: Pages load instantly (pre-rendered HTML)
- 🔄 **Always Fresh**: Content updates automatically when changed in WordPress
- 💰 **Cost Effective**: Minimal server resources needed
- 🌍 **Global Performance**: Works perfectly with CDNs

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local` file:

```env
# Revalidation Secret (generate a strong random string)
REVALIDATE_SECRET=your-very-secure-secret-key-here
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 2. Deploy to Vercel

The site is optimized for Vercel deployment:

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - All WooCommerce API credentials
   - `REVALIDATE_SECRET`
4. Deploy

### 3. WordPress Plugin Installation

#### Option A: Manual Installation

1. Upload the `wordpress-plugin/blackboard-nextjs-sync.php` file to your WordPress site
2. Place it in `/wp-content/plugins/blackboard-nextjs-sync/` directory
3. Activate the plugin in WordPress admin

#### Option B: Direct Installation

1. Copy the plugin code from `wordpress-plugin/blackboard-nextjs-sync.php`
2. Create a new file in WordPress: `/wp-content/plugins/blackboard-nextjs-sync/blackboard-nextjs-sync.php`
3. Paste the code and save
4. Activate in WordPress admin → Plugins

### 4. Configure WordPress Plugin

1. Go to **WooCommerce → Next.js Sync** in WordPress admin
2. Enter your settings:
   - **Next.js Site URL**: Your Vercel URL (e.g., `https://blackboard.vercel.app`)
   - **Revalidation Secret**: Same secret from your `.env.local`
3. Save settings
4. Test with "Trigger Manual Sync" button

## Manual Revalidation Methods

### Method 1: WordPress Admin (Recommended)

Use the WordPress plugin interface:
1. Go to **WooCommerce → Next.js Sync** in WordPress admin
2. Click **"Trigger Manual Sync"** button
3. Wait for success confirmation
4. Your site is rebuilt with fresh content!

This is the primary method for all content updates and manual rebuilds.

### Method 2: URL Trigger (Emergency/Testing)

Trigger revalidation directly via URL:

```bash
# Revalidate everything
https://your-site.vercel.app/api/revalidate?secret=YOUR_SECRET&type=all

# Revalidate shop pages only
https://your-site.vercel.app/api/revalidate?secret=YOUR_SECRET&type=shop
```

### Method 3: cURL Command (Developer)

```bash
# Revalidate all pages
curl -X POST https://your-site.vercel.app/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: YOUR_SECRET" \
  -d '{"type": "all"}'

# Revalidate specific product
curl -X POST https://your-site.vercel.app/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: YOUR_SECRET" \
  -d '{"type": "path", "path": "/product/blackboard-basic"}'
```


## Automatic Triggers

The WordPress plugin automatically triggers revalidation when:

- ✅ Product is created
- ✅ Product is updated
- ✅ Product is deleted
- ✅ Product is restored from trash
- ✅ Stock levels change
- ✅ Product variations are modified

## Monitoring & Debugging

### Check Revalidation Status

Visit: `https://your-site.vercel.app/api/revalidate`

This shows the endpoint configuration and usage instructions.

### Vercel Logs

Monitor revalidation in Vercel dashboard:
1. Go to your project in Vercel
2. Click "Functions" tab
3. View logs for `/api/revalidate`

### WordPress Debug

Enable WordPress debug logging:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

Check logs at: `/wp-content/debug.log`

## Performance Optimization

### Current Configuration

All pages are configured with:

```javascript
export const revalidate = false // No automatic revalidation
export const dynamic = 'force-static' // Force static generation
```

This means:
- Pages are only rebuilt when explicitly triggered
- Maximum performance and cache efficiency
- Lower hosting costs

### Build-Time Data Fetching

All data is fetched at build time:
- Product information
- Images
- Prices
- Stock status
- Categories

## Troubleshooting

### Revalidation Not Working

1. **Check Secret**: Ensure `REVALIDATE_SECRET` matches in both Next.js and WordPress
2. **Check URL**: Verify the Next.js URL is correct (no trailing slash)
3. **Check Logs**: Look for errors in Vercel Functions logs
4. **Test Manually**: Try the GET endpoint with secret parameter

### Pages Not Updating

1. **Check Build**: Ensure the site built successfully in Vercel
2. **Clear Cache**: If using Cloudflare, purge cache after revalidation
3. **Check Paths**: Verify the correct paths are being revalidated

### WordPress Plugin Issues

1. **Check PHP Version**: Requires PHP 7.0+
2. **Check WooCommerce**: Must have WooCommerce activated
3. **Check Permissions**: User needs `manage_woocommerce` capability

## Advanced Configuration

### Custom Revalidation Logic

Edit `/app/api/revalidate/route.ts` to add custom logic:

```typescript
// Add custom action
case 'custom.action':
  revalidatePath('/custom-page', 'page')
  return NextResponse.json({ revalidated: true })
```

### Selective Revalidation

Revalidate specific pages based on product categories:

```typescript
if (product.category === 'workshops') {
  revalidatePath('/workshops', 'page')
} else if (product.category === 'blackboard-sets') {
  revalidatePath('/shop', 'page')
  revalidatePath('/', 'page')
}
```

### Scheduled Revalidation

Set up a cron job to revalidate periodically:

```bash
# Crontab entry - revalidate daily at 2 AM
0 2 * * * curl -X GET "https://your-site.vercel.app/api/revalidate?secret=YOUR_SECRET&type=all"
```

## Security Considerations

1. **Keep Secret Secure**: Never commit `REVALIDATE_SECRET` to version control
2. **Use HTTPS**: Always use HTTPS for revalidation requests
3. **Rotate Secrets**: Change the secret periodically
4. **Monitor Access**: Check logs for unauthorized attempts

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Check WordPress debug logs
3. Test with manual revalidation
4. Verify all environment variables are set correctly