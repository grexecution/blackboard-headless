# 🚀 Deploy to Vercel - Step by Step Guide

## Prerequisites
- GitHub account
- Vercel account (free at vercel.com)
- WooCommerce API credentials from your WordPress site

## Step 1: Prepare Your Code

### Ensure your code is committed:
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Via Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy
vercel

# Follow prompts to link to your Vercel account
```

### Option B: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: **woo-storefront** (if in subdirectory)
   - Build Command: `npm run build` (auto-detected)
   - Install Command: `npm install` (auto-detected)

## Step 3: Set Environment Variables in Vercel

Go to: **Settings → Environment Variables**

Add these variables:

### Required Variables:
```bash
# WooCommerce API
NEXT_PUBLIC_WOO_API_URL=https://blackboard-training.com/wp-json/wc/v3
WOO_CONSUMER_KEY=ck_xxxxxxxxxxxxx  # Get from WooCommerce
WOO_CONSUMER_SECRET=cs_xxxxxxxxxxxxx  # Get from WooCommerce

# WordPress
WORDPRESS_API_URL=https://blackboard-training.com

# Authentication
NEXTAUTH_URL=https://your-app.vercel.app  # Your Vercel URL
NEXTAUTH_SECRET=xxx  # Generate: openssl rand -base64 32

# Webhooks (for auto-updates)
WEBHOOK_SECRET=xxx  # Generate: openssl rand -hex 32
```

## Step 4: Get WooCommerce API Credentials

1. Login to WordPress Admin
2. Go to: **WooCommerce → Settings → Advanced → REST API**
3. Click "Add Key"
4. Description: "Vercel Production"
5. User: Select admin user
6. Permissions: **Read**
7. Click "Generate API Key"
8. **SAVE THESE** - Consumer Key and Consumer Secret (shown only once!)

## Step 5: Deploy

1. Click **Deploy** in Vercel
2. Wait for build to complete (2-3 minutes)
3. Your site is live at: `https://your-project.vercel.app`

## Step 6: Set Up Custom Domain (Optional)

1. In Vercel: **Settings → Domains**
2. Add your domain: `shop.blackboard-training.com`
3. Follow DNS configuration instructions

## Step 7: Configure Auto-Updates (IMPORTANT!)

### Get Vercel Deploy Hook:
1. Go to: **Settings → Git → Deploy Hooks**
2. Create hook: "WooCommerce Updates"
3. Copy the URL
4. Add to environment variables as `VERCEL_DEPLOY_HOOK`

### Configure WooCommerce Webhooks:
1. In WordPress: **WooCommerce → Settings → Advanced → Webhooks**
2. Add webhook:
   - Name: "Vercel Rebuild - Product Update"
   - Status: **Active**
   - Topic: **Product updated**
   - Delivery URL: `https://your-app.vercel.app/api/webhook/rebuild`
   - Secret: Same as `WEBHOOK_SECRET`
3. Repeat for "Product created" and "Product deleted"

## Step 8: Test Everything

### Test Site:
- [ ] Homepage loads
- [ ] Shop page shows products
- [ ] Product pages work
- [ ] Cart functionality works
- [ ] Login/register works

### Test Auto-Updates:
1. Update a product in WooCommerce
2. Check Vercel dashboard for new deployment
3. After ~2 minutes, verify changes appear

## Troubleshooting

### "Build Failed"
- Check environment variables are set correctly
- Verify WooCommerce API is accessible
- Check build logs in Vercel

### "Products Not Showing"
- Verify API credentials are correct
- Check WooCommerce REST API is enabled
- Test API: `curl https://your-site.com/wp-json/wc/v3/products`

### "Updates Not Working"
- Check webhook logs in WooCommerce
- Verify webhook secret matches
- Test manually: `curl https://your-app.vercel.app/api/webhook/rebuild`

### "Slow Performance"
- Should be <50ms with static generation
- Check Analytics → Web Vitals in Vercel
- Verify `revalidate = false` in page files

## Performance Expectations

With static generation:
- **First Contentful Paint**: <0.5s
- **Time to Interactive**: <1s
- **Page Load**: <50ms for cached pages
- **Lighthouse Score**: 95-100

## Monitoring

1. **Vercel Analytics**: Automatic performance monitoring
2. **Deployment Logs**: Check for build errors
3. **Function Logs**: Monitor webhook activity

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- WooCommerce API: https://woocommerce.github.io/woocommerce-rest-api-docs/

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Project imported to Vercel
- [ ] Environment variables set
- [ ] WooCommerce API credentials added
- [ ] Site deployed successfully
- [ ] Custom domain configured (optional)
- [ ] Webhooks configured in WooCommerce
- [ ] Deploy hook added to env variables
- [ ] Test product update → auto rebuild

**Congratulations! Your site is live and auto-updating! 🎉**