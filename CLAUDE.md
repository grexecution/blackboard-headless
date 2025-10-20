# CLAUDE.md - Project Documentation & Reminders

## 🔌 WORDPRESS PLUGIN ARCHITECTURE - CRITICAL

### ⚠️ ONE PLUGIN TO RULE THEM ALL
**NEVER CREATE NEW PLUGINS!** All WordPress functionality MUST be added to the main plugin:

**Plugin Name:** `BlackBoard Next.js Sync` (in `/wp-content/plugins/blackboard-nextjs-sync/`)

This single plugin handles ALL features:
- WooCommerce product sync
- Video Custom Post Type (CPT)
- Course/Workshop CPT (replacing Tutor LMS)
- REST API extensions
- ACF field exposure
- Automatic rebuilds/revalidation
- Access control based on purchases
- CORS configuration
- Admin dashboards

### When Adding New Features:
1. **ALWAYS** add code to the existing `blackboard-nextjs-sync.php` file or create new classes within the same plugin folder
2. **NEVER** create separate plugins
3. **ALWAYS** update the plugin documentation section below
4. **ALWAYS** add admin menu items to the existing dashboard

### Current Plugin Features (v3.2.0):
- ✅ WooCommerce product sync with webhooks
- ✅ Multi-currency price fields (USD/EUR)
- ✅ Video CPT with categories and ACF fields
- ✅ Course CPT with LMS functionality
- ✅ Free course toggle
- ✅ REST API for videos/courses with access control
- ✅ Automatic Next.js rebuilds on content changes
- ✅ CORS headers for headless setup
- ✅ Admin dashboard with diagnostics
- ✅ Settings page for API keys

### Upcoming Features (To Be Added):
- 🔜 Course CPT (replacing Tutor LMS)
- 🔜 Workshop CPT (category of courses)
- 🔜 WooCommerce product connection for courses
- 🔜 Vimeo video integration for courses
- 🔜 Progress tracking
- 🔜 Certificate generation

## 🎓 LMS REPLACEMENT ARCHITECTURE

### Overview
Replace Tutor LMS with a custom CPT-based solution integrated into the main plugin.

### Course Structure:
1. **Course CPT** (`course`)
   - Title, description, featured image
   - ACF fields for Vimeo videos
   - Connected WooCommerce product (for pricing/purchase)
   - Course materials/downloads

2. **Course Categories**:
   - **ProCoach** - Professional certification courses
   - **Workshops** - Specialized training workshops

3. **Access Control**:
   - Check if connected WooCommerce product is purchased
   - Use `wc_customer_bought_product()` for verification
   - Show price from connected product if not purchased

4. **Data Migration**:
   - Transfer all existing Tutor LMS courses to new CPT
   - Preserve enrollments via WooCommerce order history
   - Maintain video content and descriptions

5. **Frontend Features**:
   - Course listing page
   - Individual course pages with lessons
   - Progress tracking (stored in user meta)
   - Certificate generation on completion

### Implementation Requirements:
```php
// Course CPT Registration
register_post_type('course', [
    'labels' => [...],
    'public' => true,
    'has_archive' => true,
    'supports' => ['title', 'editor', 'thumbnail'],
    'show_in_rest' => true
]);

// ACF Fields for Courses
- course_product_id (relationship to WooCommerce product)
- course_videos (repeater with Vimeo IDs)
- course_duration
- course_difficulty
- course_materials (file uploads)

// Access Check
function check_course_access($course_id, $user_id) {
    $product_id = get_field('course_product_id', $course_id);
    return wc_customer_bought_product('', $user_id, $product_id);
}
```

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
   - **IMPORTANT**: All main content sections should use `max-w-7xl` for consistency

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

## 💱 Multi-Currency Implementation

### Overview
The site supports USD and EUR currency switching with instant price updates across the entire frontend.

### Architecture:

**1. WordPress Plugin (v3.2.0)**
- Added custom fields to WooCommerce products:
  - `_nextjs_usd_regular_price`
  - `_nextjs_usd_sale_price`
  - `_nextjs_eur_regular_price`
  - `_nextjs_eur_sale_price`
- Fields appear in Product Data → General tab as "Next.js Multi-Currency Prices"
- Prices automatically exposed via WooCommerce REST API in `currency_prices` object

**2. Frontend Currency Context** (`/lib/currency-context.tsx`)
```tsx
// Global currency state management
const { currency, setCurrency, formatPrice, getCurrencySymbol } = useCurrency()

// Format price with current currency
formatPrice(usdPrice, eurPrice) // Returns "$99.00" or "€89.00"
```

