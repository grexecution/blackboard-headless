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

## 🎨 DESIGN SYSTEM ARCHITECTURE

### Component Library Structure

The project now includes a comprehensive design system with reusable UI components located in `/components/ui/` and design tokens in `/lib/design-system/`.

#### Core UI Components

1. **Section** (`/components/ui/Section.tsx`)
   - Standardized section spacing and containers
   - Variants: default, dark, light, yellow
   - Sizes: sm, md, lg
   - Container widths: narrow, medium, wide, full

2. **Button** (`/components/ui/Button.tsx`)
   - Variants: primary (yellow), secondary (black), outline, ghost
   - Sizes: xs, sm, md, lg, xl
   - Supports loading states, icons, and renders as link when href provided
   - Consistent hover effects and transitions

3. **Card** (`/components/ui/Card.tsx`)
   - Base template for all card layouts
   - Configurable padding, shadows, and hover effects
   - Used as foundation for product, course, and feature cards

4. **Grid** (`/components/ui/Grid.tsx`)
   - Responsive grid layouts with consistent breakpoints
   - Column options: 2, 3, 4 columns
   - Gap sizes: sm, md, lg, xl

5. **Heading** (`/components/ui/Heading.tsx`)
   - Typography consistency across all headings
   - Auto-accent for brand keywords (BlackBoard, ProCoach, Workshop)
   - Levels: h1-h6 with predefined styles

6. **Badge** (`/components/ui/Badge.tsx`)
   - Status indicators and labels
   - Variants: primary, secondary, success, warning, error, info, dark
   - Used for: product badges, course status, sale indicators

7. **FeatureCard** (`/components/ui/FeatureCard.tsx`)
   - Icon + title + description pattern
   - Consistent styling for feature presentations
   - Centered or left-aligned options

8. **HeroSection** (`/components/ui/HeroSection.tsx`)
   - Standardized hero sections across pages
   - Variants: default, compact, feature
   - Integrated CTAs and background patterns

9. **Container** (`/components/ui/Container.tsx`)
   - Consistent max-width constraints
   - Sizes: narrow (4xl), medium (5xl), wide (6xl), full (7xl)

10. **PriceDisplay** (`/components/ui/PriceDisplay.tsx`)
    - Consistent price formatting
    - Sale price support with strikethrough
    - Currency symbols and size variants

#### Design System Constants (`/lib/design-system/constants.ts`)

- **Colors**: Primary yellow (#ffed00), blacks, grays, status colors
- **Typography**: Heading scales, body text sizes, color utilities
- **Spacing**: Section padding, container widths, element spacing
- **Grid**: Column layouts and gap sizes
- **Shadows**: Elevation scale from sm to 2xl
- **Transitions**: Animation durations and easing
- **Z-Index**: Layering scale for modals, dropdowns, tooltips

### Using the Design System

#### Import Components
```tsx
import { Button, Card, Section, Grid, Heading } from '@/components/ui'
```

#### Example Usage
```tsx
<Section variant="dark" size="lg">
  <Heading level={1} accent centered>
    Welcome to BlackBoard
  </Heading>
  <Grid cols={3} gap="lg">
    <Card>Content here</Card>
  </Grid>
  <Button variant="primary" size="lg" href="/shop">
    Shop Now
  </Button>
</Section>
```

### Component Patterns

#### Product Cards
- Use base `Card` component
- Add product-specific elements (image, price, badges)
- Maintain hover effects and transitions

#### Course Cards
- Extend `Card` with progress bars
- Include access status badges
- Show price for locked content

#### Modal Overlays
- Full-screen backdrop with blur
- Centered content with max-width
- Framer Motion for animations
- Close button positioning

#### Form Inputs
- Gray backgrounds with yellow focus rings
- Icon prefixes for context
- Consistent padding and borders
- Error state styling

### Best Practices

1. **Always use design system components** instead of creating new ones
2. **Import from central `/components/ui`** directory
3. **Use design tokens** from constants file for consistency
4. **Extend existing components** rather than duplicating
5. **Maintain semantic HTML** structure
6. **Follow accessibility guidelines** (ARIA labels, keyboard navigation)
7. **Test responsive behavior** at all breakpoints
8. **Use consistent animations** from the design system

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
- **UI Components**: Custom design system in `/components/ui`
- **Design Tokens**: Centralized in `/lib/design-system/constants.ts`

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
- ✅ LMS integration for courses
- ✅ Comprehensive design system
- ✅ Reusable UI components

### Brand Identity:
- **Primary Color**: Yellow (#ffed00)
- **Typography**: Bold headings with yellow accents
- **Imagery**: High-contrast product photography
- **Animations**: Smooth transitions (300ms standard)
- **Shadows**: Multi-level elevation system
- **Spacing**: 8-point grid system

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

## 📁 Important Files & Directories

### API Routes
- `/api/webhook/rebuild` - Webhook endpoint for auto-rebuilds
- `/api/revalidate` - Manual revalidation endpoint
- `/api/orders/` - Order management endpoints
- `/api/woo/` - WooCommerce proxy endpoints

### Core Libraries
- `/lib/woocommerce/` - WooCommerce API integration
- `/lib/lms/` - Learning Management System
- `/lib/cart-context.tsx` - Cart state management
- `/lib/design-system/` - Design tokens and constants

### UI Components
- `/components/ui/` - Reusable design system components
- `/components/auth/login-modal.tsx` - Login modal system
- `/components/lms/course-card.tsx` - Course card component
- `/components/videos/` - Video player components

### Pages
- `/app/` - Next.js 15 App Router pages
- `/app/shop/` - Product listing and details
- `/app/checkout/` - Checkout flow
- `/app/account/` - User dashboard
- `/app/procoach/` - Certification programs
- `/app/workshops/` - Workshop listings

## ⚠️ Important Notes

1. **Static Generation**: Pages are set to `revalidate = false` for maximum performance
2. **Updates**: Content updates only via webhooks or manual rebuild
3. **Cart Data**: Stored in localStorage, not affected by static generation
4. **Auth**: Sessions handled separately from static content
5. **Design System**: Always use components from `/components/ui` for consistency
6. **Brand Colors**: Primary yellow (#ffed00) should be used for all CTAs and accents

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
4. Check TypeScript errors with `npm run type-check`

### Slow performance?
- Should be <50ms with static generation
- Check if `revalidate = false` is set
- Verify pages are being statically generated
- Review Vercel Analytics for bottlenecks

### UI Inconsistencies?
- Use design system components from `/components/ui`
- Check design tokens in `/lib/design-system/constants.ts`
- Verify Tailwind classes match design system
- Test responsive behavior at all breakpoints

## 📞 Support Resources

- WooCommerce API Docs: https://woocommerce.github.io/woocommerce-rest-api-docs/
- Next.js Docs: https://nextjs.org/docs
- Vercel Support: https://vercel.com/support
- Tailwind CSS: https://tailwindcss.com/docs

## 🔐 Security Reminders

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Implement rate limiting on API routes
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS in production
- Enable CORS appropriately

---

**Last Updated**: December 2024
**Version**: 2.0 - Now with comprehensive design system
**Reminder**: Always use the design system components for UI consistency!