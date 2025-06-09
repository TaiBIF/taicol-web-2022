$(function (){

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
        trigger: ".section-1-kv",
        start: "0 top",
        onEnter:function () {
            gsap.to(".scroll-downs", { opacity: 0, duration: 0.5, ease: "power1.out" });
        }
    });

    $('select[name=name-select]').niceSelect();

    $('.more .arrbtn').on('click', function(){
        var $target = $(this).siblings('.more-itembox');
        $target.toggleClass('open');
    });


		$("#higherTaxa").select2({
			placeholder: $lang == 'en-us' ? "Enter keywords" : "請輸入查詢字串" ,
			language: {
				"noResults": function(params){
					return $lang == 'en-us' ? "No result" : "查無結果";
				},		 
				searching: function(params) {

					if (params.term != undefined){

					   if (params.term.trim().length  > 0){
							return $lang == 'en-us' ? "Searching..." : '查詢中...';
					   } else {
						   return false;  
					   }
					}

				}
			},		
			ajax: {
				delay: 250,
				dataType: 'json',
				data: function (params) {
					if (params.term != undefined ){
						if (params.term.trim().length  > 0){
							return {
							   keyword: params.term,
							   from_tree: 'false',
							   lang: $lang
							};
		
						} else {
							throw false;  
						}
					} else {
						throw false;  
					}
				},			  
				jsonpCallback: 'jsonCallback',
				url: '/get_autocomplete_taxon_by_solr',
				processResults: function (data) {
					return {
						results: $.map(data, function (item) {
							return {
								text: item.text,
								id: item.id,
							}
						})
					};
				}
			},
			escapeMarkup: function(markup) { return markup; }, // Allows HTML rendering
		});

		$('#higherTaxa').on('select2:open', function (e) {
			$('.select2-search__field').get(0).focus()
		});
		  
		$('#higherTaxa').on('select2:select', function (e) {
			// Do something
			var data = e.params.data;

			if ($(`input[name=higherTaxa][value=${data.id}]`).length == 0){
				$('.higherTaxa-alread-select').append(

					`<div class="item">
						<p>${data.text}</p>
						<input type="hidden" name="higherTaxa" value="${data.id}">
						<input type="hidden" name="higherTaxa_str" value="${data.text}">
						<button type="button" class="removeHigherTaxaItem">
							<img src="/static/image/w-xx.svg">
						</button>
					</div>`)

					$(".removeHigherTaxaItem").prop("onclick", null).off("click");

					$('.removeHigherTaxaItem').on('click',function(){
						removeHigherTaxaItem($(this))
					})		
			}

	
		  });
		  
	$('.search').click(function(){
		if ($('input[name=keyword]').val()==''){
			//alert('請輸入關鍵字')
			$lang == 'en-us' ? alert("Please enter keywords") : alert("請輸入關鍵字");

		} else {
			window.location = '/catalogue?filter=0&name-select=contain&keyword=' + $('input[name=keyword]').val()
		}
	})

			
	// 按 enter 直接查詢
	window.enterPressed = false;

	
		$(document).on('keypress', function(e) {			
	
		if (e.which === 13 && !$('input[name=keyword]').val()==''){	
			e.preventDefault();
			window.location = '/catalogue?filter=0&name-select=contain&keyword=' + $('input[name=keyword]').val()
			// if (!$('.download_check').is(':disabled')){
			// 	$('.download_check').trigger('click')
			// }
		}
		
		// else if (e.which === 13 && !window.enterPressed ){	

		// 	e.preventDefault();
		// 	window.enterPressed = true;
		// 	getData(page=1, from_url=false);
		// }
	});



})


function removeHigherTaxaItem(obj){
    obj.parent('.item').remove()
    // 如果全部選項都沒有的話，select換成reset
    if ($('.higherTaxa-alread-select .item').length == 0) {
        $('#higherTaxa').val('');
        $('#higherTaxa').trigger('change');	
    }
}