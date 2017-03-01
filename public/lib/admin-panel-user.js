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


function onChangeHandler(e) {
	if (this.value != '') {
		superagent
			.post("/admin/api/user/edit")
			.send(serializeFormData(this.parentNode))
			.end(function (res) {
				if (res.error) {
					if (res.body.inputError) {
						res.body.inputError.forEach(function(input){
							alert(input.msg);
						});
					}
					return console.error(res.body.inputError || res.error);
				}
				if (res.body.userEdit){
					var cat = document.getElementById('uEditname');
					for (var i = 0; i <= cat.options.length - 1; i++) {
						if (res.body.userEdit[0].uid == cat.options[i].value) {
							cat.options[i].selected = 'selected';
							break;
						}
					}
					document.getElementById('uEdittscore').value = res.body.userEdit[0].utscore;
					document.getElementById('uEditdesc').innerHTML = res.body.userEdit[0].description;
				}	
			});	
	} else {
		document.getElementById('uEditname').options[0].selected = 'selected';
		document.getElementById('uEdittscore').value = '';
		document.getElementById('uEditdesc').innerHTML = '';
		
	}
}


document.querySelector('#logout').addEventListener('submit', onSubmitHandler);

document.querySelector('#userNewpanel form').addEventListener('submit', onSubmitHandler);
document.querySelector('#userRmpanel form').addEventListener('submit', onSubmitHandler);
document.querySelector('#userEditpanel form').addEventListener('submit', onSubmitHandler);

document.querySelector('#uEditname').addEventListener('change', onChangeHandler);

})();