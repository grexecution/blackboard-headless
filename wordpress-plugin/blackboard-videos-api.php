<?php
/**
 * Plugin Name: BlackBoard Videos API
 * Description: Extends WordPress REST API for Video CPT with ACF fields and Next.js integration
 * Version: 1.0.0
 * Author: BlackBoard Training
 * Text Domain: blackboard-videos-api
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class BlackBoardVideosAPI {

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
    }

    /**
     * Register additional REST API fields
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
            return;
        }

        $webhook_url = trailingslashit($nextjs_url) . 'api/webhook/rebuild';

        $body = array(
            'secret' => $webhook_secret,
            'action' => $action,
            'type' => 'video',
            'slug' => $slug,
            'timestamp' => current_time('mysql'),
        );

        wp_remote_post($webhook_url, array(
            'body' => json_encode($body),
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'timeout' => 5,
            'blocking' => false,
        ));
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

// Admin settings page
add_action('admin_menu', function() {
    add_submenu_page(
        'edit.php?post_type=video',
        'Video API Settings',
        'API Settings',
        'manage_options',
        'video-api-settings',
        'blackboard_video_api_settings_page'
    );
});

function blackboard_video_api_settings_page() {
    // Save settings
    if (isset($_POST['submit'])) {
        update_option('blackboard_nextjs_url', sanitize_text_field($_POST['nextjs_url']));
        update_option('blackboard_webhook_secret', sanitize_text_field($_POST['webhook_secret']));
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }

    $nextjs_url = get_option('blackboard_nextjs_url', '');
    $webhook_secret = get_option('blackboard_webhook_secret', '');
    ?>
    <div class="wrap">
        <h1>Video API Settings</h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th><label for="nextjs_url">Next.js URL</label></th>
                    <td>
                        <input type="url" id="nextjs_url" name="nextjs_url" value="<?php echo esc_attr($nextjs_url); ?>" class="regular-text" />
                        <p class="description">Your Next.js site URL (e.g., https://your-site.vercel.app)</p>
                    </td>
                </tr>
                <tr>
                    <th><label for="webhook_secret">Webhook Secret</label></th>
                    <td>
                        <input type="text" id="webhook_secret" name="webhook_secret" value="<?php echo esc_attr($webhook_secret); ?>" class="regular-text" />
                        <p class="description">Secret key for webhook authentication</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>

        <h2>API Endpoints</h2>
        <p>The following REST API endpoints are available:</p>
        <ul>
            <li><code><?php echo home_url('/wp-json/wp/v2/video'); ?></code> - All videos</li>
            <li><code><?php echo home_url('/wp-json/wp/v2/video_cat'); ?></code> - Video categories</li>
            <li><code><?php echo home_url('/wp-json/blackboard/v1/videos'); ?></code> - Filtered videos</li>
            <li><code><?php echo home_url('/wp-json/blackboard/v1/videos/category/{slug}'); ?></code> - Videos by category</li>
            <li><code><?php echo home_url('/wp-json/blackboard/v1/videos/access/{id}'); ?></code> - Check video access</li>
        </ul>
    </div>
    <?php
}