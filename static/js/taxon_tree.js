var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');

/*
function redirectTaxonPage(taxon_id){
        event.stopPropagation();
        window.open(`/taxon/${taxon_id}`);
}*/

function getSubList(item){
    let cultured = 'off';
    if ($('input[name="cultured"]').is(':checked')){
        cultured = 'on';
    }

    if ($(item).data('taxon')){
        taxon_id = $(item).data('taxon')
    } else {
        taxon_id = $(item).data('parent_taxon')
    }
    //$('.main-box .item-box').removeClass('now');
    if ($(item).data('fetched')=="0"){
        console.log('a')
        $('.loadingbox').removeClass('d-none');
        $.ajax({
            url: "/get_sub_tree",
            data:  {'csrfmiddlewaretoken' : $csrf_token,
                    'taxon_id': taxon_id,
                    'rank_id': $(item).data('rank'),
                    'cultured': cultured
                    },
            type: 'POST',
            dataType : 'json',
        })
        .done(function(results) {
            $('.loadingbox').addClass('d-none');
            $(item).data('fetched','1');
            let html_str;
            for (j of Object.keys(results)){
                if (j != 'has_lack'){
                    html_str = "";
                    for (var i = 0; i < results[j]['data'].length; i++) {
                        if (results[j]['data'][i]['taxon_id']){
                            html_str += `
                            <li>
                                <span class="anchor" id="${results[j]['data'][i]['taxon_id']}-${cultured}" ></span>
                                <div class="item-box getSubList" data-cultured="${cultured}" data-fetched="0" data-taxon="${results[j]['data'][i]['taxon_id']}" data-rank="${results[j]['data'][i]['rank_id']}">
                                    <div class="cir-box">
                                        ${j}
                                    </div>
                                    <h2 class="redirectTaxonPage" data-taxon_id="${results[j]['data'][i]['taxon_id']}">${results[j]['data'][i]['name']}</h2>
                                    <p>${results[j]['data'][i]['stat']}</p>
                                    <div class="arr">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20.828" height="11.828" viewBox="0 0 20.828 11.828">
                                            <g id="tree-arr" transform="translate(-1545.086 -550.086)">
                                                <line id="Line_177" data-name="Line 177" x2="9" y2="9" transform="translate(1546.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                                <line id="Line_178" data-name="Line 178" x1="9" y2="9" transform="translate(1555.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                            </g>
                                        </svg>
                                    </div>
                                </div>
                            </li>
                            `
                        } else {
                            html_str += `
                            <li>
                                <span class="anchor" id="" ></span>
                                <div class="item-box getSubList" data-cultured="${cultured}" data-fetched="0" data-taxon="" data-parent_taxon="${taxon_id}" data-rank="${results[j]['data'][i]['rank_id']}">
                                    <div class="cir-box">
                                        ${j}
                                    </div>
                                    <h2 class="" data-taxon_id="${results[j]['data'][i]['taxon_id']}">${results[j]['data'][i]['name']}</h2>
                                    <p>${results[j]['data'][i]['stat']}</p>
                                    <div class="arr">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20.828" height="11.828" viewBox="0 0 20.828 11.828">
                                            <g id="tree-arr" transform="translate(-1545.086 -550.086)">
                                                <line id="Line_177" data-name="Line 177" x2="9" y2="9" transform="translate(1546.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                                <line id="Line_178" data-name="Line 178" x1="9" y2="9" transform="translate(1555.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                            </g>
                                        </svg>
                                    </div>
                                </div>
                            </li>
                            `
                        }
                    }

                    html_str = `<ul class="d-block ${results[j]['rank_color']}">` + html_str + '</ul>'
                    $(item).after(html_str)
                }
            }
            $(".getSubList").prop("onclick", null).off("click");
            $(".redirectTaxonPage").prop("onclick", null).off("click");

            $('.getSubList').on('click', function(){
                getSubList($(this))
            })   
        
            $('.redirectTaxonPage').on('click', function(event){
                event.stopPropagation();
                window.open(`/taxon/${$(this).data('taxon_id')}`);
            })   
 
        })
        .fail(function( xhr, status, errorThrown ) {
            $('.loadingbox').addClass('d-none');
            alert('發生未知錯誤！請聯絡管理員')
            console.log( 'Error: ' + errorThrown + 'Status: ' + xhr.status)
        }) 
        
    }

    $( '.item-box' ).removeClass('now')

    if (($( item ).next('ul').hasClass('d-block'))|( ($( item ).next('ul').length ==0)&($( item ).hasClass('now'))) ) {
        $( item ).removeClass('now')
        $( item ).nextAll('ul').removeClass('d-block').addClass('d-none')
        //$( item ).nextAll('.item-box').removeClass('now')
    } else {
        $( item ).addClass('now');
        $( item ).nextAll('ul').removeClass('d-none').addClass('d-block')
    }

        
}



