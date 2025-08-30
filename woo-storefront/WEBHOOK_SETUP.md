# 🚀 WooCommerce Webhook Setup for Instant Updates

## Overview
Your site now serves **static HTML pages** for lightning-fast performance. When you update products in WordPress/WooCommerce, the site automatically rebuilds to reflect changes.

## Setup Instructions

### 1. Environment Variables
Add these to your `.env.local` file:

```bash
# Secret key for webhook security (generate a random string)
WEBHOOK_SECRET=your-secret-key-here

# For Vercel deployment (get from Vercel dashboard)
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/xxx

# Your site URL
NEXT_PUBLIC_BASE_URL=https://your-site.vercel.app
```

### 2. Configure WooCommerce Webhooks

1. **Go to WordPress Admin** → WooCommerce → Settings → Advanced → Webhooks
2. **Add New Webhook** with these settings:

#### For Product Updates:
- **Name**: Product Update Trigger
- **Status**: Active
- **Topic**: Product updated
- **Delivery URL**: `https://your-site.vercel.app/api/webhook/rebuild`
- **Secret**: (same as WEBHOOK_SECRET in .env)
- **API Version**: WP REST API Integration v3

#### For Product Creation:
- **Name**: Product Create Trigger
- **Status**: Active
- **Topic**: Product created
- **Delivery URL**: `https://your-site.vercel.app/api/webhook/rebuild`
- **Secret**: (same as WEBHOOK_SECRET in .env)
- **API Version**: WP REST API Integration v3

#### For Product Deletion:
- **Name**: Product Delete Trigger
- **Status**: Active
- **Topic**: Product deleted
- **Delivery URL**: `https://your-site.vercel.app/api/webhook/rebuild`
- **Secret**: (same as WEBHOOK_SECRET in .env)
- **API Version**: WP REST API Integration v3

### 3. Get Vercel Deploy Hook (if using Vercel)

1. Go to your Vercel project dashboard
2. Settings → Git → Deploy Hooks
3. Create Hook with name "WooCommerce Updates"
4. Copy the URL and add to `.env.local` as `VERCEL_DEPLOY_HOOK`

## How It Works

1. **You update a product in WooCommerce** 
2. **WooCommerce sends webhook** to your site
3. **Webhook endpoint triggers**:
   - **Production**: Full rebuild via Vercel Deploy Hook (takes 1-2 minutes)
   - **Alternative**: Revalidates specific pages (instant)
4. **Site serves updated content** with static HTML speed

## Performance

- **Page Load Speed**: <50ms (static HTML)
- **Time to See Updates**: 1-2 minutes after WordPress change
- **No API calls**: Pages are pre-built, zero runtime API calls

## Testing

### Test Webhook Endpoint:
```bash
curl https://your-site.vercel.app/api/webhook/rebuild
```

### Test Revalidation:
```bash
curl "https://your-site.vercel.app/api/revalidate?secret=your-secret-key&path=/shop"
```

### Manual Rebuild (Vercel):
```bash
curl -X POST YOUR_VERCEL_DEPLOY_HOOK_URL
```

## Alternative: Faster Updates with Revalidation

If you want instant updates without full rebuild, modify the webhook to use revalidation:

In `/api/webhook/rebuild/route.ts`, the code already supports both methods:
- **Full rebuild**: Triggered via Vercel Deploy Hook (slower but comprehensive)
- **Path revalidation**: Updates specific pages only (faster)

## Troubleshooting

### Updates not showing?
1. Check webhook logs in WooCommerce → Status → Logs
2. Verify webhook secret matches in both WooCommerce and .env
3. Check Vercel deployment logs

### Webhook returns 401?
- Secret key mismatch - verify WEBHOOK_SECRET in .env

### Build fails?
- Check WooCommerce API is accessible
- Verify API credentials in .env

## Benefits

✅ **Lightning Fast**: <50ms page loads (static HTML)
✅ **SEO Perfect**: Full HTML pages for search engines
✅ **Cost Effective**: No API calls on page views
✅ **Auto Updates**: Changes in WordPress trigger rebuilds
✅ **Simple**: No complex caching to manage

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Check WooCommerce webhook logs
3. Test endpoints manually using curl commands above