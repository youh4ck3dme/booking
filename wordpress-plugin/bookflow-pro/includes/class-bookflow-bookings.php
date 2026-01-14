<?php
if (!defined('ABSPATH')) exit;

class BookFlow_Bookings
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
        // Menu item added in BookFlow_Admin
    }

    public static function render_page()
    {
        $api = BookFlow_API::instance();
        $response = $api->request('/api/v1/bookings');
        $bookings = is_wp_error($response) ? [] : $response;

?>
        <div class="wrap">
            <h1 class="wp-heading-inline"><?php _e('Bookings', 'bookflow-pro'); ?></h1>
            <hr class="wp-header-end">

            <?php if (is_wp_error($response)) : ?>
                <div class="notice notice-error">
                    <p><?php echo esc_html($response->get_error_message()); ?></p>
                </div>
            <?php endif; ?>

            <div class="tablenav top">
                <div class="alignleft actions">
                    <!-- Future: Filter by Location/Date -->
                </div>
                <div class="tablenav-pages">
                    <span class="displaying-num"><?php echo count($bookings); ?> <?php _e('items', 'bookflow-pro'); ?></span>
                </div>
                <br class="clear">
            </div>

            <table class="wp-list-table widefat fixed striped table-view-list posts">
                <thead>
                    <tr>
                        <th scope="col" class="manage-column"><?php _e('Date', 'bookflow-pro'); ?></th>
                        <th scope="col" class="manage-column"><?php _e('Customer', 'bookflow-pro'); ?></th>
                        <th scope="col" class="manage-column"><?php _e('Service', 'bookflow-pro'); ?></th>
                        <th scope="col" class="manage-column"><?php _e('Employee', 'bookflow-pro'); ?></th>
                        <th scope="col" class="manage-column"><?php _e('Status', 'bookflow-pro'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($bookings)) : ?>
                        <tr>
                            <td colspan="5"><?php _e('No bookings found.', 'bookflow-pro'); ?></td>
                        </tr>
                    <?php else : ?>
                        <?php foreach ($bookings as $booking) : ?>
                            <tr>
                                <td>
                                    <strong><?php echo esc_html(date_i18n(get_option('date_format'), strtotime($booking['date']))); ?></strong><br>
                                    <?php echo esc_html($booking['startTime'] . ' - ' . $booking['endTime']); ?>
                                </td>
                                <td>
                                    <strong><?php echo esc_html($booking['customerName']); ?></strong><br>
                                    <a href="mailto:<?php echo esc_attr($booking['customerEmail']); ?>"><?php echo esc_html($booking['customerEmail']); ?></a>
                                </td>
                                <td><?php echo esc_html($booking['serviceName']); ?></td>
                                <td><?php echo esc_html($booking['employeeName']); ?></td>
                                <td><span class="bf-status-badge bf-status-<?php echo esc_attr($booking['status']); ?>"><?php echo esc_html(ucfirst($booking['status'])); ?></span></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        <style>
            .bf-status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
            }

            .bf-status-confirmed {
                background: #d1fae5;
                color: #065f46;
            }

            .bf-status-cancelled {
                background: #fee2e2;
                color: #991b1b;
            }

            .bf-status-pending {
                background: #fef3c7;
                color: #92400e;
            }
        </style>
<?php
    }
}
