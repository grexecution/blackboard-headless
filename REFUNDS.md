# WooCommerce Refund Integration Guide

## How Refunds Work with Our Headless Setup

### Prerequisites for Refunds to Work

1. **Order must have a `transaction_id`** - This is set when payment is confirmed
2. **Payment gateway plugin must be installed** in WordPress (Stripe/PayPal)
3. **API credentials must be configured** in the payment gateway plugin

### Data We Store for Refunds

When a payment is confirmed via `/api/orders/[id]/complete-payment`, we store:

#### Core Order Fields (Required for refunds):
- `transaction_id` - The payment gateway transaction ID (CRITICAL!)
- `payment_method` - stripe, paypal, or bacs
- `payment_method_title` - Human-readable payment method
- `date_paid` - When payment was received
- `set_paid` - Marks order as paid

#### Meta Data Fields (For plugin compatibility):
- `_stripe_charge_id` - Stripe charge ID for Stripe plugin
- `_stripe_source_id` - Alternative Stripe ID field
- `_paypal_transaction_id` - PayPal transaction ID
- `_paypal_status` - PayPal payment status
- `_paid_amount` - Amount actually paid
- `_paid_currency` - Currency of payment

### How to Process Refunds

1. **In WooCommerce Admin:**
   - Go to WooCommerce → Orders
   - Click on the order
   - Click "Refund" button
   - Enter refund amount
   - Click "Refund via [Payment Method]"

2. **What Happens:**
   - WooCommerce uses the `transaction_id` to call the payment gateway API
   - Stripe/PayPal processes the refund
   - Customer receives refund to original payment method
   - Order status updates to show partial/full refund

### Testing Refunds

1. **Create a test order** with Stripe/PayPal
2. **Confirm payment** using `/admin/confirm-payment` with test transaction ID:
   - Stripe test: `ch_test_xxxxxxxxxxxxx`
   - PayPal test: `PAYID-XXXXXXXXXX`
3. **Process refund** in WooCommerce admin
4. **Check logs** in WooCommerce Status → Logs

### Important Notes

- **Bank Transfer (BACS)** orders cannot be refunded automatically (manual process)
- **Partial refunds** are supported by both Stripe and PayPal
- **Refund fees** are not returned by payment gateways
- **Refund timeline**: 5-10 business days for customer to see funds

### Troubleshooting Refunds

If refunds fail:

1. **Check transaction_id** is present in order
2. **Verify payment gateway plugin** is active and configured
3. **Check API credentials** in payment gateway settings
4. **Review error logs** in WooCommerce Status → Logs
5. **Test with gateway's test mode** first

### Manual Refund Process (Fallback)

If automatic refund fails:

1. Process refund manually in Stripe/PayPal dashboard
2. Update order in WooCommerce:
   - Add order note with refund details
   - Change order status to "Refunded"
   - Update order totals

### Code Integration Points

- **Order Creation**: `/api/checkout/route.ts` - Creates order with payment method
- **Payment Confirmation**: `/api/orders/[id]/complete-payment` - Stores transaction ID
- **Admin Tool**: `/admin/confirm-payment` - Manual payment confirmation

### Future Enhancements

- Webhook endpoints for automatic payment confirmation
- Stripe Payment Intent integration for SCA compliance
- PayPal IPN handler for instant payment notification
- Automated refund status sync from payment gateways