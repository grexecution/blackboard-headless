<?php
/**
 * Plugin Name: BlackBoard Headless Options
 * Description: Complete headless CMS solution for BlackBoard Training - WooCommerce sync, Course & Video CPTs, ProCoach Finder, REST API extensions, automatic rebuilds, course access management, reseller pricing, and import/export tools
 * Version: 4.7.3
 * Author: BlackBoard Training
 * Author URI: https://blackboard-training.com
 * Text Domain: blackboard-headless-options
 *
 * ⚠️ IMPORTANT: DO NOT CREATE NEW PLUGINS!
 * ================================================
 * This is THE SINGLE plugin for connecting ALL features between WordPress/WooCommerce and Next.js.
 * All functionality should be added to THIS plugin, not separate plugins.
 *
 * This plugin handles:
 * - WooCommerce product sync with webhooks
 * - Course Custom Post Type with categories and ACF fields
 * - Video Custom Post Type with categories and ACF fields
 * - ProCoach Custom Post Type with location data and REST API (v4.4.0)
 * - Course Import/Export (JSON-based)
 * - REST API extensions with access control
 * - ACF field exposure for headless consumption
 * - Automatic Next.js rebuilds/revalidation
 * - Manual sync and build triggers
 * - CORS configuration for headless setup
 * - Course access management based on WooCommerce purchases
 * - Reseller bulk pricing for simple & variable products (v4.3.0 - single price applies to all variations)
 * - Admin dashboard with diagnostics
 *
 * If you need to add new features, add them HERE.
 * ================================================
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

        // CRITICAL: Whitelist endpoints from JWT Auth BEFORE rest_api_init
        // Must be added early or JWT Auth will block our custom endpoints
        add_filter('jwt_auth_whitelist', array($this, 'whitelist_endpoints'));

        // Add enrolled courses to JWT token response
        add_filter('jwt_auth_token_before_dispatch', array($this, 'add_enrolled_courses_to_jwt_response'), 10, 2);

        // Migrate old course post type to blackboard-course (one-time)
        $this->migrate_course_post_type();

        // Migrate old coach post types to bb_procoach (one-time)
        $this->migrate_coach_post_types();

        // Create course access table on activation
        register_activation_hook(__FILE__, array($this, 'create_course_access_table'));
        $this->create_course_access_table();

        // Initialize components
        $this->init_woocommerce_sync();
        $this->init_video_api();
        $this->init_course_cpt();  // NEW: Initialize Course CPT
        $this->init_course_access_system();  // NEW: Course access management
        $this->init_reseller_pricing();  // NEW: Reseller bulk pricing (v4.1.0)
        $this->init_coach_finder();  // NEW: Coach Finder (v4.7.0)
        $this->init_admin_interface();

        // Add admin styles
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_styles'));
    }

    /**
     * Migrate old 'course' post type to 'blackboard-course' (one-time migration)
     */
    private function migrate_course_post_type() {
        // Check if migration has already been done
        if (get_option('blackboard_course_migration_done', false)) {
            return;
        }

        global $wpdb;

        // Update all 'course' posts to 'blackboard-course'
        $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$wpdb->posts} SET post_type = %s WHERE post_type = %s",
                'blackboard-course',
                'course'
            )
        );

        // Mark migration as complete
        update_option('blackboard_course_migration_done', true);
    }

    /**
     * Migrate old coach post types to bb_procoach (one-time migration)
     */
    private function migrate_coach_post_types() {
        // Check if migration has already been done (v4.7.3 forces remigration for meta fields)
        $migration_version = get_option('bb_coach_migration_version', '0');
        if (version_compare($migration_version, '4.7.3', '>=')) {
            return;
        }

        global $wpdb;

        // Migrate all old coach post types to bb_procoach
        $old_types = array('procoach', 'blackboard-procoach', 'bb_coach');

        foreach ($old_types as $old_type) {
            $wpdb->query(
                $wpdb->prepare(
                    "UPDATE {$wpdb->posts} SET post_type = %s WHERE post_type = %s",
                    'bb_procoach',
                    $old_type
                )
            );
        }

        // Migrate meta field names for all bb_procoach posts
        $coaches = get_posts(array(
            'post_type' => 'bb_procoach',
            'posts_per_page' => -1,
            'post_status' => 'any',
        ));

        foreach ($coaches as $coach) {
            // Map old field names to new field names
            $field_map = array(
                'coach_name' => 'bb_coach_name',
                'company_name' => 'bb_coach_company',
                'address' => 'bb_coach_address',
                'latitude' => 'bb_coach_lat',
                'longitude' => 'bb_coach_lng',
                'phone' => 'bb_coach_phone',
                'email' => 'bb_coach_email',
                'website' => 'bb_coach_website',
                'certification_date' => 'bb_coach_cert_date',
                'specialties' => 'bb_coach_specialties',
            );

            foreach ($field_map as $old_field => $new_field) {
                $value = get_post_meta($coach->ID, $old_field, true);
                if ($value) {
                    update_post_meta($coach->ID, $new_field, $value);
                }
            }
        }

        // Mark migration as complete with version
        update_option('bb_coach_migration_done', true);
        update_option('bb_coach_migration_version', '4.7.3');
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

        // Add multi-currency price fields
        add_action('woocommerce_product_options_pricing', array($this, 'add_currency_price_fields'));
        add_action('woocommerce_process_product_meta', array($this, 'save_currency_price_fields'));

        // Add multi-currency price fields to variations
        add_action('woocommerce_variation_options_pricing', array($this, 'add_variation_currency_price_fields'), 10, 3);
        add_action('woocommerce_save_product_variation', array($this, 'save_variation_currency_price_fields'), 10, 2);

        // Modify REST API to include currency prices
        add_filter('woocommerce_rest_prepare_product_object', array($this, 'add_currency_prices_to_api'), 10, 3);
        add_filter('woocommerce_rest_prepare_product_variation_object', array($this, 'add_variation_currency_prices_to_api'), 10, 3);
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
     * Initialize Course CPT functionality
     */
    private function init_course_cpt() {
        // Register Course CPT
        add_action('init', array($this, 'register_course_post_type'));

        // Register Course Categories Taxonomy
        add_action('init', array($this, 'register_course_taxonomies'));

        // Add REST API support
        add_action('rest_api_init', array($this, 'register_course_rest_fields'));
        add_action('rest_api_init', array($this, 'register_course_rest_routes'));

        // Hook into course post actions
        add_action('save_post_course', array($this, 'on_course_saved'), 10, 3);
        add_action('delete_post', array($this, 'on_course_deleted'), 10, 1);

        // Modify REST API responses
        add_filter('rest_prepare_course', array($this, 'modify_course_response'), 10, 3);

        // Register ACF fields programmatically
        add_action('acf/init', array($this, 'register_course_acf_fields'));
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
        // Enqueue Select2 for user search on Course Access page
        if (strpos($hook, 'blackboard-course-access') !== false || strpos($hook, 'blackboard-headless') !== false) {
            // Select2 CSS
            wp_enqueue_style('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', array(), '4.1.0');

            // Select2 JS
            wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array('jquery'), '4.1.0', true);
        }

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

        // Course Custom Post Type
        $this->diagnostics['course_post_type'] = array(
            'label' => 'Course Custom Post Type',
            'status' => post_type_exists('blackboard-course'),
            'value' => post_type_exists('blackboard-course') ? 'Registered' : 'Not found',
            'type' => post_type_exists('blackboard-course') ? 'success' : 'warning'
        );

        // Course Count
        $course_count = wp_count_posts('blackboard-course');
        $published_courses = isset($course_count->publish) ? $course_count->publish : 0;
        $this->diagnostics['course_count'] = array(
            'label' => 'Published Courses',
            'status' => $published_courses > 0,
            'value' => $published_courses . ' courses',
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
    // Course CPT Methods
    // ===========================

    /**
     * Register Course Custom Post Type
     */
    public function register_course_post_type() {
        $labels = array(
            'name'                  => _x('Courses', 'Post type general name', 'blackboard-nextjs-sync'),
            'singular_name'         => _x('Course', 'Post type singular name', 'blackboard-nextjs-sync'),
            'menu_name'            => _x('Courses', 'Admin Menu text', 'blackboard-nextjs-sync'),
            'name_admin_bar'       => _x('Course', 'Add New on Toolbar', 'blackboard-nextjs-sync'),
            'add_new'              => __('Add New', 'blackboard-nextjs-sync'),
            'add_new_item'         => __('Add New Course', 'blackboard-nextjs-sync'),
            'new_item'             => __('New Course', 'blackboard-nextjs-sync'),
            'edit_item'            => __('Edit Course', 'blackboard-nextjs-sync'),
            'view_item'            => __('View Course', 'blackboard-nextjs-sync'),
            'all_items'            => __('All Courses', 'blackboard-nextjs-sync'),
            'search_items'         => __('Search Courses', 'blackboard-nextjs-sync'),
            'parent_item_colon'    => __('Parent Courses:', 'blackboard-nextjs-sync'),
            'not_found'            => __('No courses found.', 'blackboard-nextjs-sync'),
            'not_found_in_trash'   => __('No courses found in Trash.', 'blackboard-nextjs-sync'),
            'featured_image'       => _x('Course Cover Image', 'Overrides the "Featured Image" phrase', 'blackboard-nextjs-sync'),
            'set_featured_image'   => _x('Set cover image', 'Overrides the "Set featured image" phrase', 'blackboard-nextjs-sync'),
            'remove_featured_image' => _x('Remove cover image', 'Overrides the "Remove featured image" phrase', 'blackboard-nextjs-sync'),
            'use_featured_image'   => _x('Use as cover image', 'Overrides the "Use as featured image" phrase', 'blackboard-nextjs-sync'),
            'archives'             => _x('Course archives', 'The post type archive label', 'blackboard-nextjs-sync'),
            'insert_into_item'     => _x('Insert into course', 'Overrides the "Insert into post" phrase', 'blackboard-nextjs-sync'),
            'uploaded_to_this_item' => _x('Uploaded to this course', 'Overrides the "Uploaded to this post" phrase', 'blackboard-nextjs-sync'),
            'filter_items_list'    => _x('Filter courses list', 'Screen reader text', 'blackboard-nextjs-sync'),
            'items_list_navigation' => _x('Courses list navigation', 'Screen reader text', 'blackboard-nextjs-sync'),
            'items_list'           => _x('Courses list', 'Screen reader text', 'blackboard-nextjs-sync'),
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'           => array('slug' => 'course'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => 6,
            'menu_icon'          => 'dashicons-welcome-learn-more',
            'supports'           => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
            'show_in_rest'       => true,
            'rest_base'          => 'courses',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
        );

        register_post_type('blackboard-course', $args);
    }

    /**
     * Register Course Taxonomies
     */
    public function register_course_taxonomies() {
        // Course Category (ProCoach, Workshop, etc)
        $labels = array(
            'name'              => _x('Course Categories', 'taxonomy general name', 'blackboard-nextjs-sync'),
            'singular_name'     => _x('Course Category', 'taxonomy singular name', 'blackboard-nextjs-sync'),
            'search_items'      => __('Search Categories', 'blackboard-nextjs-sync'),
            'all_items'         => __('All Categories', 'blackboard-nextjs-sync'),
            'parent_item'       => __('Parent Category', 'blackboard-nextjs-sync'),
            'parent_item_colon' => __('Parent Category:', 'blackboard-nextjs-sync'),
            'edit_item'         => __('Edit Category', 'blackboard-nextjs-sync'),
            'update_item'       => __('Update Category', 'blackboard-nextjs-sync'),
            'add_new_item'      => __('Add New Category', 'blackboard-nextjs-sync'),
            'new_item_name'     => __('New Category Name', 'blackboard-nextjs-sync'),
            'menu_name'         => __('Categories', 'blackboard-nextjs-sync'),
        );

        $args = array(
            'hierarchical'      => true,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'rewrite'          => array('slug' => 'course-category'),
            'show_in_rest'      => true,
            'rest_base'         => 'course_categories',
        );

        register_taxonomy('course_category', array('blackboard-course'), $args);

        // Add default categories on plugin activation
        $this->add_default_course_categories();
    }

    /**
     * Add default course categories
     */
    private function add_default_course_categories() {
        $default_categories = array(
            'ProCoach' => 'Professional coaching certification courses',
            'Workshop' => 'Hands-on workshop courses',
            'Online' => 'Self-paced online courses',
        );

        foreach ($default_categories as $name => $description) {
            if (!term_exists($name, 'course_category')) {
                wp_insert_term($name, 'course_category', array(
                    'description' => $description,
                    'slug' => strtolower(str_replace(' ', '-', $name)),
                ));
            }
        }
    }

    /**
     * Register ACF fields for Course CPT
     */
    public function register_course_acf_fields() {
        if (!function_exists('acf_add_local_field_group')) {
            return;
        }

        acf_add_local_field_group(array(
            'key' => 'group_course_fields',
            'title' => 'Course Settings',
            'fields' => array(
                // Free Course Toggle
                array(
                    'key' => 'field_course_is_free',
                    'label' => 'Free Course',
                    'name' => 'is_free_course',
                    'type' => 'true_false',
                    'instructions' => 'Enable this to make the course accessible to everyone for free (no purchase required)',
                    'message' => 'This is a free course - accessible to all users',
                    'default_value' => 0,
                    'ui' => 1,
                ),
                // Billing Product (Single - for pricing and purchase)
                array(
                    'key' => 'field_course_billing_product',
                    'label' => 'Billing Product (Pricing)',
                    'name' => 'billing_product_id',
                    'type' => 'post_object',
                    'instructions' => 'The main product used for pricing and purchasing this course (not required for free courses)',
                    'required' => 0,
                    'post_type' => array('product'),
                    'allow_null' => 1,
                    'multiple' => 0,
                    'return_format' => 'id',
                    'ui' => 1,
                    'conditional_logic' => array(
                        array(
                            array(
                                'field' => 'field_course_is_free',
                                'operator' => '!=',
                                'value' => '1',
                            ),
                        ),
                    ),
                ),
                // Access Products (Multiple - for multilanguage support)
                array(
                    'key' => 'field_course_access_products',
                    'label' => 'Access Products (Grant Access)',
                    'name' => 'access_product_ids',
                    'type' => 'post_object',
                    'instructions' => 'All products that grant access to this course. Include multilanguage duplicates here.',
                    'required' => 0,
                    'post_type' => array('product'),
                    'allow_null' => 1,
                    'multiple' => 1,
                    'return_format' => 'id',
                    'ui' => 1,
                    'conditional_logic' => array(
                        array(
                            array(
                                'field' => 'field_course_is_free',
                                'operator' => '!=',
                                'value' => '1',
                            ),
                        ),
                    ),
                ),
                // IMPORTANT FIELDS AT TOP
                array(
                    'key' => 'field_course_instructor',
                    'label' => 'Instructor Name',
                    'name' => 'instructor',
                    'type' => 'text',
                    'default_value' => 'BlackBoard Training Team',
                    'required' => 1,
                ),
                array(
                    'key' => 'field_course_type',
                    'label' => 'Course Type',
                    'name' => 'course_type',
                    'type' => 'select',
                    'choices' => array(
                        'on_demand' => 'On Demand',
                        'online_live' => 'Online Live Course',
                    ),
                    'default_value' => 'on_demand',
                    'required' => 1,
                ),
                array(
                    'key' => 'field_course_booking_widget',
                    'label' => 'Booking Widget Code',
                    'name' => 'booking_widget',
                    'type' => 'textarea',
                    'instructions' => 'Add HTML/JavaScript code snippet for the booking widget. This will open as a modal when users click "Add to Cart" on this course.',
                    'rows' => 8,
                    'placeholder' => '<script>...</script>',
                    'conditional_logic' => array(
                        array(
                            array(
                                'field' => 'field_course_type',
                                'operator' => '==',
                                'value' => 'online_live',
                            ),
                        ),
                    ),
                ),
                array(
                    'key' => 'field_course_certificate',
                    'label' => 'Certificate Awarded',
                    'name' => 'certificate_awarded',
                    'type' => 'true_false',
                    'instructions' => 'Does this course award a certificate upon completion?',
                    'default_value' => 1,
                    'ui' => 1,
                ),
                // Course Duration
                array(
                    'key' => 'field_course_duration',
                    'label' => 'Duration',
                    'name' => 'duration',
                    'type' => 'text',
                    'instructions' => 'e.g., "12 weeks" or "3 months"',
                    'default_value' => '',
                    'placeholder' => '12 weeks',
                ),
                // Course Videos
                array(
                    'key' => 'field_course_videos',
                    'label' => 'Course Videos',
                    'name' => 'course_videos',
                    'type' => 'repeater',
                    'instructions' => 'Add Vimeo video lessons for this course',
                    'layout' => 'block',
                    'button_label' => 'Add Video Lesson',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_video_title',
                            'label' => 'Video Title',
                            'name' => 'video_title',
                            'type' => 'text',
                            'required' => 1,
                        ),
                        array(
                            'key' => 'field_vimeo_id',
                            'label' => 'Vimeo Video ID',
                            'name' => 'vimeo_id',
                            'type' => 'text',
                            'instructions' => 'Enter just the numeric ID from the Vimeo URL (optional - leave blank for text-only lessons)',
                            'required' => 0,
                        ),
                        array(
                            'key' => 'field_video_duration',
                            'label' => 'Video Duration',
                            'name' => 'video_duration',
                            'type' => 'text',
                            'instructions' => 'e.g., "15:30" for 15 minutes 30 seconds',
                            'placeholder' => '15:30',
                        ),
                        array(
                            'key' => 'field_video_description',
                            'label' => 'Lesson Content',
                            'name' => 'video_description',
                            'type' => 'wysiwyg',
                            'instructions' => 'Add the lesson content - supports rich text formatting, images, videos, and links',
                            'tabs' => 'all',
                            'toolbar' => 'full',
                            'media_upload' => 1,
                            'delay' => 0,
                        ),
                    ),
                ),
                // Course Materials
                array(
                    'key' => 'field_course_materials',
                    'label' => 'Course Materials',
                    'name' => 'course_materials',
                    'type' => 'repeater',
                    'instructions' => 'Add downloadable materials for this course',
                    'layout' => 'table',
                    'button_label' => 'Add Material',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_material_title',
                            'label' => 'Material Title',
                            'name' => 'material_title',
                            'type' => 'text',
                            'required' => 1,
                        ),
                        array(
                            'key' => 'field_material_file',
                            'label' => 'File',
                            'name' => 'material_file',
                            'type' => 'file',
                            'return_format' => 'array',
                            'library' => 'all',
                            'required' => 1,
                        ),
                    ),
                ),
                // Additional Settings
                array(
                    'key' => 'field_course_start_date',
                    'label' => 'Next Start Date',
                    'name' => 'start_date',
                    'type' => 'date_picker',
                    'instructions' => 'When does this course next start?',
                    'display_format' => 'F j, Y',
                    'return_format' => 'Y-m-d',
                    'first_day' => 1,
                ),
                // This Course Includes (Repeater)
                array(
                    'key' => 'field_course_includes',
                    'label' => 'This Course Includes',
                    'name' => 'course_includes',
                    'type' => 'repeater',
                    'instructions' => 'Add items to show what\'s included in this course (e.g., "24 on-demand video lessons", "Lifetime access", etc.)',
                    'layout' => 'table',
                    'button_label' => 'Add Include Item',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_include_item',
                            'label' => 'Item',
                            'name' => 'item',
                            'type' => 'text',
                            'required' => 1,
                            'placeholder' => 'e.g., 24 on-demand video lessons',
                        ),
                    ),
                ),
                // What You Will Learn
                array(
                    'key' => 'field_course_what_you_will_learn',
                    'label' => 'What You Will Learn',
                    'name' => 'what_you_will_learn',
                    'type' => 'wysiwyg',
                    'instructions' => 'List the key learning outcomes and skills students will gain',
                    'tabs' => 'all',
                    'toolbar' => 'full',
                    'media_upload' => 0,
                    'delay' => 0,
                ),
                // Equipment & Requirements
                array(
                    'key' => 'field_course_equipment_requirements',
                    'label' => 'Equipment & Requirements',
                    'name' => 'equipment_requirements',
                    'type' => 'wysiwyg',
                    'instructions' => 'List any equipment, materials, or prerequisites needed for this course',
                    'tabs' => 'all',
                    'toolbar' => 'full',
                    'media_upload' => 0,
                    'delay' => 0,
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'blackboard-course',
                    ),
                ),
            ),
            'menu_order' => 0,
            'position' => 'normal',
            'style' => 'default',
            'label_placement' => 'top',
            'instruction_placement' => 'label',
            'active' => true,
            'description' => 'Course configuration fields for LMS functionality',
        ));
    }

    /**
     * Register Course REST API fields
     */
    public function register_course_rest_fields() {
        register_rest_field('blackboard-course', 'acf', array(
            'get_callback' => array($this, 'get_course_acf_fields'),
            'update_callback' => null,
            'schema' => null,
        ));

        register_rest_field('blackboard-course', 'course_access', array(
            'get_callback' => array($this, 'get_course_access'),
            'update_callback' => null,
            'schema' => null,
        ));
    }

    /**
     * Register Course REST API routes
     */
    public function register_course_rest_routes() {
        // Get all courses
        register_rest_route('blackboard/v1', '/courses', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_courses'),
            'permission_callback' => '__return_true',
        ));

        // Get single course
        register_rest_route('blackboard/v1', '/courses/(?P<slug>[a-z0-9-]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_single_course'),
            'permission_callback' => '__return_true',
        ));

        // Check course access
        register_rest_route('blackboard/v1', '/courses/access/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'check_course_access'),
            'permission_callback' => '__return_true',
        ));

        // Get user's enrolled/purchased courses (returns course IDs)
        register_rest_route('blackboard/v1', '/user/enrolled-courses', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_user_enrolled_courses'),
            'permission_callback' => '__return_true',
        ));

        // Export courses as JSON
        register_rest_route('blackboard/v1', '/export-courses', array(
            'methods' => 'GET',
            'callback' => array($this, 'export_courses_json'),
            'permission_callback' => '__return_true',
        ));

        // Import courses from JSON
        register_rest_route('blackboard/v1', '/import-courses', array(
            'methods' => 'POST',
            'callback' => array($this, 'import_courses_json'),
            'permission_callback' => '__return_true',
            'args' => array(
                'content-type' => array(
                    'required' => false,
                    'default' => 'application/json',
                ),
            ),
        ));
    }

    /**
     * Get Course ACF fields
     */
    public function get_course_acf_fields($post) {
        if (!function_exists('get_fields')) {
            return array();
        }

        $fields = get_fields($post['id']);
        if (!$fields) {
            $fields = array();
        }

        // Process product relationships
        // 1. Billing Product (for pricing/display)
        $billing_product_id = null;
        if (!empty($fields['billing_product_id'])) {
            $billing_product_id = $fields['billing_product_id'];
        }
        // Backwards compatibility with old product_id field
        elseif (!empty($fields['product_id'])) {
            $billing_product_id = $fields['product_id'];
        }

        // 2. Access Products (for access control)
        $access_product_ids = array();
        if (!empty($fields['access_product_ids'])) {
            $access_product_ids = is_array($fields['access_product_ids']) ? $fields['access_product_ids'] : array($fields['access_product_ids']);
        }
        // Backwards compatibility with old product_ids field
        elseif (!empty($fields['product_ids'])) {
            $access_product_ids = is_array($fields['product_ids']) ? $fields['product_ids'] : array($fields['product_ids']);
        }
        // Backwards compatibility with old single product_id
        elseif (!empty($fields['product_id'])) {
            $access_product_ids = array($fields['product_id']);
        }

        // If no access products specified, use billing product
        if (empty($access_product_ids) && !empty($billing_product_id)) {
            $access_product_ids = array($billing_product_id);
        }

        // Store for access checking
        $fields['access_product_ids'] = $access_product_ids;

        // Get billing product data for display
        if (!empty($billing_product_id)) {
            $product = wc_get_product($billing_product_id);
            if ($product) {
                $fields['product_id'] = $product->get_id();
                $fields['product_data'] = array(
                    'id' => $product->get_id(),
                    'name' => $product->get_name(),
                    'price' => $product->get_price(),
                    'regular_price' => $product->get_regular_price(),
                    'sale_price' => $product->get_sale_price(),
                    'on_sale' => $product->is_on_sale(),
                    'permalink' => get_permalink($product->get_id()),
                );
            }
        }

        // Process video thumbnails
        if (!empty($fields['course_videos']) && is_array($fields['course_videos'])) {
            foreach ($fields['course_videos'] as &$video) {
                if (!empty($video['vimeo_id'])) {
                    $video['thumbnail'] = $this->get_vimeo_thumbnail($video['vimeo_id']);
                }
            }
        }

        return $fields;
    }

    /**
     * Get user ID from JWT token in request headers
     */
    private function get_user_id_from_jwt() {
        $headers = getallheaders();
        $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] :
                      (isset($headers['authorization']) ? $headers['authorization'] : '');

        if (empty($auth_header)) {
            return 0;
        }

        // Extract Bearer token
        if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
            $token = $matches[1];

            try {
                // Decode JWT token
                $token_parts = explode('.', $token);
                if (count($token_parts) === 3) {
                    $payload = json_decode(base64_decode($token_parts[1]), true);

                    if (isset($payload['data']['user']['id'])) {
                        return intval($payload['data']['user']['id']);
                    }
                }
            } catch (Exception $e) {
                error_log('JWT decode error: ' . $e->getMessage());
            }
        }

        return 0;
    }

    /**
     * Get course access information
     */
    public function get_course_access($post) {
        $course_id = $post['id'];
        $fields = get_fields($course_id);

        // Get access product IDs (multiple for multilanguage support)
        $access_product_ids = array();
        if (!empty($fields['access_product_ids'])) {
            $access_product_ids = is_array($fields['access_product_ids']) ? $fields['access_product_ids'] : array($fields['access_product_ids']);
        }
        // Backwards compatibility
        elseif (!empty($fields['product_ids'])) {
            $access_product_ids = is_array($fields['product_ids']) ? $fields['product_ids'] : array($fields['product_ids']);
        }
        elseif (!empty($fields['product_id'])) {
            $access_product_ids = array($fields['product_id']);
        }

        // Get billing product for display
        $billing_product_id = !empty($fields['billing_product_id']) ? $fields['billing_product_id'] :
                             (!empty($fields['product_id']) ? $fields['product_id'] :
                             (!empty($access_product_ids) ? $access_product_ids[0] : null));

        // Check if course is marked as free
        $is_free_course = !empty($fields['is_free_course']) ? (bool)$fields['is_free_course'] : false;

        // ONLY mark as free if the ACF toggle is explicitly set to true
        if ($is_free_course) {
            return array(
                'has_access' => true,
                'reason' => 'free_course',
                'is_free' => true,
            );
        }

        // If no products connected, course requires purchase but none configured
        if (empty($access_product_ids)) {
            return array(
                'has_access' => false,
                'reason' => 'no_products_configured',
                'product_id' => $billing_product_id,
                'access_product_ids' => $access_product_ids,
            );
        }

        // Try to get user ID from JWT token first, then fall back to WordPress session
        $user_id = $this->get_user_id_from_jwt();

        if (!$user_id && is_user_logged_in()) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return array(
                'has_access' => false,
                'reason' => 'login_required',
                'product_id' => $billing_product_id,
                'access_product_ids' => $access_product_ids,
            );
        }

        // Check if user is admin
        $user = get_user_by('id', $user_id);
        if ($user && in_array('administrator', (array) $user->roles)) {
            return array(
                'has_access' => true,
                'reason' => 'admin_access',
                'product_id' => $billing_product_id,
                'access_product_ids' => $access_product_ids,
            );
        }

        // NEW: Check access using custom database table
        if ($this->check_user_course_access($user_id, $course_id)) {
            return array(
                'has_access' => true,
                'reason' => 'purchased',
                'product_id' => $billing_product_id,
                'access_product_ids' => $access_product_ids,
            );
        }

        return array(
            'has_access' => false,
            'reason' => 'purchase_required',
            'product_id' => $billing_product_id,
            'access_product_ids' => $access_product_ids,
        );
    }

    /**
     * Modify course REST response
     */
    public function modify_course_response($response, $post, $request) {
        $response->data['acf'] = $this->get_course_acf_fields(array('id' => $post->ID));
        $response->data['access'] = $this->get_course_access(array('id' => $post->ID));

        // Add categories
        $categories = wp_get_post_terms($post->ID, 'course_category');
        $response->data['course_categories'] = array_map(function($cat) {
            return array(
                'id' => $cat->term_id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            );
        }, $categories);

        // Add featured image
        $thumbnail_id = get_post_thumbnail_id($post->ID);
        if ($thumbnail_id) {
            $response->data['featured_image'] = array(
                'url' => wp_get_attachment_url($thumbnail_id),
                'alt' => get_post_meta($thumbnail_id, '_wp_attachment_image_alt', true),
            );
        }

        return $response;
    }

    /**
     * Get all courses via REST API
     */
    public function get_courses($request) {
        $args = array(
            'post_type' => 'blackboard-course',
            'posts_per_page' => -1,
            'post_status' => 'publish',
        );

        $query = new WP_Query($args);
        $courses = array();

        foreach ($query->posts as $post) {
            $course_data = array(
                'id' => $post->ID,
                'title' => $post->post_title,
                'slug' => $post->post_name,
                'excerpt' => $post->post_excerpt,
                'content' => $post->post_content,
                'acf' => $this->get_course_acf_fields(array('id' => $post->ID)),
                'access' => $this->get_course_access(array('id' => $post->ID)),
            );

            // Add categories
            $categories = wp_get_post_terms($post->ID, 'course_category');
            $course_data['course_categories'] = array_map(function($cat) {
                return array(
                    'id' => $cat->term_id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                );
            }, $categories);

            // Add featured image
            $thumbnail_id = get_post_thumbnail_id($post->ID);
            if ($thumbnail_id) {
                $course_data['featured_image'] = array(
                    'url' => wp_get_attachment_url($thumbnail_id),
                    'alt' => get_post_meta($thumbnail_id, '_wp_attachment_image_alt', true),
                );
            }

            $courses[] = $course_data;
        }

        return rest_ensure_response($courses);
    }

    /**
     * Get single course via REST API
     */
    public function get_single_course($request) {
        $slug = $request->get_param('slug');

        $args = array(
            'name' => $slug,
            'post_type' => 'blackboard-course',
            'post_status' => 'publish',
            'numberposts' => 1
        );

        $posts = get_posts($args);

        if (empty($posts)) {
            return new WP_Error('no_course', 'Course not found', array('status' => 404));
        }

        $post = $posts[0];

        $course_data = array(
            'id' => $post->ID,
            'title' => $post->post_title,
            'slug' => $post->post_name,
            'excerpt' => $post->post_excerpt,
            'content' => $post->post_content,
            'acf' => $this->get_course_acf_fields(array('id' => $post->ID)),
            'access' => $this->get_course_access(array('id' => $post->ID)),
        );

        // Add categories
        $categories = wp_get_post_terms($post->ID, 'course_category');
        $course_data['course_categories'] = array_map(function($cat) {
            return array(
                'id' => $cat->term_id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            );
        }, $categories);

        // Add featured image
        $thumbnail_id = get_post_thumbnail_id($post->ID);
        if ($thumbnail_id) {
            $course_data['featured_image'] = array(
                'url' => wp_get_attachment_url($thumbnail_id),
                'alt' => get_post_meta($thumbnail_id, '_wp_attachment_image_alt', true),
            );
        }

        return rest_ensure_response($course_data);
    }

    /**
     * Check course access via REST API
     */
    public function check_course_access($request) {
        $course_id = $request->get_param('id');
        $access = $this->get_course_access(array('id' => $course_id));
        return rest_ensure_response($access);
    }

    /**
     * Get list of course IDs that user has access to
     * This endpoint returns the authoritative list of accessible courses for the logged-in user
     *
     * Access is granted via:
     * 1. Manual enrollment in wp_blackboard_course_access table
     * 2. Automatic enrollment on WooCommerce order completion (via grant_course_access_on_order hook)
     * 3. Free courses (is_free_course = true)
     */
    public function get_user_enrolled_courses($request) {
        // Get user ID from JWT token
        $user_id = $this->get_user_id_from_jwt();

        if (!$user_id) {
            return rest_ensure_response(array(
                'course_ids' => array(),
                'reason' => 'not_authenticated'
            ));
        }

        // Get courses from access table (includes both manual and order-based access)
        $enrolled_courses = $this->get_user_courses($user_id);
        $course_ids = array();

        foreach ($enrolled_courses as $enrollment) {
            $course_ids[] = intval($enrollment->course_id);
        }

        // Also include free courses
        $args = array(
            'post_type' => 'blackboard-course',
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'meta_query' => array(
                array(
                    'key' => 'is_free_course',
                    'value' => '1',
                    'compare' => '='
                )
            )
        );
        $free_courses = get_posts($args);

        foreach ($free_courses as $course) {
            if (!in_array($course->ID, $course_ids)) {
                $course_ids[] = $course->ID;
            }
        }

        // Remove duplicates and return
        $course_ids = array_values(array_unique($course_ids));

        return rest_ensure_response(array(
            'course_ids' => $course_ids,
            'user_id' => $user_id,
            'count' => count($course_ids)
        ));
    }

    /**
     * Whitelist custom endpoints from JWT Auth validation
     * This allows our endpoints to handle JWT manually without interference from JWT Auth plugin
     */
    public function whitelist_endpoints($endpoints) {
        // Our custom endpoints that handle JWT validation internally
        $your_endpoints = array(
            '/wp-json/blackboard/v1/user/enrolled-courses',
            '/wp-json/blackboard/v1/*',  // Whitelist all our custom endpoints
        );
        return array_unique(array_merge($endpoints, $your_endpoints));
    }

    /**
     * Add enrolled courses to JWT token response
     * This enriches the login response with course access data in one API call
     */
    public function add_enrolled_courses_to_jwt_response($data, $user) {
        $user_id = $user->ID;

        // Get courses from access table (includes both manual and order-based access)
        $enrolled_courses = $this->get_user_courses($user_id);
        $course_ids = array();

        foreach ($enrolled_courses as $enrollment) {
            $course_ids[] = intval($enrollment->course_id);
        }

        // Also include free courses
        $args = array(
            'post_type' => 'blackboard-course',
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'meta_query' => array(
                array(
                    'key' => 'is_free_course',
                    'value' => '1',
                    'compare' => '='
                )
            )
        );
        $free_courses = get_posts($args);

        foreach ($free_courses as $course) {
            if (!in_array($course->ID, $course_ids)) {
                $course_ids[] = $course->ID;
            }
        }

        // Remove duplicates
        $course_ids = array_values(array_unique($course_ids));

        // Add to response
        $data['enrolled_course_ids'] = $course_ids;

        return $data;
    }

    /**
     * Export courses as JSON for easy transfer between sites
     */
    public function export_courses_json($request) {
        $args = array(
            'post_type' => 'blackboard-course',
            'posts_per_page' => -1,
            'post_status' => 'publish',
        );

        $query = new WP_Query($args);
        $export_data = array(
            'courses' => array(),
            'categories' => array(),
            'export_date' => current_time('mysql'),
            'source_url' => home_url(),
        );

        // Export courses
        foreach ($query->posts as $post) {
            $course_data = array(
                'title' => $post->post_title,
                'slug' => $post->post_name,
                'content' => $post->post_content,
                'excerpt' => $post->post_excerpt,
                'status' => $post->post_status,
                'acf' => function_exists('get_fields') ? get_fields($post->ID) : array(),
                'categories' => array(),
                'featured_image_url' => get_the_post_thumbnail_url($post->ID, 'full'),
            );

            // Get categories
            $categories = wp_get_post_terms($post->ID, 'course_category');
            foreach ($categories as $cat) {
                $course_data['categories'][] = array(
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                    'description' => $cat->description,
                );
            }

            $export_data['courses'][] = $course_data;
        }

        // Export categories
        $all_categories = get_terms(array(
            'taxonomy' => 'course_category',
            'hide_empty' => false,
        ));

        foreach ($all_categories as $cat) {
            $export_data['categories'][] = array(
                'name' => $cat->name,
                'slug' => $cat->slug,
                'description' => $cat->description,
            );
        }

        return rest_ensure_response($export_data);
    }

    /**
     * Import courses from JSON
     */
    public function import_courses_json($request) {
        // Get the raw body
        $body = $request->get_body();

        // Try to decode the JSON
        $data = json_decode($body, true);

        // Check for JSON errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error(
                'invalid_json',
                'JSON parsing error: ' . json_last_error_msg() . ' | Body preview: ' . substr($body, 0, 100),
                array('status' => 400)
            );
        }

        if (!$data || !isset($data['courses'])) {
            return new WP_Error(
                'invalid_data',
                'Invalid import data structure. Expected "courses" key. Keys found: ' . implode(', ', array_keys($data ?: [])),
                array('status' => 400)
            );
        }

        $imported = array();
        $errors = array();
        $log = array();

        // Import categories first
        if (isset($data['categories'])) {
            foreach ($data['categories'] as $cat_data) {
                if (!term_exists($cat_data['slug'], 'course_category')) {
                    wp_insert_term($cat_data['name'], 'course_category', array(
                        'slug' => $cat_data['slug'],
                        'description' => $cat_data['description'] ?? '',
                    ));
                    $log[] = "Created category: " . $cat_data['name'];
                }
            }
        }

        // Import courses
        foreach ($data['courses'] as $course_data) {
            try {
                // Check if course already exists
                $existing = get_page_by_path($course_data['slug'], OBJECT, 'blackboard-course');
                if ($existing) {
                    $log[] = "Skipped (already exists): " . $course_data['title'];
                    continue;
                }

                // Create course
                $course_id = wp_insert_post(array(
                    'post_title' => $course_data['title'],
                    'post_name' => $course_data['slug'],
                    'post_content' => $course_data['content'],
                    'post_excerpt' => $course_data['excerpt'],
                    'post_status' => 'publish',
                    'post_type' => 'blackboard-course',
                ));

                if (is_wp_error($course_id)) {
                    $errors[] = "Failed to import: " . $course_data['title'];
                    continue;
                }

                // Import ACF fields
                if (function_exists('update_field') && !empty($course_data['acf'])) {
                    foreach ($course_data['acf'] as $field_key => $field_value) {
                        update_field($field_key, $field_value, $course_id);
                    }
                }

                // Assign categories
                if (!empty($course_data['categories'])) {
                    $category_ids = array();
                    foreach ($course_data['categories'] as $cat_data) {
                        $term = get_term_by('slug', $cat_data['slug'], 'course_category');
                        if ($term) {
                            $category_ids[] = $term->term_id;
                        }
                    }
                    if (!empty($category_ids)) {
                        wp_set_object_terms($course_id, $category_ids, 'course_category');
                    }
                }

                // Download and set featured image
                if (!empty($course_data['featured_image_url'])) {
                    require_once(ABSPATH . 'wp-admin/includes/media.php');
                    require_once(ABSPATH . 'wp-admin/includes/file.php');
                    require_once(ABSPATH . 'wp-admin/includes/image.php');

                    $image_id = media_sideload_image($course_data['featured_image_url'], $course_id, '', 'id');
                    if (!is_wp_error($image_id)) {
                        set_post_thumbnail($course_id, $image_id);
                    }
                }

                $imported[] = array(
                    'id' => $course_id,
                    'title' => $course_data['title'],
                );
                $log[] = "✓ Imported: " . $course_data['title'];

            } catch (Exception $e) {
                $errors[] = "Error importing {$course_data['title']}: " . $e->getMessage();
                $log[] = "✗ Error: " . $e->getMessage();
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'imported' => $imported,
            'imported_count' => count($imported),
            'errors' => $errors,
            'log' => $log,
            'message' => sprintf('Import complete: %d courses imported, %d errors', count($imported), count($errors)),
        ));
    }

    /**
     * DEPRECATED: Tutor LMS Migration Function
     * Kept for reference but no longer accessible via API
     */
    /*
    public function migrate_tutor_courses_DEPRECATED($request) {
        global $wpdb;
        $migrated = array();
        $errors = array();
        $detailed_log = array();

        // Get all Tutor LMS courses
        $tutor_courses = $wpdb->get_results("
            SELECT * FROM {$wpdb->posts}
            WHERE post_type = 'courses'
            AND post_status IN ('publish', 'draft', 'private')
        ");

        $detailed_log[] = "Found " . count($tutor_courses) . " Tutor LMS courses to migrate";

        foreach ($tutor_courses as $tutor_course) {
            try {
                $detailed_log[] = "Processing: " . $tutor_course->post_title;

                // Get all meta data for comprehensive migration
                $tutor_meta = get_post_meta($tutor_course->ID);

                // Get course topics and lessons
                $topics = $wpdb->get_results($wpdb->prepare("
                    SELECT * FROM {$wpdb->posts}
                    WHERE post_type = 'topics'
                    AND post_parent = %d
                    ORDER BY menu_order ASC
                ", $tutor_course->ID));

                // Collect all lessons with their content
                $all_lessons = array();
                foreach ($topics as $topic) {
                    $lessons = $wpdb->get_results($wpdb->prepare("
                        SELECT * FROM {$wpdb->posts}
                        WHERE post_type = 'lesson'
                        AND post_parent = %d
                        ORDER BY menu_order ASC
                    ", $topic->ID));

                    foreach ($lessons as $lesson) {
                        $lesson_meta = get_post_meta($lesson->ID);
                        $all_lessons[] = array(
                            'topic_title' => $topic->post_title,
                            'lesson' => $lesson,
                            'meta' => $lesson_meta
                        );
                    }
                }

                $detailed_log[] = "  - Found " . count($all_lessons) . " lessons";

                // Extract Tutor course settings
                $course_duration = isset($tutor_meta['_course_duration'][0]) ?
                    unserialize($tutor_meta['_course_duration'][0]) : null;

                $course_level = isset($tutor_meta['_tutor_course_level'][0]) ?
                    $tutor_meta['_tutor_course_level'][0] : 'beginner';

                $course_benefits = isset($tutor_meta['_tutor_course_benefits'][0]) ?
                    $tutor_meta['_tutor_course_benefits'][0] : '';

                $course_requirements = isset($tutor_meta['_tutor_course_requirements'][0]) ?
                    $tutor_meta['_tutor_course_requirements'][0] : '';

                $course_target_audience = isset($tutor_meta['_tutor_course_target_audience'][0]) ?
                    $tutor_meta['_tutor_course_target_audience'][0] : '';

                $course_material_includes = isset($tutor_meta['_tutor_course_material_includes'][0]) ?
                    $tutor_meta['_tutor_course_material_includes'][0] : '';

                // Get product connection
                $product_id = isset($tutor_meta['_tutor_course_product_id'][0]) ?
                    $tutor_meta['_tutor_course_product_id'][0] : null;

                // Prepare enhanced content with all Tutor data
                $enhanced_content = $tutor_course->post_content;

                if ($course_benefits) {
                    $enhanced_content .= "\n\n<h2>What You'll Learn</h2>\n" . $course_benefits;
                }

                if ($course_requirements) {
                    $enhanced_content .= "\n\n<h2>Requirements</h2>\n" . $course_requirements;
                }

                if ($course_target_audience) {
                    $enhanced_content .= "\n\n<h2>Who This Course is For</h2>\n" . $course_target_audience;
                }

                if ($course_material_includes) {
                    $enhanced_content .= "\n\n<h2>This Course Includes</h2>\n" . $course_material_includes;
                }

                // Create new course with all content
                $new_course_id = wp_insert_post(array(
                    'post_title' => $tutor_course->post_title,
                    'post_content' => $enhanced_content,
                    'post_excerpt' => $tutor_course->post_excerpt,
                    'post_status' => $tutor_course->post_status,
                    'post_type' => 'blackboard-course',
                    'post_author' => $tutor_course->post_author,
                    'post_name' => $tutor_course->post_name,
                    'post_date' => $tutor_course->post_date,
                    'post_date_gmt' => $tutor_course->post_date_gmt,
                ));

                if (is_wp_error($new_course_id)) {
                    $errors[] = "Failed to migrate course: " . $tutor_course->post_title;
                    continue;
                }

                $detailed_log[] = "  - Created new course ID: " . $new_course_id;

                // Copy featured image
                $thumbnail_id = get_post_thumbnail_id($tutor_course->ID);
                if ($thumbnail_id) {
                    set_post_thumbnail($new_course_id, $thumbnail_id);
                    $detailed_log[] = "  - Featured image copied";
                }

                // Set ACF fields if available
                if (function_exists('update_field')) {
                    // Product connection
                    if ($product_id) {
                        update_field('product_id', $product_id, $new_course_id);
                        $detailed_log[] = "  - Product connected: ID " . $product_id;
                    }

                    // Duration
                    if ($course_duration) {
                        $duration_string = '';
                        if (!empty($course_duration['hours'])) {
                            $duration_string .= $course_duration['hours'] . ' hours ';
                        }
                        if (!empty($course_duration['minutes'])) {
                            $duration_string .= $course_duration['minutes'] . ' minutes';
                        }
                        if (empty($duration_string) && isset($tutor_meta['_course_duration_text'][0])) {
                            $duration_string = $tutor_meta['_course_duration_text'][0];
                        }
                        if ($duration_string) {
                            update_field('duration', trim($duration_string), $new_course_id);
                        }
                    }

                    // Difficulty level mapping
                    $difficulty_map = array(
                        'beginner' => 'beginner',
                        'intermediate' => 'intermediate',
                        'advanced' => 'advanced',
                        'all_levels' => 'beginner'
                    );
                    $mapped_difficulty = isset($difficulty_map[$course_level]) ?
                        $difficulty_map[$course_level] : 'beginner';
                    update_field('difficulty', $mapped_difficulty, $new_course_id);

                    // Certificate (Tutor courses typically award certificates)
                    update_field('certificate_awarded', true, $new_course_id);

                    // Instructor
                    $instructor_id = $tutor_course->post_author;
                    $instructor_data = get_userdata($instructor_id);
                    if ($instructor_data) {
                        update_field('instructor', $instructor_data->display_name, $new_course_id);
                    }

                    // Process lessons into course videos
                    $course_videos = array();
                    foreach ($all_lessons as $index => $lesson_data) {
                        $lesson = $lesson_data['lesson'];
                        $lesson_meta = $lesson_data['meta'];

                        // Check for video in lesson meta
                        $video_info = isset($lesson_meta['_video'][0]) ?
                            unserialize($lesson_meta['_video'][0]) : null;

                        $vimeo_id = '';
                        $video_duration = '';

                        if ($video_info) {
                            // Extract Vimeo ID if present
                            if (isset($video_info['source']) && $video_info['source'] === 'vimeo') {
                                $vimeo_id = $video_info['source_video_id'] ?? '';
                            } elseif (isset($video_info['source_video_id'])) {
                                $vimeo_id = $video_info['source_video_id'];
                            }

                            // Get duration from video info
                            if (isset($video_info['runtime'])) {
                                $runtime = $video_info['runtime'];
                                if (isset($runtime['hours']) || isset($runtime['minutes']) || isset($runtime['seconds'])) {
                                    $hours = intval($runtime['hours'] ?? 0);
                                    $minutes = intval($runtime['minutes'] ?? 0);
                                    $seconds = intval($runtime['seconds'] ?? 0);

                                    if ($hours > 0) {
                                        $video_duration = sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
                                    } else {
                                        $video_duration = sprintf('%d:%02d', $minutes, $seconds);
                                    }
                                }
                            }
                        }

                        // Use placeholder video if no Vimeo ID found
                        if (empty($vimeo_id)) {
                            $vimeo_id = '347119375'; // Default test video
                        }

                        // Create video entry for ACF repeater
                        $course_videos[] = array(
                            'video_title' => $lesson->post_title,
                            'vimeo_id' => $vimeo_id,
                            'video_duration' => $video_duration,
                            'video_description' => $lesson->post_excerpt ?: wp_trim_words($lesson->post_content, 30)
                        );
                    }

                    if (!empty($course_videos)) {
                        update_field('course_videos', $course_videos, $new_course_id);
                        $detailed_log[] = "  - Added " . count($course_videos) . " video lessons";
                    }

                    // Course materials/attachments
                    $attachments = isset($tutor_meta['_tutor_attachments'][0]) ?
                        unserialize($tutor_meta['_tutor_attachments'][0]) : array();

                    if (!empty($attachments) && is_array($attachments)) {
                        $course_materials = array();
                        foreach ($attachments as $attachment_id) {
                            $attachment = get_post($attachment_id);
                            if ($attachment) {
                                $course_materials[] = array(
                                    'material_title' => $attachment->post_title ?: 'Course Material',
                                    'material_file' => $attachment_id
                                );
                            }
                        }

                        if (!empty($course_materials)) {
                            update_field('course_materials', $course_materials, $new_course_id);
                            $detailed_log[] = "  - Added " . count($course_materials) . " course materials";
                        }
                    }

                    // Store migration meta for reference
                    update_post_meta($new_course_id, '_migrated_from_tutor', true);
                    update_post_meta($new_course_id, '_original_tutor_id', $tutor_course->ID);
                    update_post_meta($new_course_id, '_tutor_enrolled_count',
                        isset($tutor_meta['_tutor_enrolled_count'][0]) ? $tutor_meta['_tutor_enrolled_count'][0] : 0);
                }

                // Assign category based on course name
                $title_lower = strtolower($tutor_course->post_title);
                $category_slug = 'online'; // default

                if (strpos($title_lower, 'procoach') !== false ||
                    strpos($title_lower, 'pro coach') !== false ||
                    strpos($title_lower, 'certification') !== false) {
                    $category_slug = 'procoach';
                } elseif (strpos($title_lower, 'workshop') !== false) {
                    $category_slug = 'workshop';
                }

                $category = get_term_by('slug', $category_slug, 'course_category');
                if ($category) {
                    wp_set_object_terms($new_course_id, $category->term_id, 'course_category');
                    $detailed_log[] = "  - Category assigned: " . $category->name;
                }

                $migrated[] = array(
                    'old_id' => $tutor_course->ID,
                    'new_id' => $new_course_id,
                    'title' => $tutor_course->post_title,
                    'lessons_count' => count($all_lessons),
                    'product_id' => $product_id
                );

                $detailed_log[] = "  ✓ Successfully migrated: " . $tutor_course->post_title;

            } catch (Exception $e) {
                $errors[] = "Error migrating course {$tutor_course->ID}: " . $e->getMessage();
                $detailed_log[] = "  ✗ Error: " . $e->getMessage();
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'migrated' => $migrated,
            'migrated_count' => count($migrated),
            'errors' => $errors,
            'log' => $detailed_log,
            'message' => sprintf('Migration complete: %d courses migrated successfully, %d errors',
                count($migrated), count($errors)),
        ));
    }
    */

    /**
     * Handle course save
     */
    public function on_course_saved($post_id, $post, $update) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        $this->trigger_course_revalidation('course.' . ($update ? 'updated' : 'created'), $post->post_name);
    }

    /**
     * Handle course delete
     */
    public function on_course_deleted($post_id) {
        if (get_post_type($post_id) !== 'blackboard-course') {
            return;
        }

        $this->trigger_course_revalidation('course.deleted');
    }

    /**
     * Trigger course revalidation
     */
    private function trigger_course_revalidation($action, $slug = '') {
        if (empty($this->nextjs_url) || empty($this->webhook_secret)) {
            return false;
        }

        $webhook_url = trailingslashit($this->nextjs_url) . 'api/webhook/rebuild';

        $body = array(
            'secret' => $this->webhook_secret,
            'action' => $action,
            'type' => 'course',
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
     * Add multi-currency price fields to product edit page
     */
    public function add_currency_price_fields() {
        global $post;

        echo '<div class="options_group pricing show_if_simple show_if_external show_if_variable">';
        echo '<p class="form-field"><strong style="font-size: 14px; color: #2271b1;">Next.js Multi-Currency Prices</strong></p>';
        echo '<p class="form-field" style="padding-left: 12px; color: #646970; margin-top: -8px;">Set prices for USD and EUR currencies used in Next.js frontend</p>';

        // USD Regular Price
        woocommerce_wp_text_input(array(
            'id' => '_nextjs_usd_regular_price',
            'label' => 'USD Regular Price ($)',
            'placeholder' => '0.00',
            'desc_tip' => true,
            'description' => 'Regular price in USD for Next.js frontend',
            'type' => 'text',
            'data_type' => 'price',
            'value' => get_post_meta($post->ID, '_nextjs_usd_regular_price', true)
        ));

        // USD Sale Price
        woocommerce_wp_text_input(array(
            'id' => '_nextjs_usd_sale_price',
            'label' => 'USD Sale Price ($)',
            'placeholder' => '0.00',
            'desc_tip' => true,
            'description' => 'Sale price in USD for Next.js frontend',
            'type' => 'text',
            'data_type' => 'price',
            'value' => get_post_meta($post->ID, '_nextjs_usd_sale_price', true)
        ));

        // EUR Regular Price
        woocommerce_wp_text_input(array(
            'id' => '_nextjs_eur_regular_price',
            'label' => 'EUR Regular Price (€)',
            'placeholder' => '0.00',
            'desc_tip' => true,
            'description' => 'Regular price in EUR for Next.js frontend',
            'type' => 'text',
            'data_type' => 'price',
            'value' => get_post_meta($post->ID, '_nextjs_eur_regular_price', true)
        ));

        // EUR Sale Price
        woocommerce_wp_text_input(array(
            'id' => '_nextjs_eur_sale_price',
            'label' => 'EUR Sale Price (€)',
            'placeholder' => '0.00',
            'desc_tip' => true,
            'description' => 'Sale price in EUR for Next.js frontend',
            'type' => 'text',
            'data_type' => 'price',
            'value' => get_post_meta($post->ID, '_nextjs_eur_sale_price', true)
        ));

        echo '</div>';
    }

    /**
     * Save multi-currency price fields
     */
    public function save_currency_price_fields($post_id) {
        $usd_regular = isset($_POST['_nextjs_usd_regular_price']) ? wc_format_decimal($_POST['_nextjs_usd_regular_price']) : '';
        $usd_sale = isset($_POST['_nextjs_usd_sale_price']) ? wc_format_decimal($_POST['_nextjs_usd_sale_price']) : '';
        $eur_regular = isset($_POST['_nextjs_eur_regular_price']) ? wc_format_decimal($_POST['_nextjs_eur_regular_price']) : '';
        $eur_sale = isset($_POST['_nextjs_eur_sale_price']) ? wc_format_decimal($_POST['_nextjs_eur_sale_price']) : '';

        update_post_meta($post_id, '_nextjs_usd_regular_price', $usd_regular);
        update_post_meta($post_id, '_nextjs_usd_sale_price', $usd_sale);
        update_post_meta($post_id, '_nextjs_eur_regular_price', $eur_regular);
        update_post_meta($post_id, '_nextjs_eur_sale_price', $eur_sale);
    }

    /**
     * Add multi-currency price fields to product variations
     */
    public function add_variation_currency_price_fields($loop, $variation_data, $variation) {
        $variation_id = $variation->ID;

        echo '<div class="form-row form-row-full options_group pricing">';
        echo '<p class="form-field"><strong style="font-size: 13px; color: #2271b1;">Next.js Multi-Currency Prices</strong></p>';

        // USD Regular Price
        woocommerce_wp_text_input(array(
            'id' => "_nextjs_variation_usd_regular_price_{$loop}",
            'name' => "_nextjs_variation_usd_regular_price[{$loop}]",
            'label' => 'USD Regular Price ($)',
            'placeholder' => '0.00',
            'desc_tip' => true,
            'description' => 'Regular price in USD for this variation',
            'type' => 'text',
            'data_type' => 'price',
            'value' => get_post_meta($variation_id, '_nextjs_usd_regular_price', true),
            'wrapper_class' => 'form-row form-row-first'
        ));

        // USD Sale Price
        woocommerce_wp_text_input(array(
            'id' => "_nextjs_variation_usd_sale_price_{$loop}",
            'name' => "_nextjs_variation_usd_sale_price[{$loop}]",
            'label' => 'USD Sale Price ($)',
            'placeholder' => '0.00',
            'desc_tip' => true,
            'description' => 'Sale price in USD for this variation',
            'type' => 'text',
            'data_type' => 'price',
            'value' => get_post_meta($variation_id, '_nextjs_usd_sale_price', true),
            'wrapper_class' => 'form-row form-row-last'
        ));

        // EUR Regular Price
        woocommerce_wp_text_input(array(
            'id' => "_nextjs_variation_eur_regular_price_{$loop}",
            'name' => "_nextjs_variation_eur_regular_price[{$loop}]",
            'label' => 'EUR Regular Price (€)',
            'placeholder' => '0.00',
            'desc_tip' => true,
            'description' => 'Regular price in EUR for this variation',
            'type' => 'text',
            'data_type' => 'price',
            'value' => get_post_meta($variation_id, '_nextjs_eur_regular_price', true),
            'wrapper_class' => 'form-row form-row-first'
        ));

        // EUR Sale Price
        woocommerce_wp_text_input(array(
            'id' => "_nextjs_variation_eur_sale_price_{$loop}",
            'name' => "_nextjs_variation_eur_sale_price[{$loop}]",
            'label' => 'EUR Sale Price (€)',
            'placeholder' => '0.00',
            'desc_tip' => true,
            'description' => 'Sale price in EUR for this variation',
            'type' => 'text',
            'data_type' => 'price',
            'value' => get_post_meta($variation_id, '_nextjs_eur_sale_price', true),
            'wrapper_class' => 'form-row form-row-last'
        ));

        echo '</div>';
    }

    /**
     * Save multi-currency price fields for variations
     */
    public function save_variation_currency_price_fields($variation_id, $i) {
        $usd_regular = isset($_POST['_nextjs_variation_usd_regular_price'][$i]) ? wc_format_decimal($_POST['_nextjs_variation_usd_regular_price'][$i]) : '';
        $usd_sale = isset($_POST['_nextjs_variation_usd_sale_price'][$i]) ? wc_format_decimal($_POST['_nextjs_variation_usd_sale_price'][$i]) : '';
        $eur_regular = isset($_POST['_nextjs_variation_eur_regular_price'][$i]) ? wc_format_decimal($_POST['_nextjs_variation_eur_regular_price'][$i]) : '';
        $eur_sale = isset($_POST['_nextjs_variation_eur_sale_price'][$i]) ? wc_format_decimal($_POST['_nextjs_variation_eur_sale_price'][$i]) : '';

        update_post_meta($variation_id, '_nextjs_usd_regular_price', $usd_regular);
        update_post_meta($variation_id, '_nextjs_usd_sale_price', $usd_sale);
        update_post_meta($variation_id, '_nextjs_eur_regular_price', $eur_regular);
        update_post_meta($variation_id, '_nextjs_eur_sale_price', $eur_sale);
    }

    /**
     * Add currency prices to WooCommerce REST API response
     */
    public function add_currency_prices_to_api($response, $product, $request) {
        $product_id = $product->get_id();

        $currency_prices = array(
            'usd' => array(
                'regular_price' => get_post_meta($product_id, '_nextjs_usd_regular_price', true),
                'sale_price' => get_post_meta($product_id, '_nextjs_usd_sale_price', true),
            ),
            'eur' => array(
                'regular_price' => get_post_meta($product_id, '_nextjs_eur_regular_price', true),
                'sale_price' => get_post_meta($product_id, '_nextjs_eur_sale_price', true),
            ),
        );

        $response->data['currency_prices'] = $currency_prices;

        return $response;
    }

    /**
     * Add currency prices to product variation REST API response
     */
    public function add_variation_currency_prices_to_api($response, $variation, $request) {
        $variation_id = $variation->get_id();

        $currency_prices = array(
            'usd' => array(
                'regular_price' => get_post_meta($variation_id, '_nextjs_usd_regular_price', true),
                'sale_price' => get_post_meta($variation_id, '_nextjs_usd_sale_price', true),
            ),
            'eur' => array(
                'regular_price' => get_post_meta($variation_id, '_nextjs_eur_regular_price', true),
                'sale_price' => get_post_meta($variation_id, '_nextjs_eur_sale_price', true),
            ),
        );

        $response->data['currency_prices'] = $currency_prices;

        return $response;
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
        // Payment URL endpoint - Get payment URL for an order
        register_rest_route('blackboard/v1', '/orders/(?P<id>\d+)/payment-url', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_order_payment_url'),
            'permission_callback' => '__return_true',
        ));

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

    /**
     * Get payment URL for an order
     * This generates the appropriate payment URL based on the payment gateway
     */
    public function get_order_payment_url($request) {
        $order_id = $request->get_param('id');

        if (!$order_id) {
            return new WP_Error('missing_order_id', 'Order ID is required', array('status' => 400));
        }

        $order = wc_get_order($order_id);

        if (!$order) {
            return new WP_Error('invalid_order', 'Order not found', array('status' => 404));
        }

        // Get the payment method
        $payment_method = $order->get_payment_method();
        $payment_url = '';
        $redirect_type = 'external'; // or 'internal' for thank you page

        // Generate payment URL based on gateway
        if ($payment_method === 'stripe' || $payment_method === 'stripe_cc') {
            // For Stripe, get the checkout URL
            // WooCommerce Stripe plugin stores session data
            $payment_url = $order->get_checkout_payment_url(true);
            $redirect_type = 'external';

        } elseif ($payment_method === 'paypal' || $payment_method === 'ppec_paypal') {
            // For PayPal, get the checkout URL
            $payment_url = $order->get_checkout_payment_url(true);
            $redirect_type = 'external';

        } elseif ($payment_method === 'bacs') {
            // For bank transfer, redirect to thank you page with instructions
            $payment_url = $order->get_checkout_order_received_url();
            $redirect_type = 'internal';

        } else {
            // Default: use WooCommerce payment URL
            $payment_url = $order->get_checkout_payment_url(true);
            $redirect_type = 'external';
        }

        // Get the return URL (thank you page)
        $return_url = $order->get_checkout_order_received_url();

        // Get Next.js base URL from meta or settings
        $nextjs_url = get_post_meta($order_id, '_headless_return_url', true);
        if (empty($nextjs_url)) {
            $nextjs_url = $this->nextjs_url;
        }

        // Build Next.js thank you page URL
        if (!empty($nextjs_url)) {
            $nextjs_return_url = trailingslashit($nextjs_url) . 'order-success?order=' . $order_id . '&key=' . $order->get_order_key();
        } else {
            $nextjs_return_url = $return_url;
        }

        return rest_ensure_response(array(
            'order_id' => $order_id,
            'order_key' => $order->get_order_key(),
            'order_number' => $order->get_order_number(),
            'payment_method' => $payment_method,
            'payment_method_title' => $order->get_payment_method_title(),
            'payment_url' => $payment_url,
            'return_url' => $nextjs_return_url,
            'redirect_type' => $redirect_type,
            'status' => $order->get_status(),
            'total' => $order->get_total(),
            'currency' => $order->get_currency(),
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
            'BlackBoard Headless Options',
            'Headless Options',
            'manage_options',
            'blackboard-headless-dashboard',
            array($this, 'render_dashboard_page'),
            'dashicons-admin-settings',
            58
        );

        // Also add to WooCommerce menu for convenience
        add_submenu_page(
            'woocommerce',
            'Headless Options Dashboard',
            'Headless Options',
            'manage_woocommerce',
            'blackboard-headless-woo',
            array($this, 'render_dashboard_page')
        );

        // Also add to Videos menu if it exists
        if (post_type_exists('video')) {
            add_submenu_page(
                'edit.php?post_type=video',
                'Headless Options Dashboard',
                'Headless Options',
                'manage_options',
                'blackboard-headless-video',
                array($this, 'render_dashboard_page')
            );
        }

        // Sync page (new!)
        add_submenu_page(
            'blackboard-headless-dashboard',
            'Sync & Build',
            'Sync & Build',
            'manage_options',
            'blackboard-headless-sync',
            array($this, 'render_sync_page')
        );

        // Settings page
        add_submenu_page(
            'blackboard-headless-dashboard',
            'Settings',
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
                        <button class="tab-button" data-tab="courses-tab">📚 Courses</button>
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

                    <!-- Courses Tab -->
                    <div id="courses-tab" class="tab-content">
                        <div class="status-card">
                            <h3>📦 Course Import/Export</h3>
                            <p>Easy one-click export and import of all courses between sites.</p>

                            <div style="margin-top: 20px;">
                                <h4>Export Courses from This Site:</h4>
                                <p>Download all courses as a JSON file that can be imported on another WordPress site.</p>
                                <a href="<?php echo home_url('/wp-json/blackboard/v1/export-courses'); ?>"
                                   class="button button-primary"
                                   download="blackboard-courses-export.json"
                                   target="_blank">
                                    ⬇️ Download Courses JSON
                                </a>
                            </div>

                            <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
                                <h4>Import Courses to This Site:</h4>
                                <p>Upload a courses JSON file exported from another site.</p>
                                <form id="import-courses-form" style="margin-top: 15px;">
                                    <input type="file" id="courses-json-file" accept=".json" style="margin-bottom: 10px;" />
                                    <button type="submit" class="button button-primary">⬆️ Upload & Import Courses</button>
                                </form>
                                <div id="import-status" style="margin-top: 15px;"></div>
                            </div>

                        </div>

                        <script>
                        jQuery(document).ready(function($) {
                            // Handle import
                            $('#import-courses-form').on('submit', function(e) {
                                e.preventDefault();
                                const fileInput = $('#courses-json-file')[0];
                                const statusDiv = $('#import-status');

                                if (!fileInput.files.length) {
                                    statusDiv.html('<div class="notice notice-error"><p>Please select a JSON file first.</p></div>');
                                    return;
                                }

                                const file = fileInput.files[0];
                                const reader = new FileReader();

                                reader.onload = function(e) {
                                    statusDiv.html('<div class="notice notice-info"><p>⏳ Importing courses...</p></div>');

                                    // Clean the JSON by removing any PHP warnings/errors before the JSON starts
                                    let jsonContent = e.target.result;
                                    const jsonStart = jsonContent.indexOf('{');
                                    if (jsonStart > 0) {
                                        jsonContent = jsonContent.substring(jsonStart);
                                    }

                                    $.ajax({
                                        url: '<?php echo home_url('/wp-json/blackboard/v1/import-courses'); ?>',
                                        method: 'POST',
                                        contentType: 'application/json',
                                        data: jsonContent,
                                        success: function(response) {
                                            let logHtml = '<h4>Import Results:</h4><ul>';
                                            response.log.forEach(function(line) {
                                                logHtml += '<li>' + line + '</li>';
                                            });
                                            logHtml += '</ul>';

                                            statusDiv.html(
                                                '<div class="notice notice-success"><p><strong>' + response.message + '</strong></p>' + logHtml + '</div>'
                                            );
                                        },
                                        error: function(xhr) {
                                            statusDiv.html('<div class="notice notice-error"><p>❌ Import failed: ' + xhr.responseText + '</p></div>');
                                        }
                                    });
                                };

                                reader.readAsText(file);
                            });
                        });
                        </script>
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

                <!-- Help & Documentation -->
                <div class="diagnostic-section">
                    <h2>📚 Help & Documentation</h2>

                    <h3>What This Plugin Does</h3>
                    <p>BlackBoard Headless Options connects your WordPress/WooCommerce backend to your Next.js headless frontend.</p>

                    <h4>Key Features:</h4>
                    <ul style="list-style: disc; margin-left: 20px;">
                        <li><strong>WooCommerce Sync:</strong> Automatically exposes products via REST API for Next.js consumption</li>
                        <li><strong>Course Management:</strong> Custom Post Type for courses with video lessons, materials, and WooCommerce integration</li>
                        <li><strong>Video Library:</strong> Custom Post Type for training videos with Vimeo integration</li>
                        <li><strong>Access Control:</strong> Manages course access based on WooCommerce product purchases</li>
                        <li><strong>Auto Rebuilds:</strong> Triggers Next.js rebuilds when content changes</li>
                        <li><strong>REST API:</strong> Provides endpoints for courses, videos, and user access</li>
                    </ul>

                    <h3 style="margin-top: 30px;">Custom Fields (ACF) Created by This Plugin</h3>

                    <h4>Course Fields:</h4>
                    <ul style="list-style: disc; margin-left: 20px;">
                        <li><code>product_id</code> - Connected WooCommerce product for purchasing</li>
                        <li><code>billing_product_id</code> - Alternative billing product</li>
                        <li><code>access_product_ids</code> - Multiple products that grant access</li>
                        <li><code>is_free_course</code> - Boolean for free courses</li>
                        <li><code>duration</code> - Course duration (e.g., "2 hours")</li>
                        <li><code>course_type</code> - On Demand | Online Live Course</li>
                        <li><code>booking_widget</code> - HTML/JS snippet for live course booking (only for Online Live Courses)</li>
                        <li><code>certificate_awarded</code> - Boolean for certificate availability</li>
                        <li><code>instructor</code> - Instructor name</li>
                        <li><code>course_videos</code> - Repeater field with:
                            <ul style="margin-left: 20px;">
                                <li><code>video_title</code> - Title of video lesson</li>
                                <li><code>vimeo_id</code> - Vimeo video ID</li>
                                <li><code>video_duration</code> - Duration of video</li>
                                <li><code>video_description</code> - Description of lesson</li>
                            </ul>
                        </li>
                        <li><code>course_materials</code> - Repeater field with:
                            <ul style="margin-left: 20px;">
                                <li><code>material_title</code> - Material name</li>
                                <li><code>material_file</code> - File attachment</li>
                            </ul>
                        </li>
                        <li><code>what_you_will_learn</code> - Learning outcomes</li>
                        <li><code>equipment_requirements</code> - Required equipment</li>
                        <li><code>course_includes</code> - Repeater field for course inclusions</li>
                    </ul>

                    <h4 style="margin-top: 20px;">Video Fields:</h4>
                    <ul style="list-style: disc; margin-left: 20px;">
                        <li><code>vimeo_id</code> - Vimeo video ID for playback</li>
                        <li><code>video_duration</code> - Length of video</li>
                        <li><code>difficulty_level</code> - Beginner | Intermediate | Advanced</li>
                        <li><code>required_products</code> - WooCommerce products needed for access</li>
                        <li><code>is_free</code> - Boolean for free access</li>
                    </ul>

                    <h3 style="margin-top: 30px;">API Endpoints</h3>
                    <p>All endpoints are available at: <code><?php echo home_url('/wp-json/blackboard/v1/'); ?></code></p>
                    <ul style="list-style: disc; margin-left: 20px;">
                        <li><code>/courses</code> - List all courses with ACF fields</li>
                        <li><code>/courses/{slug}</code> - Get single course by slug</li>
                        <li><code>/courses/access</code> - Check user access to courses</li>
                        <li><code>/videos</code> - List all videos</li>
                        <li><code>/videos/{slug}</code> - Get single video</li>
                        <li><code>/export-courses</code> - Export courses as JSON</li>
                        <li><code>/import-courses</code> - Import courses from JSON</li>
                    </ul>

                    <h3 style="margin-top: 30px;">Troubleshooting</h3>
                    <ul style="list-style: disc; margin-left: 20px;">
                        <li><strong>Courses not showing:</strong> Check that ACF fields are created and populated</li>
                        <li><strong>Access denied:</strong> Verify product connection and user purchase history</li>
                        <li><strong>Builds not triggering:</strong> Check Vercel Deploy Hook URL in Settings</li>
                        <li><strong>Videos not playing:</strong> Verify Vimeo ID and video privacy settings</li>
                    </ul>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Render Sync & Build page
     */
    public function render_sync_page() {
        $nextjs_url = get_option('blackboard_nextjs_url', '');
        $vercel_deploy_hook = get_option('blackboard_vercel_deploy_hook', '');

        // Handle instant sync trigger
        if (isset($_POST['trigger_sync']) && check_admin_referer('blackboard_sync_action', 'blackboard_sync_nonce')) {
            $result = $this->trigger_vercel_build();
            if ($result) {
                echo '<div class="notice notice-success"><p>✅ Build triggered successfully!</p></div>';
            } else {
                echo '<div class="notice notice-error"><p>❌ Build trigger failed. Check your Vercel Deploy Hook URL.</p></div>';
            }
        }

        // Handle trigger settings save
        if (isset($_POST['save_trigger_settings'])) {
            update_option('blackboard_trigger_on_product', isset($_POST['blackboard_trigger_on_product']) ? '1' : '0');
            update_option('blackboard_trigger_on_course', isset($_POST['blackboard_trigger_on_course']) ? '1' : '0');
            update_option('blackboard_trigger_on_video', isset($_POST['blackboard_trigger_on_video']) ? '1' : '0');
            echo '<div class="notice notice-success"><p>✅ Trigger settings saved!</p></div>';
        }

        ?>
        <div class="wrap blackboard-admin-wrap">
            <h1>🔄 Sync & Build</h1>
            <p>Manage automatic synchronization and manual build triggers for your headless Next.js site.</p>

            <!-- Instant Sync Section -->
            <div class="blackboard-admin-card">
                <h2>🚀 Manual Sync & Build</h2>
                <p>Trigger an immediate build of your Next.js site on Vercel.</p>

                <form method="post">
                    <?php wp_nonce_field('blackboard_sync_action', 'blackboard_sync_nonce'); ?>
                    <input type="hidden" name="trigger_sync" value="1">
                    <button type="submit" class="button button-primary button-hero">
                        🔨 Trigger Build Now
                    </button>
                </form>

                <?php if (!empty($vercel_deploy_hook)): ?>
                    <p class="description" style="margin-top: 15px;">
                        ✅ Vercel Deploy Hook configured<br>
                        Build will be triggered at: <?php echo esc_html($vercel_deploy_hook); ?>
                    </p>
                <?php else: ?>
                    <p class="description error-message" style="margin-top: 15px; color: #dc3232;">
                        ⚠️ Vercel Deploy Hook not configured. Please add it in Settings.
                    </p>
                <?php endif; ?>
            </div>

            <!-- Automatic Triggers Section -->
            <div class="blackboard-admin-card">
                <h2>⚙️ Automatic Sync Triggers</h2>
                <p>Configure when automatic rebuilds should occur.</p>

                <form method="post">
                    <table class="form-table">
                        <tr>
                            <th scope="row">Trigger on Product Changes</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="blackboard_trigger_on_product" value="1"
                                        <?php checked(get_option('blackboard_trigger_on_product', '1'), '1'); ?>>
                                    Automatically rebuild when products are created, updated, or deleted
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Trigger on Course Changes</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="blackboard_trigger_on_course" value="1"
                                        <?php checked(get_option('blackboard_trigger_on_course', '1'), '1'); ?>>
                                    Automatically rebuild when courses are created, updated, or deleted
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Trigger on Video Changes</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="blackboard_trigger_on_video" value="1"
                                        <?php checked(get_option('blackboard_trigger_on_video', '1'), '1'); ?>>
                                    Automatically rebuild when videos are created, updated, or deleted
                                </label>
                            </td>
                        </tr>
                    </table>

                    <input type="hidden" name="save_trigger_settings" value="1">
                    <?php submit_button('Save Trigger Settings'); ?>
                </form>
            </div>

            <!-- Sync History -->
            <div class="blackboard-admin-card">
                <h2>📊 Recent Sync Activity</h2>
                <p>Last 10 automatic and manual sync triggers.</p>

                <?php
                $sync_history = get_option('blackboard_sync_history', array());
                if (!empty($sync_history)):
                ?>
                    <table class="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Type</th>
                                <th>Trigger</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach (array_slice($sync_history, 0, 10) as $entry): ?>
                                <tr>
                                    <td><?php echo esc_html(date('Y-m-d H:i:s', $entry['time'])); ?></td>
                                    <td><?php echo esc_html($entry['type']); ?></td>
                                    <td><?php echo esc_html($entry['trigger']); ?></td>
                                    <td><?php echo esc_html($entry['status']); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <p>No sync history yet.</p>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }

    /**
     * Trigger Vercel build via deploy hook
     */
    private function trigger_vercel_build() {
        $vercel_deploy_hook = get_option('blackboard_vercel_deploy_hook', '');

        if (empty($vercel_deploy_hook)) {
            return false;
        }

        // Make POST request to Vercel deploy hook
        $response = wp_remote_post($vercel_deploy_hook, array(
            'timeout' => 30,
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
        ));

        // Log the sync
        $sync_history = get_option('blackboard_sync_history', array());
        array_unshift($sync_history, array(
            'time' => time(),
            'type' => 'Manual',
            'trigger' => 'Admin Panel',
            'status' => is_wp_error($response) ? 'Failed' : 'Success'
        ));

        // Keep only last 50 entries
        $sync_history = array_slice($sync_history, 0, 50);
        update_option('blackboard_sync_history', $sync_history);

        return !is_wp_error($response);
    }

    public function render_settings_page() {
        // Save settings
        if (isset($_POST['submit'])) {
            update_option('blackboard_nextjs_url', sanitize_text_field($_POST['nextjs_url']));
            update_option('blackboard_webhook_secret', sanitize_text_field($_POST['webhook_secret']));
            update_option('blackboard_revalidate_secret', sanitize_text_field($_POST['revalidate_secret']));
            update_option('blackboard_vercel_deploy_hook', sanitize_text_field($_POST['vercel_deploy_hook']));

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
                        <tr>
                            <th><label for="vercel_deploy_hook">Vercel Deploy Hook URL</label></th>
                            <td>
                                <input type="url" id="vercel_deploy_hook" name="vercel_deploy_hook"
                                       value="<?php echo esc_attr(get_option('blackboard_vercel_deploy_hook', '')); ?>"
                                       class="regular-text" style="width: 100%;"
                                       placeholder="https://api.vercel.com/v1/integrations/deploy/..." />
                                <p class="description">
                                    Get this URL from Vercel Dashboard → Settings → Git → Deploy Hooks<br>
                                    Used for manual and automatic rebuilds in the Sync & Build tab
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

    // ============================================================================
    // COURSE ACCESS MANAGEMENT SYSTEM
    // ============================================================================

    /**
     * Create custom database table for course access
     */
    public function create_course_access_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'blackboard_course_access';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            course_id bigint(20) unsigned NOT NULL,
            granted_date datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            granted_by bigint(20) unsigned DEFAULT NULL,
            order_id bigint(20) unsigned DEFAULT NULL,
            notes text,
            PRIMARY KEY  (id),
            UNIQUE KEY user_course (user_id, course_id),
            KEY user_id (user_id),
            KEY course_id (course_id),
            KEY order_id (order_id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * Initialize course access system
     */
    private function init_course_access_system() {
        // Hook into WooCommerce order completion
        add_action('woocommerce_order_status_completed', array($this, 'grant_course_access_on_order'), 10, 1);
        add_action('woocommerce_order_status_processing', array($this, 'grant_course_access_on_order'), 10, 1);

        // Admin pages
        add_action('admin_menu', array($this, 'add_course_access_admin_menu'), 20);

        // AJAX handlers
        add_action('wp_ajax_bb_add_course_access', array($this, 'ajax_add_course_access'));
        add_action('wp_ajax_bb_delete_course_access', array($this, 'ajax_delete_course_access'));
        add_action('wp_ajax_bb_bulk_grant_access', array($this, 'ajax_bulk_grant_access'));
        add_action('wp_ajax_bb_search_users', array($this, 'ajax_search_users'));
    }

    /**
     * Grant course access when order is completed
     */
    public function grant_course_access_on_order($order_id) {
        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }

        $user_id = $order->get_user_id();
        if (!$user_id) {
            return;
        }

        // Get all items in the order
        foreach ($order->get_items() as $item) {
            $product_id = $item->get_product_id();

            // Find all courses that use this product as billing_product_id
            $args = array(
                'post_type' => 'blackboard-course',
                'posts_per_page' => -1,
                'meta_query' => array(
                    array(
                        'key' => 'billing_product_id',
                        'value' => $product_id,
                        'compare' => '='
                    )
                )
            );

            $courses = get_posts($args);

            foreach ($courses as $course) {
                $this->grant_course_access($user_id, $course->ID, $order_id);
            }
        }
    }

    /**
     * Grant access to a course for a user
     */
    public function grant_course_access($user_id, $course_id, $order_id = null, $granted_by = null, $notes = '') {
        global $wpdb;
        $table_name = $wpdb->prefix . 'blackboard_course_access';

        if (!$granted_by) {
            $granted_by = get_current_user_id();
        }

        // Insert or update access record
        $wpdb->replace(
            $table_name,
            array(
                'user_id' => $user_id,
                'course_id' => $course_id,
                'order_id' => $order_id,
                'granted_by' => $granted_by,
                'notes' => $notes,
                'granted_date' => current_time('mysql')
            ),
            array('%d', '%d', '%d', '%d', '%s', '%s')
        );

        return $wpdb->insert_id;
    }

    /**
     * Check if user has access to a course
     */
    public function check_user_course_access($user_id, $course_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'blackboard_course_access';

        $access = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE user_id = %d AND course_id = %d",
            $user_id,
            $course_id
        ));

        return !is_null($access);
    }

    /**
     * Remove course access
     */
    public function remove_course_access($user_id, $course_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'blackboard_course_access';

        return $wpdb->delete(
            $table_name,
            array(
                'user_id' => $user_id,
                'course_id' => $course_id
            ),
            array('%d', '%d')
        );
    }

    /**
     * Get all courses a user has access to
     */
    public function get_user_courses($user_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'blackboard_course_access';

        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name WHERE user_id = %d ORDER BY granted_date DESC",
            $user_id
        ));
    }

    /**
     * Get all users who have access to a course
     */
    public function get_course_users($course_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'blackboard_course_access';

        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name WHERE course_id = %d ORDER BY granted_date DESC",
            $course_id
        ));
    }

    /**
     * Add admin menu for course access management
     */
    public function add_course_access_admin_menu() {
        add_submenu_page(
            'edit.php?post_type=blackboard-course',
            'User Access Management',
            'User Access',
            'manage_options',
            'blackboard-course-access',
            array($this, 'render_course_access_page')
        );
    }

    /**
     * Render course access management page
     */
    public function render_course_access_page() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'blackboard_course_access';

        // Handle pagination
        $per_page = 50;
        $page = isset($_GET['paged']) ? max(1, intval($_GET['paged'])) : 1;
        $offset = ($page - 1) * $per_page;

        // Get total count of UNIQUE USERS (not access records)
        $total_items = $wpdb->get_var("SELECT COUNT(DISTINCT user_id) FROM $table_name");
        $total_pages = ceil($total_items / $per_page);

        // Get access records grouped by user with all their courses
        $access_records_raw = $wpdb->get_results(
            "SELECT a.*, u.user_login, u.user_email, p.post_title as course_title
            FROM $table_name a
            LEFT JOIN {$wpdb->users} u ON a.user_id = u.ID
            LEFT JOIN {$wpdb->posts} p ON a.course_id = p.ID
            ORDER BY u.user_login ASC, a.granted_date DESC"
        );

        // Group by user
        $users_with_access = array();
        foreach ($access_records_raw as $record) {
            if (!isset($users_with_access[$record->user_id])) {
                $users_with_access[$record->user_id] = array(
                    'user_id' => $record->user_id,
                    'user_login' => $record->user_login,
                    'user_email' => $record->user_email,
                    'access_records' => array()
                );
            }
            $users_with_access[$record->user_id]['access_records'][] = $record;
        }

        // Paginate users
        $users_with_access = array_slice($users_with_access, $offset, $per_page);

        // Only get courses for the dropdown (users will be loaded via AJAX search)
        $courses = get_posts(array(
            'post_type' => 'blackboard-course',
            'posts_per_page' => -1,
            'orderby' => 'title',
            'order' => 'ASC'
        ));

        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline">Course Access Management</h1>
            <a href="#" class="page-title-action" id="bb-add-access-btn">Add New Access</a>
            <hr class="wp-header-end">

            <div class="notice notice-info" style="margin-top: 20px;">
                <p><strong>Automatic Access:</strong> Users automatically get access when they purchase a product linked to a course's "Billing Product ID" field.</p>
                <p><strong>Manual Access:</strong> Use this page to grant or revoke access manually, or for historical data import.</p>
            </div>

            <!-- Add Access Modal -->
            <div id="bb-add-access-modal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:white; padding:30px; box-shadow:0 5px 50px rgba(0,0,0,0.3); z-index:999999; border-radius:8px; min-width:500px;">
                <h2>Grant Course Access</h2>
                <form id="bb-add-access-form">
                    <table class="form-table">
                        <tr>
                            <th><label for="bb-user-select">User</label></th>
                            <td>
                                <select name="user_id" id="bb-user-select" required style="width:100%;">
                                    <option value="">Type to search...</option>
                                </select>
                                <p class="description"><strong>Start typing (minimum 2 characters)</strong> to search users by name, username, or email. Uses AJAX search - no dropdown limit.</p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="bb-course-select">Course</label></th>
                            <td>
                                <select name="course_id" id="bb-course-select" required style="width:100%;">
                                    <option value="">Select a course...</option>
                                    <?php foreach ($courses as $course): ?>
                                        <option value="<?php echo esc_attr($course->ID); ?>">
                                            <?php echo esc_html($course->post_title); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="bb-access-notes">Notes (Optional)</label></th>
                            <td>
                                <textarea name="notes" id="bb-access-notes" rows="3" style="width:100%;"></textarea>
                            </td>
                        </tr>
                    </table>
                    <p class="submit">
                        <button type="submit" class="button button-primary">Grant Access</button>
                        <button type="button" class="button" id="bb-cancel-access-btn">Cancel</button>
                    </p>
                </form>
            </div>
            <div id="bb-modal-overlay" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:999998;"></div>

            <!-- Access Records Table - Grouped by User -->
            <table class="wp-list-table widefat fixed" style="margin-top:20px;">
                <thead>
                    <tr>
                        <th style="width: 220px;">User</th>
                        <th style="width: 250px;">Email</th>
                        <th>Courses & Access</th>
                        <th style="width: 150px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($users_with_access)): ?>
                        <tr>
                            <td colspan="4" style="text-align:center; padding:40px;">
                                No access records found. Grant access manually or wait for automatic grants from completed orders.
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($users_with_access as $user_data): ?>
                            <tr style="border-bottom: 1px solid #e5e5e5;">
                                <td style="padding: 12px 8px;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <div>
                                            <strong style="font-size: 14px;"><?php echo esc_html($user_data['user_login']); ?></strong>
                                            <br><small style="color: #666;">ID: <?php echo esc_html($user_data['user_id']); ?></small>
                                        </div>
                                    </div>
                                </td>
                                <td style="padding: 12px 8px;">
                                    <span style="color: #666;"><?php echo esc_html($user_data['user_email']); ?></span>
                                </td>
                                <td style="padding: 12px 8px;">
                                    <div style="display: flex; flex-direction: column; gap: 8px;">
                                        <?php foreach ($user_data['access_records'] as $record): ?>
                                            <div style="background: #f8f9fa; border-left: 3px solid #2271b1; padding: 8px 12px; border-radius: 3px;">
                                                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                                                    <div style="flex: 1; min-width: 200px;">
                                                        <strong style="color: #2271b1; font-size: 13px;"><?php echo esc_html($record->course_title); ?></strong>
                                                        <small style="color: #999; margin-left: 4px;">(ID: <?php echo esc_html($record->course_id); ?>)</small>
                                                    </div>
                                                    <div style="display: flex; align-items: center; gap: 8px;">
                                                        <?php if ($record->order_id): ?>
                                                            <a href="<?php echo admin_url('post.php?post=' . $record->order_id . '&action=edit'); ?>"
                                                               class="button button-small"
                                                               title="View Order #<?php echo esc_attr($record->order_id); ?>"
                                                               style="text-decoration: none;">
                                                                📦 Order #<?php echo esc_html($record->order_id); ?>
                                                            </a>
                                                        <?php else: ?>
                                                            <span style="background: #ffc107; color: #000; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;">
                                                                ✋ MANUAL
                                                            </span>
                                                        <?php endif; ?>
                                                        <span style="color: #999; font-size: 12px;" title="Granted on <?php echo esc_attr(date('M j, Y g:i a', strtotime($record->granted_date))); ?>">
                                                            📅 <?php echo esc_html(date('M j, Y', strtotime($record->granted_date))); ?>
                                                        </span>
                                                        <?php if ($record->notes): ?>
                                                            <span title="<?php echo esc_attr($record->notes); ?>" style="cursor: help;">
                                                                💬
                                                            </span>
                                                        <?php endif; ?>
                                                        <button class="button button-small bb-delete-access"
                                                                data-user-id="<?php echo esc_attr($record->user_id); ?>"
                                                                data-course-id="<?php echo esc_attr($record->course_id); ?>"
                                                                data-user-name="<?php echo esc_attr($user_data['user_login']); ?>"
                                                                data-course-name="<?php echo esc_attr($record->course_title); ?>"
                                                                style="color: #b32d2e;"
                                                                title="Revoke access to this course">
                                                            ❌ Revoke
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                </td>
                                <td style="padding: 12px 8px;">
                                    <a href="<?php echo admin_url('user-edit.php?user_id=' . $user_data['user_id']); ?>"
                                       class="button button-primary"
                                       target="_blank"
                                       style="width: 100%; text-align: center;">
                                        👤 View User
                                    </a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>

            <!-- Pagination -->
            <?php if ($total_pages > 1): ?>
                <div class="tablenav bottom">
                    <div class="tablenav-pages">
                        <span class="displaying-num"><?php echo number_format($total_items); ?> items</span>
                        <?php
                        echo paginate_links(array(
                            'base' => add_query_arg('paged', '%#%'),
                            'format' => '',
                            'prev_text' => '&laquo;',
                            'next_text' => '&raquo;',
                            'total' => $total_pages,
                            'current' => $page
                        ));
                        ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>

        <script>
        jQuery(document).ready(function($) {
            // Function to initialize Select2
            function initializeUserSelect() {
                // Destroy existing Select2 if it exists
                if ($('#bb-user-select').hasClass('select2-hidden-accessible')) {
                    $('#bb-user-select').select2('destroy');
                }

                // Initialize Select2 with AJAX user search
                $('#bb-user-select').select2({
                    ajax: {
                        url: ajaxurl,
                        dataType: 'json',
                        delay: 250,
                        data: function(params) {
                            return {
                                action: 'bb_search_users',
                                search: params.term,
                                page: params.page || 1
                            };
                        },
                        processResults: function(data, params) {
                            params.page = params.page || 1;
                            console.log('Select2 AJAX response:', data); // Debug logging
                            return {
                                results: data.results || [],
                                pagination: {
                                    more: data.more || false
                                }
                            };
                        },
                        error: function(xhr, status, error) {
                            console.error('Select2 AJAX error:', error, xhr.responseText);
                        },
                        cache: true
                    },
                    minimumInputLength: 2,
                    placeholder: 'Type at least 2 characters to search users...',
                    allowClear: true,
                    width: '100%',
                    dropdownParent: $('#bb-add-access-modal'), // IMPORTANT: Set dropdown parent to modal
                    language: {
                        inputTooShort: function() {
                            return 'Please enter 2 or more characters to search';
                        },
                        searching: function() {
                            return 'Searching users...';
                        },
                        noResults: function() {
                            return 'No users found';
                        }
                    }
                });
            }

            // Initialize Select2 on page load
            initializeUserSelect();

            // Show add access modal
            $('#bb-add-access-btn').click(function(e) {
                e.preventDefault();
                $('#bb-add-access-modal, #bb-modal-overlay').fadeIn();
                // Re-initialize Select2 when modal opens to ensure it's clickable
                setTimeout(function() {
                    initializeUserSelect();
                    // Focus on the select field
                    $('#bb-user-select').select2('open');
                }, 100);
            });

            // Hide modal
            $('#bb-cancel-access-btn, #bb-modal-overlay').click(function() {
                $('#bb-add-access-modal, #bb-modal-overlay').fadeOut();
                // Clear Select2 selection when closing modal
                $('#bb-user-select').val(null).trigger('change');
            });

            // Add access form submission
            $('#bb-add-access-form').submit(function(e) {
                e.preventDefault();
                var formData = $(this).serialize();

                $.post(ajaxurl, formData + '&action=bb_add_course_access', function(response) {
                    if (response.success) {
                        alert('Access granted successfully!');
                        location.reload();
                    } else {
                        alert('Error: ' + response.data.message);
                    }
                });
            });

            // Delete access
            $('.bb-delete-access').click(function() {
                var userId = $(this).data('user-id');
                var courseId = $(this).data('course-id');
                var userName = $(this).data('user-name');
                var courseName = $(this).data('course-name');

                if (confirm('Revoke access for ' + userName + ' to "' + courseName + '"?')) {
                    $.post(ajaxurl, {
                        action: 'bb_delete_course_access',
                        user_id: userId,
                        course_id: courseId
                    }, function(response) {
                        if (response.success) {
                            alert('Access revoked successfully!');
                            location.reload();
                        } else {
                            alert('Error: ' + response.data.message);
                        }
                    });
                }
            });
        });
        </script>
        <?php
    }

    /**
     * AJAX: Add course access
     */
    public function ajax_add_course_access() {
        check_ajax_referer('wp_rest', '_wpnonce', false);

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permission denied'));
        }

        $user_id = intval($_POST['user_id']);
        $course_id = intval($_POST['course_id']);
        $notes = sanitize_textarea_field($_POST['notes']);

        if (!$user_id || !$course_id) {
            wp_send_json_error(array('message' => 'Invalid user or course ID'));
        }

        $this->grant_course_access($user_id, $course_id, null, get_current_user_id(), $notes);

        wp_send_json_success(array('message' => 'Access granted'));
    }

    /**
     * AJAX: Delete course access
     */
    public function ajax_delete_course_access() {
        check_ajax_referer('wp_rest', '_wpnonce', false);

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permission denied'));
        }

        $user_id = intval($_POST['user_id']);
        $course_id = intval($_POST['course_id']);

        if (!$user_id || !$course_id) {
            wp_send_json_error(array('message' => 'Invalid user or course ID'));
        }

        $this->remove_course_access($user_id, $course_id);

        wp_send_json_success(array('message' => 'Access revoked'));
    }

    /**
     * AJAX: Search users for Select2 dropdown
     */
    public function ajax_search_users() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permission denied'));
        }

        global $wpdb;

        $search = isset($_GET['search']) ? sanitize_text_field($_GET['search']) : '';
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        $per_page = 50;
        $offset = ($page - 1) * $per_page;

        // Build search query
        $where = '1=1';
        if (!empty($search)) {
            $search_like = '%' . $wpdb->esc_like($search) . '%';
            $where = $wpdb->prepare(
                "(user_login LIKE %s OR user_email LIKE %s OR display_name LIKE %s)",
                $search_like,
                $search_like,
                $search_like
            );
        }

        // Get total count for pagination
        $total = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->users} WHERE $where");

        // Get users
        $users = $wpdb->get_results($wpdb->prepare(
            "SELECT ID, user_login, user_email, display_name
            FROM {$wpdb->users}
            WHERE $where
            ORDER BY display_name ASC
            LIMIT %d OFFSET %d",
            $per_page,
            $offset
        ));

        // Format results for Select2
        $results = array();
        foreach ($users as $user) {
            $results[] = array(
                'id' => $user->ID,
                'text' => sprintf('%s (%s)', $user->display_name, $user->user_email)
            );
        }

        // Check if there are more results
        $more = ($offset + $per_page) < $total;

        wp_send_json(array(
            'results' => $results,
            'more' => $more
        ));
    }

    /**
     * AJAX: Bulk grant access (for CSV import)
     */
    public function ajax_bulk_grant_access() {
        check_ajax_referer('wp_rest', '_wpnonce', false);

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permission denied'));
        }

        $access_data = json_decode(stripslashes($_POST['access_data']), true);

        if (!is_array($access_data)) {
            wp_send_json_error(array('message' => 'Invalid data format'));
        }

        $granted = 0;
        foreach ($access_data as $row) {
            if (isset($row['user_id']) && isset($row['course_id'])) {
                $this->grant_course_access(
                    intval($row['user_id']),
                    intval($row['course_id']),
                    isset($row['order_id']) ? intval($row['order_id']) : null,
                    get_current_user_id(),
                    isset($row['notes']) ? $row['notes'] : ''
                );
                $granted++;
            }
        }

        wp_send_json_success(array('message' => "$granted access records created"));
    }

    /**
     * ===================================================================
     * RESELLER PRICING SYSTEM (v4.3.0)
     * ===================================================================
     * Provides bulk pricing discounts for users with "reseller" role
     * - Per-product configuration (min quantity, EUR price, USD price)
     * - Works for simple and variable products (single price applies to all variations)
     * - Automatically exposed via WooCommerce REST API
     * - Frontend applies discounts when quantity threshold is met
     */

    /**
     * Initialize reseller pricing functionality
     */
    private function init_reseller_pricing() {
        // Add product data tab
        add_filter('woocommerce_product_data_tabs', array($this, 'add_reseller_pricing_tab'));

        // Add tab content
        add_action('woocommerce_product_data_panels', array($this, 'add_reseller_pricing_panel'));

        // Save reseller pricing data
        add_action('woocommerce_process_product_meta', array($this, 'save_reseller_pricing_data'));

        // Expose reseller pricing in REST API (applies to all product types)
        add_filter('woocommerce_rest_prepare_product_object', array($this, 'add_reseller_pricing_to_api'), 10, 3);
    }

    /**
     * Add reseller pricing tab to product data
     */
    public function add_reseller_pricing_tab($tabs) {
        $tabs['reseller_pricing'] = array(
            'label' => __('Reseller Pricing', 'blackboard-headless-options'),
            'target' => 'reseller_pricing_product_data',
            'class' => array('show_if_simple', 'show_if_variable'),
            'priority' => 80,
        );
        return $tabs;
    }

    /**
     * Add reseller pricing panel content
     */
    public function add_reseller_pricing_panel() {
        global $post;

        // Get product type
        $product = wc_get_product($post->ID);
        $is_variable = $product && $product->is_type('variable');
        ?>
        <div id="reseller_pricing_product_data" class="panel woocommerce_options_panel">
            <div class="options_group">
                <?php if ($is_variable): ?>
                    <!-- Variable Product: Show warning notice -->
                    <p class="form-field" style="background: #fff3cd; padding: 16px; border-left: 4px solid #ffc107; margin: 15px 12px;">
                        <label style="font-weight: bold; color: #856404; font-size: 14px;">⚠️ Variable Product Notice</label><br/>
                        <span class="description" style="color: #856404; font-size: 13px; line-height: 1.6;">
                            This is a variable product. <strong>Reseller prices set below will override the prices of ALL variations.</strong><br>
                            Individual per-variation reseller pricing is not supported.
                        </span>
                    </p>
                <?php endif; ?>

                <?php
                woocommerce_wp_checkbox(
                    array(
                        'id' => '_reseller_pricing_enabled',
                        'label' => __('Enable Reseller Pricing', 'blackboard-headless-options'),
                        'description' => __('Enable special pricing for resellers who purchase in bulk', 'blackboard-headless-options'),
                    )
                );

                woocommerce_wp_text_input(
                    array(
                        'id' => '_reseller_min_quantity',
                        'label' => __('Minimum Quantity', 'blackboard-headless-options'),
                        'placeholder' => '10',
                        'description' => __('Minimum quantity required to get reseller pricing (e.g., 10 means "10 or more")', 'blackboard-headless-options'),
                        'type' => 'number',
                        'custom_attributes' => array(
                            'step' => '1',
                            'min' => '1',
                        ),
                    )
                );

                woocommerce_wp_text_input(
                    array(
                        'id' => '_reseller_price_eur',
                        'label' => __('Reseller Price EUR', 'blackboard-headless-options') . ' (€)',
                        'placeholder' => '0.00',
                        'description' => __('Price in EUR for resellers when minimum quantity is met', 'blackboard-headless-options'),
                        'type' => 'number',
                        'custom_attributes' => array(
                            'step' => '0.01',
                            'min' => '0',
                        ),
                    )
                );

                woocommerce_wp_text_input(
                    array(
                        'id' => '_reseller_price_usd',
                        'label' => __('Reseller Price USD', 'blackboard-headless-options') . ' ($)',
                        'placeholder' => '0.00',
                        'description' => __('Price in USD for resellers when minimum quantity is met', 'blackboard-headless-options'),
                        'type' => 'number',
                        'custom_attributes' => array(
                            'step' => '0.01',
                            'min' => '0',
                        ),
                    )
                );
                ?>

                <p class="form-field">
                    <label style="font-weight: bold; color: #2271b1;">How Reseller Pricing Works:</label><br/>
                    <span class="description">
                        When a user with the "Reseller" role adds this product to their cart and the quantity meets or exceeds the minimum quantity,
                        the reseller price will be automatically applied. The discount will be shown visually in the cart.
                    </span>
                </p>
            </div>
        </div>
        <?php
    }


    /**
     * Save reseller pricing data
     */
    public function save_reseller_pricing_data($post_id) {
        $enabled = isset($_POST['_reseller_pricing_enabled']) ? 'yes' : 'no';
        update_post_meta($post_id, '_reseller_pricing_enabled', $enabled);

        // Min quantity - only save if not empty and greater than 0
        if (isset($_POST['_reseller_min_quantity']) && $_POST['_reseller_min_quantity'] !== '') {
            $min_qty = absint($_POST['_reseller_min_quantity']);
            if ($min_qty > 0) {
                update_post_meta($post_id, '_reseller_min_quantity', $min_qty);
            }
        }

        // EUR price - only save if not empty
        if (isset($_POST['_reseller_price_eur']) && $_POST['_reseller_price_eur'] !== '') {
            $price = sanitize_text_field($_POST['_reseller_price_eur']);
            update_post_meta($post_id, '_reseller_price_eur', $price);
        }

        // USD price - only save if not empty
        if (isset($_POST['_reseller_price_usd']) && $_POST['_reseller_price_usd'] !== '') {
            $price = sanitize_text_field($_POST['_reseller_price_usd']);
            update_post_meta($post_id, '_reseller_price_usd', $price);
        }
    }


    /**
     * Add reseller pricing to WooCommerce REST API response
     */
    public function add_reseller_pricing_to_api($response, $product, $request) {
        $product_id = $product->get_id();

        $reseller_pricing = array(
            'enabled' => get_post_meta($product_id, '_reseller_pricing_enabled', true) === 'yes',
            'min_quantity' => (int) get_post_meta($product_id, '_reseller_min_quantity', true),
            'price_eur' => get_post_meta($product_id, '_reseller_price_eur', true),
            'price_usd' => get_post_meta($product_id, '_reseller_price_usd', true),
        );

        $response->data['reseller_pricing'] = $reseller_pricing;

        return $response;
    }

    // ==========================================
    // COACH FINDER FUNCTIONALITY (v4.7.0)
    // ==========================================

    /**
     * Initialize Coach Finder
     */
    private function init_coach_finder() {
        add_action('init', array($this, 'register_coach_post_type'));
        add_action('add_meta_boxes', array($this, 'add_coach_meta_boxes'));
        add_action('save_post_bb_procoach', array($this, 'save_coach_meta'), 10, 3);
        add_action('rest_api_init', array($this, 'register_coach_rest_route'));
    }

    /**
     * Register Coach Custom Post Type
     */
    public function register_coach_post_type() {
        register_post_type('bb_procoach', array(
            'labels' => array(
                'name' => 'ProCoaches',
                'singular_name' => 'ProCoach',
                'add_new_item' => 'Add New ProCoach',
                'edit_item' => 'Edit ProCoach',
                'all_items' => 'All ProCoaches',
            ),
            'public' => true,
            'show_in_menu' => true,
            'menu_icon' => 'dashicons-location-alt',
            'menu_position' => 21,
            'supports' => array('title', 'thumbnail'),
            'show_in_rest' => false,
        ));
    }

    /**
     * Add Meta Boxes for Coach
     */
    public function add_coach_meta_boxes() {
        add_meta_box(
            'coach_details',
            'ProCoach Details',
            array($this, 'render_coach_meta_box'),
            'bb_procoach',
            'normal',
            'high'
        );
    }

    /**
     * Render Coach Meta Box
     */
    public function render_coach_meta_box($post) {
        wp_nonce_field('coach_meta', 'coach_nonce');

        $name = get_post_meta($post->ID, 'bb_coach_name', true);
        $company = get_post_meta($post->ID, 'bb_coach_company', true);
        $addr = get_post_meta($post->ID, 'bb_coach_address', true);
        $lat = get_post_meta($post->ID, 'bb_coach_lat', true);
        $lng = get_post_meta($post->ID, 'bb_coach_lng', true);
        $phone = get_post_meta($post->ID, 'bb_coach_phone', true);
        $mail = get_post_meta($post->ID, 'bb_coach_email', true);
        $web = get_post_meta($post->ID, 'bb_coach_website', true);
        $cert = get_post_meta($post->ID, 'bb_coach_cert_date', true);
        $spec = get_post_meta($post->ID, 'bb_coach_specialties', true);
        ?>
        <table class="form-table">
            <tr>
                <th><label for="bb_coach_name">Coach Name *</label></th>
                <td><input type="text" id="bb_coach_name" name="bb_coach_name" value="<?php echo esc_attr($name); ?>" class="regular-text" required></td>
            </tr>
            <tr>
                <th><label for="bb_coach_company">Company/Studio</label></th>
                <td><input type="text" id="bb_coach_company" name="bb_coach_company" value="<?php echo esc_attr($company); ?>" class="regular-text"></td>
            </tr>
            <tr>
                <th><label for="bb_coach_address">Address *</label></th>
                <td><textarea id="bb_coach_address" name="bb_coach_address" rows="3" class="large-text" required><?php echo esc_textarea($addr); ?></textarea></td>
            </tr>
            <tr>
                <th><label for="bb_coach_lat">Latitude *</label></th>
                <td><input type="text" id="bb_coach_lat" name="bb_coach_lat" value="<?php echo esc_attr($lat); ?>" class="regular-text" placeholder="48.2082" required></td>
            </tr>
            <tr>
                <th><label for="bb_coach_lng">Longitude *</label></th>
                <td><input type="text" id="bb_coach_lng" name="bb_coach_lng" value="<?php echo esc_attr($lng); ?>" class="regular-text" placeholder="16.3738" required></td>
            </tr>
            <tr>
                <th><label for="bb_coach_phone">Phone</label></th>
                <td><input type="tel" id="bb_coach_phone" name="bb_coach_phone" value="<?php echo esc_attr($phone); ?>" class="regular-text"></td>
            </tr>
            <tr>
                <th><label for="bb_coach_email">Email *</label></th>
                <td><input type="email" id="bb_coach_email" name="bb_coach_email" value="<?php echo esc_attr($mail); ?>" class="regular-text" required></td>
            </tr>
            <tr>
                <th><label for="bb_coach_website">Website</label></th>
                <td><input type="url" id="bb_coach_website" name="bb_coach_website" value="<?php echo esc_attr($web); ?>" class="regular-text"></td>
            </tr>
            <tr>
                <th><label for="bb_coach_cert_date">Certification Date</label></th>
                <td><input type="date" id="bb_coach_cert_date" name="bb_coach_cert_date" value="<?php echo esc_attr($cert); ?>" class="regular-text"></td>
            </tr>
            <tr>
                <th><label for="bb_coach_specialties">Specialties</label></th>
                <td><textarea id="bb_coach_specialties" name="bb_coach_specialties" rows="3" class="large-text"><?php echo esc_textarea($spec); ?></textarea></td>
            </tr>
        </table>
        <?php
    }

    /**
     * Save Coach Meta
     */
    public function save_coach_meta($post_id, $post, $update) {
        if (!isset($_POST['coach_nonce']) || !wp_verify_nonce($_POST['coach_nonce'], 'coach_meta')) return;
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;

        $fields = array('bb_coach_name', 'bb_coach_company', 'bb_coach_lat', 'bb_coach_lng', 'bb_coach_phone', 'bb_coach_email', 'bb_coach_website', 'bb_coach_cert_date');
        foreach ($fields as $field) {
            if (isset($_POST[$field])) {
                update_post_meta($post_id, $field, sanitize_text_field($_POST[$field]));
            }
        }

        if (isset($_POST['bb_coach_address'])) {
            update_post_meta($post_id, 'bb_coach_address', sanitize_textarea_field($_POST['bb_coach_address']));
        }
        if (isset($_POST['bb_coach_specialties'])) {
            update_post_meta($post_id, 'bb_coach_specialties', sanitize_textarea_field($_POST['bb_coach_specialties']));
        }
    }

    /**
     * Register Coach REST API Route
     */
    public function register_coach_rest_route() {
        register_rest_route('blackboard/v1', '/procoaches', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_coaches_api'),
            'permission_callback' => '__return_true',
        ));
    }

    /**
     * Get All Coaches API
     */
    public function get_coaches_api() {
        $coaches = get_posts(array(
            'post_type' => 'bb_procoach',
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ));

        $result = array();
        foreach ($coaches as $coach) {
            $thumb_id = get_post_thumbnail_id($coach->ID);
            $img = $thumb_id ? wp_get_attachment_image_url($thumb_id, 'medium') : null;

            $result[] = array(
                'id' => $coach->ID,
                'title' => $coach->post_title,
                'slug' => $coach->post_name,
                'coach_name' => get_post_meta($coach->ID, 'bb_coach_name', true),
                'company_name' => get_post_meta($coach->ID, 'bb_coach_company', true),
                'address' => get_post_meta($coach->ID, 'bb_coach_address', true),
                'latitude' => floatval(get_post_meta($coach->ID, 'bb_coach_lat', true)),
                'longitude' => floatval(get_post_meta($coach->ID, 'bb_coach_lng', true)),
                'phone' => get_post_meta($coach->ID, 'bb_coach_phone', true),
                'email' => get_post_meta($coach->ID, 'bb_coach_email', true),
                'website' => get_post_meta($coach->ID, 'bb_coach_website', true),
                'certification_date' => get_post_meta($coach->ID, 'bb_coach_cert_date', true),
                'specialties' => get_post_meta($coach->ID, 'bb_coach_specialties', true),
                'image_url' => $img,
                'date' => $coach->post_date,
                'modified' => $coach->post_modified,
            );
        }

        return rest_ensure_response($result);
    }

}

// Initialize the plugin
new BlackBoardHeadlessSync();