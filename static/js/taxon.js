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

	// // 取得照片
	// $.ajax({
	// 	url: 'https://data.taieol.tw/eol/endpoint/image/species/417918',
	// 	method: 'GET',
	// 	dataType: 'json',
	// 	data: '',
	// 	async: true,　
	   
	// 	success: res =>{
	// 		console.log(res)
	// 		},
	// 	error: err =>{
	// 		console.log(err)
	// 		},
	// });
	

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
		if (checked){
			//$('.loadingbox').removeClass('d-none');
			$.ajax({
				// url: "http://127.0.0.1:3000/api/admin/feedback/save/",
				url: "/send_feedback",
				data:  $('#errorForm').serialize() + '&is_solved=0&csrfmiddlewaretoken=' + $csrf_token,
				type: 'POST',
				dataType : 'json',
			})
			.done(function(results) {
				if (results['status'] == 'done'){
					//$('.loadingbox').addClass('d-none');
					$('.mistakepop').fadeOut("slow");
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

	$(document).on('keypress', function(e) {
		if (e.which === 13 )
		{
			$( ".search" ).trigger( "click" );
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
		// $('.imagepop #image_license').html($(this).next('.image_license').html());
		$('.imagepop #image_provider').html($(this).next().next('.image_provider').html());
		$('.imagepop #image_permalink').attr("href",$(this).next().next().next('.image_permalink').html());

	});


	// 變更歷史頁碼

	// get_taxon_history?taxon_id=t0097239&name_id=137324&current_page=2

	/*

	$(".taxon-history-edit .updateData").prop("onclick", null).off("click");
	$('.taxon-history-edit .updateData').on('click', function(){
		updateData(parseInt($(this).data('page')))
	})*/

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


/*
function updateData(page){
	$.ajax({
		url: `/get_taxon_history?taxon_id=${$('input[name=taxon_id]').val()}&name_id=${$('#name_id').val()}&page=${page}`,
	})
	.done(function(results) {
	

		$('.taxon-history-edit .history-rows').remove()

		for (i of results.taxon_history){
			$('.taxon-history-edit table').append(`
				<tr class="history-rows">
					<td>${i.updated_at}</td>
					<td>${i.title}${i.content}</td>
					<td>${i.ref}</td>
					<td>${i.editor}</td>
				</tr>
				`)
		}

		$('.taxon-history-edit .page-num').remove()
	
		// 頁碼
		if (results.total_page > 1){  // 判斷超過一頁，有才加分頁按鈕
			$('.taxon-history-edit .scro-m').after(
			`	<div class="page-num">
				<!--現在位置加now-->
				<a href="javascript:;" data-page="1" class="num page-start updateData">1</a>
				<a href="javascript:;" data-page="${results.current_page - 1}" class="back updateData">
					<img src="/static/image/pagear1.svg">
					<p>${results.prev}</p>
				</a>
				<a href="javascript:;" data-page="${results.current_page + 1}" class="next updateData">
					<p>${results.next}</p>
					<img src="/static/image/pagear2.svg">
				</a>
				<a href="javascript:;" data-page="${results.total_page}" class="num updateData" id="page-end">${results.total_page}</a>
			</div>
			`)
			$('.taxon-history-edit .page-num').append(`
				<input type="hidden" name="total_page" value="${results.total_page}">
			`)
		}

		if (results.current_page==1){
			$('.taxon-history-edit .back').removeClass('updateData')
		} else if (results.current_page==results.total_page){
			$('.taxon-history-edit .next').removeClass('updateData')
		}
			
		let html = ''
		for (let i = 0; i < results.page_list.length; i++) {
			if (results.page_list[i] == results.current_page){
			html += `<a class="num now updateData" href="javascript:;" data-page="${results.page_list[i]}">${results.page_list[i]}</a> `;
			} else {
			html += `<a class="num updateData" href="javascript:;" data-page="${results.page_list[i]}">${results.page_list[i]}</a>  `
			}
		}
		$('.taxon-history-edit .back').after(html)

		$(".taxon-history-edit .updateData").prop("onclick", null).off("click");
		$('.taxon-history-edit .updateData').on('click', function(){
			updateData(parseInt($(this).data('page')))
		})
	
	})
	.fail(function( xhr, status, errorThrown ) {
	$('.loadingbox').addClass('d-none');
	//alert('發生未知錯誤！請聯絡管理員')
	$lang == 'en-us' ? alert('An unexpected error occured! Please contact us.') : alert('發生未知錯誤！請聯絡管理員')
	//condition ? true_expression : false_expression
	
	console.log( 'Error: ' + errorThrown + 'Status: ' + xhr.status)
	}) 
	
	

}*/