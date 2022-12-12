$(function (){

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
        trigger: ".about-2",
        start: "top-=60% top",
        // markers: true,
        onEnter:function () {
            $('.about-2').addClass('vivi')
        }
    });

})