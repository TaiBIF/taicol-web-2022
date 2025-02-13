var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');


var $getSubListArr = `<div class="arr">
<svg xmlns="http://www.w3.org/2000/svg" width="20.828" height="11.828" viewBox="0 0 20.828 11.828">
    <g id="tree-arr" transform="translate(-1545.086 -550.086)">
        <line id="Line_177" data-name="Line 177" x2="9" y2="9" transform="translate(1546.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
        <line id="Line_178" data-name="Line 178" x1="9" y2="9" transform="translate(1555.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
    </g>
</svg>
</div>`

function getSubList(item){


    let with_cultured = 'off';
    if ($('input[name="with_cultured"]').is(':checked')){
        with_cultured = 'on';
    }

    let lin_rank = 'off';
    if ($('input[name="lin_rank"]').is(':checked')){
        lin_rank = 'on';
    }

    let with_not_official = 'off';
    if ($('input[name="with_not_official"]').is(':checked')){
        with_not_official = 'on';
    }

    if ($(item).data('taxon')){
        taxon_id = $(item).data('taxon')
    } else {
        taxon_id = $(item).data('parent_taxon')
    }

    if ($(item).data('fetched')=="0"){
        $('.loadingbox').removeClass('d-none');
        $.ajax({
            url: "/get_sub_tree_list",
            data:  {'csrfmiddlewaretoken' : $csrf_token,
                    'taxon_id': [taxon_id],
                    'rank_id': [$(item).data('rank')],
                    'with_cultured': with_cultured,
                    'lin_rank': lin_rank,
                    'with_not_official': with_not_official,
                    'lang': $lang,
                    'from_search_click': false },
            type: 'POST',
            dataType : 'json',
        })
        .done(function(resp) {
            results = resp[0]
            $('.loadingbox').addClass('d-none');
            $(item).data('fetched','1');
            let html_str;
            for (j of Object.keys(results)){
                if (j != 'has_lack'){
                    html_str = "";
                    for (var i = 0; i < results[j]['data'].length; i++) {

                        let still_has_sub = results[j]['data'][i]['stat'] ? true : false;

                        if (results[j]['data'][i]['taxon_id']){
                            html_str += `
                            <li>
                                <span class="anchor" id="${results[j]['data'][i]['taxon_id']}" ></span>
                                <div class="item-box ${still_has_sub ? 'getSubList' : ''}" data-with_cultured="${with_cultured}" data-lin_rank="${lin_rank}" data-fetched="0" data-taxon="${results[j]['data'][i]['taxon_id']}" data-rank="${results[j]['data'][i]['rank_id']}">
                                    <div class="cir-box">
                                        ${j}
                                    </div>
                                    <h2><a href="/${$lang}/taxon/${results[j]['data'][i]['taxon_id']}">${results[j]['data'][i]['name']}</a></h2>
                                    <p>${results[j]['data'][i]['stat']}</p>
                                    ${still_has_sub ? $getSubListArr : ''}
                                </div>
                            </li>
                            `
                        } else {
                            html_str += `
                            <li>
                                <span class="anchor" id="" ></span>
                                <div class="item-box ${still_has_sub ? 'getSubList' : ''}" data-with_cultured="${with_cultured}" data-lin_rank="${lin_rank}" data-fetched="0" data-taxon="" data-parent_taxon="${taxon_id}" data-rank="${results[j]['data'][i]['rank_id']}">
                                    <div class="cir-box">
                                        ${j}
                                    </div>
                                    <h2 data-taxon_id="${results[j]['data'][i]['taxon_id']}">${results[j]['data'][i]['name']}</h2>
                                    <p>${results[j]['data'][i]['stat']}</p>
                                    ${still_has_sub ? $getSubListArr : ''}
                                </div>
                            </li>
                            `
                        }
                    }

                    html_str = `<ul class="d-block ${results[j]['rank_color']}">` + html_str + '</ul>'
                    $(item).after(html_str)
                }
            }

            $(".getSubList").off("click");
            $('.getSubList').on('click', function(){
                getSubList($(this))
            })   

            $('.tree-area .item-box h2 a').off('click')
            $('.tree-area .item-box h2 a').on('click', function(event){
                event.stopPropagation();
            })
 
        })
        .fail(function( xhr, status, errorThrown ) {
            $('.loadingbox').addClass('d-none');
			$lang == 'en-us' ? alert('An unexpected error occured! Please contact us.') : alert('發生未知錯誤！請聯絡管理員')
            console.log( 'Error: ' + errorThrown + 'Status: ' + xhr.status)
        }) 
        
    }

    $( '.item-box' ).removeClass('now')

    if (($(item).next('ul').hasClass('d-block'))|( ($(item).next('ul').length ==0)&($(item).hasClass('now'))) ) {
        $(item).removeClass('now')
        $(item).nextAll('ul').removeClass('d-block').addClass('d-none')
    } else {
        $(item).addClass('now');
        $(item).nextAll('ul').removeClass('d-none').addClass('d-block')
    }

}



