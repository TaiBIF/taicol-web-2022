var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    

function addClass(element, className){
    element.className += ' ' + className;   
}

function removeClass(element, className) {
    element.className = element.className.replace(
    new RegExp('( |^)' + className + '( |$)', 'g'), ' ').trim();
}

//https://emailregex.com
function ValidateEmail(inputText) {
	let mailformat = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
	if (inputText.match(mailformat)) {
		return true
	} else {
		return false
	}
	}


let slideIndex = 1;
showSlides(slideIndex);


function plusSlides(n) {
	showSlides(slideIndex += n);
}

function currentSlide(n) {
	showSlides(slideIndex = n);
}

function showSlides(n) {
	let i;
	let slides = document.getElementsByClassName("mySlides");
	if (n > slides.length) {slideIndex = 1}    
	if (n < 1) {slideIndex = slides.length}
	for (i = 0; i < slides.length; i++) {
		removeClass(slides[i], 'd-none')
		removeClass(slides[i], 'd-block')
		addClass(slides[i], 'd-none')
	}

	removeClass(slides[slideIndex-1], 'd-none')
	addClass(slides[slideIndex-1], 'd-block')

	// 修改彈跳視窗內的照片
	let current_elem = slides[slideIndex-1];
	if (current_elem!=undefined){
		if (current_elem.getElementsByClassName('no-pic').length == 0){
			$('.imagepop #spe-image').attr("src",current_elem.getElementsByTagName('img')[0].src);
			$('.imagepop #image_author').html(current_elem.getElementsByClassName('image_author')[0].innerText);
			$('.imagepop #image_license').html(current_elem.getElementsByClassName('image_license')[0].innerText);
			$('.imagepop #image_provider').html(current_elem.getElementsByClassName('image_provider')[0].innerText);
			$('.imagepop #image_permalink').attr("href",current_elem.getElementsByClassName('image_permalink')[0].innerText);
		}
	}
}


function controlAll(){


	if($('.w-box.now').length == 0){
		$('.w-box').addClass('now')
		$('.all-open-close').removeClass('now')
	} else {
		$('.w-box').removeClass('now')
		$('.all-open-close').addClass('now')

	}
}




