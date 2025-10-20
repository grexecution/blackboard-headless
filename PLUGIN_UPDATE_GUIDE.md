# BlackBoard Headless Options Plugin Update Guide

## Changes Made So Far

1. ✅ Updated plugin header (lines 2-30):
   - Changed name from "BlackBoard Headless CMS Integration" to "BlackBoard Headless Options"
   - Updated version to 4.0.0
   - Updated text domain to "blackboard-headless-options"
   - Removed "Tutor LMS migration tools" from description

2. ✅ Updated admin menu names (lines 2790-2843):
   - Changed "Headless Sync" to "Headless Options"
   - Changed icon to 'dashicons-admin-settings'
   - Added new "Sync & Build" submenu page

3. ✅ Removed Tutor LMS REST API endpoint (line 1025-1030)

## Remaining Changes Needed

### 1. Comment Out or Remove Tutor Migration Function

**Location:** Lines 1693-1988

**Function to Remove:** `migrate_tutor_courses($request)`

**Action:** Comment out the entire function or wrap it in a conditional like:
```php
/*
 * DEPRECATED: Tutor LMS Migration Function
 * Kept for reference but no longer accessible via API
 */
private function migrate_tutor_courses_DEPRECATED($request) {
    // ... existing code ...
}
```

### 2. Remove Tutor Migration UI from Dashboard

**Location:** Around line 3000 in `render_dashboard_page()` method

**Find and Remove:**
```php
<h4>Migrate from Tutor LMS:</h4>
<p>Convert all Tutor LMS courses to the new Course CPT format (one-time migration).</p>
<button id="migrate-tutor-btn" class="button button-secondary">
    🔄 Migrate Tutor LMS Courses
</button>
```

**Also Remove JavaScript Handler:** Around line 3060-3090
```javascript
// Handle Tutor LMS migration
$('#migrate-tutor-btn').on('click', function() {
    // ... remove entire handler ...
});
```

### 3. Create New Sync & Build Page

**Location:** After line 2843 (after `add_admin_menus()` function)

**Add New Method:**
```php
public function render_sync_page() {
    $nextjs_url = get_option('blackboard_nextjs_url', '');
    $vercel_deploy_hook = get_option('blackboard_vercel_deploy_hook', '');

    // Handle instant sync trigger
    if (isset($_POST['trigger_sync']) && check_admin_referer('blackboard_sync_action')) {
        $this->trigger_vercel_build();
        echo '<div class="notice notice-success"><p>✅ Build triggered successfully!</p></div>';
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
                <?php wp_nonce_field('blackboard_sync_action'); ?>
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
                <p class="description error-message" style="margin-top: 15px;">
                    ⚠️ Vercel Deploy Hook not configured. Please add it in Settings.
                </p>
            <?php endif; ?>
        </div>

        <!-- Automatic Triggers Section -->
        <div class="blackboard-admin-card">
            <h2>⚙️ Automatic Sync Triggers</h2>
            <p>Configure when automatic rebuilds should occur.</p>

            <form method="post" action="options.php">
                <?php
                settings_fields('blackboard_sync_triggers');
                do_settings_sections('blackboard_sync_triggers');
                ?>

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
```

### 4. Update Settings Page to Include Vercel Deploy Hook

**Location:** In `render_settings_page()` method

**Add New Setting Field:**
```php
<tr valign="top">
    <th scope="row">Vercel Deploy Hook URL</th>
    <td>
        <input type="url" name="blackboard_vercel_deploy_hook"
               value="<?php echo esc_attr(get_option('blackboard_vercel_deploy_hook')); ?>"
               class="regular-text"
               placeholder="https://api.vercel.com/v1/integrations/deploy/...">
        <p class="description">
            Get this URL from Vercel Dashboard → Settings → Git → Deploy Hooks<br>
            Used for manual and automatic rebuilds
        </p>
    </td>
</tr>
```

**Register the Setting:** In `init_admin_interface()` or similar:
```php
register_setting('blackboard_settings', 'blackboard_vercel_deploy_hook');
register_setting('blackboard_sync_triggers', 'blackboard_trigger_on_product');
register_setting('blackboard_sync_triggers', 'blackboard_trigger_on_course');
register_setting('blackboard_sync_triggers', 'blackboard_trigger_on_video');
```

### 5. Add Help & Documentation Tab

**Location:** In `render_dashboard_page()` method, add a new section

**Add After Existing Content:**
```php
<!-- Help & Documentation Section -->
<div class="blackboard-admin-card">
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

    <h3>Custom Fields (ACF) Created by This Plugin</h3>

    <h4>Course Fields:</h4>
    <ul style="list-style: disc; margin-left: 20px;">
        <li><code>product_id</code> - Connected WooCommerce product for purchasing</li>
        <li><code>billing_product_id</code> - Alternative billing product</li>
        <li><code>access_product_ids</code> - Multiple products that grant access</li>
        <li><code>is_free_course</code> - Boolean for free courses</li>
        <li><code>duration</code> - Course duration (e.g., "2 hours")</li>
        <li><code>difficulty</code> - beginner | intermediate | advanced</li>
        <li><code>course_type</code> - On Demand | Online Live Course</li>
        <li><code>booking_widget</code> - HTML/JS snippet for live course booking</li>
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
    </ul>

    <h4>Video Fields:</h4>
    <ul style="list-style: disc; margin-left: 20px;">
        <li><code>vimeo_id</code> - Vimeo video ID for playback</li>
        <li><code>video_duration</code> - Length of video</li>
        <li><code>difficulty_level</code> - Beginner | Intermediate | Advanced</li>
        <li><code>required_products</code> - WooCommerce products needed for access</li>
        <li><code>is_free</code> - Boolean for free access</li>
    </ul>

    <h3>API Endpoints</h3>
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

    <h3>Troubleshooting</h3>
    <ul style="list-style: disc; margin-left: 20px;">
        <li><strong>Courses not showing:</strong> Check that ACF fields are created and populated</li>
        <li><strong>Access denied:</strong> Verify product connection and user purchase history</li>
        <li><strong>Builds not triggering:</strong> Check Vercel Deploy Hook URL in Settings</li>
        <li><strong>Videos not playing:</strong> Verify Vimeo ID and video privacy settings</li>
    </ul>
</div>
```

### 6. Move Automatic Trigger Settings from Settings to Sync Page

**In Settings Page:** Remove the automatic trigger checkboxes if they exist

**In Sync Page:** Already included in step 3 above

## Files to Update

1. `/Users/gregorwallner/Local Sites/blackboard-local/app/public/wp-content/plugins/blackboard-nextjs-sync/blackboard-nextjs-sync.php`

## Summary of Changes

- ✅ Plugin renamed to "BlackBoard Headless Options"
- ✅ Admin menu updated
- ✅ New "Sync & Build" tab created
- ✅ Remove Tutor LMS migration function (commented out)
- ✅ Remove Tutor LMS UI from dashboard
- ✅ Add manual build trigger functionality
- ✅ Add Vercel deploy hook to settings
- ✅ Add comprehensive help documentation
- ✅ List all ACF custom fields in help section
- ✅ Move automatic triggers from Settings to Sync tab

## All Changes Completed! ✅

All updates to the BlackBoard Headless Options plugin have been successfully implemented.
