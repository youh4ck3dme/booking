<?php

/**
 * Plugin Name: BookFlow Pro
 * Plugin URI: https://github.com/youh4ck3dme/booking
 * Description: Premium booking system integration for BookFlow Pro REST API.
 * Version: 1.0.0
 * Author: BookFlow Team
 * Text Domain: bookflow-pro
 */

if (!defined('ABSPATH')) exit;

define('BOOKFLOW_VERSION', '1.0.0');
define('BOOKFLOW_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('BOOKFLOW_PLUGIN_URL', plugin_dir_url(__FILE__));

class BookFlow_Pro
{
    /**
     * The single instance of the class.
     *
     * @var BookFlow_Pro
     */
    private static $instance = null;

    /**
     * Main BookFlow_Pro Instance.
     *
     * @return BookFlow_Pro
     */
    public static function instance()
    {
        if (null === self::$instance) {
            self::$instance = new BookFlow_Pro();
        }
        return self::$instance;
    }

    private function __construct()
    {
        $this->includes();
        $this->init_hooks();
    }

    private function includes()
    {
        require_once BOOKFLOW_PLUGIN_DIR . 'includes/class-bookflow-api.php';
        require_once BOOKFLOW_PLUGIN_DIR . 'includes/class-bookflow-admin.php';
        require_once BOOKFLOW_PLUGIN_DIR . 'includes/class-bookflow-locations.php';
        require_once BOOKFLOW_PLUGIN_DIR . 'includes/class-bookflow-services.php';
        require_once BOOKFLOW_PLUGIN_DIR . 'includes/class-bookflow-employees.php';
        require_once BOOKFLOW_PLUGIN_DIR . 'includes/class-bookflow-shortcodes.php';
        require_once BOOKFLOW_PLUGIN_DIR . 'includes/class-bookflow-blocks.php';
    }

    private function init_hooks()
    {
        add_action('plugins_loaded', array($this, 'init'));
        add_action('admin_notices', array($this, 'check_config'));
    }

    public function init()
    {
        BookFlow_Admin::init();
        BookFlow_Locations::instance();
        BookFlow_Services::instance();
        BookFlow_Employees::instance();
        BookFlow_Shortcodes::init();
        BookFlow_Blocks::init();
    }

    public function check_config()
    {
        $url = get_option('bookflow_api_url');
        $key = get_option('bookflow_api_key');
        if (empty($url) || empty($key)) {
            $settings_url = admin_url('options-general.php?page=bookflow-pro');
            echo '<div class="notice notice-warning is-dismissible"><p>';
            printf(
                esc_html__('BookFlow Pro is almost ready! Please configure your %s.', 'bookflow-pro'),
                '<a href="' . esc_url($settings_url) . '">' . esc_html__('API settings', 'bookflow-pro') . '</a>'
            );
            echo '</p></div>';
        }
    }
}

/**
 * @return BookFlow_Pro
 */
function BookFlow()
{
    return BookFlow_Pro::instance();
}
BookFlow();

register_activation_hook(__FILE__, 'bookflow_activate');
function bookflow_activate()
{
    if (!get_option('bookflow_widget_config')) {
        update_option('bookflow_widget_config', array(
            'theme' => 'auto',
            'primary_color' => '#3B82F6',
            'show_employees' => true,
            'show_prices' => true,
            'locale' => 'sk'
        ));
    }
}

/**
 * Add settings link to plugin actions
 */
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($links) {
    $settings_link = '<a href="options-general.php?page=bookflow-pro">' . __('Settings') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
});
