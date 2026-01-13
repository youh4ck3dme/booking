<?php
if (!defined('WP_UNINSTALL_PLUGIN')) exit;
delete_option('bookflow_api_url');
delete_option('bookflow_api_key');
delete_option('bookflow_widget_config');
global $wpdb;
$wpdb->query("DELETE FROM $wpdb->options WHERE option_name LIKE '_transient_bookflow_%'");
$wpdb->query("DELETE FROM $wpdb->options WHERE option_name LIKE '_transient_timeout_bookflow_%'");