$(function(){

	$('.more-history').on('click', function(){
		if ($(this).hasClass('now')){
			$(this).removeClass('now')
			$('.history-rows-after').addClass('d-none')
		} else {
			$(this).addClass('now')
			$('.history-rows-after').removeClass('d-none')
		}
	})


	$('#errorForm select[name=feedback_type]').niceSelect();

	$('.rank-area .item').on('mouseenter',(function(){
		$(this).find('.search-rank').removeClass('d-none')
	}))

	$('.rank-area .item').on('mouseleave',(function(){
		$(this).find('.search-rank').addClass('d-none')
	}))

	$('.controlAll').on('click',function(){
		controlAll()
	})

	$('.sticky_btn').on('click',function(){
		document.location=document.location.pathname+`${$(this).data('hash')}`
	})
	
	$('.plusSlides').on('click',function(){
		if ($(this).data('index')=='+1'){
			plusSlides(+1)
		} else if ($(this).data('index')=='-1' ){
			plusSlides(-1)
		}
	})


	// 照片
	let cols = ['title','description','notify','name','email']
	$('.feedback').click(function(){
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
		// 檢查 Turnstile token
		let token = $('#errorForm input[name="cf-turnstile-response"]').val();
		if (!token) {
			$lang == 'en-us' ? alert("Please complete the verification") : alert("請完成人機驗證");
			return;
		}
		if (checked){
			$.ajax({
				url: "/send_feedback",
				data:  $('#errorForm').serialize() + '&is_solved=0&csrfmiddlewaretoken=' + $csrf_token,
				type: 'POST',
				dataType : 'json',
			})
			.done(function(results) {
				if (results['status'] == 'done'){
					$('.mistakepop').fadeOut("slow");
					$lang == 'en-us' ? alert("Your feedback has been sent. Thank you!") : alert("回報已送出，謝謝您！");
					if (window.turnstile) turnstile.reset(); 
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
		}

	})

	// 收和控制


	// #content-wrapper > div.page-top > div.species-de-content > div > div.right-de-box > div.box-2.column.ai-none > div.leftbox > div > div.title-click > div.mark-title > p
	$('.w-box .title-click .mark-title p' ).click(function(){

		if ($(this).parent().parent().parent('.w-box').hasClass('now')){
			$(this).parent().parent().parent('.w-box').removeClass('now')
		} else {
			$(this).parent().parent().parent('.w-box').addClass('now')
		}
		if ($('.w-box-2.now').length==1){
			$('.box-2.column').addClass('flex-start')
		} else {
			$('.box-2.column').removeClass('flex-start')
		}
	})

	$('.w-box .title-click .arr' ).click(function(){

		if ($(this).parent().parent('.w-box').hasClass('now')){
			$(this).parent().parent('.w-box').removeClass('now')
		} else {
			$(this).parent().parent('.w-box').addClass('now')
		}
		if ($('.w-box-2.now').length==1){
			$('.box-2.column').addClass('flex-start')
		} else {
			$('.box-2.column').removeClass('flex-start')
		}
	})

	$('select[name=subject-select]').niceSelect();


	$( ".mistake-btn" ).click(function() {
		$('.mistakepop').fadeIn("slow");
		$('.mistakepop').removeClass('d-none')
	});

	$( ".mistakepop .xx" ).click(function() {
		$('.mistakepop').fadeOut("slow");
		$('.mistakepop').addClass('d-none')
	});


	$( ".imagepop .xx" ).click(function() {
		$('.imagepop').fadeOut("slow");
		$('.imagepop').addClass("d-none");
	});


	$( ".mySlides img" ).not('.nopic').click(function() {
		$('.imagepop').removeClass('d-none')
		$('.imagepop').fadeIn("slow");
		$('.imagepop #spe-image').attr("src",this.src);
		$('.imagepop #image_author').html($(this).next('.image_author').html());
		$('.imagepop #image_provider').html($(this).next().next('.image_provider').html());
		$('.imagepop #image_permalink').attr("href",$(this).next().next().next('.image_permalink').html());

	});

	$('.show-higher-button').on('click', function(){		


		$.ajax({
			url: `/get_taxon_higher?taxon_id=${$('input[name=taxon_id]').val()}&path=${$(this).data('path')}&rank_id=${$('input[name=rank_id]').val()}`,
		})
		.done(function(results) {

			$('.rank-area').html('')

			for (r of results){
				$('.rank-area').append(
					`
					<div class="item">
						<div class="cir-box ${ r['rank_color'] }">
							${ r['rank_c']  }
						</div>
						<a ${ r['a_href'] ? `class="rank-p" href="${ r['a_href'] }"` : `class="rank-p a-disabled" `}>
						${ r['a_content']  }
						</a>
						${ r['search_href'] ? `<a class="search-rank d-none" href="${ r['search_href'] }">
							<i class="ml-5 fa-solid fa-magnifying-glass"></i></a>` : '' }
					</div>
					`
				)

			}

			$('.rank-area .item').off('mouseenter')

			$('.rank-area .item').on('mouseenter',(function(){
				$(this).find('.search-rank').removeClass('d-none')
			}))
		
			$('.rank-area .item').off('mouseleave')
			$('.rank-area .item').on('mouseleave',(function(){
				$(this).find('.search-rank').addClass('d-none')
			}))
		
		
		})
		.fail(function( xhr, status, errorThrown ) {
		$('.loadingbox').addClass('d-none');
			//alert('發生未知錯誤！請聯絡管理員')
			$lang == 'en-us' ? alert('An unexpected error occured! Please contact us.') : alert('發生未知錯誤！請聯絡管理員')
			console.log( 'Error: ' + errorThrown + 'Status: ' + xhr.status)
		}) 
		
		


		if ($(this).data('path') == 'lin_path'){
			$(this).data('path', 'path')
			$(this).html(`<a>${gettext('完整階層')}</a>`)
		} else {
			$(this).data('path', 'lin_path')
			$(this).html(`<a>${gettext('林奈階層')}</a>`)

		}

	


	})
	
})