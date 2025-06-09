var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');

//https://emailregex.com
function ValidateEmail(inputText) {
	let mailformat = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
	if (inputText.match(mailformat)) {
		return true
	} else {
		return false
	}
}


$(function(){


	let cols = ['title','description','notify','name','email']
	$('.submit-reference').click(function(){
		let checked = true;
		for (c of cols){
			if ($(`.error-form input[name=${c}]`).val()==''){
				checked = false;
			}
		}
		if ($('input[name=notify]'))
		if (!ValidateEmail($(`.error-form input[name=${c}]`).val())){
			checked = false;
		}
		if (checked){
			$.ajax({
				url: "/send_register_taxon",
				data:  $('#registerTaxonForm').serialize() + '&is_solved=0&csrfmiddlewaretoken=' + $csrf_token,
				type: 'POST',
				dataType : 'json',
			})
			.done(function(results) {
				if (results['status'] == 'done'){
					//$('.loadingbox').addClass('d-none');
					$('.registerpop').fadeOut("slow");
					//alert('回報已送出，謝謝您！');
					$lang == 'en-us' ? alert("Your feedback has been sent. Thank you!") : alert("回報已送出，謝謝您！");
				} else {
					$lang == 'en-us' ? alert('An unexpected error occured! Please contact us.') : alert('發生未知錯誤！請聯絡管理員')
				}
			})
			.fail(function( xhr, status, errorThrown ) {
				$lang == 'en-us' ? alert('An unexpected error occured! Please contact us.') : alert('發生未知錯誤！請聯絡管理員')
				console.log( 'Error: ' + errorThrown + 'Status: ' + xhr.status)
			}) 
	

		} else {
			$lang == 'en-us' ? alert("Please fill out the form completely") : alert("請檢查表格是否填寫完整，或電子郵件格式是否正確");

			//alert('請檢查表格是否填寫完整，或電子郵件格式是否正確')
		}

	})


	$( ".register-btn" ).click(function() {
		$('.registerpop').fadeIn("slow");
		$('.registerpop').removeClass('d-none')
	});

	$( ".registerpop .xx" ).click(function() {
		$('.registerpop').fadeOut("slow");
		$('.registerpop').addClass('d-none')
	});


	
	$('#registerTaxonForm select[name=register-type]').niceSelect();


	$('#registerTaxonForm select[name=register-bio-group]').niceSelect();


})
