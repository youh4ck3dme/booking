<?php
if (!defined('ABSPATH')) exit;

class BookFlow_API
{
    private static $instance = null;
    private $api_url;
    private $api_key;
    private $cache_time = 900;

    public static function instance()
    {
        if (null === self::$instance) self::$instance = new self();
        return self::$instance;
    }

    private function __construct()
    {
        $this->refresh();
    }

    public function refresh()
    {
        $this->api_url = rtrim(get_option('bookflow_api_url', ''), '/');
        $this->api_key = get_option('bookflow_api_key', '');
    }

    private function request($endpoint, $method = 'GET', $body = null)
    {
        if (empty($this->api_url) || empty($this->api_key)) {
            return new WP_Error('missing_config', __('API configuration is missing.', 'bookflow-pro'));
        }
        $args = array(
            'method' => $method,
            'headers' => array('X-BookFlow-API-Key' => $this->api_key, 'Content-Type' => 'application/json'),
            'timeout' => 15
        );
        if ($body) $args['body'] = wp_json_encode($body);
        $response = wp_remote_request($this->api_url . $endpoint, $args);
        if (is_wp_error($response)) return $response;
        $status = wp_remote_retrieve_response_code($response);
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if ($status >= 400) return new WP_Error('api_error', $data['message'] ?? 'API Error');
        return $data['data'] ?? $data;
    }

    public function get($endpoint)
    {
        return $this->request($endpoint, 'GET');
    }

    public function post($endpoint, $body)
    {
        return $this->request($endpoint, 'POST', $body);
    }

    public function delete($endpoint)
    {
        return $this->request($endpoint, 'DELETE');
    }

    public function test_connection()
    {
        return $this->request('/api/v1/services');
    }

    public function get_services()
    {
        $services = get_transient('bookflow_services');
        if (false === $services) {
            $services = $this->request('/api/v1/services');
            if (!is_wp_error($services)) set_transient('bookflow_services', $services, $this->cache_time);
        }
        return $services;
    }

    public function get_employees($service_id = null)
    {
        $cache_key = 'bookflow_employees_' . ($service_id ?: 'all');
        $employees = get_transient($cache_key);
        if (false === $employees) {
            $endpoint = '/api/v1/employees';
            if ($service_id) $endpoint = add_query_arg('serviceId', $service_id, $endpoint);
            $employees = $this->request($endpoint);
            if (!is_wp_error($employees)) set_transient($cache_key, $employees, $this->cache_time);
        }
        return $employees;
    }

    public function get_slots($date, $service_id, $employee_id = null)
    {
        $params = array('date' => $date, 'serviceId' => $service_id);
        if ($employee_id) $params['employeeId'] = $employee_id;
        return $this->request(add_query_arg($params, '/api/v1/slots'));
    }

    public function create_booking($data)
    {
        $result = $this->request('/api/v1/bookings', 'POST', $data);
        if (!is_wp_error($result)) $this->clear_cache();
        return $result;
    }

    public function clear_cache()
    {
        delete_transient('bookflow_services');
        global $wpdb;
        $wpdb->query("DELETE FROM $wpdb->options WHERE option_name LIKE '_transient%bookflow_employees%'");
    }
}
