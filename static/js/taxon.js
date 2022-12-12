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
			slides[i].style.display = "none";  
		}
		slides[slideIndex-1].style.display = "block";  
		// 修改popup裡面的照片
		$('.imagepop #spe-image').attr("src",$('.mySlides:visible img').attr('src'));
		$('.imagepop #image_author').html($('.mySlides:visible img').next('.image_author').html());
		$('.imagepop #image_provider').html($('.mySlides:visible img').next('.image_provider').html());
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

        $('.controlAll').on('click',function(){
            controlAll()
        })

        $('.sticky_btn').on('click',function(){
            document.location=`/taxon/${$('[name=taxon_id]').val()}${$(this).data('hash')}`
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
			if (checked){
				//$('.loadingbox').removeClass('d-none');
				$.ajax({
					url: "/send_feedback",
					data:  $('#errorForm').serialize() + '&csrfmiddlewaretoken=' + $csrf_token,
					type: 'POST',
					dataType : 'json',
				})
				.done(function(results) {
					//$('.loadingbox').addClass('d-none');
					$('.mistakepop').fadeOut("slow");
					alert('回報已送出，謝謝您！');

				})
				.fail(function( xhr, status, errorThrown ) {
					$('.loadingbox').addClass('d-none');
					alert('發生未知錯誤！請聯絡管理員')
					console.log( 'Error: ' + errorThrown + 'Status: ' + xhr.status)
				}) 
		

			} else {
				alert('請檢查表格是否填寫完整，或電子郵件格式是否正確')
			}

		})

		$(document).on('keypress', function(e) {
			if (e.which === 13 )
			{
				$( ".search" ).trigger( "click" );
			}
		});

		$('.search').click(function(){
			if ($('input[name=keyword]').val()==''){
				alert('請輸入關鍵字')
			} else {
				window.location = '/catalogue?keyword=' + $('input[name=keyword]').val()
			}
		})
		// 收和控制
		$('.w-box .title-click').click(function(){
			if ($(this).parent('.w-box').hasClass('now')){
				$(this).parent('.w-box').removeClass('now')
			} else {
				$(this).parent('.w-box').addClass('now')
			}
			if ($('.w-box-2.now').length==1){
				$('.box-2.column').css('align-items','flex-start')
			} else {
				$('.box-2.column').css('align-items','')
			}
		})

		$('select[name=subject-select]').niceSelect();
	})

	$( ".mistake-btn" ).click(function() {
		$('.mistakepop').fadeIn("slow");
	});
	$( ".xx" ).click(function() {
		$('.mistakepop').fadeOut("slow");
	});


	$( ".imagepop .xx" ).click(function() {
		$('.imagepop').fadeOut("slow");
	});


	$( ".mySlides img" ).not('.nopic').click(function() {
		$('.imagepop').fadeIn("slow");
		$('.imagepop #spe-image').attr("src",this.src);
		$('.imagepop #image_author').html($(this).next('.image_author').html());
		$('.imagepop #image_provider').html($(this).next().next('.image_provider').html());
	});
