// const { fromJS } = require("immutable");
// const { escape } = require("querystring");

    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');

    // 要有其中之一存在才送出
	let params = ['keyword','higherTaxa','bio_group-select','rank','is_endemic',
				  'alien_type','is_terrestrial','is_freshwater','is_brackish','is_marine','is_fossil',
				  'protected','redlist','iucn','cites','date','status']


	let more_opts = ['is_terrestrial','is_freshwater','is_brackish','is_marine','is_fossil',
				  'protected','redlist','iucn','cites','date']



	function changeAction(){
		// 進階選項控制
		let filter = $('[name=filter]').val();

		let queryString = window.location.search;
		let urlParams = new URLSearchParams(queryString);

		let has_search_parm = false;
		for (const [key, value] of urlParams) {
			if ((params.includes(key))&(urlParams.get(key)!='')){
				has_search_parm = true;
				break
			}
		}

		for (const [key, value] of urlParams) {
			if ((more_opts.includes(key))&(urlParams.get(key)!='')){
				// 打開moreOption2
				filter = '2';
				break;
			}
		}

		if (has_search_parm){
			if (urlParams.get('page') != '' && urlParams.get('page') != undefined){
				page = urlParams.get('page')
			} else {
				page = 1
			}

			getData(page=page, from_url=true);
		}


		if (filter=='0'){
			$('.select-button').removeClass('now');
			$('.selection-box').slideUp();
			$('.more-option-button').removeClass('now');
			$('.option-box2').slideUp();

		} else if (filter=='1'){
			if (!$('.select-button').hasClass('now')){
				$('.select-button').addClass('now');
				$('.selection-box').slideDown();
			}	
			$('.more-option-button').removeClass('now');
			$('.option-box2').slideUp();

		} else if (filter=='2'){
			if (!$('.select-button').hasClass('now')){
				$('.select-button').addClass('now');
				$('.selection-box').slideDown();
			}
			if (!$('.more-option-button').hasClass('now')){
				$('.more-option-button').addClass('now');
				$('.option-box2').slideDown();
			}
		}
	  }


	function resetForm(){
		$("#moreForm")[0].reset();
		$('input[name=keyword]').val('')
		$('select[name=name-select]').val('equal');
		$('select[name=name-select]').niceSelect('update'); 
		$('select[name=rank-select]').val('');
		$('select[name=rank-select]').niceSelect('update'); 
		$('select[name=bio_group-select]').val('');
		$('select[name=bio_group-select]').niceSelect('update'); 
		r_array = [1,3,7,12,18,22,26,30,34]
		for( r of r_array){
			$(`.list li[data-value=${r}]`).addClass('f-bold')
		}
		$('select[name=date-select]').val('gl');
		$('select[name=date-select]').niceSelect('update'); 
		$('.alread-select').html('')
		$('#higherTaxa').val('');
		$('#higherTaxa').trigger('change');
	}

	function isValidDate(dateString) {
		var regEx = /^\d{4}-\d{2}-\d{2}$/;
		if(!dateString.match(regEx)) return false;  // Invalid format
		var d = new Date(dateString);
		var dNum = d.getTime();
		if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
		return d.toISOString().slice(0,10) === dateString;
	  }
	  
	function removeRankItem(obj){
		obj.parent('.item').remove()
		// 如果全部選項都沒有的話，select換成reset
		if ($('.rank-alread-select .item').length == 0) {
			$(".rank-select-div li.option.selected").removeClass('selected');
			$(".rank-select-div.select-170 span.current").html('');
		}
	}

	// function removeBioGroupItem(obj){
	// 	obj.parent('.item').remove()
	// 	// 如果全部選項都沒有的話，select換成reset
	// 	if ($('.bio_group-alread-select .item').length == 0) {
	// 		$(".bio_group-select-div li.option.selected").removeClass('selected');
	// 		$(".bio_group-select-div.select-170 span.current").html('');
	// 	}
	// }

	function removeHigherTaxaItem(obj){
		obj.parent('.item').remove()
		// 如果全部選項都沒有的話，select換成reset
		if ($('.higherTaxa-alread-select .item').length == 0) {
			$('#higherTaxa').val('');
			$('#higherTaxa').trigger('change');	
		}
	}

	function changeFacet(facet,value,from_url=false,page=1,from_mb_select=false){

		// 如果是本來就active的facet則改為沒有facet
		if ($(`button.facet-${facet}-${value}`).hasClass('now')){
			// 改回沒有facet
			$(".facet-btn").removeClass('now');
			$('input[name=hidden-value]').val('');
			$('input[name=hidden-facet]').val('');
			updateData(page=1, from_url=false);
		} else {
			$(".facet-btn").removeClass('now');
			$(`button.facet-${facet}-${value}`).addClass('now');
			$('input[name=hidden-value]').val(value);
			$('input[name=hidden-facet]').val(facet);

			// 手機選單但不要cause onchange
			if (!from_mb_select){
				$('select[name=mb-select]').val(facet);
				$('select[name=mb-select]').niceSelect('update');
				$('select[name=mb-select]').trigger('change')
				$('select[name=mb-select-sub]').val($(`option.facet-${facet}-${value}`).text().trim());
				$('select[name=mb-select-sub]').niceSelect('update');
			}
			updateData(page, from_url);
		}
		
	}


	function downloadData(format){
		var input1 = $("<input>").attr("name", "keyword").attr("type", "hidden").val($('input[name=keyword]').val());
		var input2 = $("<input>").attr("name", "name-select").attr("type", "hidden").val($('select[name=name-select] option:selected').val());
		var input3 = $("<input>").attr("name", "file_format").attr("type", "hidden").val(format);
		var input4 = $("<input>").attr("name", "date-select").attr("type", "hidden").val($('select[name=date-select] option:selected').val());
		var input4 = $("<input>").attr("name", "bio_group-select").attr("type", "hidden").val($('select[name=bio_group-select] option:selected').val());

		// facet
		var input7 = $("<input>").attr("name", "facet").attr("type", "hidden").val($('input[name=hidden-facet]').val());
		var input8 = $("<input>").attr("name", "facet_value").attr("type", "hidden").val($('input[name=hidden-value]').val());

		$('form#moreForm').append(input1).append(input2).append(input3).append(input4).append(input7).append(input8);
		$('form#moreForm').attr('action','/download_search_results')
		$('form#moreForm').submit()
		$('form#moreForm input[name=keyword]').remove()
		$('form#moreForm input[name=name-select]').remove()
		$('form#moreForm input[name=bio_group-select]').remove()
		$('form#moreForm input[name=file_format]').remove()
		$('form#moreForm input[name=date-select]').remove()
		$('form#moreForm input[name=facet]').remove()
		$('form#moreForm input[name=facet_value]').remove()
	}

	function getData(page, from_url){

		let query_str;
		let facet = '';
		let value = '';
		// let page = 1;

		// 如果是從url進入 將url轉換成頁面上的查詢條件
		if (from_url){
			query_str = window.location.search;

			let urlParams = new URLSearchParams(query_str);
			facet = urlParams.get('facet');
			value = urlParams.get('facet_value');
			page = urlParams.get('page');

			// 要先把facet拿掉 後面再搜尋一次

			urlParams.delete('facet')
			urlParams.delete('facet_value')

			query_str = urlParams.toString()

			// 多選系列
			let mt = ['rank','alien_type','protected','redlist','iucn','cites','status']
			mt.forEach(function(m) {
				if (urlParams.getAll(m)) {
					if (m=='rank'){
						urlParams.getAll(m).forEach(function(me){
							// 先確認是不是存在
							if (!$(`input[name=rank][value="${me}"]`).length){
								$('.rank-alread-select').append(
								`<div class="item">
									<p>${$(`option[value="${me}"]`).html()}</p>
									<input type="hidden" name="rank" value="${me}">
									<button type="button" class="removeRankItem">
										<img src="/static/image/w-xx.svg">
									</button>
								</div>`)
							}
						})
					// } else if (m=='bio_group'){
					// 	urlParams.getAll(m).forEach(function(me){
					// 		// 先確認是不是存在
					// 		if (!$(`input[name=bio_group][value="${me}"]`).length){
					// 			$('.bio_group-alread-select').append(
					// 			`<div class="item">
					// 				<p>${$(`option[value="${me}"]`).html()}</p>
					// 				<input type="hidden" name="bio_group" value="${me}">
					// 				<button type="button" class="removeBioGroupItem">
					// 					<img src="/static/image/w-xx.svg">
					// 				</button>
					// 			</div>`)
					// 		}
					// 	})
					} else {
						urlParams.getAll(m).forEach(function(me){
							$(`input[name=${m}][value="${me}"]`).prop('checked', true)
						})
					}
				}
			});


            $(".removeRankItem").prop("onclick", null).off("click");

            $('.removeRankItem').on('click',function(){
                removeRankItem($(this))
            })


            // $(".removeBioGroupItem").prop("onclick", null).off("click");

            // $('.removeBioGroupItem').on('click',function(){
            //     removeBioGroupItem($(this))
            // })


			// val 系列
			let vs = ['keyword','date']
			vs.forEach(function(v) {
				if (urlParams.get(v)) {
					$(`input[name=${v}]`).val(urlParams.get(v))
				}
			});

			// taxon group
			if (urlParams.getAll('higherTaxa').length > 0){
				higherTaxa_list = urlParams.getAll('higherTaxa')
				higherTaxa_str_list = urlParams.getAll('higherTaxa_str')

				for (let i = 0; i < higherTaxa_list.length; i++) {

					if ($(`input[name=higherTaxa][value=${higherTaxa_list[i]}]`).length == 0){
						$('.higherTaxa-alread-select').append(
		
							`<div class="item">
								<p>${higherTaxa_str_list[i]}</p>
								<input type="hidden" name="higherTaxa" value="${higherTaxa_list[i]}">
								<input type="hidden" name="higherTaxa_str" value="${higherTaxa_str_list[i]}">
								<button type="button" class="removeHigherTaxaItem">
									<img src="/static/image/w-xx.svg">
								</button>
							</div>`)
		
					}

				}	
				
				$(".removeHigherTaxaItem").prop("onclick", null).off("click");

				$('.removeHigherTaxaItem').on('click',function(){
					removeHigherTaxaItem($(this))
				})
			}

			// is 系列
			let is = ['is_endemic','is_terrestrial','is_freshwater','is_brackish','is_marine','is_fossil']
			is.forEach(function(i) {
				if (urlParams.get(i)=='on') {
					$(`input[name=${i}]`).prop('checked', true)
				}
			});
		
			// nice select 系列
			let ns = ['name-select','date-select','bio_group-select']
			ns.forEach(function(n) {
				if (urlParams.get(n)){
					$(`select[name=${n}]`).val(urlParams.get(n));
					$(`select[name=${n}]`).niceSelect('update'); 
				}
			});

		} else {

			// 如果不是從url進入的話 在這邊整理查詢項目成 query string
			query_str = $('form#moreForm').find('input[name!=csrfmiddlewaretoken]').serialize() + "&keyword=" +  $('input[name=keyword]').val() +
			'&name-select=' + $('select[name=name-select] option:selected').val() + '&date-select=' + $('select[name=date-select] option:selected').val() + 
			'&bio_group-select=' + $('select[name=bio_group-select] option:selected').val() + '&page=' + page;

			var newRelativePathQuery = window.location.pathname + '?' + query_str ;
			history.pushState(null, '', newRelativePathQuery);
		
		}
		// 確認至少有一個搜尋項
		let newUrlParams = new URLSearchParams(query_str);

		let has_search_parm = false;
		for (const [key, value] of newUrlParams) {
			if (params.includes(key)&newUrlParams.get(key)!=''){
				has_search_parm = true;
				break
			}
		}

		if (!has_search_parm) {
			//alert('請至少輸入一個搜尋項目，若有輸入日期必須填入完整年月日');
			$lang == 'en-us' ? alert('Please fill at least one searching item. Date must include year, month and day.') : alert('請至少輸入一個搜尋項目，若有輸入日期必須填入完整年月日')

			window.enterPressed = false;

		} else if ((!isValidDate($('input[name=date]').val()))&($('input[name=date]').val()!='')){
			//alert('日期格式錯誤');
			$lang == 'en-us' ? alert('Incorrect date format') : alert('日期格式錯誤')
			window.enterPressed = false;
		} else {

			// 進入查詢

			$('.loadingbox').removeClass('d-none');

			$([document.documentElement, document.body]).animate({
				scrollTop: $(".result-area").offset().top - 80
			}, 200);


			if (query_str.startsWith('?')){
				query_str = query_str.substring(1)
			}

			$.ajax({
				url: `/${$lang}/catalogue`,
				data: query_str + '&csrfmiddlewaretoken=' +  $csrf_token,
				type: 'POST',
				dataType : 'json',
			})
			.done(function(results) {

				if (results.is_taxon_id==true){
					window.location = `/${$lang}/taxon/${results.taxon_id}`
				} else {
					window.enterPressed = false;


					// 清空頁碼 & facet
					$('.page-num').remove()
					$('.table-style1').html('')
					$('.button-two').addClass('d-none')
					$('.result-flexbox').addClass('d-none')

					$('.mb-cataselect').remove()
					$('.kingdom-box, .rank-box, .endemic-box, .status-box, .alien_type-box').html('')

					$('#total-count').parent('p').removeClass('d-none');
					$('.loadingbox').addClass('d-none');

					$([document.documentElement, document.body]).animate({
						scrollTop: $(".result-area").offset().top - 80
					}, 200);
	
					$('#total-count').html(results['count']['total'][0]['count']);
					if (results['count']['total'][0]['count']>0){

						if (results['count']['total'][0]['count'] > 1000){
							$('.downloadData').off('click')
							$('.downloadData').removeClass('downloadData').addClass('offlineDownloadData')
							$('.offlineDownloadData').off('click')
							$('.offlineDownloadData').on('click', function(){
								offlineDownloadData()
								$('button.download_check').data('type', $(this).data('type'))
							})
						} else {
							$('.offlineDownloadData').off('click')
							$('.offlineDownloadData').removeClass('offlineDownloadData').addClass('downloadData')
							$('.downloadData').off('click')
							$('.downloadData').on('click', function(){
								downloadData($(this).data('type'))
							})
						}
		
						$('.button-two').removeClass('d-none')
						$('.result-flexbox').removeClass('d-none')
						$('.right-table').removeClass('d-none')


						$('.top-infbox').after(
						`<!--手機版左側篩選改成下拉選單-->
						<div class="mb-cataselect">
							<select name="mb-select" class="mb-select">
								<option value=""></option>
							</select>
							<select name="mb-select-sub" class="mb-select" id="">
							</select>
						</div>`)

						$('select[name=mb-select]').on('change', function() {
							if ($('select[name=mb-select] option:selected').text() != ''){
								let opt_str = $(`.${this.value}-box`).html();
								opt_str = opt_str.replaceAll('button','option')
								$('select[name=mb-select-sub]').html('<option value=""></option>')
								$('select[name=mb-select-sub]').append(opt_str)
								$('select[name=mb-select-sub]').niceSelect('update');
							} else {

								if ($(".facet-btn").hasClass('now')){
									$('select[name=mb-select-sub]').html('')
									$('select[name=mb-select-sub]').niceSelect('update');

									$(".facet-btn").removeClass('now');
									$('input[name=hidden-value]').val('');
									$('input[name=hidden-facet]').val('');
									getData(page=1, from_url=false);
								}
							}
						});

						$('select[name=mb-select-sub]').on('change', function(){
							if ($('select[name=mb-select-sub] option:selected').text() != ''){
								// changeFacet
								let f_str = $('select[name=mb-select-sub] option:selected').attr('class');
								changeFacet(f_str.split(' ')[2].split('-')[1],f_str.split(' ')[2].split('-')[2],false,1,true)
							} else {
							// 如果選擇空的則清空
								if ($(".facet-btn").hasClass('now')){
									$(".facet-btn").removeClass('now');
									$('input[name=hidden-value]').val('');
									$('input[name=hidden-facet]').val('');
									getData(page=1, from_url=false);
								}
							}
						})

						if (results.facet.kingdom.length>0){
							$('.kingdom-box').parent('li').removeClass('d-none')
							for (let i = 0; i < results.facet.kingdom.length; i++) {
								$('.kingdom-box').append(`<button class="changeFacet facet-btn facet-kingdom-${results.facet.kingdom[i]['val']}" data-facet="kingdom" data-value="${results.facet.kingdom[i]['val']}">
														${results.facet.kingdom[i]['title']} (${results.facet.kingdom[i]['count']})</button>`)
							}
							$('select[name=mb-select]').append(`<option value="kingdom">${results.kingdom_title}</option>`)
						} else {
							$('.kingdom-box').parent('li').addClass('d-none')
						}


						if (results.facet.rank.length>0){
							$('.rank-box').parent('li').removeClass('d-none')
							for (let i = 0; i < results.facet.rank.length; i++) {
								$('.rank-box').append(`<button class="changeFacet facet-btn facet-rank-${results.facet.rank[i]['val']}" data-facet="rank" data-value="${results.facet.rank[i]['val']}">
														${results.facet.rank[i]['title']} (${results.facet.rank[i]['count']})</button>`)
							}
							$('select[name=mb-select]').append(`<option value="rank">${results.rank_title}</option>`)
						} else {
							$('.rank-box').parent('li').addClass('d-none')
						}

						if (results.facet.is_endemic.length>0){
							$('.endemic-box').parent('li').removeClass('d-none')
							for (let i = 0; i < results.facet.is_endemic.length; i++) {
								$('.endemic-box').append(`<button class="changeFacet facet-btn facet-endemic-${results.facet.is_endemic[i]['val']}" data-facet="endemic" data-value="${results.facet.is_endemic[i]['val']}">
														${results.facet.is_endemic[i]['title']} (${results.facet.is_endemic[i]['count']})</button>`)
							}
							$('select[name=mb-select]').append(`<option value="endemic">${results.endemic_title}</option>`)
						} else {
							$('.endemic-box').parent('li').addClass('d-none')
						}

						if (results.facet.alien_type.length>0){
							$('.alien_type-box').parent('li').removeClass('d-none')
							for (let i = 0; i < results.facet.alien_type.length; i++) {
								$('.alien_type-box').append(`<button class="changeFacet facet-btn facet-alien_type-${results.facet.alien_type[i]['val']}" data-facet="alien_type" data-value="${results.facet.alien_type[i]['val']}">
														${results.facet.alien_type[i]['title']} (${results.facet.alien_type[i]['count']})</button>`)
							}
							$('select[name=mb-select]').append(`<option value="alien_type">${results.alien_type_title}</option>`)
						} else {
							$('.alien_type-box').parent('li').addClass('d-none')
						}


						if (results.facet.status.length>0){
							$('.status-box').parent('li').removeClass('d-none')
							for (let i = 0; i < results.facet.status.length; i++) {
								$('.status-box').append(`<button class="changeFacet facet-btn facet-status-${results.facet.status[i]['val']}" data-facet="status" data-value="${results.facet.status[i]['val']}">
														${results.facet.status[i]['title']} (${results.facet.status[i]['count']})</button>`)
							}
							$('select[name=mb-select]').append(`<option value="status">${results.status_title}</option>`)
						} else {
							$('.alien_type-box').parent('li').addClass('d-none')
						}


						$('.table-style1').html(results['header'])

						for (let i = 0; i < results.data.length; i++) {
							let tag = '';
							if (results.data[i]['is_endemic'] != ''){
								tag += '<div class="item">' + results.data[i]['is_endemic'] + '</div>'
							}
							if (results.data[i]['alien_type'] != '' && results.data[i]['alien_type'] != undefined ){
								tag += '<div class="item">' + results.data[i]['alien_type'] + '</div>'
							}
							$('.table-style1').append(
								`
								<tr>
									<td><a href="/${$lang}/taxon/${results.data[i]['taxon_id']}">${results.data[i]['name']}</a></td>
									<td>${results.data[i]['common_name_c']}</td>
									<td>${results.data[i]['status']}</td>
									<td>
										<div class="tag-green">
											${tag}
										</div>
									</td>								
									<td>${results.data[i]['rank']}</td>
									<td>${results.data[i]['taxon_group']}</td>
									<td>${results.data[i]['kingdom']}</td>
								</tr>`)

						}
						$('.open_taxon').on('click', function(){
							window.open($(this).data('href'),"_self");
						})
						// 頁碼
						if (results.page.total_page > 1){  // 判斷超過一頁，有才加分頁按鈕
							$('.scro-m').after(
							`<div class="page-num">
								<!--現在位置加now-->
								<a data-page="1" class="num page-start getData">1</a>
								<a data-page="${results.page.current_page - 1}" class="back getData">
									<img src="/static/image/pagear1.svg">
									<p>${results.prev}</p>
								</a>
								<a data-page="${results.page.current_page + 1}" class="next getData">
									<p>${results.next}</p>
									<img src="/static/image/pagear2.svg">
								</a>
								<a data-page="${results.page.total_page}" class="num getData" id="page-end">${results.page.total_page}</a>
							</div>
							`)
							$('.page-num').append(`
								<input type="hidden" name="total_page" value="${results.page.total_page}">
							`)
						}

						if (results.page.current_page==1){
							$('.back').removeClass('getData')
						} else if (results.page.current_page==results.page.total_page){
							$('.next').removeClass('getData')
						}
							
						let html = ''
						for (let i = 0; i < results.page.page_list.length; i++) {
							if (results.page.page_list[i] == results.page.current_page){
							html += `<a class="num now getData" data-page="${results.page.page_list[i]}">${results.page.page_list[i]}</a> `;
							} else {
							html += `<a class="num getData" data-page="${results.page.page_list[i]}">${results.page.page_list[i]}</a>  `
							}
						}
						$('.back').after(html)
				
						$(".getData").prop("onclick", null).off("click");

						$('.getData').on('click', function(){

			
							if ($(this).data('page') == undefined){
								page = 1
							} else {
								page = $(this).data('page')
							}
				
							$('input[name=hidden-facet]').val('');
							getData(page=page, from_url=false)

						})

						// nice select
						
						$('select[name=mb-select]').niceSelect();
						$('select[name=mb-select-sub]').niceSelect();

						// 從網址進入如果有facet

						if((facet != '') & (value != '') & (facet != null) & (value != null)){
							changeFacet(facet, value, true, page, false)
						}

						$(".changeFacet").prop("onclick", null).off("click");

						$('.changeFacet').on('click',function(){
							changeFacet($(this).data('facet'), $(this).data('value'))
						})
				
						$('.mb-cataselect').removeClass('d-none')
						
					} else {
						
						$('.mb-cataselect').addClass('d-none')
					}
				}
			})
			.fail(function( xhr, status, errorThrown ) {
			$('.loadingbox').addClass('d-none');
			$lang == 'en-us' ? alert('An unexpected error occured! Please contact us.') : alert('發生未知錯誤！請聯絡管理員')
			window.enterPressed = false;
			console.log( 'Error: ' + errorThrown + 'Status: ' + xhr.status)
			}) 
		}
	}



	function updateData(page, from_url=false){
	
		// let total_page = $('input[name=total_page]').val();
		if (($('input[name=date]').val()!='')&(!isValidDate($('input[name=date]').val()))){
			alert('日期格式錯誤')
		} else {

			// 從facet或頁碼點選
			// 只修改表格內容，不修改facet
			$('.loadingbox').removeClass('d-none');

			$([document.documentElement, document.body]).animate({
				scrollTop: $(".result-area").offset().top - 80
			}, 200);

			
			let query_str = $('form').find('input[name!=csrfmiddlewaretoken]').serialize() + "&keyword=" +  $('input[name=keyword]').val() +
					'&name-select=' + $('select[name=name-select] option:selected').val() + '&date-select=' + $('select[name=date-select] option:selected').val() +
					'&bio_group-select=' + $('select[name=bio_group-select] option:selected').val()
					'&page=' + page + '&facet=' + $('input[name=hidden-facet]').val() + 
					'&facet_value=' + $('input[name=hidden-value]').val()  

			// 如果不是從url來的話 代表是第一次查詢 加上 page =1
			if (!from_url){
				var newRelativePathQuery = window.location.pathname + '?' + query_str + '&page=1';
				history.pushState(null, '', newRelativePathQuery);
			}

			$.ajax({
				url: `/${$lang}/catalogue`,
				data: query_str + '&csrfmiddlewaretoken=' + $csrf_token,		
				type: 'POST',
				dataType : 'json',
			})
			.done(function(results) {

				$('.loadingbox').addClass('d-none');

				$([document.documentElement, document.body]).animate({
					scrollTop: $(".result-area").offset().top - 80
				}, 200);

				// 修改共幾筆
				// $('#total-count').html(results['total_count']);
				$('#total-count').html(results['count']['total'][0]['count']);

				if (results['count']['total'][0]['count'] > 1000){
					$('.downloadData').off('click')
					$('.downloadData').removeClass('downloadData').addClass('offlineDownloadData')
					$('.offlineDownloadData').off('click')
					$('.offlineDownloadData').on('click', function(){
						offlineDownloadData()
						$('button.download_check').data('type', $(this).data('type'))
					})
				} else {
					$('.offlineDownloadData').off('click')
					$('.offlineDownloadData').removeClass('offlineDownloadData').addClass('downloadData')
					$('.downloadData').off('click')
					$('.downloadData').on('click', function(){
						downloadData($(this).data('type'))
					})
				}


				// 清空頁碼
				$('.page-num').remove()
				$('.table-style1').html(results.header)
				for (let i = 0; i < results.data.length; i++) {
					let tag = '';
					if (results.data[i]['is_endemic'] != ''){
						tag += '<div class="item">' + results.data[i]['is_endemic'] + '</div>'
					}
					if (results.data[i]['alien_type'] != ''){
						let alt_list = results.data[i]['alien_type'].split(',')
						alt_list = [...new Set(alt_list)];
						for (let a = 0; a < alt_list.length; a++) {
							tag += '<div class="item">' + alt_list[a] + '</div>'
						}
					}
					// `<tr class="open_taxon" data-href="/${$lang}/taxon/${results.data[i]['taxon_id']}">
					$('.table-style1').append(
						`<tr>
							<td><a href="/${$lang}/taxon/${results.data[i]['taxon_id']}">${results.data[i]['name']}</a></td>
							<td>${results.data[i]['common_name_c']}</td>
							<td>${results.data[i]['status']}</td>
							<td>
								<div class="tag-green">
									${tag}
								</div>
							</td>							
							<td>${results.data[i]['rank']}</td>
							<td>${results.data[i]['taxon_group']}</td>
							<td>${results.data[i]['kingdom']}</td>
						</tr>`)
				}
					
				$('.open_taxon').on('click', function(){
					window.open($(this).data('href'),"_self");
				})
				$('.page-num').remove()

					// 頁碼
					if (results.page.total_page > 1){  // 判斷超過一頁，有才加分頁按鈕
						$('.scro-m').after(
						`	<div class="page-num">
							<!--現在位置加now-->
							<a data-page="1" class="num page-start updateData">1</a>
							<a data-page="${results.page.current_page - 1}" class="back updateData">
								<img src="/static/image/pagear1.svg">
								<p>${results.prev}</p>
							</a>
							<a data-page="${results.page.current_page + 1}" class="next updateData">
								<p>${results.next}</p>
								<img src="/static/image/pagear2.svg">
							</a>
							<a data-page="${results.page.total_page}" class="num updateData" id="page-end">${results.page.total_page}</a>
						</div>
						`)
						$('.page-num').append(`
							<input type="hidden" name="total_page" value="${results.page.total_page}">
						`)
					}

					if (results.page.current_page==1){
                        $('.back').removeClass('updateData')
					} else if (results.page.current_page==results.page.total_page){
                        $('.next').removeClass('updateData')
					}
						
					let html = ''
					for (let i = 0; i < results.page.page_list.length; i++) {
						if (results.page.page_list[i] == results.page.current_page){
						html += `<a class="num now updateData" data-page="${results.page.page_list[i]}">${results.page.page_list[i]}</a> `;
						} else {
						html += `<a class="num updateData" data-page="${results.page.page_list[i]}">${results.page.page_list[i]}</a>  `
						}
					}
					$('.back').after(html)

					$(".updateData").prop("onclick", null).off("click");
                    $('.updateData').on('click', function(){
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
			
		}

	}
	  



	$(function(){		

		let date_locale = { days: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
		daysShort: ['日', '一', '二', '三', '四', '五', '六'],
		daysMin: ['日', '一', '二', '三', '四', '五', '六'],
		months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
		monthsShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
		today: '今天',
		clear: '清除',
		dateFormat: 'yyyy-MM-dd',   
		timeFormat: 'HH:mm',
		firstDay: 1}

	if ($lang == 'en-us') {
		date_locale = {   days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
		months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		today: 'Today',
		clear: 'Clear',
		dateFormat: 'yyyy-MM-dd',
		timeFormat: 'hh:mm aa',
		firstDay: 1}
	} 

		let date_picker = new AirDatepicker('#updated_at', {locale: date_locale});

        $('.changeFacet').on('click',function(){
            changeFacet($(this).data('facet'), $(this).data('value'))
        })

        $('.removeRankItem').on('click',function(){
            removeRankItem($(this))
        })
        $('.removeHigherTaxaItem').on('click',function(){
            removeHigherTaxaItem($(this))
        })

        // $('.updateData').on('click', function(){
        //     updateData(parseInt($(this).data('page')))
        // })

        $('.getData').on('click',function(){

			// 如果是從搜尋 要把facet拿掉
			
			if ($(this).data('page') == undefined){
				page = 1
			} else {
				page = $(this).data('page')
			}

			$('input[name=hidden-facet]').val('');
            getData(page=page, from_url=false)
        })

        $('.resetForm').on('click',function(){
            resetForm()
        })

        $('.downloadData').on('click',function(){
            downloadData($(this).data('type'))
        })

		// 較高分類群 autocomplete
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
			}
		});

		$('#higherTaxa').on('select2:open', function (e) {
			$('.select2-search__field').get(0).focus()
		});
		  
		
		// 按 enter 直接查詢
		window.enterPressed = false;

		
		 $(document).on('keypress', function(e) {			
	  
			if (e.which === 13 && !$('.downloadpop').hasClass('d-none')){	
				e.preventDefault();
				if (!$('.download_check').is(':disabled')){
					$('.download_check').trigger('click')
				}
			} else if (e.which === 13 && !window.enterPressed ){	

				e.preventDefault();
				window.enterPressed = true;
				getData(page=1, from_url=false);
			}
		});
		

		// 如果直接從帶有參數網址列進入
		changeAction(); 

		// 如果按上下一頁
		window.onpopstate = function(event) {
			changeAction();
		};

		// 選項設定
		$('select[name=rank-select]').niceSelect();
		// bold
		r_array = [1,3,7,12,18,22,26,30,34]
		for( r of r_array){
			$(`.list li[data-value=${r}]`).addClass('f-bold')
		}
		$('select[name=name-select]').niceSelect();
		$('select[name=date-select]').niceSelect();
		$('select[name=bio_group-select]').niceSelect();

		// 階層選項控制

		$('select[name=rank-select]').on('change', function(){
			// 確認沒有重複
			if (($('select[name=rank-select] option:selected').text() != '')&($(`.item input[name=rank][value="${$('select[name=rank-select] option:selected').val()}"]`).length == 0)){
				$('.rank-alread-select').append(
					`<div class="item">
						<p>${$('select[name=rank-select] option:selected').text()}</p>
						<input type="hidden" name="rank" value="${$('select[name=rank-select] option:selected').val()}">
						<button type="button" class="removeRankItem">
							<img src="/static/image/w-xx.svg">
						</button>
					</div>`)
			}

			// tag上面的xx
			$(".removeRankItem").prop("onclick", null).off("click");

			$('.removeRankItem').on('click',function(){
				removeRankItem($(this))
			})		
	
		})

		// $('select[name=bio_group-select]').on('change', function(){
		// 	// 確認沒有重複
		// 	if (($('select[name=bio_group-select] option:selected').text() != '')&($(`.item input[name=bio_group][value="${$('select[name=bio_group-select] option:selected').val()}"]`).length == 0)){
		// 		$('.bio_group-alread-select').append(
		// 			`<div class="item">
		// 				<p>${$('select[name=bio_group-select] option:selected').text()}</p>
		// 				<input type="hidden" name="bio_group" value="${$('select[name=bio_group-select] option:selected').val()}">
		// 				<button type="button" class="removeBioGroupItem">
		// 					<img src="/static/image/w-xx.svg">
		// 				</button>
		// 			</div>`)
		// 	}

		// 	// tag上面的xx
		// 	$(".removeBioGroupItem").prop("onclick", null).off("click");

		// 	$('.removeBioGroupItem').on('click',function(){
		// 		removeBioGroupItem($(this))
		// 	})		
	
		// })


		$('.select-button').on('click',function (event) {
			if( $(this).hasClass('now')){
				$(this).removeClass('now');
				$('.selection-box').slideUp();
			}else{
				$(this).addClass('now');
				$('.selection-box').slideDown();
			}
		});
		$('.more-option-button').on('click',function (event) {
			if( $(this).hasClass('now')){
				$(this).removeClass('now');
				$('.option-box2').slideUp();
			}else{
				$(this).addClass('now');
				$('.option-box2').slideDown();
			}
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
		  


	});



	function offlineDownloadData(){
		$('.downloadpop').fadeIn("slow");
		$('.downloadpop').removeClass("d-none");
	}


	function sendOfflineDownloadData(format){

		let query_str = "&keyword=" + $('input[name=keyword]').val() + '&name-select=' + $('select[name=name-select] option:selected').val() +
					"&file_format=" + format + "&date-select=" + $('select[name=date-select] option:selected').val() +
					"&bio_group-select=" + $('select[name=bio_group-select] option:selected').val() +
					"&download_email=" + $('input[name=download_email]').val()

		query_str += '&facet=' + $('input[name=hidden-facet]').val() + '&facet_value=' + $('input[name=hidden-value]').val();

		$.ajax({
			url: "/send_download_request",
			data: $('form#moreForm').serialize() + query_str + '&csrfmiddlewaretoken=' + $csrf_token,		
			type: 'POST',
			dataType : 'json',
		})
		.done(function(results) {
			console.log(results)
		})
	}

	$( ".downloadpop .xx" ).click(function() {
		$('.downloadpop').fadeOut("slow");
		$('.downloadpop').addClass('d-none')
	});
	
	

	$( "#download_email" ).keyup(function() {
        ValidateEmail($(this).val())
      });

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

	$('.download_check').on('click', function(){
		sendOfflineDownloadData($(this).data('type'))
		// alert('請求已送出')
		$lang == 'en-us' ? alert('Your request has been sent.') : alert('請求已送出')

		$('.downloadpop').fadeOut("slow");
		$('.downloadpop').addClass('d-none')

		
	})
