<?php
if (!defined('ABSPATH')) exit;

class BookFlow_Admin
{
    public static function init()
    {
        add_action('admin_menu', array(__CLASS__, 'add_menu'));
        add_action('admin_init', array(__CLASS__, 'register_settings'));
        add_action('admin_enqueue_scripts', array(__CLASS__, 'enqueue_assets'));
        add_action('wp_ajax_bookflow_test_connection', array(__CLASS__, 'ajax_test_connection'));
        add_action('wp_ajax_bookflow_clear_cache', array(__CLASS__, 'ajax_clear_cache'));
    }

    public static function add_menu()
    {
        // Add Main Menu
        add_menu_page(
            __('BookFlow Pro', 'bookflow-pro'),
            __('BookFlow', 'bookflow-pro'),
            'manage_options',
            'bookflow-pro',
            array(__CLASS__, 'render_settings_page'),
            'dashicons-calendar-alt',
            25
        );

        // Submenu: Settings (re-point the main slug)
        add_submenu_page(
            'bookflow-pro',
            __('Nastavenia', 'bookflow-pro'),
            __('Nastavenia', 'bookflow-pro'),
            'manage_options',
            'bookflow-pro',
            array(__CLASS__, 'render_settings_page')
        );

        // Locations is added automatically via CPT 'show_in_menu' => 'bookflow-pro'
    }

    public static function register_settings()
    {
        register_setting('bookflow_settings', 'bookflow_api_url', array('type' => 'string', 'sanitize_callback' => 'esc_url_raw', 'default' => 'http://localhost:3001'));
        register_setting('bookflow_settings', 'bookflow_api_key', array('type' => 'string', 'sanitize_callback' => 'sanitize_text_field', 'default' => ''));
        register_setting('bookflow_settings', 'bookflow_widget_config', array('type' => 'array', 'sanitize_callback' => array(__CLASS__, 'sanitize_widget_config'), 'default' => array('theme' => 'auto', 'primary_color' => '#3B82F6', 'show_employees' => true, 'show_prices' => true, 'locale' => 'sk')));
    }

    public static function sanitize_widget_config($input)
    {
        return array(
            'theme' => in_array($input['theme'] ?? '', array('light', 'dark', 'auto')) ? $input['theme'] : 'auto',
            'primary_color' => sanitize_hex_color($input['primary_color'] ?? '') ?: '#3B82F6',
            'show_employees' => !empty($input['show_employees']),
            'show_prices' => !empty($input['show_prices']),
            'locale' => sanitize_text_field($input['locale'] ?? 'sk')
        );
    }

    public static function enqueue_assets($hook)
    {
        if (strpos($hook, 'bookflow-pro') === false && strpos($hook, 'bf_location') === false) return;

        wp_enqueue_style('bookflow-admin', BOOKFLOW_PLUGIN_URL . 'admin/css/admin.css', array(), BOOKFLOW_VERSION);
        wp_enqueue_script('bookflow-admin', BOOKFLOW_PLUGIN_URL . 'admin/js/admin.js', array('jquery'), BOOKFLOW_VERSION, true);
        wp_localize_script('bookflow-admin', 'bookflowAdmin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('bookflow_admin'),
            'strings' => array('testing' => __('Testing...', 'bookflow-pro'), 'success' => __('Connected!', 'bookflow-pro'), 'failed' => __('Failed', 'bookflow-pro'), 'clearing' => __('Clearing...', 'bookflow-pro'), 'cleared' => __('Cleared!', 'bookflow-pro'))
        ));
    }

    public static function ajax_test_connection()
    {
        check_ajax_referer('bookflow_admin', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error(array('message' => 'Unauthorized'));
        $api = BookFlow_API::instance();
        $api->refresh();
        $result = $api->test_connection();
        if (is_wp_error($result)) wp_send_json_error(array('message' => $result->get_error_message()));
        wp_send_json_success(array('message' => 'Connected!'));
    }

    public static function ajax_clear_cache()
    {
        check_ajax_referer('bookflow_admin', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error(array('message' => 'Unauthorized'));
        BookFlow_API::instance()->clear_cache();
        wp_send_json_success(array('message' => 'Cache cleared!'));
    }

    public static function render_settings_page()
    {
        include BOOKFLOW_PLUGIN_DIR . 'admin/partials/settings-page.php';
    }
}
