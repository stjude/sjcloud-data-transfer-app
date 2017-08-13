const {BrowserWindow} = require('electron').remote;
const dx = require('../../app/dx');

$('#action-btn').on('click', function (e) {
	e.preventDefault();
	$('.hide-on-install').hide();
	$('.show-on-install').show();
	$('#action-btn')
			.removeClass('btn-stjude')
			.addClass('btn-stjude-warning')
			.text('Waiting...')
			.attr('disabled', true)
			.off('click'); // remove event listener

	dx.install(function (percentage, description) {
		$('#status-text').text(description);
	}, function (description) {
		$('#status-text').text(description);
	}, function (error, result) {
		$('#status-text').text('Successful!');
		$('.hide-on-success').hide();
		$('.show-on-success').show();
		$('#action-btn')
			.text('Next')
			.attr('disabled', false)
			.on('click', function (e) {
				e.preventDefault();
				BrowserWindow.getFocusedWindow().refreshState();
			});
	});
});
