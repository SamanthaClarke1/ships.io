$(function() {
	for(let i = 0; i < opts.SEAS_LIMIT; i++){
		$('.navigation').append(
			'<div class="btn btn-outline-warning col-2 navc navitem'+i+'" onclick="(selectDestination('+i+'))">'+i+'</div>'
		);
	};
});
function selectDestination(place) {
	for(let i = 0; i < opts.SEAS_LIMIT; i++) {
		$('.navitem'+i).removeClass('active')
	}
	$('.navitem'+place).addClass('active');
	$('.roomn').val(place);
}