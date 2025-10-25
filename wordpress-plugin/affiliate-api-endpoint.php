<?php
/**
 * Affiliate API Endpoint for BlackBoard Next.js Sync Plugin
 *
 * Add this code to your blackboard-nextjs-sync.php plugin file
 * or include it as a separate file in the plugin
 *
 * This exposes affiliate data from AffiliateWP, SliceWP, or any other affiliate plugin
 * to the Next.js frontend via REST API
 */

// Register REST API endpoint for affiliate data
add_action('rest_api_init', function () {
    register_rest_route('blackboard/v1', '/affiliate/(?P<user_id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'blackboard_get_affiliate_data',
        'permission_callback' => '__return_true', // Make it public but validate inside
    ));
});

/**
 * Get affiliate data for a user
 *
 * Supports:
 * - AffiliateWP
 * - SliceWP
 * - YITH WooCommerce Affiliates
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function blackboard_get_affiliate_data($request) {
    $user_id = $request->get_param('user_id');

    if (!$user_id) {
        return new WP_Error('missing_user_id', 'User ID is required', array('status' => 400));
    }

    // Detect which affiliate plugin is active
    $affiliate_data = null;

    // Try AffiliateWP first (most popular)
    if (function_exists('affiliate_wp')) {
        $affiliate_data = blackboard_get_affiliatewp_data($user_id);
    }
    // Try SliceWP
    elseif (function_exists('slicewp')) {
        $affiliate_data = blackboard_get_slicewp_data($user_id);
    }
    // Try YITH WooCommerce Affiliates
    elseif (class_exists('YITH_WCAF')) {
        $affiliate_data = blackboard_get_yith_affiliate_data($user_id);
    }
    // No affiliate plugin detected
    else {
        return new WP_Error('no_affiliate_plugin', 'No affiliate plugin detected', array('status' => 500));
    }

    // If user is not an affiliate
    if (!$affiliate_data) {
        return new WP_Error('not_affiliate', 'User is not an affiliate', array('status' => 404));
    }

    return rest_ensure_response($affiliate_data);
}

/**
 * Get data from AffiliateWP plugin
 */
function blackboard_get_affiliatewp_data($user_id) {
    $affiliate = affiliate_wp()->affiliates->get_by('user_id', $user_id);

    if (!$affiliate) {
        return null;
    }

    // Get affiliate stats
    $total_referrals = affwp_count_referrals($affiliate->ID);
    $total_earnings = affwp_get_affiliate_earnings($affiliate->ID, true);
    $unpaid_earnings = affwp_get_affiliate_unpaid_earnings($affiliate->ID, true);
    $paid_earnings = $total_earnings - $unpaid_earnings;

    // Get this month's stats
    $this_month_start = date('Y-m-01 00:00:00');
    $this_month_referrals = affwp_count_referrals($affiliate->ID, array('date' => array(
        'start' => $this_month_start,
        'end' => 'now'
    )));
    $this_month_earnings = affwp_get_affiliate_earnings($affiliate->ID, true, array('date' => array(
        'start' => $this_month_start,
        'end' => 'now'
    )));

    // Get recent referrals
    $referrals = affiliate_wp()->referrals->get_referrals(array(
        'affiliate_id' => $affiliate->ID,
        'number' => 10,
        'orderby' => 'date',
        'order' => 'DESC'
    ));

    $referrals_data = array();
    foreach ($referrals as $referral) {
        $referrals_data[] = array(
            'id' => $referral->referral_id,
            'reference' => $referral->reference, // Usually the order ID
            'order_id' => $referral->reference,
            'description' => $referral->description,
            'product_name' => $referral->description,
            'amount' => floatval($referral->amount),
            'commission' => floatval($referral->amount),
            'status' => $referral->status, // 'paid', 'unpaid', 'pending', 'rejected'
            'date' => $referral->date,
            'customer_email' => get_the_author_meta('email', $referral->user_id) // If available
        );
    }

    // Get referral URL
    $referral_var = affiliate_wp()->tracking->get_referral_var();
    $referral_url = add_query_arg($referral_var, $affiliate->affiliate_id, home_url());

    return array(
        'affiliate_id' => $affiliate->affiliate_id,
        'user_id' => $affiliate->user_id,
        'status' => $affiliate->status,
        'rate' => floatval($affiliate->rate ?: affwp_get_affiliate_rate($affiliate->ID)),
        'referrals' => $total_referrals,
        'earnings' => $total_earnings,
        'unpaid_earnings' => $unpaid_earnings,
        'paid_earnings' => $paid_earnings,
        'referrals_this_month' => $this_month_referrals,
        'earnings_this_month' => $this_month_earnings,
        'referral_url' => $referral_url,
        'referrals_data' => $referrals_data,
        'payment_email' => $affiliate->payment_email ?: get_the_author_meta('email', $user_id),
        'payment_method' => get_user_meta($user_id, 'affwp_payment_method', true) ?: 'PayPal',
        'minimum_payout' => floatval(affiliate_wp()->settings->get('referral_payout_minimum', 50)),
        'next_payment_date' => null // This would require custom logic based on payout schedule
    );
}

