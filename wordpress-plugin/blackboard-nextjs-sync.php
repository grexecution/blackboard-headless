<?php
/**
 * Plugin Name: BlackBoard Next.js Sync
 * Description: Automatically triggers Next.js revalidation when WooCommerce products are updated
 * Version: 1.0.0
 * Author: BlackBoard Training
 * Text Domain: blackboard-nextjs-sync
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class BlackBoardNextJSSync {
    
    private $nextjs_url;
    private $revalidate_secret;
    
    public function __construct() {
        // Get settings from WordPress options
        $this->nextjs_url = get_option('blackboard_nextjs_url', 'https://your-nextjs-site.vercel.app');
        $this->revalidate_secret = get_option('blackboard_revalidate_secret', '');
        
        // Hook into WooCommerce product actions
        add_action('woocommerce_new_product', array($this, 'on_product_created'), 10, 1);
        add_action('woocommerce_update_product', array($this, 'on_product_updated'), 10, 1);
        add_action('woocommerce_delete_product', array($this, 'on_product_deleted'), 10, 1);
        add_action('woocommerce_trash_product', array($this, 'on_product_deleted'), 10, 1);
        add_action('untrashed_post', array($this, 'on_product_restored'), 10, 1);
        
        // Hook into stock changes
        add_action('woocommerce_product_set_stock', array($this, 'on_stock_updated'));
        add_action('woocommerce_variation_set_stock', array($this, 'on_stock_updated'));
        
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Add admin notices
        add_action('admin_notices', array($this, 'admin_notices'));
    }
    
    /**
     * Trigger revalidation when product is created
     */
    public function on_product_created($product_id) {
        $product = wc_get_product($product_id);
        if (!$product) return;
        
        $this->trigger_revalidation('product.created', $product->get_slug());
    }
    
    /**
     * Trigger revalidation when product is updated
     */
    public function on_product_updated($product_id) {
        $product = wc_get_product($product_id);
        if (!$product) return;
        
        $this->trigger_revalidation('product.updated', $product->get_slug());
    }
    
    /**
     * Trigger revalidation when product is deleted
     */
    public function on_product_deleted($product_id) {
        $this->trigger_revalidation('product.deleted');
    }
    
    /**
     * Trigger revalidation when product is restored
     */
    public function on_product_restored($post_id) {
        if (get_post_type($post_id) !== 'product') return;
        
        $product = wc_get_product($post_id);
        if (!$product) return;
        
        $this->trigger_revalidation('product.restored', $product->get_slug());
    }
    
    /**
     * Trigger revalidation when stock is updated
     */
    public function on_stock_updated($product) {
        if (!$product) return;
        
        $slug = $product->get_slug();
        if (empty($slug) && $product->get_parent_id()) {
            $parent = wc_get_product($product->get_parent_id());
            $slug = $parent ? $parent->get_slug() : '';
        }
        
        $this->trigger_revalidation('product.updated', $slug);
    }
    
    /**
     * Send revalidation request to Next.js
     */
    private function trigger_revalidation($action, $slug = '') {
        if (empty($this->nextjs_url) || empty($this->revalidate_secret)) {
            error_log('[BlackBoard Sync] Missing configuration for Next.js sync');
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
            error_log('[BlackBoard Sync] Failed to trigger revalidation: ' . $response->get_error_message());
            return false;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        
        if ($status_code === 200) {
            error_log('[BlackBoard Sync] Successfully triggered revalidation for action: ' . $action);
            return true;
        } else {
            error_log('[BlackBoard Sync] Revalidation failed with status ' . $status_code . ': ' . $body);
            return false;
        }
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_submenu_page(
            'woocommerce',
            'Next.js Sync Settings',
            'Next.js Sync',
            'manage_woocommerce',
            'blackboard-nextjs-sync',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Admin page
     */
    public function admin_page() {
        // Handle form submission
        if (isset($_POST['submit'])) {
            if (wp_verify_nonce($_POST['_wpnonce'], 'blackboard_nextjs_sync')) {
                update_option('blackboard_nextjs_url', sanitize_url($_POST['nextjs_url']));
                update_option('blackboard_revalidate_secret', sanitize_text_field($_POST['revalidate_secret']));
                
                // Update class properties
                $this->nextjs_url = get_option('blackboard_nextjs_url');
                $this->revalidate_secret = get_option('blackboard_revalidate_secret');
                
                echo '<div class="notice notice-success"><p>Settings saved successfully!</p></div>';
            }
        }
        
        // Handle manual sync
        if (isset($_POST['manual_sync'])) {
            if (wp_verify_nonce($_POST['_wpnonce'], 'blackboard_nextjs_sync')) {
                $result = $this->trigger_revalidation('manual.sync');
                if ($result) {
                    echo '<div class="notice notice-success"><p>Manual sync triggered successfully!</p></div>';
                } else {
                    echo '<div class="notice notice-error"><p>Manual sync failed. Check your settings.</p></div>';
                }
            }
        }
        
        ?>
        <div class="wrap">
            <h1>Next.js Sync Settings</h1>
            
            <form method="post" action="">
                <?php wp_nonce_field('blackboard_nextjs_sync'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="nextjs_url">Next.js Site URL</label>
                        </th>
                        <td>
                            <input type="url" 
                                   id="nextjs_url" 
                                   name="nextjs_url" 
                                   value="<?php echo esc_attr($this->nextjs_url); ?>" 
                                   class="regular-text" 
                                   placeholder="https://your-site.vercel.app" />
                            <p class="description">The URL of your Next.js frontend (without trailing slash)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="revalidate_secret">Revalidation Secret</label>
                        </th>
                        <td>
                            <input type="text" 
                                   id="revalidate_secret" 
                                   name="revalidate_secret" 
                                   value="<?php echo esc_attr($this->revalidate_secret); ?>" 
                                   class="regular-text" />
                            <p class="description">Must match the REVALIDATE_SECRET in your Next.js .env file</p>
                        </td>
                    </tr>
                </table>
                
                <p class="submit">
                    <input type="submit" name="submit" class="button-primary" value="Save Settings" />
                    <input type="submit" name="manual_sync" class="button-secondary" value="Trigger Manual Sync" />
                </p>
            </form>
            
            <hr />
            
            <h2>How It Works</h2>
            <p>This plugin automatically triggers Next.js page revalidation when:</p>
            <ul style="list-style-type: disc; margin-left: 20px;">
                <li>A WooCommerce product is created, updated, or deleted</li>
                <li>Product stock levels change</li>
                <li>You manually trigger a sync using the button above</li>
            </ul>
            
            <h2>Manual Revalidation URLs</h2>
            <p>You can also trigger revalidation manually using these URLs:</p>
            <ul style="list-style-type: disc; margin-left: 20px;">
                <li><strong>Revalidate All:</strong><br/>
                    <code><?php echo esc_html($this->nextjs_url); ?>/api/revalidate?secret=YOUR_SECRET&type=all</code>
                </li>
                <li><strong>Revalidate Shop:</strong><br/>
                    <code><?php echo esc_html($this->nextjs_url); ?>/api/revalidate?secret=YOUR_SECRET&type=shop</code>
                </li>
            </ul>
            
            <h2>Testing</h2>
            <p>To test the connection:</p>
            <ol style="list-style-type: decimal; margin-left: 20px;">
                <li>Enter your Next.js URL and secret above</li>
                <li>Save the settings</li>
                <li>Click "Trigger Manual Sync"</li>
                <li>Check your Next.js logs for revalidation messages</li>
            </ol>
        </div>
        <?php
    }
    
    /**
     * Display admin notices
     */
    public function admin_notices() {
        if (empty($this->nextjs_url) || empty($this->revalidate_secret)) {
            $screen = get_current_screen();
            if ($screen && $screen->id === 'woocommerce_page_blackboard-nextjs-sync') {
                return; // Don't show on the settings page itself
            }
            ?>
            <div class="notice notice-warning">
                <p>
                    <strong>BlackBoard Next.js Sync:</strong> 
                    Please configure your Next.js sync settings. 
                    <a href="<?php echo admin_url('admin.php?page=blackboard-nextjs-sync'); ?>">Configure Now</a>
                </p>
            </div>
            <?php
        }
    }
}

// Initialize the plugin
new BlackBoardNextJSSync();