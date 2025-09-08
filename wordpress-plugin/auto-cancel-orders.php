<?php
/**
 * Auto-cancel unpaid orders after timeout
 * Add this to your WordPress functions.php or as a plugin
 */

// Schedule the cleanup event
add_action('init', function() {
    if (!wp_next_scheduled('cleanup_unpaid_orders')) {
        wp_schedule_event(time(), 'every_ten_minutes', 'cleanup_unpaid_orders');
    }
});

// Add custom cron schedule for every 10 minutes
add_filter('cron_schedules', function($schedules) {
    $schedules['every_ten_minutes'] = array(
        'interval' => 600, // 10 minutes in seconds
        'display' => __('Every 10 minutes')
    );
    return $schedules;
});

// The cleanup function
add_action('cleanup_unpaid_orders', function() {
    $args = array(
        'status' => array('pending', 'on-hold'),
        'date_created' => '<' . (time() - 600), // Orders older than 10 minutes
        'payment_method' => array('stripe', 'paypal'), // Only for online payments
        'limit' => 20 // Process 20 at a time
    );
    
    $orders = wc_get_orders($args);
    
    foreach ($orders as $order) {
        // Check if order has the headless checkout meta
        if ($order->get_meta('_payment_source') === 'nextjs_checkout') {
            // Check if payment is still awaiting
            if ($order->get_meta('_awaiting_payment') === 'yes') {
                // Cancel the order
                $order->update_status('cancelled', 'Order cancelled due to timeout - payment not received within 10 minutes');
                
                // Restore stock levels
                wc_maybe_increase_stock_levels($order);
                
                // Log the cancellation
                error_log('Auto-cancelled order #' . $order->get_id() . ' due to payment timeout');
            }
        }
    }
});

// Optional: Add admin setting for timeout duration
add_action('woocommerce_general_settings', function($settings) {
    $settings[] = array(
        'title' => __('Headless Checkout Timeout', 'woocommerce'),
        'desc' => __('Cancel unpaid headless orders after this many minutes', 'woocommerce'),
        'id' => 'headless_checkout_timeout',
        'type' => 'number',
        'default' => '10',
        'css' => 'width:50px;',
        'desc_tip' => true,
    );
    return $settings;
});