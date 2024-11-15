
var $lang = $('[name="lang"]').attr('value');

$(function (){

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


    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
        trigger: ".section-2-statistics",
        start: "top-=60% top",
        // markers: true,
        onEnter:function () {
            $('.section-2-statistics').addClass('vivi')
        }
    });
    ScrollTrigger.create({
        trigger: ".section-3-news",
        start: "top-=40% top",
        // markers: true,
        onEnter:function () {
            $('.section-3-news').addClass('vivi')
        }
    });

    $('.language-item').on('click',function (event) {
        document.getElementById("language").setAttribute("value",event.target.getAttribute("value"));
        document.getElementById("language-selected").submit();
    });

})