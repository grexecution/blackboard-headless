<?php
/**
 * Plugin Name: BlackBoard Video CPT Admin
 * Description: Creates and manages Video Custom Post Type with admin interface for course videos
 * Version: 1.0.0
 * Author: BlackBoard Training
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class BlackBoardVideoCPT {

    public function __construct() {
        // Register the Video CPT
        add_action('init', array($this, 'register_video_cpt'));
        add_action('init', array($this, 'register_video_taxonomies'));

        // Add meta boxes
        add_action('add_meta_boxes', array($this, 'add_video_meta_boxes'));
        add_action('save_post_video', array($this, 'save_video_meta'), 10, 2);

        // Customize admin columns
        add_filter('manage_video_posts_columns', array($this, 'set_custom_columns'));
        add_action('manage_video_posts_custom_column', array($this, 'custom_column_content'), 10, 2);

        // Add admin menu for course structure
        add_action('admin_menu', array($this, 'add_course_menu'));

        // Enqueue admin scripts
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }

    /**
     * Register Video Custom Post Type
     */
    public function register_video_cpt() {
        $labels = array(
            'name'                  => 'Training Videos',
            'singular_name'         => 'Video',
            'menu_name'             => 'Training Videos',
            'add_new'               => 'Add New Video',
            'add_new_item'          => 'Add New Training Video',
            'edit_item'             => 'Edit Video',
            'new_item'              => 'New Video',
            'view_item'             => 'View Video',
            'view_items'            => 'View Videos',
            'search_items'          => 'Search Videos',
            'not_found'             => 'No videos found',
            'not_found_in_trash'    => 'No videos found in trash',
            'all_items'             => 'All Videos',
            'archives'              => 'Video Archives',
            'attributes'            => 'Video Attributes',
            'insert_into_item'      => 'Insert into video',
            'uploaded_to_this_item' => 'Uploaded to this video',
            'featured_image'        => 'Video Thumbnail',
            'set_featured_image'    => 'Set video thumbnail',
            'remove_featured_image' => 'Remove video thumbnail',
            'use_featured_image'    => 'Use as video thumbnail',
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'training-video'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => 20,
            'menu_icon'          => 'dashicons-video-alt3',
            'supports'           => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
            'show_in_rest'       => true,
            'rest_base'          => 'video',
        );

        register_post_type('video', $args);
    }

    /**
     * Register Video Taxonomies
     */
    public function register_video_taxonomies() {
        // Video Categories (for organizing videos)
        $cat_labels = array(
            'name'              => 'Video Categories',
            'singular_name'     => 'Video Category',
            'search_items'      => 'Search Categories',
            'all_items'         => 'All Categories',
            'parent_item'       => 'Parent Category',
            'parent_item_colon' => 'Parent Category:',
            'edit_item'         => 'Edit Category',
            'update_item'       => 'Update Category',
            'add_new_item'      => 'Add New Category',
            'new_item_name'     => 'New Category Name',
            'menu_name'         => 'Categories',
        );

        register_taxonomy('video_cat', array('video'), array(
            'hierarchical'      => true,
            'labels'            => $cat_labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'rewrite'           => array('slug' => 'video-category'),
            'show_in_rest'      => true,
        ));

        // Course taxonomy (for grouping videos into courses)
        $course_labels = array(
            'name'              => 'Courses',
            'singular_name'     => 'Course',
            'search_items'      => 'Search Courses',
            'all_items'         => 'All Courses',
            'parent_item'       => 'Parent Course',
            'parent_item_colon' => 'Parent Course:',
            'edit_item'         => 'Edit Course',
            'update_item'       => 'Update Course',
            'add_new_item'      => 'Add New Course',
            'new_item_name'     => 'New Course Name',
            'menu_name'         => 'Courses',
        );

        register_taxonomy('video_course', array('video'), array(
            'hierarchical'      => true,
            'labels'            => $course_labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'rewrite'           => array('slug' => 'course'),
            'show_in_rest'      => true,
        ));

        // Difficulty Level taxonomy
        $diff_labels = array(
            'name'              => 'Difficulty Levels',
            'singular_name'     => 'Difficulty',
            'menu_name'         => 'Difficulty',
        );

        register_taxonomy('video_difficulty', array('video'), array(
            'hierarchical'      => false,
            'labels'            => $diff_labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'show_in_rest'      => true,
        ));
    }

    /**
     * Add meta boxes for video details
     */
    public function add_video_meta_boxes() {
        // Video Details
        add_meta_box(
            'video_details',
            'Video Details',
            array($this, 'render_video_details_box'),
            'video',
            'normal',
            'high'
        );

        // Access Control
        add_meta_box(
            'video_access',
            'Access Control',
            array($this, 'render_access_control_box'),
            'video',
            'side',
            'default'
        );

        // Course Structure
        add_meta_box(
            'course_structure',
            'Course Position',
            array($this, 'render_course_structure_box'),
            'video',
            'side',
            'default'
        );
    }

    /**
     * Render video details meta box
     */
    public function render_video_details_box($post) {
        wp_nonce_field('save_video_meta', 'video_meta_nonce');

        // Get existing values
        $vimeo_id = get_post_meta($post->ID, '_vimeo_video_id', true);
        $duration = get_post_meta($post->ID, '_video_duration', true);
        $subtitle = get_post_meta($post->ID, '_video_subtitle', true);
        $training_goal = get_post_meta($post->ID, '_training_goal', true);
        $body_area = get_post_meta($post->ID, '_body_area', true);
        ?>
        <style>
            .video-meta-field {
                margin-bottom: 20px;
            }
            .video-meta-field label {
                display: block;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .video-meta-field input[type="text"],
            .video-meta-field textarea {
                width: 100%;
                padding: 8px;
            }
            .video-meta-field .description {
                color: #666;
                font-style: italic;
                margin-top: 5px;
            }
        </style>

        <div class="video-meta-field">
            <label for="vimeo_video_id">Vimeo Video ID</label>
            <input type="text" id="vimeo_video_id" name="vimeo_video_id" value="<?php echo esc_attr($vimeo_id); ?>" />
            <p class="description">Enter the Vimeo video ID (e.g., 123456789)</p>
        </div>

        <div class="video-meta-field">
            <label for="video_subtitle">Subtitle</label>
            <input type="text" id="video_subtitle" name="video_subtitle" value="<?php echo esc_attr($subtitle); ?>" />
        </div>

        <div class="video-meta-field">
            <label for="video_duration">Duration</label>
            <input type="text" id="video_duration" name="video_duration" value="<?php echo esc_attr($duration); ?>" placeholder="e.g., 15:30" />
        </div>

        <div class="video-meta-field">
            <label for="training_goal">Training Goal</label>
            <textarea id="training_goal" name="training_goal" rows="3"><?php echo esc_textarea($training_goal); ?></textarea>
        </div>

        <div class="video-meta-field">
            <label for="body_area">Body Area</label>
            <input type="text" id="body_area" name="body_area" value="<?php echo esc_attr($body_area); ?>" placeholder="e.g., Feet, Core, Full Body" />
        </div>

        <?php if ($vimeo_id): ?>
        <div class="video-meta-field">
            <label>Video Preview</label>
            <div style="position: relative; padding-bottom: 56.25%; height: 0;">
                <iframe src="https://player.vimeo.com/video/<?php echo esc_attr($vimeo_id); ?>"
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                        frameborder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowfullscreen>
                </iframe>
            </div>
        </div>
        <?php endif; ?>
        <?php
    }

    /**
     * Render access control meta box
     */
    public function render_access_control_box($post) {
        $locked = get_post_meta($post->ID, '_locked_for_non_customers', true);
        $required_products = get_post_meta($post->ID, '_required_products', true);
        ?>
        <p>
            <label>
                <input type="checkbox" name="locked_for_non_customers" value="1" <?php checked($locked, '1'); ?> />
                Lock for non-customers
            </label>
        </p>

        <p>
            <label for="required_products">Required Products (IDs)</label>
            <input type="text" id="required_products" name="required_products"
                   value="<?php echo esc_attr($required_products); ?>"
                   style="width: 100%;" />
            <span class="description">Comma-separated product IDs</span>
        </p>
        <?php
    }

    /**
     * Render course structure meta box
     */
    public function render_course_structure_box($post) {
        $lesson_number = get_post_meta($post->ID, '_lesson_number', true);
        $module = get_post_meta($post->ID, '_module', true);
        ?>
        <p>
            <label for="module">Module</label>
            <input type="text" id="module" name="module"
                   value="<?php echo esc_attr($module); ?>"
                   style="width: 100%;" />
        </p>

        <p>
            <label for="lesson_number">Lesson Number</label>
            <input type="number" id="lesson_number" name="lesson_number"
                   value="<?php echo esc_attr($lesson_number); ?>"
                   style="width: 100%;" min="1" />
        </p>
        <?php
    }

    /**
     * Save video meta data
     */
    public function save_video_meta($post_id, $post) {
        // Check nonce
        if (!isset($_POST['video_meta_nonce']) || !wp_verify_nonce($_POST['video_meta_nonce'], 'save_video_meta')) {
            return;
        }

        // Check permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Save video details
        $fields = array(
            'vimeo_video_id' => '_vimeo_video_id',
            'video_subtitle' => '_video_subtitle',
            'video_duration' => '_video_duration',
            'training_goal' => '_training_goal',
            'body_area' => '_body_area',
            'module' => '_module',
            'lesson_number' => '_lesson_number',
            'required_products' => '_required_products',
        );

        foreach ($fields as $field => $meta_key) {
            if (isset($_POST[$field])) {
                update_post_meta($post_id, $meta_key, sanitize_text_field($_POST[$field]));
            }
        }

        // Save checkbox
        $locked = isset($_POST['locked_for_non_customers']) ? '1' : '';
        update_post_meta($post_id, '_locked_for_non_customers', $locked);
    }

    /**
     * Set custom admin columns
     */
    public function set_custom_columns($columns) {
        $new_columns = array();
        $new_columns['cb'] = $columns['cb'];
        $new_columns['title'] = $columns['title'];
        $new_columns['vimeo_id'] = 'Vimeo ID';
        $new_columns['course'] = 'Course';
        $new_columns['lesson'] = 'Lesson #';
        $new_columns['duration'] = 'Duration';
        $new_columns['access'] = 'Access';
        $new_columns['categories'] = $columns['categories'] ?? 'Categories';
        $new_columns['date'] = $columns['date'];

        return $new_columns;
    }

    /**
     * Display custom column content
     */
    public function custom_column_content($column, $post_id) {
        switch ($column) {
            case 'vimeo_id':
                $vimeo_id = get_post_meta($post_id, '_vimeo_video_id', true);
                echo $vimeo_id ? esc_html($vimeo_id) : '—';
                break;

            case 'course':
                $terms = get_the_terms($post_id, 'video_course');
                if ($terms && !is_wp_error($terms)) {
                    $course_names = wp_list_pluck($terms, 'name');
                    echo esc_html(implode(', ', $course_names));
                } else {
                    echo '—';
                }
                break;

            case 'lesson':
                $lesson = get_post_meta($post_id, '_lesson_number', true);
                echo $lesson ? esc_html($lesson) : '—';
                break;

            case 'duration':
                $duration = get_post_meta($post_id, '_video_duration', true);
                echo $duration ? esc_html($duration) : '—';
                break;

            case 'access':
                $locked = get_post_meta($post_id, '_locked_for_non_customers', true);
                echo $locked ? '🔒 Locked' : '🔓 Public';
                break;
        }
    }

    /**
     * Add course management menu
     */
    public function add_course_menu() {
        add_submenu_page(
            'edit.php?post_type=video',
            'Course Manager',
            'Course Manager',
            'manage_options',
            'video-course-manager',
            array($this, 'render_course_manager')
        );
    }

    /**
     * Render course manager page
     */
    public function render_course_manager() {
        ?>
        <div class="wrap">
            <h1>Course Manager</h1>
            <p>Organize your videos into structured courses.</p>

            <?php
            // Get all courses
            $courses = get_terms(array(
                'taxonomy' => 'video_course',
                'hide_empty' => false,
                'parent' => 0,
            ));

            foreach ($courses as $course):
                $videos = get_posts(array(
                    'post_type' => 'video',
                    'posts_per_page' => -1,
                    'tax_query' => array(
                        array(
                            'taxonomy' => 'video_course',
                            'field' => 'term_id',
                            'terms' => $course->term_id,
                        ),
                    ),
                    'meta_key' => '_lesson_number',
                    'orderby' => 'meta_value_num',
                    'order' => 'ASC',
                ));
                ?>
                <div style="background: white; padding: 20px; margin: 20px 0; border: 1px solid #ccc;">
                    <h2><?php echo esc_html($course->name); ?></h2>
                    <p><?php echo esc_html($course->description); ?></p>

                    <table class="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th width="50">Lesson</th>
                                <th>Title</th>
                                <th width="100">Duration</th>
                                <th width="100">Access</th>
                                <th width="100">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if ($videos): ?>
                                <?php foreach ($videos as $video): ?>
                                <tr>
                                    <td><?php echo get_post_meta($video->ID, '_lesson_number', true) ?: '—'; ?></td>
                                    <td>
                                        <strong><?php echo esc_html($video->post_title); ?></strong>
                                        <?php
                                        $subtitle = get_post_meta($video->ID, '_video_subtitle', true);
                                        if ($subtitle) echo '<br><small>' . esc_html($subtitle) . '</small>';
                                        ?>
                                    </td>
                                    <td><?php echo get_post_meta($video->ID, '_video_duration', true) ?: '—'; ?></td>
                                    <td>
                                        <?php
                                        $locked = get_post_meta($video->ID, '_locked_for_non_customers', true);
                                        echo $locked ? '🔒 Locked' : '🔓 Public';
                                        ?>
                                    </td>
                                    <td>
                                        <a href="<?php echo get_edit_post_link($video->ID); ?>" class="button button-small">Edit</a>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="5">No videos in this course yet.</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            <?php endforeach; ?>

            <?php if (empty($courses)): ?>
                <p>No courses created yet. <a href="<?php echo admin_url('edit-tags.php?taxonomy=video_course&post_type=video'); ?>">Create your first course</a></p>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook) {
        if (get_post_type() === 'video' || strpos($hook, 'video') !== false) {
            ?>
            <style>
                .column-vimeo_id { width: 100px; }
                .column-course { width: 150px; }
                .column-lesson { width: 80px; }
                .column-duration { width: 80px; }
                .column-access { width: 80px; }
            </style>
            <?php
        }
    }
}

// Initialize the plugin
new BlackBoardVideoCPT();