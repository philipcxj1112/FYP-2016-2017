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


function onClickHandler(e) {

	var temp = document.getElementById('createdframe');
	if(!temp){
		var blankImage = document.createElement("iframe");
		blankImage.id = 'createdframe';
		blankImage.style.width = "1366px";
        blankImage.style.height = "768px";
		document.getElementById('estimoframe').appendChild(blankImage);
		document.getElementById('createdframe').src = 'https://cloud.estimote.com/';
	}
	else{
		document.getElementById('createdframe').src = 'https://cloud.estimote.com/?' + new Date().getTime();						
	}	

}

document.querySelector('#logout').addEventListener('submit', onSubmitHandler);
document.querySelector('#estimo').addEventListener('click', onClickHandler);
})();