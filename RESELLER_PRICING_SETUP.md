# Reseller Pricing System - Setup & Testing Guide

## Overview

Complete custom reseller pricing system that replaces the WDP (WordPress Dynamic Pricing) plugin with custom-built functionality integrated directly into the BlackBoard Next.js Sync plugin.

## Features Implemented

✅ **WordPress Plugin (v2.0.0)**
- Custom "Reseller Pricing" tab in WooCommerce product editor
- Fields for min quantity, EUR price, USD price, enable/disable
- Data stored as product meta
- Exposed via WooCommerce REST API

✅ **Next.js Frontend**
- TypeScript types for reseller pricing
- Cart context updated with reseller pricing data
- Utility functions for discount calculations
- Visual discount indicators in cart
- Reseller benefits table for account area
- Sticky notifications in cart for resellers

✅ **Multi-Currency Support**
- Separate reseller prices for USD and EUR
- Auto-applies based on selected currency
- Fallback handling for missing prices

## File Structure

### WordPress Plugin
```
/wordpress-plugin/blackboard-nextjs-sync.php (v2.0.0)
```

### Next.js Files
```
/lib/woocommerce/products.ts                          - Updated Product types
/lib/cart-context.tsx                                 - Updated CartItem interface
/lib/reseller-pricing.ts                             - Discount calculation utilities
/components/reseller/reseller-cart-notification.tsx   - Cart notifications
/components/reseller/reseller-benefits-table.tsx      - Account area benefits table
```

## Setup Instructions

### 1. Install WordPress Plugin

**Option A: Update Existing Plugin**
1. Go to WordPress admin → Plugins
2. Deactivate "BlackBoard Next.js Sync" if active
3. Replace `/wp-content/plugins/blackboard-nextjs-sync/blackboard-nextjs-sync.php` with the new version
4. Re-activate the plugin
5. You should see version 2.0.0

**Option B: Fresh Install**
1. Delete the old plugin folder
2. Upload the new plugin folder
3. Activate from WordPress admin

### 2. Configure Reseller Pricing on Products

1. Go to **WooCommerce → Products**
2. Edit any product you want to offer reseller pricing on
3. Scroll to **Product Data** meta box
4. Click the new **"Reseller Pricing"** tab
5. Configure:
   - ✅ **Enable Reseller Pricing**
   - **Minimum Quantity**: e.g., `10` (means 10 or more)
   - **Reseller Price EUR**: e.g., `75.00`
   - **Reseller Price USD**: e.g., `85.00`
6. **Update** the product
7. Repeat for other products (BlackBoard Basic, Professional, Toebands, etc.)

### 3. Assign Reseller Role to Test User

