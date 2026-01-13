<?php
if (!defined('ABSPATH')) exit;
$widget_id = 'bookflow-widget-' . uniqid();
?>
<div id="<?php echo esc_attr($widget_id); ?>" class="bookflow-widget" data-config='<?php echo esc_attr(wp_json_encode($config)); ?>'>
    <div class="bookflow-loading">
        <div class="bookflow-spinner"></div>
        <p>Loading...</p>
    </div>
    <div class="bookflow-container" style="display:none;">
        <div class="bookflow-progress">
            <div class="bookflow-step active" data-step="0"><span class="step-number">1</span><span class="step-label">Service</span></div>
            <div class="bookflow-step" data-step="1"><span class="step-number">2</span><span class="step-label">Staff</span></div>
            <div class="bookflow-step" data-step="2"><span class="step-number">3</span><span class="step-label">Time</span></div>
            <div class="bookflow-step" data-step="3"><span class="step-number">4</span><span class="step-label">Details</span></div>
        </div>
        <div class="bookflow-step-content">
            <div class="bookflow-panel" data-panel="0">
                <h3>Select a Service</h3>
                <div class="bookflow-services-list"></div>
            </div>
            <div class="bookflow-panel" data-panel="1" style="display:none;">
                <h3>Choose Staff</h3>
                <div class="bookflow-employees-list"></div>
            </div>
            <div class="bookflow-panel" data-panel="2" style="display:none;">
                <h3>Pick Date & Time</h3>
                <div class="bookflow-datetime">
                    <div class="bookflow-calendar"></div>
                    <div class="bookflow-timeslots"></div>
                </div>
            </div>
            <div class="bookflow-panel" data-panel="3" style="display:none;">
                <h3>Your Details</h3>
                <form class="bookflow-customer-form">
                    <div class="bookflow-form-group"><label>Name</label><input type="text" name="customerName" required></div>
                    <div class="bookflow-form-group"><label>Email</label><input type="email" name="customerEmail" required></div>
                    <div class="bookflow-form-group"><label>Phone</label><input type="tel" name="customerPhone" required></div>
                    <div class="bookflow-form-group"><label>Notes</label><textarea name="notes" rows="3"></textarea></div>
                </form>
            </div>
            <div class="bookflow-panel" data-panel="4" style="display:none;">
                <div class="bookflow-confirmation">
                    <div class="bookflow-success-icon">✓</div>
                    <h3>Booking Confirmed!</h3>
                    <div class="bookflow-booking-summary"></div>
                </div>
            </div>
        </div>
        <div class="bookflow-nav"><button type="button" class="bookflow-btn bookflow-btn-prev" style="display:none;">← Back</button><button type="button" class="bookflow-btn bookflow-btn-next bookflow-btn-primary" disabled>Continue →</button></div>
    </div>
    <div class="bookflow-error-state" style="display:none;">
        <p class="bookflow-error-message"></p><button type="button" class="bookflow-btn bookflow-btn-retry">Try Again</button>
    </div>
</div>