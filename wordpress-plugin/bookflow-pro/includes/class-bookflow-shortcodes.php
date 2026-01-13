<?php
if (!defined('ABSPATH')) exit;

class BookFlow_Shortcodes
{
    public static function init()
    {
        add_shortcode('bookflow_widget', array(__CLASS__, 'render_widget'));
        add_shortcode('bookflow_services', array(__CLASS__, 'render_services'));
        add_shortcode('bookflow_button', array(__CLASS__, 'render_button'));
        add_action('wp_enqueue_scripts', array(__CLASS__, 'register_assets'));
    }

    public static function register_assets()
    {
        wp_register_style('bookflow-widget', BOOKFLOW_PLUGIN_URL . 'public/css/widget.css', array(), BOOKFLOW_VERSION);
        wp_register_script('bookflow-widget', BOOKFLOW_PLUGIN_URL . 'public/js/widget.js', array(), BOOKFLOW_VERSION, true);
    }

    public static function render_widget($atts)
    {
        $atts = shortcode_atts(array(
            'theme' => '',
            'service' => '',
            'employee' => '',
            'location' => '',
            'color' => ''
        ), $atts, 'bookflow_widget');
        wp_enqueue_style('bookflow-widget');
        wp_enqueue_script('bookflow-widget');

        $api_url = get_option('bookflow_api_url', '');
        $api_key = get_option('bookflow_api_key', '');
        $js_api_url = str_replace('host.docker.internal', 'localhost', $api_url);
        $widget_config = get_option('bookflow_widget_config', array());

        $config = array(
            'apiUrl' => $js_api_url,
            'apiKey' => $api_key,
            'theme' => $atts['theme'] ?: ($widget_config['theme'] ?? 'auto'),
            'primaryColor' => $atts['color'] ?: ($widget_config['primary_color'] ?? '#3B82F6'),
            'showEmployees' => $widget_config['show_employees'] ?? true,
            'showPrices' => $widget_config['show_prices'] ?? true,
            'locale' => $widget_config['locale'] ?? 'sk',
            'preselectedService' => $atts['service'],
            'preselectedEmployee' => $atts['employee'],
            'preselectedLocation' => $atts['location']
        );

        wp_localize_script('bookflow-widget', 'bookflowConfig', $config);
        ob_start();
        include BOOKFLOW_PLUGIN_DIR . 'public/templates/booking-widget.php';
        return ob_get_clean();
    }

    public static function render_services($atts)
    {
        $atts = shortcode_atts(array('category' => '', 'columns' => '3'), $atts, 'bookflow_services');
        wp_enqueue_style('bookflow-widget');
        $api = BookFlow_API::instance();
        $services = $api->get_services();
        if (is_wp_error($services) || empty($services)) return '<p class="bookflow-error">No services available.</p>';

        $columns = intval($atts['columns']);
        ob_start();
        echo '<div class="bookflow-services-grid" style="--bf-columns: ' . esc_attr($columns) . '">';
        foreach ($services as $service) {
            echo '<div class="bookflow-service-card"><h3>' . esc_html($service['name']) . '</h3><p>€' . esc_html($service['price']) . ' - ' . esc_html($service['duration']) . ' min</p></div>';
        }
        echo '</div>';
        return ob_get_clean();
    }

    public static function render_button($atts)
    {
        $atts = shortcode_atts(array('text' => __('Book Now', 'bookflow-pro'), 'service' => '', 'class' => ''), $atts, 'bookflow_button');
        wp_enqueue_style('bookflow-widget');
        wp_enqueue_script('bookflow-widget');
        $data_service = $atts['service'] ? ' data-service="' . esc_attr($atts['service']) . '"' : '';
        return sprintf('<button class="bookflow-cta-button %s"%s>%s</button>', esc_attr($atts['class']), $data_service, esc_html($atts['text']));
    }
}
