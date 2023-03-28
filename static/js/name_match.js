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
				},
					
			type: 'POST',
			dataType : 'json',
		})
		.done(function(results) {
			$('.loadingbox').addClass('d-none');
			$('.check-result-box').removeClass('d-none');
			//清空表格
			$('.table-style1').html(`<tr>
				<td>查詢字串</td>
				<td>比對結果</td>
				<td>中文名</td>
				<td>界</td>
				<td>所屬類群</td>
				<td>階層</td>
				<td>原生/外來/特有性</td>
				<td>棲地環境</td>
				<td>保育類</td>
				<td>臺灣紅皮書</td>
				<td>IUCN評估</td>
				<td>CITES附錄</td>
			</tr>`)
			console.log(results.data)
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
					if (results.data[i]['is_endemic'] != ''){
						tag += '<div class="item">' + results.data[i]['is_endemic'] + '</div>'
					}
					if (results.data[i]['alien_type'] != ''){
						tag += '<div class="item">' + results.data[i]['alien_type'] + '</div>'
					}
					let tag1 = '';
					if (results.data[i]['is_terrestrial'] ==1 ){
						tag1 += '<div class="item">陸生</div>'
					}
					if (results.data[i]['is_freshwater'] ==1 ){
						tag1 += '<div class="item">淡水</div>'
					}
					if (results.data[i]['is_brackish'] ==1 ){
						tag1 += '<div class="item">半鹹水</div>'
					}
					if (results.data[i]['is_marine'] ==1 ){
						tag1 += '<div class="item">海洋</div>'
					}

					console.log(results.data[i])

					$('.table-style1').append(
						`<tr>
							<td>${results.data[i]['search_term']}</td>
							<td><a href="/taxon/${results.data[i]['taxon_id']}" target="_blank">${results.data[i]['formatted_name']}</a></td>
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
						<p>上一頁</p>
					</a>
					<a href="javascript:;" data-page="${results.page.current_page + 1}" class="next getData">
						<p>下一頁</p>
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
			alert('發生未知錯誤！請聯絡管理員')
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
			}else{
				alert('請輸入查詢學名')
			}
		})

	})