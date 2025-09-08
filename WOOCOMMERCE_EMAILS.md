# WooCommerce Email Notifications

## Automatic Emails Sent by WooCommerce

When orders are created through our headless checkout, WooCommerce automatically sends the following emails:

### Customer Emails

#### 1. **New Account** (When account created at checkout)
- **Trigger**: Customer account created via `/api/auth/register-customer`
- **Contains**: Username, password setup link, account details
- **When**: Immediately after account creation

#### 2. **Order Processing** (Order received)
- **Trigger**: Order status set to "processing" or "on-hold"
- **Contains**: Order details, products, billing/shipping address, payment method
- **When**: Immediately after order creation

#### 3. **Order Complete**
- **Trigger**: Order status changed to "completed"
- **Contains**: Order summary, download links (if applicable)
- **When**: When admin marks order as completed

#### 4. **Order Refunded**
- **Trigger**: Refund processed through WooCommerce
- **Contains**: Refund details, amount refunded
- **When**: When refund is processed

### Admin Emails

#### 1. **New Order**
- **Sent to**: Store admin email
- **Trigger**: Any new order created
- **Contains**: Full order details, customer info
- **When**: Immediately after order creation

#### 2. **Cancelled Order**
- **Sent to**: Store admin email
- **Trigger**: Order cancelled (auto-cancel plugin or manual)
- **Contains**: Cancelled order details
- **When**: When order is cancelled

#### 3. **Failed Order**
- **Sent to**: Store admin email
- **Trigger**: Order marked as failed
- **Contains**: Failed order details
- **When**: When payment fails or order fails

## Email Settings in WooCommerce

To configure these emails:

1. Go to **WooCommerce → Settings → Emails**
2. Each email can be:
   - Enabled/Disabled
   - Customized with different subject lines
   - Sent to additional recipients
   - Styled with custom templates

## Important Notes

### For Our Headless Setup:

1. **Customer Account Emails**: 
   - Sent when creating account via checkout
   - Password is set by customer (not random)
   - No "reset password" email needed initially

2. **Order Confirmation**:
   - Sent for ALL payment methods
   - Bank Transfer orders get "on-hold" email
   - Stripe/PayPal get "processing" email after payment

3. **Email Templates**:
   - Can be customized in `/wp-content/themes/[theme]/woocommerce/emails/`
   - Default WooCommerce templates are used if not customized

### Testing Emails

To test email sending:

1. **Use a real email service** (not local mail)
2. **Check spam folder** (especially for new domains)
3. **Install WP Mail SMTP plugin** for better delivery
4. **Use services like**:
   - SendGrid
   - Mailgun
   - Amazon SES
   - SMTP.com

### Email Variables Available

Our checkout sends these to WooCommerce:
- Customer email
- Customer name (first/last)
- Billing address
- Shipping address
- Customer note
- Order items
- Payment method
- Transaction ID (after payment confirmation)

### Disabling Specific Emails

If you want to disable certain emails:

```php
// Add to WordPress functions.php
add_filter('woocommerce_email_enabled_new_order', '__return_false');
add_filter('woocommerce_email_enabled_customer_processing_order', '__return_false');
// etc.
```

### Custom Email Triggers

Our system triggers emails at these points:

1. **Account Creation** → New account email
2. **Order Creation** → Processing/On-hold email + Admin new order
3. **Payment Confirmation** → Status update email (if status changes)
4. **Auto-cancellation** → Cancelled order email (after 10 min timeout)
5. **Refund Processing** → Refund email

## Troubleshooting

If emails are not sending:

1. **Check WooCommerce Status** → Tools → Status → Logs
2. **Verify email settings** in WooCommerce → Settings → Emails
3. **Test with WooCommerce Email Test plugin**
4. **Check WordPress email configuration** (WP Mail SMTP)
5. **Verify customer email addresses** are valid
6. **Check order meta data** includes email address

## Email Customization

To customize email content for headless:

1. Add order meta data in checkout
2. Use hooks to modify email content:

```php
add_action('woocommerce_email_order_meta', function($order, $sent_to_admin, $plain_text, $email) {
    if ($order->get_meta('_payment_source') === 'nextjs_checkout') {
        echo '<p>Order placed via BlackBoard Training website</p>';
    }
}, 10, 4);
```