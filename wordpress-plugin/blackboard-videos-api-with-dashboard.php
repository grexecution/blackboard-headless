<?php
/**
 * Plugin Name: BlackBoard Videos API with Dashboard
 * Description: Extends WordPress REST API for Video CPT with ACF fields, Next.js integration, and diagnostic dashboard
 * Version: 2.0.0
 * Author: BlackBoard Training
 * Text Domain: blackboard-videos-api
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class BlackBoardVideosAPI {

    private $diagnostics = array();

    public function __construct() {
        // Register REST API modifications
        add_action('rest_api_init', array($this, 'register_rest_fields'));

        // Add custom REST endpoints
        add_action('rest_api_init', array($this, 'register_rest_routes'));

        // Hook into video post type actions for Next.js sync
        add_action('save_post_video', array($this, 'on_video_saved'), 10, 3);
        add_action('delete_post', array($this, 'on_video_deleted'), 10, 1);

        // Modify REST API response
        add_filter('rest_prepare_video', array($this, 'modify_video_response'), 10, 3);
        add_filter('rest_prepare_video_cat', array($this, 'modify_category_response'), 10, 3);

        // Add CORS headers for Next.js
        add_action('rest_api_init', array($this, 'add_cors_headers'));

        // Add admin styles
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_styles'));
    }

    /**
     * Enqueue admin styles for the dashboard
     */
    public function enqueue_admin_styles($hook) {
        if (strpos($hook, 'video-api-dashboard') !== false || strpos($hook, 'video-api-settings') !== false) {
            ?>
            <style>
                .blackboard-dashboard {
                    padding: 20px;
                    background: #f0f0f1;
                    margin: 20px 20px 20px 0;
                }
                .status-grid {
                    display: grid;
                    gap: 20px;
                    margin-top: 20px;
                }
                .status-card {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .status-card h3 {
                    margin-top: 0;
                    font-size: 18px;
                    color: #1d2327;
                }
                .status-list {
                    list-style: none;
                    padding: 0;
                    margin: 15px 0;
                }
                .status-item {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    margin: 5px 0;
                    background: #f6f7f7;
                    border-radius: 4px;
                }
                .status-icon {
                    margin-right: 10px;
                    font-size: 20px;
                }
                .status-success { color: #00a32a; }
                .status-error { color: #d63638; }
                .status-warning { color: #dba617; }
                .status-info { color: #72aee6; }
                .status-label {
                    flex: 1;
                    font-weight: 500;
                }
                .status-value {
                    color: #646970;
                    font-size: 13px;
                }
                .diagnostic-section {
                    margin-top: 30px;
                }
                .api-endpoint-list {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-top: 10px;
                }
                .endpoint-item {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    border-bottom: 1px solid #e0e0e0;
                }
                .endpoint-item:last-child {
                    border-bottom: none;
                }
                .endpoint-method {
                    background: #72aee6;
                    color: white;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-size: 11px;
                    font-weight: bold;
                    margin-right: 10px;
                }
                .endpoint-url {
                    flex: 1;
                    font-family: monospace;
                    font-size: 13px;
                    color: #2c3338;
                }
                .endpoint-status {
                    margin-left: 10px;
                }
                .quick-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                }
                .stat-box {
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    border-left: 4px solid #72aee6;
                }
                .stat-number {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2c3338;
                }
                .stat-label {
                    color: #646970;
                    font-size: 13px;
                    margin-top: 5px;
                }
                .refresh-button {
                    margin-top: 20px;
                }
                .test-button {
                    display: inline-block;
                    margin-left: 10px;
                    padding: 5px 10px;
                    background: #2271b1;
                    color: white;
                    text-decoration: none;
                    border-radius: 3px;
                    font-size: 12px;
                }
                .test-button:hover {
                    background: #135e96;
                    color: white;
                }
            </style>
            <?php
        }
    }

    /**
     * Run all diagnostic checks
     */
    private function run_diagnostics() {
        $this->diagnostics = array();

        // Check Video Custom Post Type
        $this->diagnostics['post_type'] = array(
            'label' => 'Video Custom Post Type',
            'status' => post_type_exists('video'),
            'value' => post_type_exists('video') ? 'Registered' : 'Not found',
            'type' => post_type_exists('video') ? 'success' : 'error'
        );

        // Check Video Categories Taxonomy
        $this->diagnostics['taxonomy'] = array(
            'label' => 'Video Categories Taxonomy',
            'status' => taxonomy_exists('video_cat'),
            'value' => taxonomy_exists('video_cat') ? 'Registered' : 'Not found',
            'type' => taxonomy_exists('video_cat') ? 'success' : 'error'
        );

        // Check ACF Plugin
        $this->diagnostics['acf'] = array(
            'label' => 'Advanced Custom Fields (ACF)',
            'status' => function_exists('get_fields'),
            'value' => function_exists('get_fields') ? 'Active' : 'Not installed/inactive',
            'type' => function_exists('get_fields') ? 'success' : 'warning'
        );

        // Check WooCommerce
        $this->diagnostics['woocommerce'] = array(
            'label' => 'WooCommerce',
            'status' => class_exists('WooCommerce'),
            'value' => class_exists('WooCommerce') ? 'Active v' . WC()->version : 'Not installed/inactive',
            'type' => class_exists('WooCommerce') ? 'success' : 'warning'
        );

        // Check REST API
        $this->diagnostics['rest_api'] = array(
            'label' => 'WordPress REST API',
            'status' => function_exists('rest_api_init'),
            'value' => function_exists('rest_api_init') ? 'Enabled' : 'Disabled',
            'type' => function_exists('rest_api_init') ? 'success' : 'error'
        );

        // Check Next.js Configuration
        $nextjs_url = get_option('blackboard_nextjs_url', '');
        $webhook_secret = get_option('blackboard_webhook_secret', '');

        $this->diagnostics['nextjs_url'] = array(
            'label' => 'Next.js URL Configuration',
            'status' => !empty($nextjs_url),
            'value' => !empty($nextjs_url) ? $nextjs_url : 'Not configured',
            'type' => !empty($nextjs_url) ? 'success' : 'warning'
        );

        $this->diagnostics['webhook_secret'] = array(
            'label' => 'Webhook Secret',
            'status' => !empty($webhook_secret),
            'value' => !empty($webhook_secret) ? 'Configured (' . strlen($webhook_secret) . ' characters)' : 'Not configured',
            'type' => !empty($webhook_secret) ? 'success' : 'warning'
        );

        // Check Custom REST Routes Registration
        $rest_routes = rest_get_server()->get_routes();
        $custom_routes = array(
            '/blackboard/v1/videos' => false,
            '/blackboard/v1/videos/category/(?P<slug>[a-z0-9-]+)' => false,
            '/blackboard/v1/videos/access/(?P<id>\d+)' => false,
        );

        foreach ($custom_routes as $route => &$status) {
            foreach ($rest_routes as $registered_route => $data) {
                if (strpos($registered_route, trim($route, '(?P<slug>[a-z0-9-]+)(?P<id>\d+)')) !== false) {
                    $status = true;
                    break;
                }
            }
        }

        $routes_registered = array_filter($custom_routes);
        $this->diagnostics['custom_routes'] = array(
            'label' => 'Custom API Routes',
            'status' => count($routes_registered) === count($custom_routes),
            'value' => count($routes_registered) . ' of ' . count($custom_routes) . ' registered',
            'type' => count($routes_registered) === count($custom_routes) ? 'success' : 'warning'
        );

        // Check Videos Count
        $video_count = wp_count_posts('video');
        $published_videos = isset($video_count->publish) ? $video_count->publish : 0;

        $this->diagnostics['video_count'] = array(
            'label' => 'Published Videos',
            'status' => $published_videos > 0,
            'value' => $published_videos . ' videos',
            'type' => $published_videos > 0 ? 'info' : 'warning'
        );

        // Check Categories Count
        $categories = get_terms(array('taxonomy' => 'video_cat', 'hide_empty' => false));
        $category_count = !is_wp_error($categories) ? count($categories) : 0;

        $this->diagnostics['category_count'] = array(
            'label' => 'Video Categories',
            'status' => $category_count > 0,
            'value' => $category_count . ' categories',
            'type' => $category_count > 0 ? 'info' : 'warning'
        );

        // Check ACF Fields
        if (function_exists('get_fields')) {
            $sample_video = get_posts(array('post_type' => 'video', 'posts_per_page' => 1));
            if (!empty($sample_video)) {
                $fields = get_fields($sample_video[0]->ID);
                $field_count = is_array($fields) ? count($fields) : 0;

                $this->diagnostics['acf_fields'] = array(
                    'label' => 'ACF Fields on Videos',
                    'status' => $field_count > 0,
                    'value' => $field_count > 0 ? $field_count . ' fields detected' : 'No fields found',
                    'type' => $field_count > 0 ? 'success' : 'warning'
                );
            }
        }

        // Check CORS Headers
        $allowed_origins = array(
            'http://localhost:3000',
            'http://localhost:3001',
            $nextjs_url
        );

        $this->diagnostics['cors'] = array(
            'label' => 'CORS Configuration',
            'status' => true,
            'value' => count(array_filter($allowed_origins)) . ' origins configured',
            'type' => 'info'
        );

        return $this->diagnostics;
    }

    /**
     * Get all available API endpoints
     */
    private function get_api_endpoints() {
        $site_url = home_url();
        $endpoints = array(
            array(
                'method' => 'GET',
                'url' => $site_url . '/wp-json/wp/v2/video',
                'description' => 'All videos (standard WordPress endpoint)',
                'status' => post_type_exists('video')
            ),
            array(
                'method' => 'GET',
                'url' => $site_url . '/wp-json/wp/v2/video_cat',
                'description' => 'Video categories',
                'status' => taxonomy_exists('video_cat')
            ),
            array(
                'method' => 'GET',
                'url' => $site_url . '/wp-json/blackboard/v1/videos',
                'description' => 'Filtered videos with ACF data',
                'status' => true
            ),
            array(
                'method' => 'GET',
                'url' => $site_url . '/wp-json/blackboard/v1/videos/category/{slug}',
                'description' => 'Videos by category slug',
                'status' => true
            ),
            array(
                'method' => 'GET',
                'url' => $site_url . '/wp-json/blackboard/v1/videos/access/{id}',
                'description' => 'Check video access for current user',
                'status' => true
            ),
        );

        return $endpoints;
    }

    /**
     * Register REST API fields
     */
    public function register_rest_fields() {
        // Register ACF fields to REST API
        if (function_exists('acf_add_local_field_group')) {
            // Ensure ACF fields are exposed in REST API
            register_rest_field('video', 'acf_fields', array(
                'get_callback' => array($this, 'get_acf_fields'),
                'update_callback' => null,
                'schema' => null,
            ));

            // Add formatted data
            register_rest_field('video', 'formatted_data', array(
                'get_callback' => array($this, 'get_formatted_data'),
                'update_callback' => null,
                'schema' => null,
            ));
        }
    }

    /**
     * Register custom REST routes
     */
    public function register_rest_routes() {
        // Get videos by category
        register_rest_route('blackboard/v1', '/videos/category/(?P<slug>[a-z0-9-]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_videos_by_category'),
            'permission_callback' => '__return_true',
        ));

        // Get video access status
        register_rest_route('blackboard/v1', '/videos/access/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'check_video_access'),
            'permission_callback' => '__return_true',
        ));

        // Get all videos with filters
        register_rest_route('blackboard/v1', '/videos', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_filtered_videos'),
            'permission_callback' => '__return_true',
            'args' => array(
                'category' => array(
                    'default' => '',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'difficulty' => array(
                    'default' => '',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'equipment' => array(
                    'default' => '',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'locked' => array(
                    'default' => '',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
            ),
        ));
    }

    /**
     * Get ACF fields for a video
     */
    public function get_acf_fields($post) {
        if (!function_exists('get_fields')) {
            return array();
        }

        $fields = get_fields($post['id']);
        if (!$fields) {
            $fields = array();
        }

        // Process repeater fields if they exist
        if (isset($fields['videos']) && is_array($fields['videos'])) {
            foreach ($fields['videos'] as &$video_item) {
                // Add Vimeo thumbnail if video ID exists
                if (!empty($video_item['vimeo_video_id'])) {
                    $video_item['vimeo_thumbnail'] = $this->get_vimeo_thumbnail($video_item['vimeo_video_id']);
                }

                // Process product relationship
                if (!empty($video_item['product'])) {
                    $product = wc_get_product($video_item['product']);
                    if ($product) {
                        $video_item['product_data'] = array(
                            'id' => $product->get_id(),
                            'name' => $product->get_name(),
                            'slug' => $product->get_slug(),
                            'price' => $product->get_price(),
                            'link' => get_permalink($product->get_id()),
                        );
                    }
                }
            }
        }

        return $fields;
    }

    /**
     * Get formatted data for frontend
     */
    public function get_formatted_data($post) {
        $data = array();

        // Get featured image
        $thumbnail_id = get_post_thumbnail_id($post['id']);
        if ($thumbnail_id) {
            $data['featured_image'] = array(
                'url' => wp_get_attachment_url($thumbnail_id),
                'alt' => get_post_meta($thumbnail_id, '_wp_attachment_image_alt', true),
                'sizes' => wp_get_attachment_metadata($thumbnail_id)['sizes'] ?? array(),
            );
        }

        // Get categories
        $categories = wp_get_post_terms($post['id'], 'video_cat');
        $data['categories'] = array_map(function($cat) {
            return array(
                'id' => $cat->term_id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'description' => $cat->description,
            );
        }, $categories);

        // Get author info
        $author_id = get_post_field('post_author', $post['id']);
        $data['instructor'] = array(
            'id' => $author_id,
            'name' => get_the_author_meta('display_name', $author_id),
            'bio' => get_the_author_meta('description', $author_id),
            'avatar' => get_avatar_url($author_id),
        );

        // Check access for current user
        $data['access'] = $this->check_user_access($post['id']);

        return $data;
    }

    /**
     * Check if current user has access to video
     */
    private function check_user_access($video_id) {
        $fields = get_fields($video_id);
        $locked = $fields['locked_for_non_customers'] ?? false;

        if (!$locked) {
            return array(
                'has_access' => true,
                'reason' => 'public',
            );
        }

        // Check if user is logged in
        if (!is_user_logged_in()) {
            return array(
                'has_access' => false,
                'reason' => 'login_required',
            );
        }

        $user_id = get_current_user_id();

        // Check if user is a customer
        $customer = new WC_Customer($user_id);
        if ($customer && $customer->get_order_count() > 0) {
            return array(
                'has_access' => true,
                'reason' => 'customer',
            );
        }

        // Check for specific product purchases if configured
        if (!empty($fields['required_products'])) {
            foreach ($fields['required_products'] as $product_id) {
                if (wc_customer_bought_product('', $user_id, $product_id)) {
                    return array(
                        'has_access' => true,
                        'reason' => 'product_purchase',
                        'product_id' => $product_id,
                    );
                }
            }
        }

        return array(
            'has_access' => false,
            'reason' => 'purchase_required',
        );
    }

    /**
     * Get Vimeo thumbnail URL
     */
    private function get_vimeo_thumbnail($video_id) {
        // Cache the thumbnail URL
        $cache_key = 'vimeo_thumb_' . $video_id;
        $cached = get_transient($cache_key);

        if ($cached !== false) {
            return $cached;
        }

        // Fetch from Vimeo API
        $response = wp_remote_get("https://vimeo.com/api/v2/video/{$video_id}.json");

        if (!is_wp_error($response)) {
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);

            if (!empty($data[0]['thumbnail_large'])) {
                $thumbnail = $data[0]['thumbnail_large'];
                set_transient($cache_key, $thumbnail, DAY_IN_SECONDS);
                return $thumbnail;
            }
        }

        return '';
    }

    /**
     * Modify video REST response
     */
    public function modify_video_response($response, $post, $request) {
        // Add custom data to response
        $response->data['acf'] = $this->get_acf_fields(array('id' => $post->ID));
        $response->data['formatted'] = $this->get_formatted_data(array('id' => $post->ID));

        return $response;
    }

    /**
     * Modify category REST response
     */
    public function modify_category_response($response, $term, $request) {
        // Add video count
        $response->data['video_count'] = $term->count;

        // Add category image if using ACF
        if (function_exists('get_field')) {
            $response->data['image'] = get_field('category_image', 'video_cat_' . $term->term_id);
            $response->data['featured'] = get_field('featured_category', 'video_cat_' . $term->term_id);
        }

        return $response;
    }

    /**
     * Get videos by category
     */
    public function get_videos_by_category($request) {
        $slug = $request->get_param('slug');

        $term = get_term_by('slug', $slug, 'video_cat');
        if (!$term) {
            return new WP_Error('no_category', 'Category not found', array('status' => 404));
        }

        $args = array(
            'post_type' => 'video',
            'posts_per_page' => -1,
            'tax_query' => array(
                array(
                    'taxonomy' => 'video_cat',
                    'field' => 'term_id',
                    'terms' => $term->term_id,
                ),
            ),
        );

        $query = new WP_Query($args);
        $videos = array();

        foreach ($query->posts as $post) {
            $videos[] = array(
                'id' => $post->ID,
                'title' => $post->post_title,
                'slug' => $post->post_name,
                'content' => $post->post_content,
                'excerpt' => $post->post_excerpt,
                'acf' => $this->get_acf_fields(array('id' => $post->ID)),
                'formatted' => $this->get_formatted_data(array('id' => $post->ID)),
            );
        }

        return rest_ensure_response($videos);
    }

    /**
     * Check video access endpoint
     */
    public function check_video_access($request) {
        $video_id = $request->get_param('id');
        $access = $this->check_user_access($video_id);

        return rest_ensure_response($access);
    }

    /**
     * Get filtered videos
     */
    public function get_filtered_videos($request) {
        $args = array(
            'post_type' => 'video',
            'posts_per_page' => -1,
            'post_status' => 'publish',
        );

        // Filter by category
        if ($category = $request->get_param('category')) {
            $args['tax_query'][] = array(
                'taxonomy' => 'video_cat',
                'field' => 'slug',
                'terms' => $category,
            );
        }

        // Filter by difficulty (if using ACF)
        if ($difficulty = $request->get_param('difficulty')) {
            $args['meta_query'][] = array(
                'key' => 'difficulty_level',
                'value' => $difficulty,
                'compare' => '=',
            );
        }

        $query = new WP_Query($args);
        $videos = array();

        foreach ($query->posts as $post) {
            $videos[] = array(
                'id' => $post->ID,
                'title' => $post->post_title,
                'slug' => $post->post_name,
                'content' => $post->post_content,
                'excerpt' => $post->post_excerpt,
                'acf' => $this->get_acf_fields(array('id' => $post->ID)),
                'formatted' => $this->get_formatted_data(array('id' => $post->ID)),
            );
        }

        return rest_ensure_response($videos);
    }

    /**
     * Trigger Next.js revalidation when video is saved
     */
    public function on_video_saved($post_id, $post, $update) {
        // Skip autosaves
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Trigger Next.js revalidation
        $this->trigger_nextjs_revalidation('video.' . ($update ? 'updated' : 'created'), $post->post_name);
    }

    /**
     * Trigger Next.js revalidation when video is deleted
     */
    public function on_video_deleted($post_id) {
        if (get_post_type($post_id) !== 'video') {
            return;
        }

        $this->trigger_nextjs_revalidation('video.deleted');
    }

    /**
     * Send revalidation request to Next.js
     */
    private function trigger_nextjs_revalidation($action, $slug = '') {
        $nextjs_url = get_option('blackboard_nextjs_url', '');
        $webhook_secret = get_option('blackboard_webhook_secret', '');

        if (empty($nextjs_url) || empty($webhook_secret)) {
            return false;
        }

        $webhook_url = trailingslashit($nextjs_url) . 'api/webhook/rebuild';

        $body = array(
            'secret' => $webhook_secret,
            'action' => $action,
            'type' => 'video',
            'slug' => $slug,
            'timestamp' => current_time('mysql'),
        );

        $response = wp_remote_post($webhook_url, array(
            'body' => json_encode($body),
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'timeout' => 5,
            'blocking' => true,
        ));

        return !is_wp_error($response);
    }

    /**
     * Test webhook connection
     */
    public function test_webhook_connection() {
        $result = $this->trigger_nextjs_revalidation('test.connection');
        return $result;
    }

    /**
     * Add CORS headers for Next.js
     */
    public function add_cors_headers() {
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
        add_filter('rest_pre_serve_request', function($value) {
            $origin = get_http_origin();
            $allowed_origins = array(
                'http://localhost:3000',
                'http://localhost:3001',
                get_option('blackboard_nextjs_url', ''),
            );

            if (in_array($origin, $allowed_origins)) {
                header('Access-Control-Allow-Origin: ' . $origin);
                header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
                header('Access-Control-Allow-Headers: Authorization, Content-Type');
                header('Access-Control-Allow-Credentials: true');
            }

            return $value;
        });
    }
}

// Initialize the plugin
new BlackBoardVideosAPI();

// Admin menu items
add_action('admin_menu', function() {
    // Add main dashboard page
    add_submenu_page(
        'edit.php?post_type=video',
        'Video API Dashboard',
        '🎯 API Dashboard',
        'manage_options',
        'video-api-dashboard',
        'blackboard_video_api_dashboard_page'
    );

    // Add settings page
    add_submenu_page(
        'edit.php?post_type=video',
        'Video API Settings',
        '⚙️ API Settings',
        'manage_options',
        'video-api-settings',
        'blackboard_video_api_settings_page'
    );
});

/**
 * Dashboard page with diagnostic information
 */
function blackboard_video_api_dashboard_page() {
    $api_instance = new BlackBoardVideosAPI();
    $diagnostics = $api_instance->run_diagnostics();
    $endpoints = $api_instance->get_api_endpoints();

    // Handle test webhook
    if (isset($_GET['test_webhook']) && $_GET['test_webhook'] === '1') {
        $webhook_result = $api_instance->test_webhook_connection();
        if ($webhook_result) {
            echo '<div class="notice notice-success"><p>✅ Webhook test successful! Connection to Next.js is working.</p></div>';
        } else {
            echo '<div class="notice notice-error"><p>❌ Webhook test failed. Please check your Next.js URL and webhook secret.</p></div>';
        }
    }
    ?>
    <div class="wrap">
        <h1>🎯 BlackBoard Video API Dashboard</h1>

        <div class="blackboard-dashboard">
            <!-- Quick Stats -->
            <h2>📊 Quick Stats</h2>
            <div class="quick-stats">
                <div class="stat-box">
                    <div class="stat-number"><?php echo $diagnostics['video_count']['value']; ?></div>
                    <div class="stat-label">Published Videos</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number"><?php echo $diagnostics['category_count']['value']; ?></div>
                    <div class="stat-label">Categories</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number"><?php echo count($endpoints); ?></div>
                    <div class="stat-label">API Endpoints</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number"><?php echo $diagnostics['custom_routes']['value']; ?></div>
                    <div class="stat-label">Custom Routes</div>
                </div>
            </div>

            <!-- System Status -->
            <div class="diagnostic-section">
                <h2>🔍 System Status</h2>
                <div class="status-grid">
                    <!-- Core Requirements -->
                    <div class="status-card">
                        <h3>Core Requirements</h3>
                        <ul class="status-list">
                            <?php foreach (['post_type', 'taxonomy', 'rest_api'] as $key): ?>
                            <li class="status-item">
                                <span class="status-icon status-<?php echo $diagnostics[$key]['type']; ?>">
                                    <?php echo $diagnostics[$key]['status'] ? '✅' : '❌'; ?>
                                </span>
                                <span class="status-label"><?php echo $diagnostics[$key]['label']; ?></span>
                                <span class="status-value"><?php echo $diagnostics[$key]['value']; ?></span>
                            </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>

                    <!-- Plugin Dependencies -->
                    <div class="status-card">
                        <h3>Plugin Dependencies</h3>
                        <ul class="status-list">
                            <?php foreach (['acf', 'woocommerce'] as $key): ?>
                            <li class="status-item">
                                <span class="status-icon status-<?php echo $diagnostics[$key]['type']; ?>">
                                    <?php echo $diagnostics[$key]['status'] ? '✅' : '⚠️'; ?>
                                </span>
                                <span class="status-label"><?php echo $diagnostics[$key]['label']; ?></span>
                                <span class="status-value"><?php echo $diagnostics[$key]['value']; ?></span>
                            </li>
                            <?php endforeach; ?>
                            <?php if (isset($diagnostics['acf_fields'])): ?>
                            <li class="status-item">
                                <span class="status-icon status-<?php echo $diagnostics['acf_fields']['type']; ?>">
                                    <?php echo $diagnostics['acf_fields']['status'] ? '✅' : '⚠️'; ?>
                                </span>
                                <span class="status-label"><?php echo $diagnostics['acf_fields']['label']; ?></span>
                                <span class="status-value"><?php echo $diagnostics['acf_fields']['value']; ?></span>
                            </li>
                            <?php endif; ?>
                        </ul>
                    </div>

                    <!-- Next.js Integration -->
                    <div class="status-card">
                        <h3>Next.js Integration</h3>
                        <ul class="status-list">
                            <?php foreach (['nextjs_url', 'webhook_secret', 'custom_routes', 'cors'] as $key): ?>
                            <li class="status-item">
                                <span class="status-icon status-<?php echo $diagnostics[$key]['type']; ?>">
                                    <?php
                                    if ($diagnostics[$key]['type'] === 'success') echo '✅';
                                    elseif ($diagnostics[$key]['type'] === 'warning') echo '⚠️';
                                    elseif ($diagnostics[$key]['type'] === 'info') echo 'ℹ️';
                                    else echo '❌';
                                    ?>
                                </span>
                                <span class="status-label"><?php echo $diagnostics[$key]['label']; ?></span>
                                <span class="status-value"><?php echo $diagnostics[$key]['value']; ?></span>
                            </li>
                            <?php endforeach; ?>
                        </ul>
                        <?php if (!empty(get_option('blackboard_nextjs_url')) && !empty(get_option('blackboard_webhook_secret'))): ?>
                        <a href="?post_type=video&page=video-api-dashboard&test_webhook=1" class="test-button">Test Webhook Connection</a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <!-- API Endpoints -->
            <div class="diagnostic-section">
                <h2>🔗 Available API Endpoints</h2>
                <div class="api-endpoint-list">
                    <?php foreach ($endpoints as $endpoint): ?>
                    <div class="endpoint-item">
                        <span class="endpoint-method"><?php echo $endpoint['method']; ?></span>
                        <span class="endpoint-url"><?php echo $endpoint['url']; ?></span>
                        <span class="endpoint-status">
                            <?php echo $endpoint['status'] ? '✅' : '❌'; ?>
                        </span>
                    </div>
                    <div style="padding: 5px 15px; color: #646970; font-size: 12px; margin-bottom: 10px;">
                        <?php echo $endpoint['description']; ?>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Actions -->
            <div class="diagnostic-section">
                <h2>⚡ Quick Actions</h2>
                <p>
                    <a href="?post_type=video&page=video-api-settings" class="button button-primary">Configure Settings</a>
                    <a href="<?php echo admin_url('edit.php?post_type=video'); ?>" class="button">Manage Videos</a>
                    <a href="<?php echo admin_url('edit-tags.php?taxonomy=video_cat&post_type=video'); ?>" class="button">Manage Categories</a>
                    <a href="<?php echo home_url('/wp-json/blackboard/v1/videos'); ?>" target="_blank" class="button">View API Response</a>
                </p>
            </div>

            <!-- Help Section -->
            <div class="diagnostic-section">
                <h2>❓ Need Help?</h2>
                <div class="status-card">
                    <h3>Common Issues & Solutions</h3>
                    <ul style="padding-left: 20px;">
                        <li><strong>No videos showing in API:</strong> Make sure videos are published and not in draft status</li>
                        <li><strong>ACF fields not appearing:</strong> Ensure ACF plugin is active and fields are properly configured</li>
                        <li><strong>Webhook not working:</strong> Check that Next.js URL is correct and includes https://</li>
                        <li><strong>Access control issues:</strong> Verify WooCommerce is active and customer orders are tracked</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <?php
}

/**
 * Settings configuration page
 */
function blackboard_video_api_settings_page() {
    // Save settings
    if (isset($_POST['submit'])) {
        update_option('blackboard_nextjs_url', sanitize_text_field($_POST['nextjs_url']));
        update_option('blackboard_webhook_secret', sanitize_text_field($_POST['webhook_secret']));
        echo '<div class="notice notice-success"><p>✅ Settings saved successfully!</p></div>';
    }

    $nextjs_url = get_option('blackboard_nextjs_url', '');
    $webhook_secret = get_option('blackboard_webhook_secret', '');
    ?>
    <div class="wrap">
        <h1>⚙️ Video API Settings</h1>

        <form method="post">
            <div class="status-card" style="max-width: 800px; margin-top: 20px;">
                <h3>Next.js Integration Settings</h3>
                <table class="form-table">
                    <tr>
                        <th><label for="nextjs_url">Next.js Site URL</label></th>
                        <td>
                            <input type="url" id="nextjs_url" name="nextjs_url" value="<?php echo esc_attr($nextjs_url); ?>" class="regular-text" style="width: 100%;" />
                            <p class="description">Your Next.js site URL (e.g., https://your-site.vercel.app or https://yourdomain.com)</p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="webhook_secret">Webhook Secret Key</label></th>
                        <td>
                            <input type="text" id="webhook_secret" name="webhook_secret" value="<?php echo esc_attr($webhook_secret); ?>" class="regular-text" style="width: 100%;" />
                            <p class="description">
                                Secret key for webhook authentication. Generate one with: <code>openssl rand -hex 32</code><br>
                                This same secret must be set in your Next.js environment variables as WEBHOOK_SECRET
                            </p>
                        </td>
                    </tr>
                </table>
                <?php submit_button('Save Settings'); ?>
            </div>
        </form>

        <div class="status-card" style="max-width: 800px; margin-top: 30px;">
            <h3>📚 Setup Instructions</h3>
            <ol style="padding-left: 20px; line-height: 1.8;">
                <li><strong>Configure Settings Above:</strong> Enter your Next.js site URL and generate a webhook secret</li>
                <li><strong>Set Environment Variables in Next.js:</strong>
                    <pre style="background: #f0f0f1; padding: 10px; margin: 10px 0;">WORDPRESS_API_URL=<?php echo home_url(); ?>
WEBHOOK_SECRET=your-webhook-secret-here</pre>
                </li>
                <li><strong>Ensure Required Plugins are Active:</strong>
                    <ul style="margin-top: 5px;">
                        <li>Advanced Custom Fields (ACF) - for video metadata</li>
                        <li>WooCommerce - for customer access control</li>
                    </ul>
                </li>
                <li><strong>Create ACF Fields for Videos:</strong>
                    <ul style="margin-top: 5px;">
                        <li><code>videos</code> - Repeater field for multiple videos</li>
                        <li><code>vimeo_video_id</code> - Text field for Vimeo ID</li>
                        <li><code>locked_for_non_customers</code> - True/False field</li>
                        <li><code>required_products</code> - Relationship field to products</li>
                    </ul>
                </li>
                <li><strong>Test the Integration:</strong> Use the "Test Webhook Connection" button in the dashboard</li>
            </ol>
        </div>

        <div class="status-card" style="max-width: 800px; margin-top: 30px;">
            <h3>🔒 Security Notes</h3>
            <ul style="padding-left: 20px;">
                <li>Keep your webhook secret secure and never share it publicly</li>
                <li>Use HTTPS for both WordPress and Next.js sites in production</li>
                <li>Regularly update all plugins and WordPress core</li>
                <li>Consider implementing rate limiting on your API endpoints</li>
            </ul>
        </div>
    </div>
    <?php
}