
console.log(`Application started`);
$(function () {

	$('#CreateTextForm').on('submit', function (evt, target) {
		evt.preventDefault();
		let data = $('#CreateTextForm').serialize()
		$.post('/createtext', data)
		.then( response => {
			$('#CreateTextSuccess').html(`Success! Take your picture from the link <a href='${response.url}' target='_blank'>${response.url}</a>`);
		})
		.catch( error => {
			$('#CreateTextSuccess').html(`<span class="text-danger">${error.responseJSON.error}</span>`);
		})
	})

	$('#AddCaptionForm').on('submit', function (evt, target) {
		evt.preventDefault();

		let data = new FormData();
		data.append('text', $('#AddCaptionArea').val())
		data.append('image', $('#AddCaptionFile')[0].files[0])

		$.ajax({
			url: '/addcaption',
			data: data,
			cache: false,
			contentType: false,
			processData: false,
			method: 'POST',
		})
		.then( response => {
			$('#AddCaptionSuccess').html(`Success! Take your picture from the link <a href='${response.url}' target='_blank'>${response.url}</a>`);
		})
		.catch( error => {
			$('#AddCaptionSuccess').html(`<span class="text-danger">${error.responseJSON.error}</span>`);
		})
	})

})