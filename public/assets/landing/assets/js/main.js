/*global $, jQuery ,AOS*/

(function ($) {

    "use strict";

    var $window = $(window),
        $body = $('body'),
        $foxappMenu = $('.foxapp-header'),
        $countUp = $('.fact-box h5'),
        $otherFeaturesSlider = $('.other-features-slider'),
        $screenshotsSlider = $('.screenshots-slider'),
        $testimonialSslider = $('.testimonial-slider'),
        $teamSlider = $('.team-slider'),
        $logosSlider = $('.logos-slider'),
        $recentNewsSlider = $('.recent-news-slider');

    /*START PRELOADER JS & REFRESH AOS*/
    $window.on('load', function () {
        $('.preloader').delay(350).fadeOut('slow');
        AOS.refresh();
		setTimeout(function(){ AOS.refresh(); });
    });
    /*END PRELOADER JS & REFRESH AOS*/

	$window.on('scroll load resize', function () {
		var currentLink = $(this);
		if ($(currentLink).scrollTop() > 500) {
			$foxappMenu.addClass("sticky");
		} else {
			$foxappMenu.removeClass("sticky");
		}
	});

    $(document).ready(function () {

        $('.themes-colors span').on('click', function () {
            $('.themes-colors').toggleClass('open');
        });

        $('.themes-colors ul li a').on('click', function () {
            var styleSrc = $(this).attr("data-style");
            $('.themes-colors ul li').removeClass('active');
            $('#themes_colors').attr("href", "assets/css/" + styleSrc + ".css");
            $(this).parent().toggleClass('active');
        });

        /*START AOS JS*/
        AOS.init({
            disable: 'mobile',
            once: true,
            duration: 600
        });
        /*END AOS JS*/

        /*START SCROLL SPY JS*/
        $body.scrollspy({
            target: '#main_menu',
        });
        /*END SCROLL SPY JS*/

        /*START MENU JS*/
        $('a.anchor').on('click', function (e) {
            var anchor = $(this);
            var ancAtt = $(anchor.attr('href'));
            $('html, body').stop().animate({
                scrollTop: ancAtt.offset().top
            }, 1000);
            e.preventDefault();
        });
        /*END MENU JS*/
        
        /*START OTHER FEATURES SLIDER JS*/
        if ($otherFeaturesSlider.length > 0) {
            $otherFeaturesSlider.slick({
                rtl: true,
                centerMode: true,
                centerPadding: '150px',
                slidesToShow: 3,
                infinite: false,
                focusOnSelect: true,
                arrows: false,
                responsive: [{
                        breakpoint: 1200,
                        settings: {
                            slidesToShow: 3,
                            centerPadding: '0',
                        }
                    },
                    {
                        breakpoint: 992,
                        settings: {
                            slidesToShow: 1,
                            centerPadding: '150px',
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            centerPadding: '0',
                        }
                    },
                ]
            });
        }
        /*END OTHER FEATURES SLIDER JS*/

        /*START SCREENSHOTS SLIDER JS*/
        if ($screenshotsSlider.length > 0) {
            $screenshotsSlider.slick({
                rtl: true,
                centerMode: true,
                centerPadding: '150px',
                slidesToShow: 3,
                infinite: false,
                focusOnSelect: true,
                arrows: false,
                responsive: [{
                        breakpoint: 1200,
                        settings: {
                            slidesToShow: 3,
                            centerPadding: '0',
                        }
                    },
                    {
                        breakpoint: 992,
                        settings: {
                            slidesToShow: 3,
                            centerPadding: '0',
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            centerPadding: '0',
                        }
                    },
                ]
            });
        }
        /*END SCREENSHOTS SLIDER JS*/

        /*START TESTIMONIAL SLIDER JS*/
        if ($testimonialSslider.length > 0) {
            $testimonialSslider.slick({
                rtl: true,
                centerPadding: '150px',
                slidesToShow: 2,
                slidesToScroll: 2,
                dots: true,
                infinite: false,
                arrows: false,
                responsive: [{
                        breakpoint: 1200,
                        settings: {
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                        }
                    },
                ]
            });
        }
        /*END TESTIMONIAL SLIDER JS*/

        /*START COUNTUP JS*/
        $countUp.counterUp({
            delay: 10,
            time: 2000
        });
        /*END COUNTUP JS*/

        /*START TEAM SLIDER JS*/
        if ($teamSlider.length > 0) {
            $teamSlider.slick({
                rtl: true,
                slidesToShow: 4,
                slidesToScroll: 1,
                dots: true,
                infinite: false,
                arrows: false,
                responsive: [{
                        breakpoint: 1200,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 1,
                        }
                    },
                    {
                        breakpoint: 992,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1,
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                        }
                    },
                ]
            });
        }
        /*END TEAM SLIDER JS*/

        /*START LOGOS SLIDER JS*/
        if ($logosSlider.length > 0) {
            $logosSlider.slick({
                rtl: true,
                slidesToShow: 6,
                slidesToScroll: 1,
                dots: false,
                infinite: false,
                arrows: true,
                responsive: [{
                        breakpoint: 1200,
                        settings: {
							slidesToShow: 5,
                            slidesToScroll: 1,
                        }
                    },
                    {
                        breakpoint: 992,
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 1,
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 1,
                        }
                    },
                    {
                        breakpoint: 576,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1,
                        }
                    },
                    {
                        breakpoint: 400,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                        }
                    },
                ]
            });
        }
        /*END LOGOS SLIDER JS*/

        /*START RECENT NEWS SLIDER JS*/
        if ($recentNewsSlider.length > 0) {
            $recentNewsSlider.slick({
                rtl: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                dots: true,
                infinite: false,
                arrows: false,
                responsive: [{
                        breakpoint: 1200,
                        settings: {
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                        }
                    },
                ]
            });
        }
		/*END RECENT NEWS SLIDER JS*/
		
		/*START CUSTOM FORM VALIDATION MESSAGES*/
		$('input[required], textarea[required]').on('invalid', function () {
			this.setCustomValidity('وارد کردن این قسمت الزامی است');
		});
		
		$('input[type="email"]').on('invalid', function () {
			if (this.validity.valueMissing) {
				this.setCustomValidity("وارد کردن ایمیل الزامی است");
			}
			else if (this.validity.typeMismatch) {
				this.setCustomValidity("لطفا یک ایمیل معتبر وارد نمایید");
			}
		});
		
		$('input[required], textarea[required], input[type="email"]').on('input', function () {
			this.setCustomValidity('');
		});
		/*END CUSTOM FORM VALIDATION MESSAGES*/

    });

}(jQuery));