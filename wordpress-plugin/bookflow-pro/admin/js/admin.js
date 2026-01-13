jQuery(document).ready(function ($) {
    $('#test-connection-btn').on('click', function () {
        var btn = $(this);
        var result = $('#connection-result');
        btn.prop('disabled', true).text(bookflowAdmin.strings.testing);
        $.post(bookflowAdmin.ajaxUrl, { action: 'bookflow_test_connection', nonce: bookflowAdmin.nonce }, function (response) {
            result.removeClass('success error').addClass(response.success ? 'success' : 'error').text(response.success ? bookflowAdmin.strings.success : response.data.message);
            btn.prop('disabled', false).text('Test Connection');
        });
    });
    $('#clear-cache-btn').on('click', function () {
        var btn = $(this);
        btn.prop('disabled', true).text(bookflowAdmin.strings.clearing);
        $.post(bookflowAdmin.ajaxUrl, { action: 'bookflow_clear_cache', nonce: bookflowAdmin.nonce }, function () {
            btn.prop('disabled', false).text(bookflowAdmin.strings.cleared);
            setTimeout(function () { btn.text('Clear Cache'); }, 2000);
        });
    });
});
