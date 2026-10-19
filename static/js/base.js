var $lang = $('[name="lang"]').attr('value');

// 站內 ajax 一律加上目前頁面的語言前綴，避免後端依 cookie 判斷語言，造成和頁面語言不一致
$.ajaxPrefilter(function(options) {
    if ($lang && /^\/(?!\/)/.test(options.url) && !/^\/(zh-hant|en-us|static|media|jsi18n|i18n)(\/|$)/.test(options.url)) {
        options.url = '/' + $lang + options.url;
    }
});

$(function (){

    window.canSearchClick = false;

    $('.search-area-n').on('mouseenter', function() {
        window.canSearchClick = false; 
    });

    $('.search-area-n').on('transitionend', function(e) {
        window.canSearchClick = true;
    });


    $('.search-area-n button').click(function(){
        if (window.canSearchClick | ($(window).width()<999 & $('.search-area-n').hasClass('d-block'))){
            if ($('input[name=topkeyword]').val()==''){
                $lang == 'en-us' ? alert("Please enter keywords") : alert("請輸入關鍵字");
            } else {
                window.location = '/' + $lang + '/catalogue?filter=0&name-select=contain&keyword=' + $('input[name=topkeyword]').val()
            }
        }
	})

	$('input[name=topkeyword]').on('keypress', function(e) {	
        if (window.canSearchClick | ($(window).width()<999 & $('.search-area-n').hasClass('d-block'))){
            if (e.which === 13 && !$('input[name=topkeyword]').val()==''){	
                e.preventDefault();
                window.location = '/' + $lang + '/catalogue?filter=0&name-select=contain&keyword=' + $('input[name=topkeyword]').val()
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

/* ===== 離線寄信請求：Turnstile 人機驗證共用函式 =====
 * 容器：<div class="ts-widget" data-sitekey="..."></div>
 * 彈窗打開時呼叫 tsRender()，送出時用 tsToken() 取 token；token 只能用一次，送出後再 tsRender() 重置
 */
function tsRender(selector){
	let el = $(selector)[0];
	if (!el) return;
	if (!window.turnstile){
		// api.js 為 async 載入，尚未就緒時稍後再試
		setTimeout(function(){ tsRender(selector) }, 300);
		return;
	}
	if (el.dataset.widgetId){
		turnstile.reset(el.dataset.widgetId);
	} else {
		el.dataset.widgetId = turnstile.render(el, {sitekey: el.dataset.sitekey, theme: 'light'});
	}
}

function tsToken(selector){
	let el = $(selector)[0];
	if (!el || !window.turnstile || !el.dataset.widgetId) return '';
	return turnstile.getResponse(el.dataset.widgetId) || '';
}

// 離線請求失敗訊息（後端回傳 reason: turnstile / email / rate_limit）
function offlineRequestFail(xhr){
	let reason = (xhr && xhr.responseJSON) ? xhr.responseJSON.reason : '';
	let en = (typeof $lang !== 'undefined' && $lang == 'en-us');
	if (reason == 'turnstile'){
		en ? alert('Please complete the verification') : alert('請完成人機驗證');
	} else if (reason == 'email'){
		en ? alert('Please enter a valid email.') : alert('請輸入正確的電子郵件');
	} else if (reason == 'rate_limit'){
		en ? alert('Too many requests. Please try again later.') : alert('請求過於頻繁，請稍後再試');
	} else {
		en ? alert('An unexpected error occured! Please contact us.') : alert('發生未知錯誤！請聯絡管理員');
	}
}
