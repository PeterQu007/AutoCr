$(function(){

	console.log('REPOST A LISTING');

	if (document.location.href.indexOf('edit')>-1) {
		$('#postingForm').submit();
	}

	if (document.location.href.indexOf('preview')>-1) {
		$('#publish_top').submit();
	}

	if (document.location.href.indexOf('redirect')>-1){
		$('section.body ul.ul li a')[2].click();
	}

}())