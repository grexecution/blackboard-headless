<?php
/**
 * Plugin Name: BlackBoard Headless Sync & API
 * Description: Complete integration for Next.js headless site - handles WooCommerce products, Video CPT, REST API extensions, and automatic sync
 * Version: 3.0.0
 * Author: BlackBoard Training
 * Text Domain: blackboard-headless-sync
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main plugin class that combines all functionality
 */
class BlackBoardHeadlessSync {

    private $diagnostics = array();
    private $nextjs_url;
    private $webhook_secret;
    private $revalidate_secret;

    public function __construct() {
        // Load settings
        $this->nextjs_url = get_option('blackboard_nextjs_url', '');
        $this->webhook_secret = get_option('blackboard_webhook_secret', '');
        $this->revalidate_secret = get_option('blackboard_revalidate_secret', '');

        // Initialize components
        $this->init_woocommerce_sync();
        $this->init_video_api();
        $this->init_admin_interface();

        // Add admin styles
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_styles'));
    }

    /**
     * Initialize WooCommerce product sync functionality
     */
    private function init_woocommerce_sync() {
        // Hook into WooCommerce product actions
        add_action('woocommerce_new_product', array($this, 'on_product_created'), 10, 1);
        add_action('woocommerce_update_product', array($this, 'on_product_updated'), 10, 1);
        add_action('woocommerce_delete_product', array($this, 'on_product_deleted'), 10, 1);
        add_action('woocommerce_trash_product', array($this, 'on_product_deleted'), 10, 1);
        add_action('untrashed_post', array($this, 'on_product_restored'), 10, 1);

        // Hook into stock changes
        add_action('woocommerce_product_set_stock', array($this, 'on_stock_updated'));
        add_action('woocommerce_variation_set_stock', array($this, 'on_stock_updated'));
    }