$(function (){

    // 如果進入時 帶有hash 打開樹
    if (window.location.hash != null && window.location.hash != '') {
        searchClick(window.location.hash.substring(1),true)

    };

    $('.getSubList').off('click')
    $('.getSubList').on('click', function(){
        getSubList($(this))
    })

    $('.search_a').on('click',function(){
        searchClick($(this).data('taxon_id'),true)
    })

    $('.tree-area .item-box h2 a').off('click')
    $('.tree-area .item-box h2 a').on('click', function(event){
        event.stopPropagation();
    })

    // 栽培豢養
    $('input[name="with_cultured"], input[name="lin_rank"], input[name="with_not_official"]').change(function() {

        let current_taxon_id;
        if ($('.main-box .item-box.now').length >0){
            // 只選擇最後一個
            current_taxon_id = $('.main-box .item-box.now').last().data('taxon')
        } else {
            // 清空autocomplete
            $( "#keyword" ).val('').trigger('change');
        }

        let with_cultured = 'off';
        if ($('input[name="with_cultured"]').is(':checked')){
            with_cultured = 'on';
        }

        let lin_rank = 'off';
        if ($('input[name="lin_rank"]').is(':checked')){
            lin_rank = 'on';
        }

        let with_not_official = 'off';
        if ($('input[name="with_not_official"]').is(':checked')){
            with_not_official = 'on';
        }


        $.ajax({
            url: "/get_root_tree",
            data:  {'csrfmiddlewaretoken' : $csrf_token,
                    'with_cultured': with_cultured,
                    'lin_rank': lin_rank,
                    'with_not_official': with_not_official,
                    'lang': $lang},
            type: 'POST',
            dataType : 'json',
        })
        .done(function(results) {

            $('.tree-area .main-box ul.kingdom').html('')

            for (r of results){

                let still_has_sub = r.stat ? true : false;

                $('.tree-area .main-box ul.kingdom').append(
                    `<li ${ r.name.includes('Viruses') ? 'class="unranked-li"' :  ''}>
                    <span class="anchor" id="${ r.taxon_id }" ></span>
                    <div class="item-box ${still_has_sub ? 'getSubList' : ''}" data-with_cultured="${ with_cultured }" data-lin_rank="${ lin_rank }" data-fetched="0" data-taxon="${ r.taxon_id }" data-rank="${ r.name.includes('Viruses') ? 50 :  3}">
                        <div class="cir-box">
                            ${ r.name.includes('Viruses') ? '未定' :  '界'}
                        </div>
                        <h2><a href="/${$lang}/taxon/${ r.taxon_id }">${ r.name }</a></h2>
                        <p>${ r.stat }</p>
                        ${still_has_sub ? $getSubListArr : ''}
                    </div>
                    </li>`
                )
            }

            $('.getSubList').off('click')
            $('.getSubList').on('click', function(){
                getSubList($(this))
            })
        
            $('.tree-area .item-box h2 a').off('click')
            $('.tree-area .item-box h2 a').on('click', function(event){
                event.stopPropagation();
            })        

            if (current_taxon_id){
                searchClick(current_taxon_id, false)
            } 
        })

    });


    // 關鍵字 autocomplete
    $("#keyword").select2({
        language: {
            "noResults": function(){
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
            },
        },		
        ajax: {
            delay: 250,
            dataType: 'json',
            data: function (params) {
                let with_cultured = 'off';
                if ($('input[name="with_cultured"]').is(':checked')){
                    with_cultured = 'on';
                }
                let lin_rank = 'off';
                if ($('input[name="lin_rank"]').is(':checked')){
                    lin_rank = 'on';
                }

                let with_not_official = 'off';
                if ($('input[name="with_not_official"]').is(':checked')){
                    with_not_official = 'on';
                }

                if (params.term != undefined ){
                    if (params.term.trim().length  > 0){
                         return {
                            keyword: params.term,
                            from_tree: 'true',
                            with_cultured: with_cultured,
                            lin_rank: lin_rank,
                            with_not_official: with_not_official,
                            lang: $lang
                            };
                    } else {
                        return false;  
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
            },
        },
        escapeMarkup: function(markup) { return markup; }, // Allows HTML rendering
    });

    $('#keyword').on('select2:open', function (e) {
        $('.select2-search__field').get(0).focus()
    });

    $('#keyword').on('select2:select', function (e) {
        console.log('select2:select')
        var data = e.params.data;
        searchClick(data.id,true)
      });

});


function searchClick(keyword_taxon_id, add_stat){

    let with_cultured = 'off';
    if ($('input[name="with_cultured"]').is(':checked')){
        with_cultured = 'on';
    }
    let lin_rank = 'off';
    if ($('input[name="lin_rank"]').is(':checked')){
        lin_rank = 'on';
    }
    let with_not_official = 'off';
    if ($('input[name="with_not_official"]').is(':checked')){
        with_not_official = 'on';
    }
    // 關閉所有的樹
    $('.main-box .item-box').removeClass('now');
    $(`.main-box ul`).not('.rank-1-red').addClass('d-none').removeClass('d-block');
    // 搜尋下方的樹
    // 先查path 如果已經在樹上就不要再查詢
    // 已經有存在 只需要打開
    if ($(`div [data-taxon="${keyword_taxon_id}"]`).length > 0) {
        $(`div [data-taxon="${keyword_taxon_id}"]`).parent().parents('ul').addClass('d-block').removeClass('d-none');
        if (!$(`div[data-taxon="${keyword_taxon_id}"]`).hasClass('now')){
            $(`div[data-taxon="${keyword_taxon_id}"]`).addClass('now')}	
        $(`div [data-taxon="${keyword_taxon_id}"]`).nextAll('ul').addClass('d-block').removeClass('d-none');
        document.location=`#${keyword_taxon_id}`
    } else {
        $('.loadingbox').removeClass('d-none');
        $.ajax({
            url: "/get_taxon_path",
            data:  {'csrfmiddlewaretoken' : $csrf_token,
                    'taxon_id': keyword_taxon_id,
                    'with_cultured': with_cultured,
                    'lin_rank': lin_rank,
                    'with_not_official': with_not_official},
            type: 'POST',
            dataType : 'json',
        })
        .done(function(results) {

            fetch_taxon = []
            fetch_rank_id = []
            for (let i = 0; i < results.path.length; i++) {

                if ($(`div[data-taxon="${results.path[i]}"]`).length==0 | $(`div[data-taxon="${results.path[i]}"]`).data('fetched')=="0"){
                    fetch_taxon.push(results.path[i])
                    fetch_rank_id.push(results.rank_id[i])
                }
            }

            if (fetch_taxon.length > 0){
                fetchSubList(fetch_taxon, keyword_taxon_id, fetch_rank_id)
            } else {
                $('.loadingbox').addClass('d-none');
            }

        })
        .fail(function( xhr, status, errorThrown ) {
            $('.loadingbox').addClass('d-none');
			$lang == 'en-us' ? alert('An unexpected error occured! Please contact us.') : alert('發生未知錯誤！請聯絡管理員')
            console.log( 'Error: ' + errorThrown + 'Status: ' + xhr.status)
        }) 

    }
    // 加入搜尋次數
    if (add_stat){
        $.ajax({
            url: "/update_search_stat",
            data:  {'csrfmiddlewaretoken' : $csrf_token,
                    'taxon_id': keyword_taxon_id},
            type: 'POST',
            dataType : 'json',
        })
        .done(function(results) {
            console.log('update_search_stat done')
        })
    }
}


function fetchSubList(fetch_taxon, keyword_taxon_id, fetch_rank_id){

    let with_cultured = 'off';
    if ($('input[name="with_cultured"]').is(':checked')){
        with_cultured = 'on';
    }

    let lin_rank = 'off';
    if ($('input[name="lin_rank"]').is(':checked')){
        lin_rank = 'on';
    }

    let with_not_official = 'off';
    if ($('input[name="with_not_official"]').is(':checked')){
        with_not_official = 'on';
    }

    $.ajax({
        url: "/get_sub_tree_list",
        data:  {'csrfmiddlewaretoken' : $csrf_token,
                'taxon_id': fetch_taxon,
                'rank_id': fetch_rank_id,
                'with_cultured': with_cultured,
                'lin_rank': lin_rank,
                'with_not_official': with_not_official,
                'lang': $lang,
                'from_search_click': true
            },
        type: 'POST',
        dataType : 'json',
    })
    .done(function(results) {
        
        for (var r = 0; r < results.length; r++) {

            let html_str;
            if (results[r]['has_lack']){
                j = Object.keys(results[r])[1]
                // 第一個一定是接在該taxon_id後面沒錯
               item= $(`div[data-taxon="${results[r][j]['taxon_id']}"]`)
                $(item).data('fetched','1');
                html_str = "";
                for (var i = 0; i < results[r][j]['data'].length; i++) {

                    let still_has_sub = results[r][j]['data'][i]['stat'] ? true : false;

                    if (results[r][j]['data'][i]['taxon_id']){
                        html_str += `
                        <li>
                            <span class="anchor" id="${results[r][j]['data'][i]['taxon_id']}" ></span>
                            <div class="item-box ${still_has_sub ? 'getSubList' : ''}" data-with_cultured="${with_cultured}" data-lin_rank="${lin_rank}" data-fetched="0" data-taxon="${results[r][j]['data'][i]['taxon_id']}" data-rank="${results[r][j]['data'][i]['rank_id']}">
                                <div class="cir-box">
                                    ${j}
                                </div>
                                <h2><a href="/${$lang}/taxon/${results[r][j]['data'][i]['taxon_id']}">${results[r][j]['data'][i]['name']}</a></h2>
                                <p>${results[r][j]['data'][i]['stat']}</p>
                                ${still_has_sub ? $getSubListArr : ''}
                            </div>
                        </li>
                        `
                    } else {
                        html_str += `
                        <li>
                            <span class="anchor" id="" ></span>
                            <div class="item-box ${still_has_sub ? 'getSubList' : ''}" data-with_cultured="${with_cultured}" data-lin_rank="${lin_rank}" data-fetched="0" data-taxon="" data-parent_taxon="${results[r][j]['taxon_id']}" data-rank="${results[r][j]['data'][i]['rank_id']}">
                                <div class="cir-box">
                                    ${j}
                                </div>
                                <h2 data-taxon_id="${results[r][j]['data'][i]['taxon_id']}">${results[r][j]['data'][i]['name']}</h2>
                                <p>${results[r][j]['data'][i]['stat']}</p>
                                ${still_has_sub ? $getSubListArr : ''}
                            </div>
                        </li>
                        `
                    }
                }
                html_str = `<ul class="${results[r][j]['rank_color']}">` + html_str + '</ul>'
                $(item).after(html_str) 

                for (j of Object.keys(results[r])){
                    if (j != Object.keys(results[r])[0]){
                        // 這邊要改成判斷可以接在parent後面
                       item= $(`div[data-parent_taxon="${results[r][j]['taxon_id']}"][data-rank="${results[r][j]['parent_rank_id']}"]`)
                        $(item).data('fetched','1');
                        html_str = "";
                        for (var i = 0; i < results[r][j]['data'].length; i++) {

                            let still_has_sub = results[r][j]['data'][i]['stat'] ? true : false;

                            if (results[r][j]['data'][i]['taxon_id']){
                                html_str += `
                                <li>
                                    <span class="anchor" id="${results[r][j]['data'][i]['taxon_id']}" ></span>
                                    <div class="item-box ${still_has_sub ? 'getSubList' : ''}" data-with_cultured="${with_cultured}" data-lin_rank="${lin_rank}" data-fetched="0" data-taxon="${results[r][j]['data'][i]['taxon_id']}" data-rank="${results[r][j]['data'][i]['rank_id']}">
                                        <div class="cir-box">
                                            ${j}
                                        </div>
                                        <h2><a href="/${$lang}/taxon/${results[r][j]['data'][i]['taxon_id']}">${results[r][j]['data'][i]['name']}</a></h2>
                                        <p>${results[r][j]['data'][i]['stat']}</p>
                                        ${still_has_sub ? $getSubListArr : ''}
                                    </div>
                                </li>
                                `
                            } else {
                                html_str += `
                                <li>
                                    <span class="anchor" id="" ></span>
                                    <div class="item-box ${still_has_sub ? 'getSubList' : ''}" data-with_cultured="${with_cultured}" data-lin_rank="${lin_rank}" data-fetched="0" data-taxon="" data-parent_taxon="${results[r][j]['taxon_id']}" data-rank="${results[r][j]['data'][i]['rank_id']}">
                                        <div class="cir-box">
                                            ${j}
                                        </div>
                                        <h2 data-taxon_id="${results[r][j]['data'][i]['taxon_id']}">${results[r][j]['data'][i]['name']}</h2>
                                        <p>${results[r][j]['data'][i]['stat']}</p>
                                        ${still_has_sub ? $getSubListArr : ''}
                                    </div>
                                </li>
                                `
                            }
                        }
                        html_str = `<ul class="d-block ${results[r][j]['rank_color']}">` + html_str + '</ul>'
                        $(item).after(html_str) 
                    }
                }
            } else {
                for (j of Object.keys(results[r])){
                    if (j != 'has_lack'){
                       item= $(`div[data-taxon="${results[r][j]['taxon_id']}"]`)
                        $(item).data('fetched','1');
                        html_str = "";
                        for (var i = 0; i < results[r][j]['data'].length; i++) {

                            let still_has_sub = results[r][j]['data'][i]['stat'] ? true : false;

                            if (results[r][j]['data'][i]['taxon_id']){
                                html_str += `
                                <li>
                                    <span class="anchor" id="${results[r][j]['data'][i]['taxon_id']}" ></span>
                                    <div class="item-box ${still_has_sub ? 'getSubList' : ''}" data-with_cultured="${with_cultured}" data-lin_rank="${lin_rank}" data-fetched="0" data-taxon="${results[r][j]['data'][i]['taxon_id']}" data-rank="${results[r][j]['data'][i]['rank_id']}">
                                        <div class="cir-box">
                                            ${j}
                                        </div>
                                        <h2><a href="/${$lang}/taxon/${results[r][j]['data'][i]['taxon_id']}">${results[r][j]['data'][i]['name']}</a></h2>
                                        <p>${results[r][j]['data'][i]['stat']}</p>
                                        ${still_has_sub ? $getSubListArr : ''}
                                    </div>
                                </li>
                                `
                            } 
                        }
                        html_str = `<ul class="d-block ${results[r][j]['rank_color']}">` + html_str + '</ul>'
                        $(item).after(html_str) 
                    }
                }
            }
            
        }

        $(".getSubList").off("click");
        $('.getSubList').on('click', function(){
            getSubList($(this))
        })

        $('.tree-area .item-box h2 a').off('click')
        $('.tree-area .item-box h2 a').on('click', function(event){
            event.stopPropagation();
        })

        // 關閉所有的樹
        $('.main-box .item-box').removeClass('now');
        $(`.main-box ul`).not('.rank-1-red').addClass('d-none').removeClass('d-block');

        if (!$(`div[data-taxon="${keyword_taxon_id}"]`).hasClass('now')){
            $(`div[data-taxon="${keyword_taxon_id}"]`).addClass('now')
        }
        $(`div [data-taxon="${keyword_taxon_id}"]`).data('fetched','1')

        $(`div [data-taxon="${keyword_taxon_id}"]`).parent().parents('ul').addClass('d-block').removeClass('d-none');
        $(`div [data-taxon="${keyword_taxon_id}"]`).nextAll('ul').addClass('d-block').removeClass('d-none');

        document.location=`#${keyword_taxon_id}`

        $('.loadingbox').addClass('d-none');


    })
    .fail(function( xhr, status, errorThrown ) {
        $('.loadingbox').addClass('d-none');
        $lang == 'en-us' ? alert('An unexpected error occured! Please contact us.') : alert('發生未知錯誤！請聯絡管理員')
        console.log( 'Error: ' + errorThrown + 'Status: ' + xhr.status)
    }) 



}



