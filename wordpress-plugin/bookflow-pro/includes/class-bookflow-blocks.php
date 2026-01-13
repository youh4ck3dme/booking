<?php
if (!defined('ABSPATH')) exit;

class BookFlow_Blocks
{
    public static function init()
    {
        add_action('init', array(__CLASS__, 'register_blocks'));
    }

    public static function register_blocks()
    {
        if (!function_exists('register_block_type')) return;
        register_block_type(BOOKFLOW_PLUGIN_DIR . 'blocks/booking-widget', array('render_callback' => array(__CLASS__, 'render_booking_widget')));
        register_block_type(BOOKFLOW_PLUGIN_DIR . 'blocks/services-list', array('render_callback' => array(__CLASS__, 'render_services_list')));
    }

    public static function render_booking_widget($attributes)
    {
        return BookFlow_Shortcodes::render_widget(array(
            'theme' => $attributes['theme'] ?? '',
            'service' => $attributes['preselectedService'] ?? '',
            'location' => $attributes['preselectedLocation'] ?? '',
            'color' => $attributes['primaryColor'] ?? ''
        ));
    }

    public static function render_services_list($attributes)
    {
        return BookFlow_Shortcodes::render_services(array('category' => $attributes['category'] ?? '', 'columns' => $attributes['columns'] ?? '3'));
    }
}