    /**
     * Initialize Video API functionality
     */
    private function init_video_api() {
        // Register REST API modifications
        add_action('rest_api_init', array($this, 'register_rest_fields'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('rest_api_init', array($this, 'add_cors_headers'));

        // Hook into video post type actions
        add_action('save_post_video', array($this, 'on_video_saved'), 10, 3);
        add_action('delete_post', array($this, 'on_video_deleted'), 10, 1);

        // Modify REST API responses
        add_filter('rest_prepare_video', array($this, 'modify_video_response'), 10, 3);
        add_filter('rest_prepare_video_cat', array($this, 'modify_category_response'), 10, 3);
    }

    /**
     * Initialize admin interface
     */
    private function init_admin_interface() {
        add_action('admin_menu', array($this, 'add_admin_menus'));
        add_action('admin_notices', array($this, 'admin_notices'));
    }

    /**
     * Enqueue admin styles
     */
    public function enqueue_admin_styles($hook) {
        if (strpos($hook, 'blackboard-headless') !== false) {
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
                    border-bottom: 1px solid #e0e0e0;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
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
                    min-width: 40px;
                    text-align: center;
                }
                .endpoint-url {
                    flex: 1;
                    font-family: monospace;
                    font-size: 13px;
                    color: #2c3338;
                    word-break: break-all;
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
                .stat-box.stat-products {
                    border-left-color: #00a32a;
                }
                .stat-box.stat-videos {
                    border-left-color: #dba617;
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
                .tab-nav {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #e0e0e0;
                }
                .tab-button {
                    padding: 10px 20px;
                    background: none;
                    border: none;
                    border-bottom: 3px solid transparent;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    color: #646970;
                    transition: all 0.3s;
                }
                .tab-button:hover {
                    color: #2c3338;
                }
                .tab-button.active {
                    color: #2271b1;
                    border-bottom-color: #2271b1;
                }
                .tab-content {
                    display: none;
                }
                .tab-content.active {
                    display: block;
                }
            </style>
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    const tabButtons = document.querySelectorAll('.tab-button');
                    const tabContents = document.querySelectorAll('.tab-content');

                    tabButtons.forEach(button => {
                        button.addEventListener('click', function() {
                            const target = this.dataset.tab;

                            tabButtons.forEach(btn => btn.classList.remove('active'));
                            tabContents.forEach(content => content.classList.remove('active'));

                            this.classList.add('active');
                            document.getElementById(target).classList.add('active');
                        });
                    });
                });
            </script>
            <?php
        }
    }

    /**
     * Run comprehensive diagnostics
     */
    public function run_diagnostics() {
        $this->diagnostics = array();

        // WooCommerce Checks
        $this->diagnostics['woocommerce'] = array(
            'label' => 'WooCommerce',
            'status' => class_exists('WooCommerce'),
            'value' => class_exists('WooCommerce') ? 'Active v' . WC()->version : 'Not installed/inactive',
            'type' => class_exists('WooCommerce') ? 'success' : 'error'
        );

        // Product Count
        $product_count = wp_count_posts('product');
        $published_products = isset($product_count->publish) ? $product_count->publish : 0;
        $this->diagnostics['product_count'] = array(
            'label' => 'Published Products',
            'status' => $published_products > 0,
            'value' => $published_products . ' products',
            'type' => 'info'
        );

        // Video Custom Post Type
        $this->diagnostics['post_type'] = array(
            'label' => 'Video Custom Post Type',
            'status' => post_type_exists('video'),
            'value' => post_type_exists('video') ? 'Registered' : 'Not found',
            'type' => post_type_exists('video') ? 'success' : 'warning'
        );

        // Video Categories Taxonomy
        $this->diagnostics['taxonomy'] = array(
            'label' => 'Video Categories Taxonomy',
            'status' => taxonomy_exists('video_cat'),
            'value' => taxonomy_exists('video_cat') ? 'Registered' : 'Not found',
            'type' => taxonomy_exists('video_cat') ? 'success' : 'warning'
        );

        // Video Count
        $video_count = wp_count_posts('video');
        $published_videos = isset($video_count->publish) ? $video_count->publish : 0;
        $this->diagnostics['video_count'] = array(
            'label' => 'Published Videos',
            'status' => $published_videos > 0,
            'value' => $published_videos . ' videos',
            'type' => 'info'
        );

        // ACF Plugin
        $this->diagnostics['acf'] = array(
            'label' => 'Advanced Custom Fields (ACF)',
            'status' => function_exists('get_fields'),
            'value' => function_exists('get_fields') ? 'Active' : 'Not installed/inactive',
            'type' => function_exists('get_fields') ? 'success' : 'warning'
        );

        // REST API
        $this->diagnostics['rest_api'] = array(
            'label' => 'WordPress REST API',
            'status' => function_exists('rest_api_init'),
            'value' => function_exists('rest_api_init') ? 'Enabled' : 'Disabled',
            'type' => function_exists('rest_api_init') ? 'success' : 'error'
        );

        // Next.js Configuration
        $this->diagnostics['nextjs_url'] = array(
            'label' => 'Next.js URL',
            'status' => !empty($this->nextjs_url),
            'value' => !empty($this->nextjs_url) ? $this->nextjs_url : 'Not configured',
            'type' => !empty($this->nextjs_url) ? 'success' : 'error'
        );

        $this->diagnostics['webhook_secret'] = array(
            'label' => 'Webhook Secret (Videos)',
            'status' => !empty($this->webhook_secret),
            'value' => !empty($this->webhook_secret) ? 'Configured (' . strlen($this->webhook_secret) . ' chars)' : 'Not configured',
            'type' => !empty($this->webhook_secret) ? 'success' : 'warning'
        );

        $this->diagnostics['revalidate_secret'] = array(
            'label' => 'Revalidate Secret (Products)',
            'status' => !empty($this->revalidate_secret),
            'value' => !empty($this->revalidate_secret) ? 'Configured (' . strlen($this->revalidate_secret) . ' chars)' : 'Not configured',
            'type' => !empty($this->revalidate_secret) ? 'success' : 'warning'
        );

        // Check Custom REST Routes
        $rest_routes = rest_get_server()->get_routes();
        $custom_routes_found = 0;
        $total_custom_routes = 3;

        foreach ($rest_routes as $route => $data) {
            if (strpos($route, '/blackboard/v1/') !== false) {
                $custom_routes_found++;
            }
        }

        $this->diagnostics['custom_routes'] = array(
            'label' => 'Custom Video API Routes',
            'status' => $custom_routes_found > 0,
            'value' => $custom_routes_found . ' routes registered',
            'type' => $custom_routes_found > 0 ? 'success' : 'warning'
        );

        // CORS Configuration
        $this->diagnostics['cors'] = array(
            'label' => 'CORS Headers',
            'status' => true,
            'value' => 'Configured for Next.js',
            'type' => 'info'
        );

        return $this->diagnostics;
    }

    /**
     * Get all API endpoints
     */
    public function get_api_endpoints() {
        $site_url = home_url();
        $endpoints = array(
            // WooCommerce Endpoints
            array(
                'method' => 'GET',
                'url' => $site_url . '/wp-json/wc/v3/products',
                'description' => 'WooCommerce products',
                'type' => 'woocommerce',
                'status' => class_exists('WooCommerce')
            ),
            array(
                'method' => 'GET',
                'url' => $site_url . '/wp-json/wc/v3/products/categories',
                'description' => 'Product categories',
                'type' => 'woocommerce',
                'status' => class_exists('WooCommerce')
            ),
            array(
                'method' => 'GET',
                'url' => $site_url . '/wp-json/wc/v3/orders',
                'description' => 'WooCommerce orders',
                'type' => 'woocommerce',
                'status' => class_exists('WooCommerce')
            ),
            // Video Endpoints
            array(
                'method' => 'GET',
                'url' => $site_url . '/wp-json/wp/v2/video',
                'description' => 'All videos (WordPress)',
                'type' => 'video',
                'status' => post_type_exists('video')
            ),
            array(
                'method' => 'GET',
                'url' => $site_url . '/wp-json/wp/v2/video_cat',
                'description' => 'Video categories',
                'type' => 'video',
                'status' => taxonomy_exists('video_cat')
            ),
            array(
                'method' => 'GET',
                'url' => $site_url . '/wp-json/blackboard/v1/videos',
                'description' => 'Filtered videos with ACF',
                'type' => 'video',
                'status' => true
            ),
            array(
                'method' => 'GET',
                'url' => $site_url . '/wp-json/blackboard/v1/videos/category/{slug}',
                'description' => 'Videos by category',
                'type' => 'video',
                'status' => true
            ),
            array(
                'method' => 'GET',
                'url' => $site_url . '/wp-json/blackboard/v1/videos/access/{id}',
                'description' => 'Check video access',
                'type' => 'video',
                'status' => true
            ),
            // Sync Endpoints
            array(
                'method' => 'POST',
                'url' => $this->nextjs_url . '/api/revalidate',
                'description' => 'Product sync endpoint',
                'type' => 'sync',
                'status' => !empty($this->nextjs_url)
            ),
            array(
                'method' => 'POST',
                'url' => $this->nextjs_url . '/api/webhook/rebuild',
                'description' => 'Video sync endpoint',
                'type' => 'sync',
                'status' => !empty($this->nextjs_url)
            ),
        );

        return $endpoints;
    }

    // ===========================
    // WooCommerce Sync Methods
    // ===========================

    public function on_product_created($product_id) {
        $product = wc_get_product($product_id);
        if (!$product) return;

        $this->trigger_product_revalidation('product.created', $product->get_slug());
    }

    public function on_product_updated($product_id) {
        $product = wc_get_product($product_id);
        if (!$product) return;

        $this->trigger_product_revalidation('product.updated', $product->get_slug());
    }

    public function on_product_deleted($product_id) {
        $this->trigger_product_revalidation('product.deleted');
    }

    public function on_product_restored($post_id) {
        if (get_post_type($post_id) !== 'product') return;

        $product = wc_get_product($post_id);
        if (!$product) return;

        $this->trigger_product_revalidation('product.restored', $product->get_slug());
    }

    public function on_stock_updated($product) {
        if (!$product) return;

        $slug = $product->get_slug();
        if (empty($slug) && $product->get_parent_id()) {
            $parent = wc_get_product($product->get_parent_id());
            $slug = $parent ? $parent->get_slug() : '';
        }

        $this->trigger_product_revalidation('product.stock_updated', $slug);
    }

    /**
     * Trigger product revalidation (uses /api/revalidate endpoint)
     */
    private function trigger_product_revalidation($action, $slug = '') {
        if (empty($this->nextjs_url) || empty($this->revalidate_secret)) {
            error_log('[BlackBoard Sync] Missing configuration for product sync');
            return false;
        }

        $endpoint = trailingslashit($this->nextjs_url) . 'api/revalidate';

        $body = array(
            'action' => $action,
            'slug' => $slug,
            'timestamp' => current_time('c'),
            'site_url' => get_site_url()
        );

        $args = array(
            'method' => 'POST',
            'headers' => array(
                'Content-Type' => 'application/json',
                'x-revalidate-secret' => $this->revalidate_secret
            ),
            'body' => json_encode($body),
            'timeout' => 10,
            'sslverify' => true
        );

        $response = wp_remote_post($endpoint, $args);

        if (is_wp_error($response)) {
            error_log('[BlackBoard Sync] Failed to trigger product revalidation: ' . $response->get_error_message());
            return false;
        }

        $status_code = wp_remote_retrieve_response_code($response);
        if ($status_code === 200) {
            error_log('[BlackBoard Sync] Successfully triggered product revalidation for: ' . $action);
            return true;
        }

        return false;
    }

    // ===========================
    // Video API Methods
    // ===========================

    public function register_rest_fields() {
        if (function_exists('acf_add_local_field_group')) {
            register_rest_field('video', 'acf_fields', array(
                'get_callback' => array($this, 'get_acf_fields'),
                'update_callback' => null,
                'schema' => null,
            ));

            register_rest_field('video', 'formatted_data', array(
                'get_callback' => array($this, 'get_formatted_data'),
                'update_callback' => null,
                'schema' => null,
            ));
        }
    }

    public function register_rest_routes() {
        // Videos by category
        register_rest_route('blackboard/v1', '/videos/category/(?P<slug>[a-z0-9-]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_videos_by_category'),
            'permission_callback' => '__return_true',
        ));

