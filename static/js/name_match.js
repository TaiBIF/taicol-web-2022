var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');


	function downloadData(format){
		var input1 = $("<input>").attr("name", "file_format").attr("type", "hidden").val(format);

		$('form').append(input1);
		$('form').submit()	
	}


	function getData(page){
		$('.loadingbox').removeClass('d-none');
		$.ajax({
			url: "/get_match_result",
			data:  {'csrfmiddlewaretoken' : $csrf_token,
					'best': $('input[name=best]').val(),
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
				if ((results.data[i]['taxon_id'] == '')|results.data[i]['taxon_id'] == undefined){
					$('.table-style1').append(
						`<tr>
							<td>${results.data[i]['search_term']}</td>
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
					for (ii of ['is_endemic','alien_type']){
						if (results.data[i][ii] !=''){
							tag += `<div class="item">${results.data[i][ii]}</div>`
						}
					}

					is_array = ['is_terrestrial','is_freshwater','is_brackish','is_marine','is_fossil']
					let tag1 = '';
					for (ii of is_array){
						if (results.data[i][ii] !=''){
							tag1 += `<div class="item">${results.data[i][ii]}</div>`
						}
					}

					console.log(results.data[i])

					$('.table-style1').append(
						`<tr>
							<td>${results.data[i]['search_term']}</td>
							<td><a href="/${$lang}/taxon/${results.data[i]['taxon_id']}" target="_blank">${results.data[i]['formatted_name']}</a></td>
							<td>${results.data[i]['common_name_c']}</a></td>
							<td>${results.data[i]['kingdom']}</td>
							<td>${results.data[i]['taxon_group']}</td>
							<td>${results.data[i]['rank']}</td>
							<td>
								<div class="tag-green">
									${tag}
								</div>
							</td>
							<td>
								<div class="tag-green">
									${tag1}
								</div>
							</td>
							<td>${results.data[i]['protected_category']}</td>
							<td>${results.data[i]['red_category']}</td>
							<td>${results.data[i]['iucn_category']}</td>
							<td>${results.data[i]['cites_listing']}</td>
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
            downloadData($(this).data('type'))
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