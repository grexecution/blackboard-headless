# 📚 BlackBoard LMS WordPress Setup Documentation

## Overview
This documentation covers the complete setup of the LMS (Learning Management System) in WordPress that integrates with your Next.js frontend. The system allows you to create courses, lessons, and control access based on WooCommerce product purchases.

---

## 🎯 Custom Post Types Setup

### 1. **Course (CPT: `bb_course`)**
Register this custom post type for courses/training programs.

```php
// Add to your theme's functions.php or custom plugin
register_post_type('bb_course', [
    'labels' => [
        'name' => 'Courses',
        'singular_name' => 'Course',
    ],
    'public' => true,
    'show_in_rest' => true, // Important for REST API
    'supports' => ['title', 'editor', 'thumbnail', 'excerpt'],
    'menu_icon' => 'dashicons-welcome-learn-more',
    'has_archive' => true,
]);
```

### 2. **Lesson (CPT: `bb_lesson`)**
Register this custom post type for individual lessons within courses.

```php
register_post_type('bb_lesson', [
    'labels' => [
        'name' => 'Lessons',
        'singular_name' => 'Lesson',
    ],
    'public' => true,
    'show_in_rest' => true,
    'supports' => ['title', 'editor', 'thumbnail', 'excerpt'],
    'menu_icon' => 'dashicons-video-alt3',
    'has_archive' => false,
]);
```

---

## 📝 ACF Field Groups Configuration

### **Field Group 1: Course Settings**
**Location:** Post Type = `bb_course`

| Field Label | Field Name | Field Type | Instructions | Required |
|------------|------------|------------|--------------|----------|
| Course Duration | `course_duration` | Text | e.g., "4 weeks" or "2 hours" | Yes |
| Difficulty Level | `difficulty_level` | Select | Choices: Beginner, Intermediate, Advanced | Yes |
| Course Category | `course_category` | Select | Choices: Foot Training, Rehabilitation, Performance, ProCoach | Yes |
| Course Thumbnail | `course_thumbnail` | Image | Featured image for course listing | Yes |
| Course Trailer (Vimeo ID) | `course_trailer_vimeo` | Text | Vimeo video ID for preview (e.g., "123456789") | No |
| Total Lessons | `total_lessons` | Number | Auto-calculated or manual | Yes |
| Required Products | `required_products` | Relationship | Connect to WooCommerce Products | Yes |
| Course Order | `course_order` | Number | Display order (lower numbers first) | Yes |
| Featured Course | `is_featured` | True/False | Show in featured section | No |
| Course Materials | `course_materials` | Repeater | Downloadable resources | No |
| - Material Title | `material_title` | Text | | |
| - Material File | `material_file` | File | PDF, etc. | |
| - Material Description | `material_description` | Textarea | | |

### **Field Group 2: Lesson Content**
**Location:** Post Type = `bb_lesson`

| Field Label | Field Name | Field Type | Instructions | Required |
|------------|------------|------------|--------------|----------|
| Parent Course | `parent_course` | Post Object | Select parent course (bb_course) | Yes |
| Lesson Number | `lesson_number` | Number | Order within course (1, 2, 3...) | Yes |
| Video URL (Vimeo) | `vimeo_video_id` | Text | Vimeo video ID (e.g., "123456789") | Yes |
| Video Duration | `video_duration` | Text | e.g., "15:30" | Yes |
| Lesson Type | `lesson_type` | Select | Choices: Video, Text, Mixed, Exercise | Yes |
| Lesson Materials | `lesson_materials` | Repeater | Downloadable resources | No |
| - Material Title | `material_title` | Text | | |
| - Material File | `material_file` | File | | |
| Written Content | `written_content` | WYSIWYG Editor | Additional text content | No |
| Exercise Instructions | `exercise_instructions` | Repeater | For practice exercises | No |
| - Exercise Title | `exercise_title` | Text | | |
| - Exercise Description | `exercise_description` | Textarea | | |
| - Exercise Duration | `exercise_duration` | Text | | |
| - Exercise Image | `exercise_image` | Image | | |
| Completion Time | `estimated_completion` | Number | Minutes to complete | Yes |
| Preview Available | `is_preview` | True/False | Allow non-customers to preview | No |

### **Field Group 3: User Progress Tracking**
**Location:** User Role = All

| Field Label | Field Name | Field Type | Instructions |
|------------|------------|------------|--------------|
| Completed Lessons | `completed_lessons` | Repeater | Track completed lessons |
| - Lesson ID | `lesson_id` | Number | |
| - Completion Date | `completion_date` | Date Time Picker | |
| - Watch Time | `watch_time` | Number | Seconds watched |
| Course Progress | `course_progress` | Repeater | Track course progress |
| - Course ID | `course_id` | Number | |
| - Percentage Complete | `percentage_complete` | Number | |
| - Last Accessed | `last_accessed` | Date Time Picker | |

---

## 🔐 Access Control Setup

### **WooCommerce Integration for Access Control**

1. **Install Required Plugins:**
   - ACF Pro
   - WooCommerce
   - Custom Post Type UI (optional, if not coding CPTs)

2. **Create Access Control Function:**

Add this to your theme's `functions.php`:

