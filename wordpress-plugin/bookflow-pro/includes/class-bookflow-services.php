<?php
if (!defined('ABSPATH')) exit;

class BookFlow_Services
{
    private static $instance = null;

    public static function instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct()
    {
        add_action('init', array($this, 'register_post_type'));
        add_action('add_meta_boxes', array($this, 'add_meta_boxes'));
        add_action('save_post_bf_service', array($this, 'save_meta_boxes'));
        add_action('wp_ajax_bf_sync_service', array($this, 'ajax_sync_service'));
    }

    public function register_post_type()
    {
        $labels = array(
            'name' => _x('Services', 'Post Type General Name', 'bookflow-pro'),
            'singular_name' => _x('Service', 'Post Type Singular Name', 'bookflow-pro'),
            'menu_name' => __('Services', 'bookflow-pro'),
            'all_items' => __('All Services', 'bookflow-pro'),
            'add_new_item' => __('Add New Service', 'bookflow-pro'),
            'edit_item' => __('Edit Service', 'bookflow-pro'),
        );
        $args = array(
            'label' => __('Service', 'bookflow-pro'),
            'labels' => $labels,
            'supports' => array('title', 'editor'),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => false, // Handled by BookFlow_Admin
            'capability_type' => 'post',
            'has_archive' => false,
            'hierarchical' => false,
            'menu_icon' => 'dashicons-scissors',
        );
        register_post_type('bf_service', $args);
    }

    public function add_meta_boxes()
    {
        add_meta_box(
            'bf_service_details',
            __('Service Details', 'bookflow-pro'),
            array($this, 'render_details_meta_box'),
            'bf_service',
            'normal',
            'high'
        );
    }

    public function render_details_meta_box($post)
    {
        wp_nonce_field('bf_service_meta_box', 'bf_service_meta_box_nonce');
        $price = get_post_meta($post->ID, '_bf_price', true);
        $duration = get_post_meta($post->ID, '_bf_duration', true);
        $category = get_post_meta($post->ID, '_bf_category', true);
        $color = get_post_meta($post->ID, '_bf_color', true) ?: '#3B82F6';
        $location_id = get_post_meta($post->ID, '_bf_location_id', true);
        $api_id = get_post_meta($post->ID, '_bf_api_id', true);

        $locations = get_posts(array('post_type' => 'bf_location', 'numberposts' => -1));
?>
        <div class="bf-meta-grid">
            <p>
                <label for="bf_price"><?php _e('Price (€)', 'bookflow-pro'); ?></label>
                <input type="number" id="bf_price" name="bf_price" value="<?php echo esc_attr($price); ?>" step="0.01" class="widefat">
            </p>
            <p>
                <label for="bf_duration"><?php _e('Duration (minutes)', 'bookflow-pro'); ?></label>
                <input type="number" id="bf_duration" name="bf_duration" value="<?php echo esc_attr($duration); ?>" class="widefat">
            </p>
            <p>
                <label for="bf_category"><?php _e('Category', 'bookflow-pro'); ?></label>
                <input type="text" id="bf_category" name="bf_category" value="<?php echo esc_attr($category); ?>" class="widefat">
            </p>
            <p>
                <label for="bf_color"><?php _e('Color', 'bookflow-pro'); ?></label>
                <input type="color" id="bf_color" name="bf_color" value="<?php echo esc_attr($color); ?>" class="widefat">
            </p>
            <p>
                <label for="bf_location_id"><?php _e('Location', 'bookflow-pro'); ?></label>
                <select id="bf_location_id" name="bf_location_id" class="widefat">
                    <option value=""><?php _e('Global (All Locations)', 'bookflow-pro'); ?></option>
                    <?php foreach ($locations as $loc) : ?>
                        <?php $loc_api_id = get_post_meta($loc->ID, '_bf_api_id', true); ?>
                        <option value="<?php echo esc_attr($loc_api_id); ?>" <?php selected($location_id, $loc_api_id); ?>>
                            <?php echo esc_html($loc->post_title); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </p>
        </div>
        <?php if ($api_id) : ?>
            <p class="description"><?php printf(__('Synced with API (ID: %s)', 'bookflow-pro'), esc_html($api_id)); ?></p>
        <?php endif; ?>
<?php
    }

    public function save_meta_boxes($post_id)
    {
        if (!isset($_POST['bf_service_meta_box_nonce']) || !wp_verify_nonce($_POST['bf_service_meta_box_nonce'], 'bf_service_meta_box')) {
            return;
        }
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;

        $fields = array('bf_price', 'bf_duration', 'bf_category', 'bf_color', 'bf_location_id');
        foreach ($fields as $field) {
            if (isset($_POST[$field])) {
                update_post_meta($post_id, '_' . $field, sanitize_text_field($_POST[$field]));
            }
        }

        // Trigger Sync
        $this->sync_with_api($post_id);
    }

    public function sync_with_api($post_id)
    {
        $post = get_post($post_id);
        $api_id = get_post_meta($post_id, '_bf_api_id', true);

        if (empty($api_id)) {
            $api_id = wp_generate_uuid4();
            update_post_meta($post_id, '_bf_api_id', $api_id);
        }

        $service_data = array(
            'id' => $api_id,
            'name' => $post->post_title,
            'description' => $post->post_content,
            'price' => (float)get_post_meta($post_id, '_bf_price', true),
            'duration' => (int)get_post_meta($post_id, '_bf_duration', true),
            'category' => get_post_meta($post_id, '_bf_category', true),
            'color' => get_post_meta($post_id, '_bf_color', true),
            'locationId' => get_post_meta($post_id, '_bf_location_id', true)
        );

        $api = BookFlow_API::instance();
        $api->post('services', $service_data);
    }
}
