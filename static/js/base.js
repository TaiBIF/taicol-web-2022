
var $lang = $('[name="lang"]').attr('value');

$(function (){

    var canSearchClick = false;

    $('.search-area-n').on('mouseenter', function() {
        canSearchClick = false; 
    });

    $('.search-area-n').on('transitionend', function(e) {
        canSearchClick = true;
    });


    $('.search-area-n button').click(function(){
        if (canSearchClick | $('.search-area-n').hasClass('d-block')){
            if ($('input[name=topkeyword]').val()==''){
                $lang == 'en-us' ? alert("Please enter keywords") : alert("請輸入關鍵字");
            } else {
                window.location = '/catalogue?filter=0&name-select=contain&keyword=' + $('input[name=topkeyword]').val()
            }
        }
	})

	$('input[name=topkeyword]').on('keypress', function(e) {	
        if (canSearchClick | $('.search-area-n').hasClass('d-block')){
            if (e.which === 13 && !$('input[name=topkeyword]').val()==''){	
                e.preventDefault();
                window.location = '/catalogue?filter=0&name-select=contain&keyword=' + $('input[name=topkeyword]').val()
            }
        }
	});


    $('.go-topbtn').on('click', function(){
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;	  
    })    

    $('.ham4').on('click', function() {
        if($(window).width()<999){
            if (!$('.ham4').hasClass('active')){
                $('.ham4').addClass('active')
                $('.main_menu').addClass('d-block').removeClass('d-none')
            } else {
                $('.ham4').removeClass('active')
                $('.main_menu').removeClass('d-block').addClass('d-none')
            }
        }else{
            $('.ham4').removeClass('active');
            $('.main_menu').addClass('d-flex').removeClass('d-none');
        }
    });

    $(window).resize(function(){

        if($(window).width()>=999){
            $('.main_menu').addClass('d-flex').removeClass('d-none').removeClass('d-block');
        }else{
            $('.ham4').removeClass('active');
            $('.main_menu').addClass('d-none').removeClass('d-flex');
        }
    })

    if ($(window).width() < 960) {
        $('.mbli').addClass('rd_mb_two_menu_li');
        $('.mbli a.big_title').addClass('fit-content');
    }else{
        $('.mbli').removeClass('rd_mb_two_menu_li');
        $('.mbli a.big_title').removeClass('fit-content');
    }


    $('.rd_mb_two_menu_li').on('click',function (event) {

        if( $(this).closest('li').hasClass('now')){
            $(this).removeClass('now');
            $(this).find('.menu_2').slideUp();

        }else{
            $(this).addClass('now');
            $(this).find('.menu_2').slideDown();
        }
    });


    $('.language-item').on('click',function (event) {
        document.getElementById("language").setAttribute("value",event.target.getAttribute("value"));
        document.getElementById("language-selected").submit();
    });

    		//2025//
		$('.mb-searchbtn').on('click', function() {
			if($(window).width()<999){
				$('.search-area-n').toggleClass('d-none')
				$('.search-area-n').toggleClass('d-block')
                // .removeClass('d-block');
			}else{
				$('.search-area-n').removeClass('d-none').addClass('d-block');
			}
		});
		$(window).on('resize', function() {
			if ($(window).width() >= 999) {
				$('.search-area-n').removeClass('d-none').addClass('d-block');
			} else {
				// 如果你想預設手機版先隱藏（可加判斷）
				if (!$('.mb-searchbtn').hasClass('active')) {
					$('.search-area-n').addClass('d-none').removeClass('d-block');
				}
			}
		}).trigger('resize');


})