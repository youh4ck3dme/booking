<?php
if (!defined('ABSPATH')) exit;
$api_url = get_option('bookflow_api_url');
$api_key = get_option('bookflow_api_key');
$widget_config = get_option('bookflow_widget_config');
?>
<div class="wrap bookflow-admin">
    <div class="bookflow-header">
        <div class="bookflow-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
        </div>
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    </div>

    <form action="options.php" method="post">
        <?php settings_fields('bookflow_settings'); ?>

        <div class="bookflow-card">
            <h2>API Configuration</h2>
            <table class="form-table">
                <tr>
                    <th><label for="bookflow_api_url">API URL</label></th>
                    <td>
                        <input name="bookflow_api_url" type="url" id="bookflow_api_url" value="<?php echo esc_attr($api_url); ?>" class="regular-text" placeholder="https://api.bookflow.pro">
                        <p class="description">Your API server base URL.</p>
                    </td>
                </tr>
                <tr>
                    <th><label for="bookflow_api_key">API Key</label></th>
                    <td>
                        <input name="bookflow_api_key" type="password" id="bookflow_api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text">
                        <p class="description">Required for secure data synchronization.</p>
                    </td>
                </tr>
            </table>
            <div style="margin-top: 20px;">
                <button type="button" id="test-connection-btn" class="button button-secondary">Test Connection</button>
                <button type="button" id="clear-cache-btn" class="button">Clear Cache</button>
            </div>
            <div id="connection-result"></div>
        </div>

        <div class="bookflow-card">
            <h2>Display Options</h2>
            <table class="form-table">
                <tr>
                    <th>Widget Theme</th>
                    <td>
                        <select name="bookflow_widget_config[theme]">
                            <option value="auto" <?php selected($widget_config['theme'] ?? '', 'auto'); ?>>Auto (Follow System)</option>
                            <option value="light" <?php selected($widget_config['theme'] ?? '', 'light'); ?>>Light Aesthetic</option>
                            <option value="dark" <?php selected($widget_config['theme'] ?? '', 'dark'); ?>>Premium Dark</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th>Accent Color</th>
                    <td>
                        <input name="bookflow_widget_config[primary_color]" type="color" value="<?php echo esc_attr($widget_config['primary_color'] ?? '#3B82F6'); ?>">
                        <span class="description">Used for buttons and active states.</span>
                    </td>
                </tr>
                <tr>
                    <th>Visibility</th>
                    <td>
                        <fieldset>
                            <label><input name="bookflow_widget_config[show_employees]" type="checkbox" value="1" <?php checked($widget_config['show_employees'] ?? true); ?>> Show Employee Selection</label><br>
                            <label><input name="bookflow_widget_config[show_prices]" type="checkbox" value="1" <?php checked($widget_config['show_prices'] ?? true); ?>> Display Service Prices</label>
                        </fieldset>
                    </td>
                </tr>
            </table>
        </div>

        <div class="bookflow-card">
            <h2>Usage Helper</h2>
            <div class="bookflow-shortcode-helper">
                <p>To display the booking widget on any page, use the following shortcode:</p>
                <code>[bookflow_widget]</code>
                <p style="margin-top: 10px;">Or use the <strong>BookFlow Widget</strong> block in the Gutenberg editor.</p>
            </div>
        </div>

        <div style="margin-top: 30px;">
            <?php submit_button('Save Professional Settings', 'primary'); ?>
        </div>
    </form>
</div>