/**
 * Get data from SliceWP plugin
 */
function blackboard_get_slicewp_data($user_id) {
    global $wpdb;

    // Get affiliate by user ID
    $affiliate = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}slicewp_affiliates WHERE user_id = %d AND status = 'active'",
        $user_id
    ));

    if (!$affiliate) {
        return null;
    }

    // Get commission stats
    $total_earnings = $wpdb->get_var($wpdb->prepare(
        "SELECT SUM(amount) FROM {$wpdb->prefix}slicewp_commissions WHERE affiliate_id = %d AND status != 'rejected'",
        $affiliate->id
    ));

    $unpaid_earnings = $wpdb->get_var($wpdb->prepare(
        "SELECT SUM(amount) FROM {$wpdb->prefix}slicewp_commissions WHERE affiliate_id = %d AND status = 'unpaid'",
        $affiliate->id
    ));

    $total_referrals = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->prefix}slicewp_visits WHERE affiliate_id = %d AND converted = 1",
        $affiliate->id
    ));

    // Get recent commissions
    $commissions = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}slicewp_commissions WHERE affiliate_id = %d ORDER BY date_created DESC LIMIT 10",
        $affiliate->id
    ));

    $referrals_data = array();
    foreach ($commissions as $commission) {
        $referrals_data[] = array(
            'id' => $commission->id,
            'reference' => $commission->reference,
            'order_id' => $commission->reference,
            'description' => $commission->reference,
            'product_name' => 'Purchase',
            'amount' => floatval($commission->amount),
            'commission' => floatval($commission->amount),
            'status' => $commission->status,
            'date' => $commission->date_created,
            'customer_email' => 'Customer'
        );
    }

    return array(
        'affiliate_id' => $affiliate->id,
        'user_id' => $affiliate->user_id,
        'status' => $affiliate->status,
        'rate' => 0.1, // SliceWP uses different rate structure
        'referrals' => $total_referrals,
        'earnings' => floatval($total_earnings),
        'unpaid_earnings' => floatval($unpaid_earnings),
        'paid_earnings' => floatval($total_earnings - $unpaid_earnings),
        'referrals_this_month' => 0, // Would require date filtering
        'earnings_this_month' => 0,
        'referral_url' => home_url() . '?slicewp_ref=' . $affiliate->id,
        'referrals_data' => $referrals_data,
        'payment_email' => get_user_meta($user_id, 'slicewp_payment_email', true) ?: get_the_author_meta('email', $user_id),
        'payment_method' => 'PayPal',
        'minimum_payout' => 50,
        'next_payment_date' => null
    );
}

/**
 * Get data from YITH WooCommerce Affiliates
 */
function blackboard_get_yith_affiliate_data($user_id) {
    $affiliate = YITH_WCAF_Affiliate_Handler()->get_affiliate_by_user_id($user_id);

    if (!$affiliate || !$affiliate->is_valid()) {
        return null;
    }

    $stats = $affiliate->get_stats();

    return array(
        'affiliate_id' => $affiliate->get_id(),
        'user_id' => $user_id,
        'status' => $affiliate->get_status(),
        'rate' => floatval($affiliate->get_rate()),
        'referrals' => $stats['commissions_count'],
        'earnings' => floatval($stats['commissions_total']),
        'unpaid_earnings' => floatval($stats['commissions_unpaid']),
        'paid_earnings' => floatval($stats['commissions_paid']),
        'referrals_this_month' => 0,
        'earnings_this_month' => 0,
        'referral_url' => $affiliate->get_url(),
        'referrals_data' => array(), // YITH has complex commission structure
        'payment_email' => get_the_author_meta('email', $user_id),
        'payment_method' => 'PayPal',
        'minimum_payout' => 50,
        'next_payment_date' => null
    );
}