**3. Currency Toggle Switch**
- Beautiful pill-style toggle in navbar (desktop)
- Full-width toggle in mobile menu
- Yellow (#ffed00) active state
- Instant currency switching
- Selection persisted in localStorage

**4. Product Types Updated**
```tsx
interface CurrencyPrices {
  usd: {
    regular_price: string
    sale_price: string
  }
  eur: {
    regular_price: string
    sale_price: string
  }
}

interface Product {
  // ... existing fields
  currency_prices?: CurrencyPrices
}
```

### How to Set Prices in WordPress:

1. Edit any product in WooCommerce
2. Go to Product Data → General tab
3. Scroll to "Next.js Multi-Currency Prices" section
4. Set USD and EUR prices (regular and sale)
5. Save product

### How Currency Switching Works:

1. User clicks EUR or USD in navbar toggle
2. Selection saved to localStorage: `blackboard_currency`
3. `CurrencyContext` updates global state
4. All price displays automatically update via `useCurrency()` hook
5. Checkout uses correct currency prices for order creation

### Usage in Components:

**Simple Approach (using helper function):**
```tsx
import { useCurrency, getProductPrice } from '@/lib/currency-context'

function ProductCard({ product }: { product: Product }) {
  const { currency, formatPrice } = useCurrency()

  // Get the correct prices with automatic fallback
  const { regularPrice, salePrice, displayPrice, onSale } = getProductPrice(product, currency)

  return (
    <div>
      {onSale && (
        <span className="line-through text-gray-400">
          {formatPrice(regularPrice, regularPrice)}
        </span>
      )}
      <span className="font-bold">
        {formatPrice(displayPrice, displayPrice)}
      </span>
    </div>
  )
}
```

**Manual Approach (for more control):**
```tsx
import { useCurrency } from '@/lib/currency-context'

function ProductCard({ product }: { product: Product }) {
  const { formatPrice } = useCurrency()

  // Manually specify USD and EUR prices
  const displayPrice = formatPrice(
    product.currency_prices?.usd.regular_price || product.regular_price,
    product.currency_prices?.eur.regular_price || product.regular_price
  )

  return <span>{displayPrice}</span>
}
```

### Default Currency:
- EUR is the default currency (European market)
- User selection overrides default
- Selection persists across sessions

### Fallback Behavior:

**When currency prices are not set:**
- If USD is selected but USD price is empty → falls back to EUR price
- If EUR is selected but EUR price is empty → falls back to USD price
- If both are empty → returns empty string (no price shown)
- If only one currency is set → that price is used for both currencies

**Example Scenarios:**
```typescript
// Scenario 1: Both currencies set
formatPrice('99.00', '89.00') // USD selected → "$99.00", EUR selected → "€89.00"

// Scenario 2: Only USD price set
formatPrice('99.00', '') // USD selected → "$99.00", EUR selected → "€99.00" (fallback)

// Scenario 3: Only EUR price set
formatPrice('', '89.00') // USD selected → "$89.00" (fallback), EUR selected → "€89.00"

// Scenario 4: No prices set
formatPrice('', '') // Returns "" (empty string)
```

### Important Notes:
- Fallback ensures prices are always shown if at least one currency is set
- Cart calculates totals in selected currency using fallback logic
- Orders are created in WooCommerce with the selected currency price
- Currency symbol changes automatically ($ vs €)
- Zero prices are treated as empty (won't display)

## 📝 Project Architecture

### Technology Stack:
- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with BlackBoard brand colors (#ffed00)
- **Backend**: WooCommerce REST API
- **Auth**: NextAuth.js with WordPress credentials
- **Cart**: React Context with localStorage persistence
- **Currency**: React Context with localStorage persistence (USD/EUR)
- **Performance**: Static Site Generation (SSG) with webhook rebuilds
- **UI Components**: Custom design system in `/components/ui`
- **Design Tokens**: Centralized in `/lib/design-system/constants.ts`

### Key Features:
- ✅ Full e-commerce functionality
- ✅ Multi-currency support (USD/EUR)
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

## 🎨 Layout & Container Standards

### Container Width Consistency
**CRITICAL**: All sections, navbar, and footer MUST use the exact same container pattern for visual consistency across ALL screen sizes.

#### Standard Container Pattern:
```jsx
<div className="max-w-screen-xl mx-auto px-4 lg:px-6">
  {/* Content here */}
</div>
```

#### Full Section Example:
```jsx
<section className="py-20 bg-white">
  <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
    {/* All content goes here */}
  </div>
</section>
```

#### Key Rules:
1. **ALWAYS use `max-w-screen-xl mx-auto px-4 lg:px-6`** - This is the ONLY container pattern
2. **NEVER nest container divs** - One container per section, no max-width wrappers inside
3. **Apply to ALL components**:
   - Navbar: `<div className="max-w-screen-xl mx-auto px-4 lg:px-6">`
   - Footer: `<div className="max-w-screen-xl mx-auto px-4 lg:px-6">`
   - All content sections: Same pattern
4. **Responsive widths**:
   - Desktop: 1280px (max-w-screen-xl)
   - Mobile/Tablet padding: 1rem (px-4)
   - Large screen padding: 1.5rem (lg:px-6)

#### Why This Pattern:
- **max-w-screen-xl** (1280px) provides better wide screen support than max-w-7xl
- **lg:px-6** adds extra padding on larger screens for better readability
- **mx-auto** centers the content consistently
- **Single container per section** prevents nesting issues

This ensures:
- Perfect visual alignment across all sections at ANY screen width
- No shifting or misalignment when viewport exceeds container width
- Consistent content width on all screen sizes
- Clean vertical lines when sections stack
- Professional, polished appearance on ultra-wide monitors

### Container Standardization Process

#### How to Standardize Containers Across the Codebase:

1. **Identify All Container Patterns**
   ```bash
   # Search for all container patterns
   grep -r "container mx-auto\|max-w-.*mx-auto" --include="*.tsx" --include="*.jsx"
   ```

2. **Replace Non-Standard Patterns**
   Replace ALL of these patterns:
   - `container mx-auto px-4` → `max-w-screen-xl mx-auto px-4 lg:px-6`
   - `container mx-auto px-3` → `max-w-screen-xl mx-auto px-4 lg:px-6`
   - `max-w-7xl mx-auto px-4` → `max-w-screen-xl mx-auto px-4 lg:px-6`
   - `max-w-6xl mx-auto px-4` → `max-w-screen-xl mx-auto px-4 lg:px-6`
   - `max-w-5xl mx-auto px-4` → `max-w-screen-xl mx-auto px-4 lg:px-6`
   - `max-w-4xl mx-auto px-4` → `max-w-screen-xl mx-auto px-4 lg:px-6`

3. **Check for Nested Containers**
   Remove any nested max-width divs. Structure should be:
   ```jsx
   // ✅ CORRECT
   <section>
     <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
       <div className="content">...</div>
     </div>
   </section>

   // ❌ INCORRECT (nested containers)
   <section>
     <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
       <div className="max-w-4xl mx-auto">...</div>
     </div>
   </section>
   ```

4. **Fix Closing Div Balance**
   After removing nested containers, ensure proper div closing:
   - Count opening `<div>` tags
   - Count closing `</div>` tags
   - They must match exactly

5. **Common Files to Check**:
   - `/components/navbar.tsx`
   - `/components/footer.tsx`
   - `/components/home-content.tsx`
   - `/app/shop/page.tsx`
   - `/app/about/page.tsx`
   - `/app/checkout/page.tsx`
   - `/app/procoach/page.tsx`
   - `/app/workshops/page.tsx`
   - `/app/account/courses/page.tsx`
   - `/components/product/product-detail.tsx`
   - `/app/courses/[slug]/learn/course-learn-client.tsx`

6. **Verify with Build**:
   ```bash
   npm run build
   ```
   Fix any syntax errors from mismatched div tags.

#### Container Width Troubleshooting:

**Problem**: Content doesn't align when viewport > 1312px
**Solution**: Use `max-w-screen-xl` instead of `max-w-7xl` and ensure ALL sections use the same pattern

**Problem**: Extra closing `</div>` tags after standardization
**Solution**: When removing nested containers, remove both the opening AND closing div tags

**Problem**: Different sections have different widths
**Solution**: Search entire codebase and replace ALL container patterns with the standard one

#### Visual Alignment Test:
1. Set browser width to 1920px
2. Draw an imaginary vertical line at the content edge
3. ALL sections should align to this line
4. Navbar, content, and footer should have identical margins

### Course Learn Page Layout

The course learn page (`/app/courses/[slug]/learn/`) uses the standard container pattern with a special layout:

```jsx
<div className="min-h-screen bg-gray-50">
  <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
    <div className="flex gap-6 py-6">
      {/* Sidebar with course content */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-white rounded-xl border overflow-hidden sticky top-6">
          {/* Sidebar content */}
        </div>
      </div>

      {/* Main video player area */}
      <div className="flex-1">
        <div className="bg-white rounded-xl border overflow-hidden">
          {/* Video player and content */}
        </div>
      </div>
    </div>
  </div>
</div>
```

**Key Points:**
- Uses standard `max-w-screen-xl mx-auto px-4 lg:px-6` container
- Sidebar and main content are wrapped in rounded white cards
- Sidebar is sticky (`sticky top-6`) for better UX
- `flex gap-6 py-6` creates consistent spacing
- Both sidebar and main content use `rounded-xl border` for visual consistency

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
- `/lib/currency-context.tsx` - Multi-currency state management
- `/lib/auth-context.tsx` - Authentication state management
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