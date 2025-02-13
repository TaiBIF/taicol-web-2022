var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');

//https://emailregex.com

function ValidateEmail(inputText){
	let mailformat = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
	if(inputText.match(mailformat)){
		$('#email-check').attr('fill', 'green');
		$('button.download_check').prop('disabled', false);
	} else {
		$('#email-check').attr('fill', 'lightgrey');
		$('button.download_check').prop('disabled', true);
	}
}

function downloadData(format){
	// 把之前的移除
	$('input[name=file_format]').remove();
	var input1 = $("<input>").attr("name", "file_format").attr("type", "hidden").val(format);

	$('form#matchForm').append(input1);


	$.ajax({
		url: "/download_match_results_offline",
		data: $('form#matchForm').serialize() + "&download_email=" + $('input[name=download_email]').val(),		
		type: 'POST',
		dataType : 'json',
	})
	.done(function(results) {
		$lang == 'en-us' ? alert('Your request has been sent.') : alert('請求已送出')
	})

	// $('form').submit()	
}

function getData(page){
	$('.loadingbox').removeClass('d-none');
	$.ajax({
		url: "/get_match_result",
		data: $('form#matchForm').serialize() + '&page=' + page + '&lang=' + $lang,
		type: 'POST',
		dataType : 'json',
	})
	.done(function(results) {
		$('.loadingbox').addClass('d-none');
		$('.check-result-box').removeClass('d-none');
		//清空表格
		$('.table-style1').html(results.header)

		for (let i = 0; i < results.data.length; i++) {

			let alert_str = '';

			if (results.matched_count[results.data[i]['search_term']] > 1){
				alert_str = 
				`<div class="alien-tooltip">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle cl-blue" viewBox="0 0 16 16">
					<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
					<path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
				</svg>
				<span class="alien-tooltiptext">${results['more_than_one_str']}</span>  
			</div>`

			}

			if ((results.data[i]['taxon_id'] == '')|results.data[i]['taxon_id'] == undefined){
				$('.table-style1').append(
					`<tr>
						<td>${results.data[i]['search_term']}${alert_str}</td>
						<td>${results.data[i]['formatted_name']}</td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
					</tr>`)
			} else {
				
				let tag = '';
				for (ii of ['is_endemic','is_in_taiwan','alien_type']){
					if (results.data[i][ii] !=''){
						if (ii == 'is_in_taiwan') {
							tag += `<div class="item orange-tag-item">${results.data[i][ii]}</div>`
						} else {
							split_arr = results.data[i][ii].split(',')
							for (iii of split_arr){
								tag += `<div class="item">${iii}</div>`
							}
						}
					}
				}

				// // is_array = ['is_terrestrial','is_freshwater','is_brackish','is_marine','is_fossil']
				// is_array = ['is_terrestrial','is_freshwater','is_brackish','is_marine','is_fossil']
				// let tag1 = '';
				// for (ii of is_array){
				// 	if (results.data[i][ii] !=''){
				// 		tag1 += `<div class="item">${results.data[i][ii]}</div>`
				// 	}
				// }

				$('.table-style1').append(
					`<tr>
						<td>${results.data[i]['search_term']}${alert_str}</td>
						<td>${results.data[i]['simple_name']}</td>
						<td>${results.data[i]['score']}</td>
						<td>${results.data[i]['name_status']}</td>
						<td><a href="/${$lang}/taxon/${results.data[i]['taxon_id']}" target="_blank">${results.data[i]['formatted_name']}</a></td>
						<td><a href="/${$lang}/taxon/${results.data[i]['taxon_id']}" target="_blank">${results.data[i]['common_name_c']}</a></td>
						<td>${results.data[i]['kingdom']}</td>
						<td>${results.data[i]['taxon_group']}</td>
						<td>${results.data[i]['rank']}</td>
						<td>
							<div class="tag-green">
								${tag}
							</div>
						</td>
						<td>${results.data[i]['protected_category']}</td>
						<td>${results.data[i]['red_category']}</td>
						<td>${results.data[i]['iucn_category']}</td>
					</tr>`)
			}
		}

		$('.page-num').remove()

		// 頁碼
		if (results.page.total_page > 1){  // 判斷超過一頁，有才加分頁按鈕
			$('.scro-m').after(
			`	<div class="page-num">
				<!--現在位置加now-->
				<a href="javascript:;" data-page="1" class="num page-start getData">1</a>
				<a href="javascript:;" data-page="${results.page.current_page - 1}" class="back getData">
					<img src="/static/image/pagear1.svg">
					<p>${results.prev}</p>
				</a>
				<a href="javascript:;" data-page="${results.page.current_page + 1}" class="next getData">
					<p>${results.next}</p>
					<img src="/static/image/pagear2.svg">
				</a>
				<a href="javascript:;" data-page="${results.page.total_page}" class="num getData" id="page-end">${results.page.total_page}</a>
			</div>
			`)
			$('.page-num').append(`
				<input type="hidden" name="total_page" value="${results.page.total_page}">
			`)
		}

		if (results.page.current_page==1){
			$('.back').removeClass('getData')
			//$('.back').attr("onclick","");
		} else if (results.page.current_page==results.page.total_page){
			//$('.next').attr("onclick","");
			$('.next').removeClass('getData')
		}


		let html = ''
		for (let i = 0; i < results.page.page_list.length; i++) {
			if (results.page.page_list[i] == results.page.current_page){
			html += `<a class="num now getData" data-page="${results.page.page_list[i]}" href="javascript:;">${results.page.page_list[i]}</a> `;
			} else {
			html += `<a class="num getData" href="javascript:;" data-page="${results.page.page_list[i]}">${results.page.page_list[i]}</a>  `
			}
		}
		$('.back').after(html)

		$(".getData").prop("onclick", null).off("click");

		$('.getData').on('click',function(){
			getData(parseInt($(this).data('page')))
		})

		$([document.documentElement, document.body]).animate({
			scrollTop: $(".check-result-box").offset().top - 80
		}, 200);

			
	})
	.fail(function( xhr, status, errorThrown ) {
		$('.loadingbox').addClass('d-none');
		$lang == 'en-us' ? alert('An unexpected error occured! Please contact us.') : alert('發生未知錯誤！請聯絡管理員')
		console.log( 'Error: ' + errorThrown + 'Status: ' + xhr.status)
	}) 

}


