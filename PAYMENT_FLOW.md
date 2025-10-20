# Payment Flow Documentation

## Overview

The payment system has been fully integrated to provide a seamless checkout experience that automatically redirects users to Stripe or PayPal for payment completion.

## How It Works

### 1. User Fills Out Checkout Form
- User enters billing/shipping information
- Selects payment method (Stripe, PayPal, or Bank Transfer)
- Clicks "Place Order"

### 2. Order Creation
- Next.js creates order in WooCommerce with status `pending` (for Stripe/PayPal) or `on-hold` (for bank transfer)
- Order contains all product information, billing, shipping, and payment method details

### 3. Payment URL Retrieval
- Next.js API fetches payment URL from WordPress plugin REST endpoint
- WordPress generates the appropriate payment URL based on the selected gateway:
  - **Stripe**: WooCommerce Stripe checkout URL
  - **PayPal**: WooCommerce PayPal checkout URL
  - **Bank Transfer**: Direct to thank you page with bank details

### 4. Beautiful Loading Animation
- Full-screen overlay with animated progress steps
- Shows:
  1. Creating your order (with spinning loader)
  2. Setting up payment
  3. Redirecting to payment
- Yellow (#ffed00) branded animations with smooth transitions

### 5. Automatic Redirect
- User is automatically redirected to payment gateway
- For Stripe: Stripe Checkout page
- For PayPal: PayPal payment page
- For Bank Transfer: Thank you page with bank details

### 6. Payment Completion
- User completes payment on Stripe/PayPal
- WooCommerce automatically updates order status to `processing` or `completed`
- User is redirected back to thank you page

### 7. Order Cancellation (Automatic)
- If payment not completed within 10 minutes, order is automatically cancelled
- This is handled by the WordPress auto-cancel orders plugin

## Technical Implementation

### WordPress Plugin Changes

**File**: `/wp-content/plugins/blackboard-nextjs-sync/blackboard-nextjs-sync.php`

**New REST API Endpoint**:
```php
GET /wp-json/blackboard/v1/orders/{order_id}/payment-url
```

**Response**:
```json
{
  "order_id": 123,
  "order_key": "wc_order_abc123",
  "order_number": "123",
  "payment_method": "stripe",
  "payment_method_title": "Credit Card (Stripe)",
  "payment_url": "https://yoursite.com/checkout/order-pay/123/?pay_for_order=true&key=wc_order_abc123",
  "return_url": "https://your-nextjs-site.com/order-success?order=123&key=wc_order_abc123",
  "redirect_type": "external",
  "status": "pending",
  "total": "99.95",
  "currency": "EUR"
}
```

### Next.js Changes

**File**: `/app/api/checkout/route.ts`

After creating the order in WooCommerce, the API now:
1. Fetches the payment URL from WordPress plugin
2. Returns payment URL in the response

**File**: `/app/checkout/page.tsx`

Enhanced with:
1. **Processing Steps State**: Tracks `creating` → `payment` → `redirecting`
2. **Full-Screen Overlay**: Beautiful loading animation while processing
3. **Automatic Redirect**: Redirects to payment URL when received
4. **Smart Routing**:
   - Stripe/PayPal: Redirects to payment gateway
   - Bank Transfer: Redirects to thank you page

## Payment Method Details

### Stripe
- **Payment Method ID**: `stripe` or `stripe_cc`
- **Flow**: Order created → Stripe Checkout URL → User pays → Redirected to thank you page
- **Order Status**: `pending` → `processing` (after successful payment)
- **Webhook**: Stripe sends webhook to WooCommerce to update order status

### PayPal
- **Payment Method ID**: `paypal` or `ppec_paypal`
- **Flow**: Order created → PayPal payment page → User pays → Redirected to thank you page
- **Order Status**: `pending` → `processing` (after successful payment)
- **Webhook**: PayPal sends IPN to WooCommerce to update order status

### Bank Transfer
- **Payment Method ID**: `bacs`
- **Flow**: Order created → Thank you page with bank details
- **Order Status**: `on-hold` (awaiting payment confirmation)
- **Manual**: Admin manually marks as paid after verifying bank transfer

## Auto-Cancel Orders

**Plugin**: Already implemented in `/wordpress-plugin/auto-cancel-orders.php`

**Features**:
- Automatically cancels unpaid orders after 10 minutes
- Restores stock for cancelled orders
- Only affects orders with status `pending` or `on-hold`
- Runs every 5 minutes via WordPress cron

## Testing Checklist

### Stripe Payment
- [x] Fill out checkout form
- [x] Select Stripe payment method
- [x] Click "Place Order"
- [x] See beautiful loading animation
- [x] Automatically redirected to Stripe Checkout
- [ ] Complete payment with test card `4242 4242 4242 4242`
- [ ] Verify redirect to thank you page
- [ ] Verify order status changed to `processing`

### PayPal Payment
- [x] Fill out checkout form
- [x] Select PayPal payment method
- [x] Click "Place Order"
- [x] See beautiful loading animation
- [x] Automatically redirected to PayPal
- [ ] Complete payment with PayPal sandbox account
- [ ] Verify redirect to thank you page
- [ ] Verify order status changed to `processing`

### Bank Transfer
- [x] Fill out checkout form
- [x] Select Bank Transfer payment method
- [x] Click "Place Order"
- [x] See beautiful loading animation
- [x] Redirected to thank you page with bank details
- [ ] Verify order status is `on-hold`
- [ ] Verify bank details are displayed correctly

### Order Cancellation
- [ ] Create order but don't complete payment
- [ ] Wait 10+ minutes
- [ ] Verify order status changed to `cancelled`
- [ ] Verify stock restored

## Stripe Test Cards

Use these test cards for testing Stripe payments:

| Card Number | Description | Result |
|-------------|-------------|--------|
| 4242 4242 4242 4242 | Successful payment | Success |
| 4000 0000 0000 0002 | Card declined | Declined |
| 4000 0000 0000 9995 | Insufficient funds | Declined |
| 4000 0025 0000 3155 | 3D Secure authentication required | Success (after auth) |

**Expiry**: Any future date (e.g., 12/34)
**CVC**: Any 3 digits (e.g., 123)

## Configuration

### WordPress Settings

1. **WooCommerce → Settings → Payments**
   - Enable Stripe
   - Enable PayPal
   - Configure API keys for each gateway

2. **BlackBoard Plugin Settings**
   - Set Next.js URL in plugin settings
   - This ensures correct return URLs after payment

### Next.js Environment Variables

```bash
# Required for payment flow
WORDPRESS_API_URL=https://your-wordpress-site.com
NEXT_PUBLIC_WOO_API_URL=https://your-wordpress-site.com/wp-json/wc/v3
WOO_CONSUMER_KEY=ck_xxxxxxxxxxxxx
WOO_CONSUMER_SECRET=cs_xxxxxxxxxxxxx
NEXTAUTH_URL=https://your-nextjs-site.com
```

## User Experience

### What Users See:

1. **Checkout Form** (familiar checkout fields)
2. **Place Order Button** (yellow with "Processing..." animation)
3. **Full-Screen Overlay** with:
   - Large spinning loader
   - Progress steps with checkmarks
   - Clear status messages
4. **Automatic Redirect** to Stripe/PayPal
5. **Payment Gateway** (Stripe Checkout or PayPal)
6. **Thank You Page** with order confirmation

### Animation Details:

- **Colors**: Yellow (#ffed00) for primary actions
- **Timing**: 800ms delay before redirect (smooth transition)
- **Icons**: Package → Credit Card → Checkmark
- **Feedback**: Clear messages at each step

## Troubleshooting

### Payment URL Not Generated

**Problem**: User sees error "Failed to get payment URL"

**Solution**:
1. Check WordPress plugin is active
2. Verify REST API endpoint is accessible: `GET /wp-json/blackboard/v1/orders/{id}/payment-url`
3. Check WordPress error logs

### Not Redirecting to Payment Gateway

**Problem**: Loading animation shows but doesn't redirect

**Solution**:
1. Check browser console for errors
2. Verify payment URL is returned from API
3. Check if payment gateway is enabled in WooCommerce

### Order Status Not Updating

**Problem**: Payment completed but order still `pending`

**Solution**:
1. Check Stripe/PayPal webhooks are configured in WooCommerce
2. Verify webhook URLs are accessible
3. Check WordPress error logs for webhook failures

### Orders Not Auto-Cancelling

**Problem**: Unpaid orders remain in `pending` status

**Solution**:
1. Verify auto-cancel plugin is active
2. Check WordPress cron is running: `wp-cli cron event list`
3. Manually trigger cron: `wp-cli cron event run --due-now`

## Next Steps

### For Testing:
1. Set up Stripe test mode with test API keys
2. Set up PayPal sandbox with test accounts
3. Test complete flow end-to-end
4. Verify order status updates correctly
5. Test auto-cancellation with 10+ minute wait

### For Production:
1. Replace Stripe test keys with live keys
2. Replace PayPal sandbox with live credentials
3. Test with small real payment first
4. Monitor first few orders closely
5. Set up order notifications for admins

## Support

For issues with:
- **Stripe**: Check Stripe dashboard for payment logs
- **PayPal**: Check PayPal dashboard for transaction logs
- **WooCommerce**: Check WooCommerce → Status → Logs
- **WordPress**: Check WordPress error logs
- **Next.js**: Check Vercel deployment logs

## Files Modified

1. `/wp-content/plugins/blackboard-nextjs-sync/blackboard-nextjs-sync.php` (WordPress plugin)
2. `/app/api/checkout/route.ts` (Next.js API)
3. `/app/checkout/page.tsx` (Next.js checkout page)
4. `/PAYMENT_FLOW.md` (this documentation)
