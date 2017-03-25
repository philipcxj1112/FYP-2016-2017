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

function onChangeHandler(e) {
	if (this.value != '') {
		superagent
			.post("/admin/api/pic/edit")
			.send(serializeFormData(this.parentNode.parentNode))
			.end(function (res) {
				if (res.error) {
					if (res.body.inputError) {
						res.body.inputError.forEach(function(input){
							alert(input.msg);
						});
					}
					return console.error(res.body.inputError || res.error);
				}
				if (res.body.picEdit){
					var cat = document.getElementById('pEditImagelist');
					var loc = document.getElementById('pEditlid');
					for (var i = 0; i <= cat.options.length - 1; i++) {
						if (res.body.picEdit[0].pid == cat.options[i].value) {
							cat.options[i].selected = 'selected';
							break;
						}
					}
					document.getElementById('pEditName').value = res.body.picEdit[0].pname;
					document.getElementById('pEditdesc').innerHTML = res.body.picEdit[0].description;
					var blankImage = document.createElement("img");
					blankImage.id = 'prodOrgImage';
					document.getElementById('OrgPicture').appendChild(blankImage);
					document.getElementById('prodOrgImage').src = '..' + res.body.picEdit[0].imgurl;
				}	
			});	
	} else {
		document.getElementById('prodEditCatId').options[0].selected = 'selected';
		document.getElementById('prodEditName').value = '';
		document.getElementById('prodEditPrice').value = '';
		document.getElementById('prodEditDescription').innerHTML = '';

		var removeImage = document.getElementById('prodOrgImage');
		removeImage.parentNode.removeChild(removeImage);
		
	}
}


document.querySelector('#logout').addEventListener('submit', onSubmitHandler);

document.querySelector('#userNewpanel form').addEventListener('submit', onSubmitHandler);
document.querySelector('#locNewpanel form').addEventListener('submit', onSubmitHandler);
document.querySelector('#userRmpanel form').addEventListener('submit', onSubmitHandler);
document.querySelector('#picRmpanel form').addEventListener('submit', onSubmitHandler);
document.querySelector('#locRmpanel form').addEventListener('submit', onSubmitHandler);

document.querySelector('#piclocNewpanel  form').addEventListener('submit', onSubmitImageHandler);
document.querySelector('#picuserNewpanel  form').addEventListener('submit', onSubmitImageHandler);

document.querySelector('#pEditImagelist').addEventListener('change', onChangeHandler);
})();