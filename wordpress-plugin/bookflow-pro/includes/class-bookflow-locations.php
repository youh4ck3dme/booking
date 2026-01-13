<?php
if (!defined('ABSPATH')) exit;

class BookFlow_Locations
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
        add_action('init', array($this, 'register_cpt'));
        add_action('add_meta_boxes', array($this, 'add_meta_boxes'));
        add_action('save_post_bf_location', array($this, 'save_location_meta'));
        add_action('save_post_bf_location', array($this, 'sync_with_api'), 20);
    }

    public function register_cpt()
    {
        $labels = array(
            'name'                  => _x('Prevádzky', 'Post Type General Name', 'bookflow-pro'),
            'singular_name'         => _x('Prevádzka', 'Post Type Singular Name', 'bookflow-pro'),
            'menu_name'             => __('Prevádzky', 'bookflow-pro'),
            'name_admin_bar'        => __('Prevádzka', 'bookflow-pro'),
            'all_items'             => __('Všetky prevádzky', 'bookflow-pro'),
            'add_new_item'          => __('Pridať novú prevádzku', 'bookflow-pro'),
            'add_new'               => __('Pridať novú', 'bookflow-pro'),
            'new_item'              => __('Nová prevádzka', 'bookflow-pro'),
            'edit_item'             => __('Upraviť prevádzku', 'bookflow-pro'),
            'update_item'           => __('Aktualizovať prevádzku', 'bookflow-pro'),
            'view_item'             => __('Zobraziť prevádzku', 'bookflow-pro'),
            'view_items'            => __('Zobraziť prevádzky', 'bookflow-pro'),
            'search_items'          => __('Hľadať prevádzky', 'bookflow-pro'),
            'not_found'             => __('Nenájdené', 'bookflow-pro'),
            'not_found_in_trash'    => __('Nenájdené v koši', 'bookflow-pro'),
        );

        $args = array(
            'label'                 => __('Prevádzka', 'bookflow-pro'),
            'description'           => __('Správa pobočiek a prevádzok', 'bookflow-pro'),
            'labels'                => $labels,
            'supports'              => array('title', 'thumbnail'),
            'hierarchical'          => false,
            'public'                => false,
            'show_ui'               => true,
            'show_in_menu'          => 'bookflow-pro', // We'll update the main menu in Admin class
            'menu_position'         => 5,
            'show_in_admin_bar'     => true,
            'show_in_nav_menus'     => false,
            'can_export'            => true,
            'has_archive'           => false,
            'exclude_from_search'   => true,
            'publicly_queryable'    => false,
            'capability_type'       => 'post',
            'show_in_rest'          => false,
        );

        register_post_type('bf_location', $args);
    }

    public function add_meta_boxes()
    {
        add_meta_box(
            'bf_location_details',
            __('Detaily prevádzky', 'bookflow-pro'),
            array($this, 'render_details_meta_box'),
            'bf_location',
            'normal',
            'high'
        );

        add_meta_box(
            'bf_location_hours',
            __('Otváracie hodiny', 'bookflow-pro'),
            array($this, 'render_hours_meta_box'),
            'bf_location',
            'normal',
            'high'
        );
    }

    public function render_details_meta_box($post)
    {
        wp_nonce_field('bf_location_meta', 'bf_location_meta_nonce');

        $address = get_post_meta($post->ID, '_bf_address', true);
        $phone = get_post_meta($post->ID, '_bf_phone', true);
        $email = get_post_meta($post->ID, '_bf_email', true);
        $coords = get_post_meta($post->ID, '_bf_coords', true); // lat,lng

?>
        <div class="bf-admin-fields">
            <p>
                <label for="bf_address"><strong><?php _e('Adresa', 'bookflow-pro'); ?></strong></label><br>
                <input type="text" id="bf_address" name="bf_address" value="<?php echo esc_attr($address); ?>" class="large-text" placeholder="Ulica 123, Mesto">
            </p>
            <div style="display: flex; gap: 20px;">
                <p style="flex: 1;">
                    <label for="bf_phone"><strong><?php _e('Telefón', 'bookflow-pro'); ?></strong></label><br>
                    <input type="text" id="bf_phone" name="bf_phone" value="<?php echo esc_attr($phone); ?>" class="large-text">
                </p>
                <p style="flex: 1;">
                    <label for="bf_email"><strong><?php _e('Email', 'bookflow-pro'); ?></strong></label><br>
                    <input type="email" id="bf_email" name="bf_email" value="<?php echo esc_attr($email); ?>" class="large-text">
                </p>
            </div>
            <p>
                <label for="bf_coords"><strong><?php _e('Súradnice (voliteľné)', 'bookflow-pro'); ?></strong></label> – <small>Formát: 48.148, 17.107</small><br>
                <input type="text" id="bf_coords" name="bf_coords" value="<?php echo esc_attr($coords); ?>" class="regular-text">
            </p>
        </div>
    <?php
    }

    public function render_hours_meta_box($post)
    {
        $hours = get_post_meta($post->ID, '_bf_hours', true);
        if (empty($hours)) {
            $hours = array(
                'monday' => array('start' => '09:00', 'end' => '17:00'),
                'tuesday' => array('start' => '09:00', 'end' => '17:00'),
                'wednesday' => array('start' => '09:00', 'end' => '17:00'),
                'thursday' => array('start' => '09:00', 'end' => '17:00'),
                'friday' => array('start' => '09:00', 'end' => '17:00'),
                'saturday' => array('start' => '', 'end' => ''),
                'sunday' => array('start' => '', 'end' => ''),
            );
        }

        $days = array(
            'monday' => __('Pondelok', 'bookflow-pro'),
            'tuesday' => __('Utorok', 'bookflow-pro'),
            'wednesday' => __('Streda', 'bookflow-pro'),
            'thursday' => __('Štvrtok', 'bookflow-pro'),
            'friday' => __('Piatok', 'bookflow-pro'),
            'saturday' => __('Sobota', 'bookflow-pro'),
            'sunday' => __('Nedeľa', 'bookflow-pro'),
        );

    ?>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th><strong><?php _e('Deň', 'bookflow-pro'); ?></strong></th>
                    <th><strong><?php _e('Otvorené od', 'bookflow-pro'); ?></strong></th>
                    <th><strong><?php _e('Zatvorené do', 'bookflow-pro'); ?></strong></th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($days as $key => $label) : ?>
                    <tr>
                        <td><?php echo esc_html($label); ?></td>
                        <td><input type="time" name="bf_hours[<?php echo $key; ?>][start]" value="<?php echo esc_attr($hours[$key]['start'] ?? ''); ?>"></td>
                        <td><input type="time" name="bf_hours[<?php echo $key; ?>][end]" value="<?php echo esc_attr($hours[$key]['end'] ?? ''); ?>"></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
<?php
    }

    public function save_location_meta($post_id)
    {
        if (!isset($_POST['bf_location_meta_nonce']) || !wp_verify_nonce($_POST['bf_location_meta_nonce'], 'bf_location_meta')) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

        if (!current_user_can('edit_post', $post_id)) return;

        $fields = array('bf_address', 'bf_phone', 'bf_email', 'bf_coords');
        foreach ($fields as $field) {
            if (isset($_POST[$field])) {
                update_post_meta($post_id, '_' . $field, sanitize_text_field($_POST[$field]));
            }
        }

        if (isset($_POST['bf_hours'])) {
            update_post_meta($post_id, '_bf_hours', $_POST['bf_hours']);
        }
    }

    public function sync_with_api($post_id)
    {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

        $post = get_post($post_id);
        if ($post->post_status !== 'publish') return;

        $address = get_post_meta($post_id, '_bf_address', true);
        $phone = get_post_meta($post_id, '_bf_phone', true);
        $email = get_post_meta($post_id, '_bf_email', true);
        $hours = get_post_meta($post_id, '_bf_hours', true);
        $coords = get_post_meta($post_id, '_bf_coords', true);

        $api_id = get_post_meta($post_id, '_bf_api_id', true);
        if (empty($api_id)) {
            $api_id = wp_generate_uuid4();
            update_post_meta($post_id, '_bf_api_id', $api_id);
        }

        $location_data = array(
            'id' => $api_id,
            'name' => $post->post_title,
            'address' => $address,
            'phone' => $phone,
            'email' => $email,
            'business_hours' => $hours,
        );

        if (!empty($coords)) {
            $parts = explode(',', $coords);
            if (count($parts) === 2) {
                $location_data['coordinates'] = array(
                    'lat' => (float) trim($parts[0]),
                    'lng' => (float) trim($parts[1])
                );
            }
        }

        $api = BookFlow_API::instance();
        $response = $api->post('locations', $location_data);

        if (is_wp_error($response)) {
            // Log error or show notice
            error_log('BookFlow API Sync Error: ' . $response->get_error_message());
        }
    }
}

BookFlow_Locations::instance();