```php
// Check if user has access to a course
function bb_user_has_course_access($user_id, $course_id) {
    // Get required products for the course
    $required_products = get_field('required_products', $course_id);

    if (empty($required_products)) {
        return false; // No products linked = no access
    }

    // Check if user has purchased any of the required products
    foreach ($required_products as $product_id) {
        if (wc_customer_bought_product('', $user_id, $product_id)) {
            return true;
        }
    }

    return false;
}

// Add REST API endpoint for course access
add_action('rest_api_init', function () {
    register_rest_route('bb-lms/v1', '/check-access', [
        'methods' => 'POST',
        'callback' => 'bb_check_course_access',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ]);
});

function bb_check_course_access($request) {
    $user_id = get_current_user_id();
    $course_id = $request->get_param('course_id');

    return [
        'has_access' => bb_user_has_course_access($user_id, $course_id),
        'user_id' => $user_id,
        'course_id' => $course_id
    ];
}
```

3. **Add Course Data to REST API:**

```php
// Expose ACF fields in REST API
add_filter('rest_prepare_bb_course', function($response, $post, $request) {
    $response->data['acf'] = get_fields($post->ID);

    // Add lessons for this course
    $lessons = get_posts([
        'post_type' => 'bb_lesson',
        'meta_key' => 'parent_course',
        'meta_value' => $post->ID,
        'orderby' => 'meta_value_num',
        'meta_key' => 'lesson_number',
        'order' => 'ASC',
        'numberposts' => -1
    ]);

    $response->data['lessons'] = array_map(function($lesson) {
        return [
            'id' => $lesson->ID,
            'title' => $lesson->post_title,
            'slug' => $lesson->post_name,
            'acf' => get_fields($lesson->ID)
        ];
    }, $lessons);

    return $response;
}, 10, 3);
```

---

## 🏷️ Product-Course Linking

### **Setting up Product Access Rules**

1. **In WooCommerce Products:**
   - Create products like "BlackBoard Professional", "ProCoach Certification", etc.
   - Note the product IDs

2. **In Course Settings (ACF):**
   - Use the "Required Products" field to link products
   - Multiple products = OR logic (user needs ANY of them)
   - For AND logic, create a bundle product

3. **Example Product-Course Relationships:**

   | Product | Gives Access To |
   |---------|----------------|
   | BlackBoard Basic | Basic Training Videos |
   | BlackBoard Professional | Basic + Advanced Training |
   | ProCoach Certification | All Training + Certification Course |
   | Workshop Ticket | Specific Workshop Recording |

---

## 📱 REST API Endpoints

### **Custom Endpoints to Create:**

```php
// 1. Get all courses for logged-in user
register_rest_route('bb-lms/v1', '/my-courses', [
    'methods' => 'GET',
    'callback' => 'bb_get_user_courses',
    'permission_callback' => function() {
        return is_user_logged_in();
    }
]);

// 2. Get single course with lessons
register_rest_route('bb-lms/v1', '/course/(?P<id>\d+)', [
    'methods' => 'GET',
    'callback' => 'bb_get_course_details',
    'permission_callback' => function() {
        return is_user_logged_in();
    }
]);

// 3. Mark lesson as complete
register_rest_route('bb-lms/v1', '/complete-lesson', [
    'methods' => 'POST',
    'callback' => 'bb_mark_lesson_complete',
    'permission_callback' => function() {
        return is_user_logged_in();
    }
]);

// 4. Get user progress
register_rest_route('bb-lms/v1', '/progress', [
    'methods' => 'GET',
    'callback' => 'bb_get_user_progress',
    'permission_callback' => function() {
        return is_user_logged_in();
    }
]);
```

---

## 🎬 Vimeo Integration Setup

### **Vimeo Privacy Settings:**
1. Upload videos to Vimeo Pro/Plus/Business account
2. Set privacy to "Hide from Vimeo"
3. Add your domain to the whitelist
4. Use domain-level privacy for extra security

### **Storing Vimeo IDs:**
- Store only the video ID (e.g., "123456789")
- Not the full URL
- The Next.js frontend will construct the embed URL

---

## 📦 Sample Course Structure

```
Course: "BlackBoard Fundamentals"
├── Required Products: [BlackBoard Basic, BlackBoard Professional]
├── Duration: "4 weeks"
├── Difficulty: "Beginner"
└── Lessons:
    ├── Lesson 1: Introduction to Foot Training
    │   ├── Vimeo ID: "123456789"
    │   ├── Duration: "12:30"
    │   └── Materials: [PDF Guide]
    ├── Lesson 2: Basic Exercises
    │   ├── Vimeo ID: "123456790"
    │   ├── Duration: "15:45"
    │   └── Materials: [Exercise Chart]
    └── Lesson 3: Progress Tracking
        ├── Vimeo ID: "123456791"
        ├── Duration: "08:20"
        └── Materials: [Progress Template]
```

---

## 🚀 Quick Setup Checklist

- [ ] Install ACF Pro plugin
- [ ] Create Custom Post Types (bb_course, bb_lesson)
- [ ] Set up ACF field groups as documented above
- [ ] Add access control functions to functions.php
- [ ] Create REST API endpoints
- [ ] Link WooCommerce products to courses
- [ ] Upload videos to Vimeo and configure privacy
- [ ] Test API endpoints with Postman
- [ ] Create sample course with 2-3 lessons
- [ ] Test access control with test user

---

## 🔧 Troubleshooting

**Issue:** Courses not showing in REST API
**Solution:** Ensure `show_in_rest => true` in CPT registration

**Issue:** ACF fields not in API response
**Solution:** Add the REST API filter code above

**Issue:** Access control not working
**Solution:** Check if user is logged in and has purchased linked products

**Issue:** Vimeo videos not playing
**Solution:** Check domain whitelist in Vimeo privacy settings

---

## 📞 Support Notes

- This system is designed to scale to hundreds of courses and thousands of users
- Consider caching user access checks for performance
- Regular backups of course content recommended
- Monitor Vimeo bandwidth usage with growth