        // Video access check
        register_rest_route('blackboard/v1', '/videos/access/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'check_video_access'),
            'permission_callback' => '__return_true',
        ));

        // Filtered videos
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
            ),
        ));
    }

    public function get_acf_fields($post) {
        if (!function_exists('get_fields')) {
            return array();
        }

        $fields = get_fields($post['id']);
        if (!$fields) {
            $fields = array();
        }

        // Process video repeater fields
        if (isset($fields['videos']) && is_array($fields['videos'])) {
            foreach ($fields['videos'] as &$video_item) {
                // Add Vimeo thumbnail
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

    public function get_formatted_data($post) {
        $data = array();

        // Featured image
        $thumbnail_id = get_post_thumbnail_id($post['id']);
        if ($thumbnail_id) {
            $data['featured_image'] = array(
                'url' => wp_get_attachment_url($thumbnail_id),
                'alt' => get_post_meta($thumbnail_id, '_wp_attachment_image_alt', true),
            );
        }

        // Categories
        $categories = wp_get_post_terms($post['id'], 'video_cat');
        $data['categories'] = array_map(function($cat) {
            return array(
                'id' => $cat->term_id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'description' => $cat->description,
            );
        }, $categories);

        // Author/Instructor
        $author_id = get_post_field('post_author', $post['id']);
        $data['instructor'] = array(
            'id' => $author_id,
            'name' => get_the_author_meta('display_name', $author_id),
            'bio' => get_the_author_meta('description', $author_id),
            'avatar' => get_avatar_url($author_id),
        );

        // Access check
        $data['access'] = $this->check_user_access($post['id']);

        return $data;
    }

    private function check_user_access($video_id) {
        $fields = get_fields($video_id);
        $locked = $fields['locked_for_non_customers'] ?? false;

        if (!$locked) {
            return array(
                'has_access' => true,
                'reason' => 'public',
            );
        }

        if (!is_user_logged_in()) {
            return array(
                'has_access' => false,
                'reason' => 'login_required',
            );
        }

        $user_id = get_current_user_id();

        // Check if user is a customer
        if (class_exists('WC_Customer')) {
            $customer = new WC_Customer($user_id);
            if ($customer && $customer->get_order_count() > 0) {
                return array(
                    'has_access' => true,
                    'reason' => 'customer',
                );
            }
        }

        // Check for specific product purchases
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

    private function get_vimeo_thumbnail($video_id) {
        $cache_key = 'vimeo_thumb_' . $video_id;
        $cached = get_transient($cache_key);

        if ($cached !== false) {
            return $cached;
        }

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

    public function modify_video_response($response, $post, $request) {
        $response->data['acf'] = $this->get_acf_fields(array('id' => $post->ID));
        $response->data['formatted'] = $this->get_formatted_data(array('id' => $post->ID));
        return $response;
    }

    public function modify_category_response($response, $term, $request) {
        $response->data['video_count'] = $term->count;

        if (function_exists('get_field')) {
            $response->data['image'] = get_field('category_image', 'video_cat_' . $term->term_id);
            $response->data['featured'] = get_field('featured_category', 'video_cat_' . $term->term_id);
        }

        return $response;
    }

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

    public function check_video_access($request) {
        $video_id = $request->get_param('id');
        $access = $this->check_user_access($video_id);
        return rest_ensure_response($access);
    }

    public function get_filtered_videos($request) {
        $args = array(
            'post_type' => 'video',
            'posts_per_page' => -1,
            'post_status' => 'publish',
        );

        if ($category = $request->get_param('category')) {
            $args['tax_query'][] = array(
                'taxonomy' => 'video_cat',
                'field' => 'slug',
                'terms' => $category,
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

    public function on_video_saved($post_id, $post, $update) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        $this->trigger_video_revalidation('video.' . ($update ? 'updated' : 'created'), $post->post_name);
    }

    public function on_video_deleted($post_id) {
        if (get_post_type($post_id) !== 'video') {
            return;
        }

        $this->trigger_video_revalidation('video.deleted');
    }

    /**
     * Trigger video revalidation (uses /api/webhook/rebuild endpoint)
     */
    private function trigger_video_revalidation($action, $slug = '') {
        if (empty($this->nextjs_url) || empty($this->webhook_secret)) {
            return false;
        }

        $webhook_url = trailingslashit($this->nextjs_url) . 'api/webhook/rebuild';

        $body = array(
            'secret' => $this->webhook_secret,
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

    public function add_cors_headers() {
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
        add_filter('rest_pre_serve_request', function($value) {
            $origin = get_http_origin();
            $allowed_origins = array(
                'http://localhost:3000',
                'http://localhost:3001',
                $this->nextjs_url,
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

    // ===========================
    // Admin Interface Methods
    // ===========================

    public function add_admin_menus() {
        // Main dashboard - accessible from both WooCommerce and Videos
        add_menu_page(
            'BlackBoard Headless Sync',
            'Headless Sync',
            'manage_options',
            'blackboard-headless-dashboard',
            array($this, 'render_dashboard_page'),
            'dashicons-update',
            58
        );

        // Also add to WooCommerce menu for convenience
        add_submenu_page(
            'woocommerce',
            'Headless Sync Dashboard',
            'Headless Sync',
            'manage_woocommerce',
            'blackboard-headless-woo',
            array($this, 'render_dashboard_page')
        );

        // Also add to Videos menu if it exists
        if (post_type_exists('video')) {
            add_submenu_page(
                'edit.php?post_type=video',
                'Headless Sync Dashboard',
                'Headless Sync',
                'manage_options',
                'blackboard-headless-video',
                array($this, 'render_dashboard_page')
            );
        }

        // Settings page
        add_submenu_page(
            'blackboard-headless-dashboard',
            'Headless Sync Settings',
            'Settings',
            'manage_options',
            'blackboard-headless-settings',
            array($this, 'render_settings_page')
        );
    }

    public function render_dashboard_page() {
        $diagnostics = $this->run_diagnostics();
        $endpoints = $this->get_api_endpoints();

        // Handle test actions
        if (isset($_GET['test_product_sync'])) {
            $result = $this->trigger_product_revalidation('test.product_sync');
            echo $result ?
                '<div class="notice notice-success"><p>✅ Product sync test successful!</p></div>' :
                '<div class="notice notice-error"><p>❌ Product sync test failed. Check settings.</p></div>';
        }

        if (isset($_GET['test_video_sync'])) {
            $result = $this->trigger_video_revalidation('test.video_sync');
            echo $result ?
                '<div class="notice notice-success"><p>✅ Video sync test successful!</p></div>' :
                '<div class="notice notice-error"><p>❌ Video sync test failed. Check settings.</p></div>';
        }
        ?>
        <div class="wrap">
            <h1>🚀 BlackBoard Headless Sync Dashboard</h1>

            <div class="blackboard-dashboard">
                <!-- Quick Stats -->
                <h2>📊 System Overview</h2>
                <div class="quick-stats">
                    <div class="stat-box stat-products">
                        <div class="stat-number"><?php echo $diagnostics['product_count']['value']; ?></div>
                        <div class="stat-label">WooCommerce Products</div>
                    </div>
                    <div class="stat-box stat-videos">
                        <div class="stat-number"><?php echo $diagnostics['video_count']['value']; ?></div>
                        <div class="stat-label">Training Videos</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number"><?php echo count($endpoints); ?></div>
                        <div class="stat-label">API Endpoints</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">
                            <?php
                            $active = array_filter($diagnostics, function($d) { return $d['type'] === 'success'; });
                            echo count($active) . '/' . count($diagnostics);
                            ?>
                        </div>
                        <div class="stat-label">Systems Active</div>
                    </div>
                </div>

                <!-- Tabbed Content -->
                <div class="diagnostic-section">
                    <div class="tab-nav">
                        <button class="tab-button active" data-tab="status-tab">System Status</button>
                        <button class="tab-button" data-tab="endpoints-tab">API Endpoints</button>
                        <button class="tab-button" data-tab="help-tab">Help & Documentation</button>
                    </div>

                    <!-- Status Tab -->
                    <div id="status-tab" class="tab-content active">
                        <div class="status-grid">
                            <!-- Core Systems -->
                            <div class="status-card">
                                <h3>🛍️ E-Commerce Systems</h3>
                                <ul class="status-list">
                                    <?php foreach (['woocommerce', 'product_count', 'revalidate_secret'] as $key): if(isset($diagnostics[$key])): ?>
                                    <li class="status-item">
                                        <span class="status-icon status-<?php echo $diagnostics[$key]['type']; ?>">
                                            <?php
                                            switch($diagnostics[$key]['type']) {
                                                case 'success': echo '✅'; break;
                                                case 'warning': echo '⚠️'; break;
                                                case 'info': echo 'ℹ️'; break;
                                                default: echo '❌';
                                            }
                                            ?>
                                        </span>
                                        <span class="status-label"><?php echo $diagnostics[$key]['label']; ?></span>
                                        <span class="status-value"><?php echo $diagnostics[$key]['value']; ?></span>
                                    </li>
                                    <?php endif; endforeach; ?>
                                </ul>
                                <?php if (!empty($this->nextjs_url) && !empty($this->revalidate_secret)): ?>
                                <a href="?page=blackboard-headless-dashboard&test_product_sync=1" class="test-button">Test Product Sync</a>
                                <?php endif; ?>
                            </div>

                            <!-- Video Systems -->
                            <div class="status-card">
                                <h3>🎥 Video Training Systems</h3>
                                <ul class="status-list">
                                    <?php foreach (['post_type', 'taxonomy', 'video_count', 'acf', 'webhook_secret'] as $key): if(isset($diagnostics[$key])): ?>
                                    <li class="status-item">
                                        <span class="status-icon status-<?php echo $diagnostics[$key]['type']; ?>">
                                            <?php
                                            switch($diagnostics[$key]['type']) {
                                                case 'success': echo '✅'; break;
                                                case 'warning': echo '⚠️'; break;
                                                case 'info': echo 'ℹ️'; break;
                                                default: echo '❌';
                                            }
                                            ?>
                                        </span>
                                        <span class="status-label"><?php echo $diagnostics[$key]['label']; ?></span>
                                        <span class="status-value"><?php echo $diagnostics[$key]['value']; ?></span>
                                    </li>
                                    <?php endif; endforeach; ?>
                                </ul>
                                <?php if (!empty($this->nextjs_url) && !empty($this->webhook_secret)): ?>
                                <a href="?page=blackboard-headless-dashboard&test_video_sync=1" class="test-button">Test Video Sync</a>
                                <?php endif; ?>
                            </div>

                            <!-- Integration Status -->
                            <div class="status-card">
                                <h3>🔗 Next.js Integration</h3>
                                <ul class="status-list">
                                    <?php foreach (['nextjs_url', 'rest_api', 'custom_routes', 'cors'] as $key): if(isset($diagnostics[$key])): ?>
                                    <li class="status-item">
                                        <span class="status-icon status-<?php echo $diagnostics[$key]['type']; ?>">
                                            <?php
                                            switch($diagnostics[$key]['type']) {
                                                case 'success': echo '✅'; break;
                                                case 'warning': echo '⚠️'; break;
                                                case 'info': echo 'ℹ️'; break;
                                                default: echo '❌';
                                            }
                                            ?>
                                        </span>
                                        <span class="status-label"><?php echo $diagnostics[$key]['label']; ?></span>
                                        <span class="status-value"><?php echo $diagnostics[$key]['value']; ?></span>
                                    </li>
                                    <?php endif; endforeach; ?>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Endpoints Tab -->
                    <div id="endpoints-tab" class="tab-content">
                        <div class="api-endpoint-list">
                            <h3>WooCommerce Endpoints</h3>
                            <?php foreach ($endpoints as $endpoint): if($endpoint['type'] === 'woocommerce'): ?>
                            <div class="endpoint-item">
                                <span class="endpoint-method"><?php echo $endpoint['method']; ?></span>
                                <span class="endpoint-url"><?php echo $endpoint['url']; ?></span>
                                <span class="endpoint-status">
                                    <?php echo $endpoint['status'] ? '✅' : '❌'; ?>
                                </span>
                            </div>
                            <?php endif; endforeach; ?>

                            <h3 style="margin-top: 30px;">Video API Endpoints</h3>
                            <?php foreach ($endpoints as $endpoint): if($endpoint['type'] === 'video'): ?>
                            <div class="endpoint-item">
                                <span class="endpoint-method"><?php echo $endpoint['method']; ?></span>
                                <span class="endpoint-url"><?php echo $endpoint['url']; ?></span>
                                <span class="endpoint-status">
                                    <?php echo $endpoint['status'] ? '✅' : '❌'; ?>
                                </span>
                            </div>
                            <?php endif; endforeach; ?>

                            <h3 style="margin-top: 30px;">Sync Endpoints (Next.js)</h3>
                            <?php foreach ($endpoints as $endpoint): if($endpoint['type'] === 'sync'): ?>
                            <div class="endpoint-item">
                                <span class="endpoint-method"><?php echo $endpoint['method']; ?></span>
                                <span class="endpoint-url"><?php echo $endpoint['url']; ?></span>
                                <span class="endpoint-status">
                                    <?php echo $endpoint['status'] ? '✅' : '❌'; ?>
                                </span>
                            </div>
                            <?php endif; endforeach; ?>
                        </div>
                    </div>

                    <!-- Help Tab -->
                    <div id="help-tab" class="tab-content">
                        <div class="status-card">
                            <h3>📚 How This Plugin Works</h3>
                            <p>This plugin provides complete integration between your WordPress/WooCommerce backend and Next.js frontend:</p>
                            <ul style="padding-left: 20px; line-height: 1.8;">
                                <li><strong>Product Sync:</strong> Automatically triggers Next.js rebuilds when WooCommerce products change</li>
                                <li><strong>Video API:</strong> Exposes video content with ACF fields and access control</li>
                                <li><strong>REST API Extensions:</strong> Adds custom endpoints for filtered content</li>
                                <li><strong>Access Control:</strong> Manages video access based on customer purchases</li>
                            </ul>
                        </div>

                        <div class="status-card" style="margin-top: 20px;">
                            <h3>🔧 Troubleshooting</h3>
                            <ul style="padding-left: 20px; line-height: 1.8;">
                                <li><strong>Sync not working?</strong> Check that both secrets are configured and match your Next.js environment variables</li>
                                <li><strong>Videos not showing?</strong> Ensure ACF is installed and video custom post type is registered</li>
                                <li><strong>Products not updating?</strong> Verify WooCommerce webhooks are enabled</li>
                                <li><strong>API errors?</strong> Check CORS settings and ensure REST API is enabled</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="diagnostic-section">
                    <h2>⚡ Quick Actions</h2>
                    <p>
                        <a href="?page=blackboard-headless-settings" class="button button-primary">Configure Settings</a>
                        <a href="<?php echo admin_url('edit.php?post_type=product'); ?>" class="button">Manage Products</a>
                        <a href="<?php echo admin_url('edit.php?post_type=video'); ?>" class="button">Manage Videos</a>
                        <a href="<?php echo home_url('/wp-json/'); ?>" target="_blank" class="button">View REST API</a>
                    </p>
                </div>
            </div>
        </div>
        <?php
    }

    public function render_settings_page() {
        // Save settings
        if (isset($_POST['submit'])) {
            update_option('blackboard_nextjs_url', sanitize_text_field($_POST['nextjs_url']));
            update_option('blackboard_webhook_secret', sanitize_text_field($_POST['webhook_secret']));
            update_option('blackboard_revalidate_secret', sanitize_text_field($_POST['revalidate_secret']));

            // Update instance variables
            $this->nextjs_url = get_option('blackboard_nextjs_url');
            $this->webhook_secret = get_option('blackboard_webhook_secret');
            $this->revalidate_secret = get_option('blackboard_revalidate_secret');

            echo '<div class="notice notice-success"><p>✅ Settings saved successfully!</p></div>';
        }
        ?>
        <div class="wrap">
            <h1>⚙️ Headless Sync Settings</h1>

            <form method="post">
                <div class="status-card" style="max-width: 800px; margin-top: 20px;">
                    <h3>Next.js Integration Settings</h3>
                    <table class="form-table">
                        <tr>
                            <th><label for="nextjs_url">Next.js Site URL</label></th>
                            <td>
                                <input type="url" id="nextjs_url" name="nextjs_url"
                                       value="<?php echo esc_attr($this->nextjs_url); ?>"
                                       class="regular-text" style="width: 100%;" />
                                <p class="description">Your Next.js site URL (e.g., https://your-site.vercel.app)</p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="revalidate_secret">Product Sync Secret</label></th>
                            <td>
                                <input type="text" id="revalidate_secret" name="revalidate_secret"
                                       value="<?php echo esc_attr($this->revalidate_secret); ?>"
                                       class="regular-text" style="width: 100%;" />
                                <p class="description">
                                    Secret for WooCommerce product sync (must match REVALIDATE_SECRET in Next.js)<br>
                                    <code>openssl rand -hex 32</code>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="webhook_secret">Video Sync Secret</label></th>
                            <td>
                                <input type="text" id="webhook_secret" name="webhook_secret"
                                       value="<?php echo esc_attr($this->webhook_secret); ?>"
                                       class="regular-text" style="width: 100%;" />
                                <p class="description">
                                    Secret for video content sync (must match WEBHOOK_SECRET in Next.js)<br>
                                    <code>openssl rand -hex 32</code>
                                </p>
                            </td>
                        </tr>
                    </table>
                    <?php submit_button('Save Settings'); ?>
                </div>
            </form>

            <div class="status-card" style="max-width: 800px; margin-top: 30px;">
                <h3>📝 Next.js Environment Variables</h3>
                <p>Add these to your Next.js <code>.env.local</code> file:</p>
                <pre style="background: #f0f0f1; padding: 15px; overflow-x: auto;">
# WordPress Integration
WORDPRESS_API_URL=<?php echo home_url(); ?>
WOO_CONSUMER_KEY=ck_xxxxxxxxxxxxx
WOO_CONSUMER_SECRET=cs_xxxxxxxxxxxxx

# Sync Secrets
REVALIDATE_SECRET=<?php echo $this->revalidate_secret ?: 'your-product-sync-secret'; ?>
WEBHOOK_SECRET=<?php echo $this->webhook_secret ?: 'your-video-sync-secret'; ?>

# Next.js Configuration
NEXT_PUBLIC_BASE_URL=<?php echo $this->nextjs_url ?: 'https://your-site.vercel.app'; ?></pre>
            </div>

            <div class="status-card" style="max-width: 800px; margin-top: 30px;">
                <h3>🔄 Automatic Sync Triggers</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                    <div>
                        <h4>📦 Products sync when:</h4>
                        <ul style="padding-left: 20px;">
                            <li>Product created</li>
                            <li>Product updated</li>
                            <li>Product deleted</li>
                            <li>Stock changes</li>
                            <li>Product restored from trash</li>
                        </ul>
                    </div>
                    <div>
                        <h4>🎥 Videos sync when:</h4>
                        <ul style="padding-left: 20px;">
                            <li>Video created</li>
                            <li>Video updated</li>
                            <li>Video deleted</li>
                            <li>ACF fields modified</li>
                            <li>Categories changed</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    public function admin_notices() {
        if (empty($this->nextjs_url)) {
            $screen = get_current_screen();
            if ($screen && strpos($screen->id, 'blackboard-headless') !== false) {
                return;
            }
            ?>
            <div class="notice notice-warning">
                <p>
                    <strong>BlackBoard Headless Sync:</strong>
                    Please configure your Next.js integration settings.
                    <a href="<?php echo admin_url('admin.php?page=blackboard-headless-settings'); ?>">Configure Now</a>
                </p>
            </div>
            <?php
        }
    }
}

// Initialize the plugin
new BlackBoardHeadlessSync();