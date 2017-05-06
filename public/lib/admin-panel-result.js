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
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}



function onChangeHandler(e) {
	e.preventDefault();
	// Reference: http://visionmedia.github.io/superagent/#post-/%20put%20requests
	// Disable default form submission to prevent page load
	var serialize = serializeFormData(this);

		superagent
			.post(this.getAttribute('action'))
			.send(serialize)
			.end(function (res) {
				if (res.error) {
					if (res.body.inputError) {
						res.body.inputError.forEach(function(input){
							alert(input.msg);
						});
					}
					return console.error(res.body.inputError || res.error);
				}
				if (res.body.status){
					var temp = document.getElementById('GraphGen');
					if(!temp){
						sleep(2000);
						var blankImage = document.createElement("iframe");
						blankImage.id = 'GraphGen';
						blankImage.style.width = "1000px";
        				blankImage.style.height = "500px";
						document.getElementById('Graph').appendChild(blankImage);
						document.getElementById('GraphGen').src = 'https://plot.ly/~philipcxj/0.embed';
					}
					else{			
						sleep(2000);
						document.getElementById('GraphGen').src = 'https://plot.ly/~philipcxj/0.embed?' + new Date().getTime();						
					
				}	
			}
		});	

}


document.querySelector('#logout').addEventListener('submit', onSubmitHandler);

document.querySelector('#Resultpanel  form').addEventListener('submit', onChangeHandler);

//document.querySelector('#Sluname').addEventListener('change', onChangeHandler);
})();