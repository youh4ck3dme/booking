<?php

/**
 * WordPress Stubs for IDE
 * This file is NOT used by the plugin, it's only to satisfy your IDE's linting.
 */

if (false) {
    define('ABSPATH', '');
    define('WP_UNINSTALL_PLUGIN', '');
    define('BOOKFLOW_VERSION', '');
    define('BOOKFLOW_PLUGIN_DIR', '');
    define('BOOKFLOW_PLUGIN_URL', '');

    /** @return bool */ function add_filter($tag, $function_to_add, $priority = 10, $accepted_args = 1)
    {
        return true;
    }
    function plugin_basename($file)
    {
        return '';
    }
    function printf($format, ...$args) {}
    /** @return bool */ function add_action($tag, $callback, $priority = 10, $accepted_args = 1)
    {
        return true;
    }
    /** @return bool */ function add_shortcode($tag, $callback)
    {
        return true;
    }
    /** @return bool */ function register_activation_hook($file, $callback)
    {
        return true;
    }
    /** @return string */ function plugin_dir_path($file)
    {
        return '/path/';
    }
    /** @return string */ function plugin_dir_url($file)
    {
        return 'https://example.com/';
    }
    /** @return mixed */ function get_option($option, $default = false)
    {
        return $default;
    }
    /** @return bool */ function update_option($option, $value, $autoload = null)
    {
        return true;
    }
    /** @return bool */ function delete_option($option)
    {
        return true;
    }
    /** @return bool */ function set_transient($transient, $value, $expiration = 0)
    {
        return true;
    }
    /** @return mixed */ function get_transient($transient)
    {
        return false;
    }
    /** @return bool */ function delete_transient($transient)
    {
        return true;
    }
    /** @return string */ function __($text, $domain = 'default')
    {
        return $text;
    }
    function _e($text, $domain = 'default')
    {
        echo $text;
    }
    /** @return string */ function esc_html($text)
    {
        return $text;
    }
    /** @return string */ function esc_html__($text, $domain = 'default')
    {
        return $text;
    }
    function esc_html_e($text, $domain = 'default')
    {
        echo $text;
    }
    /** @return string */ function esc_attr($text)
    {
        return $text;
    }
    /** @return string */ function esc_attr__($text, $domain = 'default')
    {
        return $text;
    }
    function esc_attr_e($text, $domain = 'default')
    {
        echo $text;
    }
    /** @return string */ function esc_url($url)
    {
        return $url;
    }
    /** @return string */ function esc_url_raw($url)
    {
        return $url;
    }
    /** @return string */ function sanitize_text_field($str)
    {
        return $str;
    }
    /** @return string */ function sanitize_hex_color($color)
    {
        return $color;
    }
    /** @return bool */ function wp_enqueue_style($handle, $src = '', $deps = array(), $ver = false, $media = 'all')
    {
        return true;
    }
    /** @return bool */ function wp_enqueue_script($handle, $src = '', $deps = array(), $ver = false, $in_footer = false)
    {
        return true;
    }
    /** @return bool */ function wp_register_style($handle, $src, $deps = array(), $ver = false, $media = 'all')
    {
        return true;
    }
    /** @return bool */ function wp_register_script($handle, $src, $deps = array(), $ver = false, $in_footer = false)
    {
        return true;
    }
    /** @return bool */ function wp_localize_script($handle, $object_name, $l10n)
    {
        return true;
    }
    /** @return array */ function wp_remote_request($url, $args = array())
    {
        return array();
    }
    /** @return int */ function wp_remote_retrieve_response_code($response)
    {
        return 200;
    }
    /** @return string */ function wp_remote_retrieve_body($response)
    {
        return '{}';
    }
    /** @return string */ function wp_json_encode($data, $options = 0, $depth = 512)
    {
        return '{}';
    }
    /** @return bool */ function is_wp_error($thing)
    {
        return false;
    }
    /** @return string */ function add_query_arg()
    {
        return '';
    }
    /** @return string */ function admin_url($path = '', $scheme = 'admin')
    {
        return $path;
    }
    /** @return string */ function wp_create_nonce($action = -1)
    {
        return '';
    }
    /** @return bool */ function check_ajax_referer($action = -1, $query_arg = false, $die = true)
    {
        return true;
    }
    /** @return bool */ function current_user_can($capability, ...$args)
    {
        return true;
    }
    /** @return bool */ function wp_send_json_success($data = null, $status_code = null)
    {
        return true;
    }
    /** @return bool */ function wp_send_json_error($data = null, $status_code = null)
    {
        return true;
    }
    /** @return bool */ function register_setting($option_group, $option_name, $args = array())
    {
        return true;
    }
    /** @return string */ function add_options_page($page_title, $menu_title, $capability, $menu_slug, $callback = '', $icon_url = '', $position = null)
    {
        return '';
    }
    /** @return string */ function settings_fields($option_group)
    {
        return '';
    }
    /** @return string */ function do_settings_sections($page)
    {
        return '';
    }
    /** @return string */ function submit_button($text = null, $type = 'primary', $name = 'submit', $wrap = true, $other_attributes = null)
    {
        return '';
    }
    /** @return string */ function selected($selected, $current = true, $echo = true)
    {
        return '';
    }
    /** @return string */ function checked($checked, $current = true, $echo = true)
    {
        return '';
    }
    /** @return string */ function get_admin_page_title()
    {
        return '';
    }
    /** @return bool */ function register_block_type($name, $args = array())
    {
        return true;
    }
    /** @return array */ function shortcode_atts($pairs, $atts, $shortcode = '')
    {
        return $pairs;
    }

    class WP_Error
    {
        public function __construct($code = '', $message = '', $data = '') {}
        public function get_error_message($code = '') {}
    }
}