1. Go to **WooCommerce → Customers**
2. Edit a customer
3. Change **Role** to "Reseller" (if the role doesn't exist, add it via a role manager plugin)
4. **Update** the customer

**Note:** If "Reseller" role doesn't exist in WooCommerce:
```php
// Add this to your theme's functions.php or create a small plugin
add_role('reseller', 'Reseller', array(
    'read' => true,
    'edit_posts' => false,
));
```

### 4. Frontend Integration

The frontend is already set up! But here's how to add components to your pages:

#### Add to Side Cart (Already Done)
The reseller notification should be added to `/components/cart/side-cart.tsx`:

```tsx
import { ResellerCartNotification } from '@/components/reseller/reseller-cart-notification'

// Add after cart header, before cart items:
<ResellerCartNotification />
```

#### Add to Account Page
Update `/app/account/account-client.tsx` to show benefits table:

```tsx
import { ResellerBenefitsTable } from '@/components/reseller/reseller-benefits-table'

// Add a new tab or section for resellers:
{session?.user?.role === 'reseller' && (
  <div className="mt-8">
    <ResellerBenefitsTable />
  </div>
)}
```

## Testing Guide

### Test Scenario 1: Basic Reseller Pricing

**Setup:**
- Product: BlackBoard Basic
- Regular Price EUR: €89.00
- Reseller Price EUR: €75.00
- Min Quantity: 10

**Steps:**
1. Login as reseller user
2. Add 5x BlackBoard Basic to cart
3. **Expected:** See notification "Add 5 more BlackBoard Basic to unlock your bulk pricing"
4. Increase quantity to 10
5. **Expected:** See green notification "Reseller Discount Active! You're saving €140.00 on 1 product"
6. **Expected:** Each item shows €75.00 instead of €89.00

### Test Scenario 2: Multiple Products with Discounts

**Setup:**
- BlackBoard Basic: 10+ = €75.00
- BlackBoard Professional: 5+ = €120.00

**Steps:**
1. Login as reseller
2. Add 10x BlackBoard Basic + 5x Professional
3. **Expected:** Both products get discounts
4. **Expected:** Total savings shown in cart notification

### Test Scenario 3: Multi-Currency

**Steps:**
1. Login as reseller
2. Currency set to EUR
3. Add 10x BlackBoard Basic
4. **Expected:** Price €75.00
5. Switch currency to USD
6. **Expected:** Price changes to reseller USD price

### Test Scenario 4: Non-Reseller User

**Steps:**
1. Login as regular customer (role: customer)
2. Add 10x BlackBoard Basic
3. **Expected:** No reseller notifications
4. **Expected:** Regular pricing applies (€89.00)

### Test Scenario 5: Benefits Table

**Steps:**
1. Login as reseller
2. Go to Account → Dashboard
3. **Expected:** See "Reseller Benefits" table
4. **Expected:** All products with reseller pricing listed
5. **Expected:** Min quantity, regular price, reseller price, savings shown

## Troubleshooting

### Products don't show reseller pricing

**Check:**
1. Plugin version is 2.0.0: `WordPress Admin → Plugins`
2. Reseller pricing is enabled on product
3. Min quantity and prices are set
4. User role is "reseller" (check in session data)

**Debug in browser console:**
```javascript
// Check if reseller pricing data is in product response
fetch('/api/woo/products')
  .then(r => r.json())
  .then(data => console.log(data[0].reseller_pricing))
```

### Discounts not applying in cart

**Check:**
1. User is logged in
2. User role is "reseller": `console.log(session.user.role)`
3. Quantity meets minimum threshold
4. Cart item has `reseller_pricing` field

**Debug:**
```javascript
// In cart context
console.log('Is Reseller:', session?.user?.role === 'reseller')
console.log('Cart Items:', items.map(i => ({
  name: i.name,
  qty: i.quantity,
  reseller_pricing: i.reseller_pricing
})))
```

### API not returning reseller pricing

**Check:**
1. Plugin REST API filter is active
2. Try manual API call:
```bash
curl "https://your-site.com/wp-json/wc/v3/products?consumer_key=xxx&consumer_secret=xxx" | jq '.[0].reseller_pricing'
```

**Expected Response:**
```json
{
  "enabled": true,
  "min_quantity": 10,
  "price_eur": "75.00",
  "price_usd": "85.00"
}
```

### Role "reseller" doesn't exist

Add the role using this code snippet (can go in theme's `functions.php` or a small plugin):

```php
<?php
// Create reseller role if it doesn't exist
if (!get_role('reseller')) {
    add_role('reseller', 'Reseller', array(
        'read' => true,
        'edit_posts' => false,
        'delete_posts' => false
    ));
}
```

## Advanced Configuration

### Modify Discount Calculation Logic

Edit `/lib/reseller-pricing.ts` and update the `calculateResellerPrice()` function.

### Customize Notification Styles

Edit `/components/reseller/reseller-cart-notification.tsx` to change colors, icons, or messaging.

### Add More Pricing Tiers

Currently supports single tier (e.g., 10+ gets price X). To add multiple tiers (10-49, 50-99, 100+), you would need to:

1. Add more fields in WordPress plugin
2. Update `ResellerPricing` interface
3. Update calculation logic to select correct tier

## Migration from WDP Plugin

If you were using the WDP (WordPress Dynamic Pricing) plugin:

1. **Export existing rules:**
   - Document all quantity-based pricing rules
   - Note which products have bulk pricing
   - Record minimum quantities and discount amounts

2. **Disable WDP plugin** (don't delete yet)

3. **Set up custom reseller pricing:**
   - Add reseller pricing to each product
   - Match the minimum quantities from WDP rules
   - Set reseller prices equivalent to WDP discounted prices

4. **Test thoroughly** with all products

5. **Deactivate and delete WDP plugin** once confirmed working

## API Reference

### Product Object with Reseller Pricing

```typescript
interface Product {
  // ... existing fields
  reseller_pricing?: {
    enabled: boolean
    min_quantity: number
    price_eur: string
    price_usd: string
  }
}
```

### Cart Item with Reseller Pricing

```typescript
interface CartItem {
  // ... existing fields
  reseller_pricing?: ResellerPricing
  reseller_discount?: {
    original_price_eur: string
    original_price_usd: string
    discounted_price_eur: string
    discounted_price_usd: string
  }
}
```

### Utility Functions

```typescript
// Check if discount should apply
shouldApplyResellerPricing(item: CartItem, isReseller: boolean): boolean

// Calculate price with discount
calculateResellerPrice(item: CartItem, currency: 'USD' | 'EUR', isReseller: boolean)

// Get products nearing discount threshold
getProductsNearingDiscount(items: CartItem[], isReseller: boolean)

// Get total savings
calculateTotalResellerSavings(items: CartItem[], currency: 'USD' | 'EUR', isReseller: boolean)
```

## Support

For issues or questions:

1. Check this guide first
2. Review the troubleshooting section
3. Check browser console for errors
4. Check WordPress error logs
5. Verify API responses match expected format

## Changelog

### Version 2.0.0 (Current)
- ✅ Added custom reseller pricing tab in WooCommerce product editor
- ✅ Exposed reseller pricing via WooCommerce REST API
- ✅ Frontend cart integration with visual discounts
- ✅ Reseller benefits table for account area
- ✅ Sticky cart notifications for resellers
- ✅ Multi-currency support (USD/EUR)
- ✅ Automatic discount application based on quantity

### Version 1.0.0
- Initial plugin with Next.js sync functionality
- Product webhooks and revalidation

---

**Last Updated:** December 2024
**Plugin Version:** 2.0.0
**Tested With:** WooCommerce 8.x, WordPress 6.x, Next.js 14