function removeRankItem(obj){
	obj.parent('.item').remove()
	// 如果全部選項都沒有的話，select換成reset
	if ($('.rank-alread-select.alread-select .item').length == 0) {
		$(".rank-select-170 li.option.selected").removeClass('selected');
		$(".rank-select-170.select-170 span.current").html('');
	}
}


$(function(){
	$('select[name=bio_group-select]').niceSelect();

	$('select[name=rank-select]').niceSelect();
	// bold
	r_array = [1,3,7,12,18,22,26,30,34]
	for( r of r_array){
		$(`.list li[data-value=${r}]`).addClass('f-bold')
	}

	$('select[name=rank-select]').on('change', function(){
		// 確認沒有重複
		if (($('select[name=rank-select] option:selected').text() != '')&($(`.item input[name=rank][value="${$('select[name=rank-select] option:selected').val()}"]`).length == 0)){
			$('.alread-select').append(
				`<div class="item">
					<p>${$('select[name=rank-select] option:selected').text()}</p>
					<input type="hidden" name="rank" value="${$('select[name=rank-select] option:selected').val()}">
					<button type="button" class="remove-alread-select removeRankItem">
						<img src="/static/image/w-xx.svg">
					</button>
				</div>`)
		}

		$(".removeRankItem").prop("onclick", null).off("click");

		$('.removeRankItem').on('click',function(){
			removeRankItem($(this))
		})		

	})

	$("#checkAllKingdom").click(function(){
		$('input[name=kingdom]:checkbox').not(this).prop('checked', this.checked);
	});
	
	// $(document).keydown(function(e) {
	// 		if ($('.downloadpop').hasClass('d-none')){
	// 			e.stopPropagation();
	// 			e.preventDefault();
	// 			// e.preventDefault();
	// 			return;
	// 		} else {
	// 			e.stopPropagation();
	// 			// e.preventDefault();
	// 			return;
	// 		}
	// 	} 
	// )


	$(document).on('keypress', function(e) {			
	  
		if (e.which === 13 && !$('.downloadpop').hasClass('d-none'))
		{	
			e.preventDefault();
			if (!$('.download_check').is(':disabled')){
				$('.download_check').trigger('click')
			}
		}
	});
	  
	$('.getData').on('click',function(){
		getData(parseInt($(this).data('page')))
	})


	$('.downloadData').on('click',function(){
		$('button.download_check').data('type', $(this).data('type'))

		$('.downloadpop').fadeIn("slow");
		$('.downloadpop').removeClass("d-none");

	})


	$( ".downloadpop .xx" ).click(function() {
		$('.downloadpop').fadeOut("slow");
		$('.downloadpop').addClass('d-none')
	});
	

	$( "#download_email" ).keyup(function() {
		ValidateEmail($(this).val())
	});


	$('.download_check').on('click', function(){
		downloadData($(this).data('type'))

		$('.downloadpop').fadeOut("slow");
		$('.downloadpop').addClass('d-none')
	})

	$('.search').click(function (){
		if ($('textarea').val()!=''){
			getData(1)
		} else {
			$lang == 'en-us' ? alert('Please enter at least one searching name') : alert('請輸入查詢學名')
		}
	})

})