$(function (){

    $('.getSubList').on('click', function(){
        getSubList($(this))
    })

    $('.search_a').on('click',function(){
        searchClick($(this).data('taxon_id'))
    })

    $('.redirectTaxonPage').on('click', function(event){
        event.stopPropagation();
        window.open(`/taxon/${$(this).data('taxon_id')}`);
    })    

    // 栽培豢養
    $('input[name="cultured"]').change(function() {
        let current_taxon_id;
        if ($('.main-box .item-box.now').length >0){
            // 只選擇最後一個
            current_taxon_id = $('.main-box .item-box.now').last().data('taxon')
        } else {
            // 清空autocomplete
            $( "#keyword" ).val('').trigger('change');

        }
        if(this.checked) {
            // 包含栽培豢養
            $('.tree-area .main-box ul.kingdom').removeClass('d-none').addClass('d-block')
            $('.tree-area .main-box ul.kingdom_c').addClass('d-none').removeClass('d-block')

            // 後續
            if (current_taxon_id){
                searchClick(current_taxon_id)
            }
            
        } else {
            // 排除栽培豢養
            $('.tree-area .main-box ul.kingdom_c').removeClass('d-none').addClass('d-block')
            $('.tree-area .main-box ul.kingdom').addClass('d-none').removeClass('d-block')
            // 後續
            if (current_taxon_id){
                searchClick(current_taxon_id)
            } 
        }
    });
    

    // 關鍵字 autocomplete
    $("#keyword").select2({
        language: {
            "noResults": function(){
                return "查無結果";
            },		 
            searching: function(params) {
                if (params.term != undefined){
                    if (params.term.match(/[\u3400-\u9FBF]/)){
                        if (params.term.length >1){
                            return '查詢中...';
                        } else {
                            return false;  
                        }
                    } else if (params.term.trim().length  > 2){
                        return '查詢中...';
                    } else {
                        return false;  
                    }					
                }
            },
        },		
        ajax: {
            dataType: 'json',
            data: function (params) {
                let cultured = 'off';
                if ($('input[name="cultured"]').is(':checked')){
                    cultured = 'on';
                }
                if (params.term != undefined ){
                    if (params.term.match(/[\u3400-\u9FBF]/)){
                        if (params.term.length >1){
                            return {
                                keyword: params.term,
                                from_tree: 'true',
                                cultured: cultured
                                };
                        }
                    } else if (params.term.trim().length  > 2){
                        return {
                            keyword: params.term,
                            from_tree: 'true',
                            cultured: cultured
                            };

                    } else {
                        return false;  
                    }					
                } else {
                    throw false;  
                }

            },			  
            jsonpCallback: 'jsonCallback',
            url: '/get_autocomplete_taxon',
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

    $('#keyword').on('select2:open', function (e) {
        $('.select2-search__field').get(0).focus()
    });


    $('#keyword').on('select2:select', function (e) {
        var data = e.params.data;
        searchClick(data.id)
      });

});

function searchClick(keyword_taxon_id){
    let cultured = 'off';
    if ($('input[name="cultured"]').is(':checked')){
        cultured = 'on';
    }
    // 關閉所有的樹
    $('.main-box .item-box').removeClass('now');
    $(`.main-box ul`).not('.rank-1-red').addClass('d-none').removeClass('d-block');
    // 搜尋下方的樹
    // 先查path 如果已經在樹上就不要再查詢
    // 已經有存在 只需要打開
    if ($(`div [data-taxon="${keyword_taxon_id}"][data-cultured="${cultured}"]`).length > 0) {
        $(`div [data-taxon="${keyword_taxon_id}"][data-cultured="${cultured}"]`).parent().parents('ul').addClass('d-block').removeClass('d-none');
        if (!$(`div[data-taxon="${keyword_taxon_id}"][data-cultured="${cultured}"]`).hasClass('now')){
            $(`div[data-taxon="${keyword_taxon_id}"][data-cultured="${cultured}"]`).addClass('now')}	
        $(`div [data-taxon="${keyword_taxon_id}"][data-cultured="${cultured}"]`).nextAll('ul').addClass('d-block').removeClass('d-none');
        document.location=`#${keyword_taxon_id}-${cultured}`
    } else {
        $('.loadingbox').removeClass('d-none');
        $.ajax({
            url: "/get_taxon_path",
            data:  {'csrfmiddlewaretoken' : $csrf_token,
                    'taxon_id': keyword_taxon_id,
                    'cultured': cultured},
            type: 'POST',
            dataType : 'json',
        })
        .done(function(results) {
            fetch_taxon = []
            fetch_rank_id = []
            for (let i = 0; i < results.path.length; i++) {
                if ($(`div[data-taxon="${results.path[i]}"][data-cultured="${cultured}"]`).length==0 | $(`div[data-taxon="${results.path[i]}"][data-cultured="${cultured}"]`).data('fetched')=="0"){
                    fetch_taxon.push(results.path[i])
                    fetch_rank_id.push(results.rank_id[i])
                }
              }
            //fetch_taxon.push(keyword_taxon_id)
            if (fetch_taxon.length > 0){
                fetchSubList(fetch_taxon, keyword_taxon_id, fetch_rank_id)
            } else {
                $('.loadingbox').addClass('d-none');
            }
        })
        .fail(function( xhr, status, errorThrown ) {
            $('.loadingbox').addClass('d-none');
            alert('發生未知錯誤！請聯絡管理員')
            console.log( 'Error: ' + errorThrown + 'Status: ' + xhr.status)
        }) 

    }
    // 加入搜尋次數
    $.ajax({
        url: "/update_search_stat",
        data:  {'csrfmiddlewaretoken' : $csrf_token,
                'taxon_id': keyword_taxon_id},
        type: 'POST',
        dataType : 'json',
    })
    .done(function(results) {
        console.log('done')
    })
}


function fetchSubList(fetch_taxon, keyword_taxon_id, fetch_rank_id){

    let cultured = 'off';
    if ($('input[name="cultured"]').is(':checked')){
        cultured = 'on';
    }
    $.ajax({
        url: "/get_sub_tree_list",
        data:  {'csrfmiddlewaretoken' : $csrf_token,
                'taxon_id': fetch_taxon,
                'rank_id': fetch_rank_id,
                'cultured': cultured},
        type: 'POST',
        dataType : 'json',
    })
    .done(function(results) {
        $('.loadingbox').addClass('d-none');
        
        for (var r = 0; r < results.length; r++) {

            let html_str;
            if (results[r]['has_lack']){
                j = Object.keys(results[r])[1]
                // 第一個一定是接在該taxon_id後面沒錯
                item = $(`div[data-taxon="${results[r][j]['taxon_id']}"][data-cultured="${cultured}"]`)
                $(item).data('fetched','1');
                html_str = "";
                for (var i = 0; i < results[r][j]['data'].length; i++) {
                    if (results[r][j]['data'][i]['taxon_id']){
                        html_str += `
                        <li>
                            <span class="anchor" id="${results[r][j]['data'][i]['taxon_id']}-${cultured}" ></span>
                            <div class="item-box getSubList" data-cultured="${cultured}" data-fetched="0" data-taxon="${results[r][j]['data'][i]['taxon_id']}" data-rank="${results[r][j]['data'][i]['rank_id']}">
                                <div class="cir-box">
                                    ${j}
                                </div>
                                <h2 class="redirectTaxonPage" data-taxon_id="${results[r][j]['data'][i]['taxon_id']}">${results[r][j]['data'][i]['name']}</h2>
                                <p>${results[r][j]['data'][i]['stat']}</p>
                                <div class="arr">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20.828" height="11.828" viewBox="0 0 20.828 11.828">
                                        <g id="tree-arr" transform="translate(-1545.086 -550.086)">
                                            <line id="Line_177" data-name="Line 177" x2="9" y2="9" transform="translate(1546.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                            <line id="Line_178" data-name="Line 178" x1="9" y2="9" transform="translate(1555.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                        </g>
                                    </svg>
                                </div>
                            </div>
                        </li>
                        `
                    } else {
                        html_str += `
                        <li>
                            <span class="anchor" id="" ></span>
                            <div class="item-box getSubList" data-cultured="${cultured}" data-fetched="0" data-taxon="" data-parent_taxon="${results[r][j]['taxon_id']}" data-rank="${results[r][j]['data'][i]['rank_id']}">
                                <div class="cir-box">
                                    ${j}
                                </div>
                                <h2 class="" data-taxon_id="${results[r][j]['data'][i]['taxon_id']}">${results[r][j]['data'][i]['name']}</h2>
                                <p>${results[r][j]['data'][i]['stat']}</p>
                                <div class="arr">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20.828" height="11.828" viewBox="0 0 20.828 11.828">
                                        <g id="tree-arr" transform="translate(-1545.086 -550.086)">
                                            <line id="Line_177" data-name="Line 177" x2="9" y2="9" transform="translate(1546.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                            <line id="Line_178" data-name="Line 178" x1="9" y2="9" transform="translate(1555.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                        </g>
                                    </svg>
                                </div>
                            </div>
                        </li>
                        `
                    }
                }
                html_str = `<ul class="d-block ${results[r][j]['rank_color']}">` + html_str + '</ul>'
                $(item).after(html_str) 

                for (j of Object.keys(results[r])){
                    if (j != Object.keys(results[r])[0]){
                        // 這邊要改成判斷可以接在parent後面
                        item = $(`div[data-parent_taxon="${results[r][j]['taxon_id']}"][data-rank="${results[r][j]['parent_rank_id']}"]`)
                        $(item).data('fetched','1');
                        html_str = "";
                        for (var i = 0; i < results[r][j]['data'].length; i++) {
                            if (results[r][j]['data'][i]['taxon_id']){
                                html_str += `
                                <li>
                                    <span class="anchor" id="${results[r][j]['data'][i]['taxon_id']}-${cultured}" ></span>
                                    <div class="item-box getSubList" data-cultured="${cultured}" data-fetched="0" data-taxon="${results[r][j]['data'][i]['taxon_id']}" data-rank="${results[r][j]['data'][i]['rank_id']}">
                                        <div class="cir-box">
                                            ${j}
                                        </div>
                                        <h2 class="redirectTaxonPage" data-taxon_id="${results[r][j]['data'][i]['taxon_id']}">${results[r][j]['data'][i]['name']}</h2>
                                        <p>${results[r][j]['data'][i]['stat']}</p>
                                        <div class="arr">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20.828" height="11.828" viewBox="0 0 20.828 11.828">
                                                <g id="tree-arr" transform="translate(-1545.086 -550.086)">
                                                    <line id="Line_177" data-name="Line 177" x2="9" y2="9" transform="translate(1546.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                                    <line id="Line_178" data-name="Line 178" x1="9" y2="9" transform="translate(1555.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                                </g>
                                            </svg>
                                        </div>
                                    </div>
                                </li>
                                `
                            } else {
                                html_str += `
                                <li>
                                    <span class="anchor" id="" ></span>
                                    <div class="item-box getSubList" data-cultured="${cultured}" data-fetched="0" data-taxon="" data-parent_taxon="${results[r][j]['taxon_id']}" data-rank="${results[r][j]['data'][i]['rank_id']}">
                                        <div class="cir-box">
                                            ${j}
                                        </div>
                                        <h2 class="" data-taxon_id="${results[r][j]['data'][i]['taxon_id']}">${results[r][j]['data'][i]['name']}</h2>
                                        <p>${results[r][j]['data'][i]['stat']}</p>
                                        <div class="arr">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20.828" height="11.828" viewBox="0 0 20.828 11.828">
                                                <g id="tree-arr" transform="translate(-1545.086 -550.086)">
                                                    <line id="Line_177" data-name="Line 177" x2="9" y2="9" transform="translate(1546.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                                    <line id="Line_178" data-name="Line 178" x1="9" y2="9" transform="translate(1555.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                                </g>
                                            </svg>
                                        </div>
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
                        item = $(`div[data-taxon="${results[r][j]['taxon_id']}"][data-cultured="${cultured}"]`)
                        $(item).data('fetched','1');
                        html_str = "";
                        for (var i = 0; i < results[r][j]['data'].length; i++) {
                            if (results[r][j]['data'][i]['taxon_id']){
                                html_str += `
                                <li>
                                    <span class="anchor" id="${results[r][j]['data'][i]['taxon_id']}-${cultured}" ></span>
                                    <div class="item-box getSubList" data-cultured="${cultured}" data-fetched="0" data-taxon="${results[r][j]['data'][i]['taxon_id']}" data-rank="${results[r][j]['data'][i]['rank_id']}">
                                        <div class="cir-box">
                                            ${j}
                                        </div>
                                        <h2 class="redirectTaxonPage" data-taxon_id="${results[r][j]['data'][i]['taxon_id']}">${results[r][j]['data'][i]['name']}</h2>
                                        <p>${results[r][j]['data'][i]['stat']}</p>
                                        <div class="arr">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20.828" height="11.828" viewBox="0 0 20.828 11.828">
                                                <g id="tree-arr" transform="translate(-1545.086 -550.086)">
                                                    <line id="Line_177" data-name="Line 177" x2="9" y2="9" transform="translate(1546.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                                    <line id="Line_178" data-name="Line 178" x1="9" y2="9" transform="translate(1555.5 551.5)" fill="none" stroke="#888" stroke-linecap="round" stroke-width="2"/>
                                                </g>
                                            </svg>
                                        </div>
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
            
            $(".getSubList").prop("onclick", null).off("click");
            $(".redirectTaxonPage").prop("onclick", null).off("click");

            $('.getSubList').on('click', function(){
                getSubList($(this))
            })      
            $('.redirectTaxonPage').on('click', function(event){
                event.stopPropagation();
                window.open(`/taxon/${$(this).data('taxon_id')}`);
            })
            
        }

        if (!$(`div[data-taxon="${keyword_taxon_id}"][data-cultured="${cultured}"]`).hasClass('now')){
            $(`div[data-taxon="${keyword_taxon_id}"][data-cultured="${cultured}"]`).addClass('now')
        }
        $(`div [data-taxon="${keyword_taxon_id}"][data-cultured="${cultured}"]`).data('fetched','1');
        $(`div [data-taxon="${keyword_taxon_id}"][data-cultured="${cultured}"]`).parent().parents('ul').addClass('d-block').removeClass('d-none');
        $(`div [data-taxon="${keyword_taxon_id}"][data-cultured="${cultured}"]`).nextAll('ul').addClass('d-block').removeClass('d-none');

        document.location=`#${keyword_taxon_id}-${cultured}`
        $('.loadingbox').addClass('d-none');
    })
    .fail(function( xhr, status, errorThrown ) {
        $('.loadingbox').addClass('d-none');
        alert('發生未知錯誤！請聯絡管理員')
        console.log( 'Error: ' + errorThrown + 'Status: ' + xhr.status)
    }) 
}