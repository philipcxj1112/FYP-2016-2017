(function() {
'use strict';

// Reference: https://ierg4210.github.io/web/lectures/04-lecture-HTTPAndClientSideFormHandling.html#31
function serializeFormData(form) {
	return [].map.call(form.elements, function(el) {
		if (el.name && !el.disabled 
				&& (!el.type || el.type.toLowerCase() !== 'checkbox' || el.checked)) {
			if (el.tagName === 'SELECT' && el.hasAttribute('multiple'))
				return [].map.call(el.selectedOptions, function(o) {
					return [el.name, o.value].map(encodeURIComponent).join('=');
				}).join('&');
			return [el.name, el.value].map(encodeURIComponent).join('=');
		}
	}).join('&');
};

function onSubmitHandler(e) {
	e.preventDefault();
	// Reference: http://visionmedia.github.io/superagent/#post-/%20put%20requests
	// Disable default form submission to prevent page load
	var serialize = serializeFormData(this);

	superagent
		.post(this.getAttribute('action'))
		.send(serialize)
		.end(function (res) {
			if (res.error) {
				if (res.body.dbError) {
					alert( 'dbError:' + res.body.dbError);
					location.href = '/admin';
				} else if (res.body.inputError) {
						res.body.inputError.forEach(function(input){
							alert(input.msg);
						});	
					}
					
				 
				return console.error(res.error);
			}

			alert('OK');
			// refresh the page with latest results
			location.reload();
		});
}

function onSubmitImageHandler(e) {
	e.preventDefault();
	// Reference: http://visionmedia.github.io/superagent/#post-/%20put%20requests
	// Disable default form submission to prevent page load
	//var serialize = serializeFormData(this);
	var formdata = new FormData(this);
	
	superagent
		.post(this.getAttribute('action'))
		.send(formdata)
		.type(null)
		.end(function (res) {
			if (res.error) {
				if (res.body.sessError) {
					alert(res.body.sessError);
					location.href = '/admin';
				} else if (res.body.imageInputError) {
					alert(res.body.imageInputError);
				} else if (res.body.inputError) {
					res.body.inputError.forEach(function(input){
						alert(input.msg);
					});	
				} 
				return console.error(res.error);
			}

			alert('OK');
			// refresh the page with latest results
			location.reload();
		});
}



document.querySelector('#logout').addEventListener('submit', onSubmitHandler);

document.querySelector('#locNewpanel form').addEventListener('submit', onSubmitHandler);
document.querySelector('#locRmpanel form').addEventListener('submit', onSubmitHandler);

document.querySelector('#pEditImagelist').addEventListener('change', onChangeHandler);
})();