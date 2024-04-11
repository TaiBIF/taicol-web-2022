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
			data:  {'csrfmiddlewaretoken' : $csrf_token,
					'best': $('input[name=best]:checked').val(),
					'name': $('textarea[name=name]').val(),
					'page': page,
					'lang': $lang
				},
					
			type: 'POST',
			dataType : 'json',
		})
		.done(function(results) {
			$('.loadingbox').addClass('d-none');
			$('.check-result-box').removeClass('d-none');
			//清空表格
			$('.table-style1').html(results.header)
			//console.log(results.data)
			for (let i = 0; i < results.data.length; i++) {

				// console.log(results.data)

				let alert_str = '';

				if (results.matched_count[results.data[i]['search_term']] > 1){
					alert_str = 
					`<div class="alien-tooltip">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle cl-blue" viewBox="0 0 16 16">
						<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
						<path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
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
							split_arr = results.data[i][ii].split(',')
							for (iii of split_arr){
								tag += `<div class="item">${iii}</div>`
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
							<td><a href="/${$lang}/taxon/${results.data[i]['taxon_id']}" target="_blank">${results.data[i]['formatted_name']}</a></td>
							<td>${results.data[i]['score']}</td>
							<td>${results.data[i]['name_status']}</td>
							<td>${results.data[i]['common_name_c']}</a></td>
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

	$(function(){

        $('.getData').on('click',function(){
            getData(parseInt($(this).data('page')))
        })


        $('.downloadData').on('click',function(){
            // downloadData($(this).data('type'))
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
			// alert('請求已送出')
			// $lang == 'en-us' ? alert('Your request has been sent.') : alert('請求已送出')

			$('.downloadpop').fadeOut("slow");
			$('.downloadpop').addClass('d-none')
		})

		$('.search').click(function (){
			if ($('textarea').val()!=''){
				getData(1)
			} else {
				//alert('請輸入查詢學名')
				$lang == 'en-us' ? alert('Please enter at least one searching name') : alert('請輸入查詢學名')
			}
		})

	})