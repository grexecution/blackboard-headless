# CLAUDE.md - Project Documentation & Reminders

## 🚨 PRODUCTION DEPLOYMENT CHECKLIST

### Before Going to Production:

1. **Install Auto-Cancel Orders Plugin** (CRITICAL for order management)
   - Add `/wordpress-plugin/auto-cancel-orders.php` to WordPress
   - This auto-cancels unpaid orders after 10 minutes
   - Prevents orphaned orders and restores stock automatically
   - Can be added to functions.php or installed as a plugin

2. **Configure WooCommerce Webhooks** (CRITICAL for auto-updates)
   - See `WEBHOOK_SETUP.md` for detailed instructions
   - Set up webhooks for product create/update/delete
   - This enables automatic site rebuilds when you change products in WordPress

3. **Set Environment Variables in Vercel**
   ```bash
   # Required for production:
   NEXT_PUBLIC_WOO_API_URL=https://your-wordpress-site.com/wp-json/wc/v3
   WOO_CONSUMER_KEY=ck_xxxxxxxxxxxxx
   WOO_CONSUMER_SECRET=cs_xxxxxxxxxxxxx
   
   # For authentication:
   NEXTAUTH_URL=https://your-production-domain.com
   NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
   
   # For webhooks (auto-rebuild):
   WEBHOOK_SECRET=generate-random-string
   VERCEL_DEPLOY_HOOK=get-from-vercel-dashboard
   NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
   
   # WordPress auth:
   WORDPRESS_API_URL=https://your-wordpress-site.com
   ```

4. **Generate Secrets**
   ```bash
   # Generate NEXTAUTH_SECRET:
   openssl rand -base64 32
   
   # Generate WEBHOOK_SECRET:
   openssl rand -hex 32
   ```

5. **Performance Configuration**
   - Site uses **full static generation** for <50ms page loads
   - No API calls on page views (pre-built HTML)
   - Automatic rebuilds via webhooks when WordPress content changes

## 💳 Payment Flow Architecture

### Current Implementation:
1. **Order-First Approach**: Orders created in WooCommerce before payment
2. **Status Management**: 
   - Bank Transfer → `on-hold` status
   - Stripe/PayPal → `pending` status
3. **Payment Confirmation**: Via `/admin/confirm-payment` page (temporary)
4. **Auto-Cancellation**: Unpaid orders cancelled after 10 minutes (via WordPress plugin)
5. **Refunds**: Handled through WooCommerce admin with stored transaction IDs

### Production Payment Integration:
- **Stripe**: Integrate Stripe.js on checkout page
- **PayPal**: Use PayPal SDK for payment processing  
- **Confirmation**: Call `/api/orders/[id]/complete-payment` after successful payment
- **Webhooks**: Set up Stripe/PayPal webhooks for automatic payment confirmation

## 📝 Project Architecture

### Technology Stack:
- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with BlackBoard brand colors (#ffed00)
- **Backend**: WooCommerce REST API
- **Auth**: NextAuth.js with WordPress credentials
- **Cart**: React Context with localStorage persistence
- **Performance**: Static Site Generation (SSG) with webhook rebuilds

### Key Features:
- ✅ Full e-commerce functionality
- ✅ Static HTML generation for instant loads
- ✅ Automatic WordPress/WooCommerce sync
- ✅ Mobile-responsive with bottom navigation
- ✅ Login modal popup system
- ✅ Side cart with IP-based shipping
- ✅ ProCoach certifications page
- ✅ Workshops page
- ✅ Professional footer with newsletter

### Brand Colors:
- Primary Yellow: `#ffed00`
- Black: `#000000`
- Dark Gray: `#1a1a1a`

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🚀 Deployment to Vercel

### Initial Setup:
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables (see checklist above)
4. Deploy

### Webhook Setup for Auto-Updates:
1. After deployment, go to Vercel Dashboard → Settings → Git → Deploy Hooks
2. Create a hook named "WooCommerce Updates"
3. Copy the URL to `VERCEL_DEPLOY_HOOK` env variable
4. Configure WooCommerce webhooks to trigger this URL

## 🔄 How Auto-Updates Work

1. **You update products in WordPress/WooCommerce**
2. **WooCommerce sends webhook** to `/api/webhook/rebuild`
3. **Webhook triggers Vercel rebuild** (1-2 minutes)
4. **Site serves updated static content** instantly

This gives you:
- ⚡ <50ms page loads (static HTML)
- 🔄 Automatic updates from WordPress
- 💰 Lower costs (no API calls on views)
- 🎯 Better SEO (fast, full HTML pages)

## 📁 Important Files

- `/api/webhook/rebuild` - Webhook endpoint for auto-rebuilds
- `/api/revalidate` - Manual revalidation endpoint
- `/lib/woocommerce/` - WooCommerce API integration
- `/components/auth/login-modal.tsx` - Login modal system
- `/lib/cart-context.tsx` - Cart state management

## ⚠️ Important Notes

1. **Static Generation**: Pages are set to `revalidate = false` for maximum performance
2. **Updates**: Content updates only via webhooks or manual rebuild
3. **Cart Data**: Stored in localStorage, not affected by static generation
4. **Auth**: Sessions handled separately from static content

## 🐛 Troubleshooting

### Products not updating?
1. Check webhook configuration in WooCommerce
2. Verify `WEBHOOK_SECRET` matches
3. Check Vercel deployment logs
4. Test webhook endpoint: `curl https://your-site.com/api/webhook/rebuild`

### Build failing?
1. Verify all environment variables are set
2. Check WooCommerce API is accessible
3. Ensure API credentials are correct

### Slow performance?
- Should be <50ms with static generation
- Check if `revalidate = false` is set
- Verify pages are being statically generated

## 📞 Support Contacts

- WooCommerce API Docs: https://woocommerce.github.io/woocommerce-rest-api-docs/
- Next.js Docs: https://nextjs.org/docs
- Vercel Support: https://vercel.com/support

---

**Last Updated**: December 2024
**Reminder**: Configure webhooks before production launch for automatic content updates!