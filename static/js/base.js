$(function (){

    $('.go-topbtn').on('click', function(){
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;	  
    })    

    $('.ham4').on('click', function() {
        if($(window).width()<999){
            $('.ham4').toggleClass('active');
            $('.main_menu').slideToggle();
        }else{
            $('.ham4').removeClass('active');
            $('.main_menu').css("display", "flex");
        }
    });

    $(window).resize(function(){

        if($(window).width()>=999){
            $('.main_menu').css("display", "flex");
        }else{
            $('.ham4').removeClass('active');
            $('.main_menu').css("display", "none");
        }
    })

    if ($(window).width() < 960) {
        $('.mbli').addClass('rd_mb_two_menu_li');
    }else{
        $('.mbli').removeClass('rd_mb_two_menu_li');
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


})