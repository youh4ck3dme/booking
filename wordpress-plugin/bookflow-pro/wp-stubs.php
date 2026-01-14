<?php

/**
 * Stubs for WordPress functions to satisfy IDE static analysis.
 * This file is NOT part of the plugin logic and is only for the IDE.
 */

if (!defined('ABSPATH')) define('ABSPATH', '/');
if (!defined('DOING_AUTOSAVE')) define('DOING_AUTOSAVE', false);
if (!defined('OBJECT')) define('OBJECT', 'OBJECT');
if (!defined('ARRAY_A')) define('ARRAY_A', 'ARRAY_A');
if (!defined('ARRAY_N')) define('ARRAY_N', 'ARRAY_N');

if (!function_exists('add_action')) {
    function add_action($tag, $callback, $priority = 10, $accepted_args = 1) {}
    function add_filter($tag, $callback, $priority = 10, $accepted_args = 1) {}
    function register_post_type($post_type, $args = array()) {}
    function add_menu_page($page_title, $menu_title, $capability, $menu_slug, $callback = '', $icon_url = '', $position = null) {}
    function add_submenu_page($parent_slug, $page_title, $menu_title, $capability, $menu_slug, $callback = '', $position = null) {}
    function add_meta_box($id, $title, $callback, $screen = null, $context = 'advanced', $priority = 'default', $callback_args = null) {}
    function wp_nonce_field($action = -1, $name = "_wpnonce", $referer = true, $echo = true) {}
    function get_post_meta($post_id, $key = '', $single = false) {}
    function update_post_meta($post_id, $meta_key, $meta_value, $prev_value = '') {}
    function wp_verify_nonce($nonce, $action = -1) {}
    function get_post($post = null, $output = OBJECT, $filter = 'raw') {}
    function get_posts($args = null)
    {
        return array();
    }
    function get_post_type($post = null)
    {
        return '';
    }
    function _x($text, $context, $domain = 'default')
    {
        return $text;
    }
    function __($text, $domain = 'default')
    {
        return $text;
    }
    function esc_attr($text)
    {
        return $text;
    }
    function esc_html($text)
    {
        return $text;
    }
    function esc_url_raw($url)
    {
        return $url;
    }
    function sanitize_text_field($str)
    {
        return $str;
    }
    function sanitize_hex_color($color)
    {
        return $color;
    }
    function wp_generate_uuid4()
    {
        return '';
    }
    function admin_url($path = '', $scheme = 'admin')
    {
        return '';
    }
    function get_option($option, $default = false)
    {
        return $default;
    }
    function update_option($option, $value, $autoload = null)
    {
        return true;
    }
    function wp_send_json_success($data = null, $status_code = null) {}
    function wp_send_json_error($data = null, $status_code = null) {}
    function check_ajax_referer($action = -1, $query_arg = false, $die = true) {}
    function current_user_can($capability, ...$args)
    {
        return true;
    }
    function plugin_dir_path($file)
    {
        return '';
    }
    function plugin_dir_url($file)
    {
        return '';
    }
    function plugin_basename($file)
    {
        return '';
    }
    function register_activation_hook($file, $callback) {}
    function wp_remote_request($url, $args = array())
    {
        return array();
    }
    function wp_remote_retrieve_response_code($response)
    {
        return 200;
    }
    function wp_remote_retrieve_body($response)
    {
        return '';
    }
    function wp_json_encode($data, $options = 0, $depth = 512)
    {
        return '';
    }
    function add_query_arg(...$args)
    {
        return '';
    }
    function set_transient($transient, $value, $expiration = 0)
    {
        return true;
    }
    function get_transient($transient)
    {
        return false;
    }
    function delete_transient($transient)
    {
        return true;
    }
    function get_the_post_thumbnail_url($post = null, $size = 'post-thumbnail')
    {
        return '';
    }
    function selected($selected, $current = true, $echo = true)
    {
        return '';
    }
    function checked($checked, $current = true, $echo = true)
    {
        return '';
    }
}
