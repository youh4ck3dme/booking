<?php
if (!defined('ABSPATH')) exit;

class BookFlow_Employees
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
        add_action('save_post_bf_employee', array($this, 'save_meta_boxes'));
    }

    public function register_post_type()
    {
        $labels = array(
            'name' => _x('Employees', 'Post Type General Name', 'bookflow-pro'),
            'singular_name' => _x('Employee', 'Post Type Singular Name', 'bookflow-pro'),
            'menu_name' => __('Employees', 'bookflow-pro'),
            'all_items' => __('All Employees', 'bookflow-pro'),
            'add_new_item' => __('Add New Employee', 'bookflow-pro'),
        );
        $args = array(
            'label' => __('Employee', 'bookflow-pro'),
            'labels' => $labels,
            'supports' => array('title', 'thumbnail'),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => false,
            'capability_type' => 'post',
            'has_archive' => false,
            'hierarchical' => false,
            'menu_icon' => 'dashicons-businessman',
        );
        register_post_type('bf_employee', $args);
    }

    public function add_meta_boxes()
    {
        add_meta_box(
            'bf_employee_details',
            __('Employee Details', 'bookflow-pro'),
            array($this, 'render_details_meta_box'),
            'bf_employee',
            'normal',
            'high'
        );
    }

    public function render_details_meta_box($post)
    {
        wp_nonce_field('bf_employee_meta_box', 'bf_employee_meta_box_nonce');
        $color = get_post_meta($post->ID, '_bf_color', true) ?: '#3B82F6';
        $location_id = get_post_meta($post->ID, '_bf_location_id', true);
        $assigned_services = get_post_meta($post->ID, '_bf_services', true) ?: array();
        $api_id = get_post_meta($post->ID, '_bf_api_id', true);

        $locations = get_posts(array('post_type' => 'bf_location', 'numberposts' => -1));
        $services = get_posts(array('post_type' => 'bf_service', 'numberposts' => -1));
?>
        <div class="bf-meta-grid">
            <p>
                <label for="bf_color"><?php _e('Employee Color', 'bookflow-pro'); ?></label>
                <input type="color" id="bf_color" name="bf_color" value="<?php echo esc_attr($color); ?>" class="widefat">
            </p>
            <p>
                <label for="bf_location_id"><?php _e('Primary Location', 'bookflow-pro'); ?></label>
                <select id="bf_location_id" name="bf_location_id" class="widefat">
                    <option value=""><?php _e('Global', 'bookflow-pro'); ?></option>
                    <?php foreach ($locations as $loc) : ?>
                        <?php $loc_api_id = get_post_meta($loc->ID, '_bf_api_id', true); ?>
                        <option value="<?php echo esc_attr($loc_api_id); ?>" <?php selected($location_id, $loc_api_id); ?>>
                            <?php echo esc_html($loc->post_title); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </p>
            <div>
                <label><?php _e('Assigned Services', 'bookflow-pro'); ?></label>
                <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-top: 5px; border-radius: 4px;">
                    <?php foreach ($services as $service) : ?>
                        <?php $service_api_id = get_post_meta($service->ID, '_bf_api_id', true); ?>
                        <label style="display: block; margin-bottom: 5px;">
                            <input type="checkbox" name="bf_services[]" value="<?php echo esc_attr($service_api_id); ?>" <?php checked(in_array($service_api_id, $assigned_services)); ?>>
                            <?php echo esc_html($service->post_title); ?>
                        </label>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
        <?php if ($api_id) : ?>
            <p class="description"><?php printf(__('Synced with API (ID: %s)', 'bookflow-pro'), esc_html($api_id)); ?></p>
        <?php endif; ?>
<?php
    }

    public function save_meta_boxes($post_id)
    {
        if (!isset($_POST['bf_employee_meta_box_nonce']) || !wp_verify_nonce($_POST['bf_employee_meta_box_nonce'], 'bf_employee_meta_box')) {
            return;
        }
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;

        if (isset($_POST['bf_color'])) {
            update_post_meta($post_id, '_bf_color', sanitize_text_field($_POST['bf_color']));
        }
        if (isset($_POST['bf_location_id'])) {
            update_post_meta($post_id, '_bf_location_id', sanitize_text_field($_POST['bf_location_id']));
        }

        $services = isset($_POST['bf_services']) ? array_map('sanitize_text_field', $_POST['bf_services']) : array();
        update_post_meta($post_id, '_bf_services', $services);

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

        $thumbnail_url = get_the_post_thumbnail_url($post_id, 'thumbnail');

        $employee_data = array(
            'id' => $api_id,
            'name' => $post->post_title,
            'avatarUrl' => $thumbnail_url ?: '',
            'color' => get_post_meta($post_id, '_bf_color', true),
            'services' => get_post_meta($post_id, '_bf_services', true),
            'locationId' => get_post_meta($post_id, '_bf_location_id', true)
        );

        $api = BookFlow_API::instance();
        $api->post('employees', $employee_data);
    }
}
