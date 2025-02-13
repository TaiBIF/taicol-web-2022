from django.shortcuts import render, redirect
from taxa.utils import *
from django.http import HttpResponse,JsonResponse
import json
from conf.settings import env, MEDIA_URL, SOLR_PREFIX
import pymysql
import pandas as pd
import numpy as np
import math
import re
import os
import datetime
from taxa.models import SearchStat
import time
import requests
from django.db.models import F
from django.utils import timezone, translation
from django.core.mail import send_mail
import threading
from django.template.loader import render_to_string
import html
from django.utils.translation import get_language, gettext

search_facet = { "kingdom": { 
                'type': 'terms',
                'field': 'kingdom',
                'mincount': 1,
                'limit': -1,
                'offset': 0,
                "facet": {"taxon_id": {
                        'type': 'terms',
                        'field': 'taxon_id',
                        'mincount': 1,
                        'limit': 0,
                        'offset': 0,
                        'allBuckets': False,
                        'numBuckets': True
                  }}
                },
                "status": { 
                'type': 'terms',
                'field': 'status',
                'mincount': 1,
                'limit': -1,
                'offset': 0,
                "facet": {"taxon_id": {
                        'type': 'terms',
                        'field': 'taxon_id',
                        'mincount': 1,
                        'limit': 0,
                        'offset': 0,
                        'allBuckets': False,
                        'numBuckets': True
                  }}
                },
                "rank_id": { 
                'type': 'terms',
                'field': 'rank_id',
                'mincount': 1,
                'limit': -1,
                'offset': 0,
                "facet": {"taxon_id": {
                        'type': 'terms',
                        'field': 'taxon_id',
                        'mincount': 1,
                        'limit': 0,
                        'offset': 0,
                        'allBuckets': False,
                        'numBuckets': True
                  }}
                },
                "is_endemic": { 
                'type': 'terms',
                'field': 'is_endemic',
                'mincount': 1,
                'limit': -1,
                'offset': 0,
                "facet": {"taxon_id": {
                        'type': 'terms',
                        'field': 'taxon_id',
                        'mincount': 1,
                        'limit': 0,
                        'offset': 0,
                        'allBuckets': False,
                        'numBuckets': True
                  }}
                },
                "alien_type": { 
                'type': 'terms',
                'field': 'alien_type',
                'mincount': 1,
                'limit': -1,
                'offset': 0,
                "facet": {"taxon_id": {
                        'type': 'terms',
                        'field': 'taxon_id',
                        'mincount': 1,
                        'limit': 0,
                        'offset': 0,
                        'allBuckets': False,
                        'numBuckets': True
                  }}
                },
            }


class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)
    

db_settings = {
    "host": env('DB_HOST'),
    "port": int(env('DB_PORT')),
    "user": env('DB_USER'),
    "password": env('DB_PASSWORD'),
    "db": env('DB_DBNAME'),
}


# 舊網站redirect
def redirect_taicol(request):
    if request.method == 'GET':
        namecode = request.GET.get('namecode')
        original_name = request.GET.get('original_name')
        conn = pymysql.connect(**db_settings)
        query = '''
            select distinct(atu.taxon_id) from api_namecode anc 
            JOIN api_taxon_usages atu ON atu.taxon_name_id = anc.taxon_name_id
            where anc.namecode = %s and atu.is_deleted != 1;
            '''
        with conn.cursor() as cursor:
            cursor.execute(query, (namecode,))
            taxon_id = cursor.fetchall()
            taxon_id = [t[0] for t in taxon_id]
            if len(taxon_id) == 1:
                taxon_id = taxon_id[0]
                return redirect('taxon', taxon_id=taxon_id) 
            else:
                query = '''
                    select distinct(tn.name) from api_namecode anc 
                    JOIN taxon_names tn ON tn.id = anc.taxon_name_id
                    where anc.namecode = %s and tn.deleted_at is null and tn.is_publish = 1;
                '''
                with conn.cursor() as cursor:
                    cursor.execute(query, (namecode,))
                    names = cursor.fetchall()
                    names = [t[0] for t in names]
                    # 如果有回傳 則用這個學名查 若沒有回傳則用TaiCOL原始的name去查
                    if len(names) == 1:
                        names = names[0]
                        return redirect('/catalogue?status=accepted&status=not-accepted&status=misapplied&keyword={}'.format(names)) 
                    else:
                        return redirect('/catalogue?status=accepted&status=not-accepted&status=misapplied&keyword={}'.format(original_name)) 



def send_download_request(request):
    task = threading.Thread(target=download_search_results_offline, args=(request,))
    # task.daemon = True
    task.start()
    return JsonResponse({"status": 'success'}, safe=False)


def download_search_results_offline(request):
    req = request.POST
    file_format = req.get('file_format','csv')

    solr_query_list, is_chinese = get_conditioned_solr_search(req)
    df = return_download_file_by_solr(solr_query_list, is_chinese)

    now = datetime.datetime.now()+datetime.timedelta(hours=8)
    if file_format == 'json':
        df_file_name = f'taicol_download_{now.strftime("%Y%m%d%H%M%s")}.json'
        compression_options = dict(method='zip', archive_name=df_file_name)
        zip_file_name = df_file_name.replace("json","zip")
        df.to_json(f'/tc-web-volumes/media/download/{zip_file_name}', orient='records', compression=compression_options)

    else:
        df_file_name = f'taicol_download_{now.strftime("%Y%m%d%H%M%s")}.csv'
        compression_options = dict(method='zip', archive_name=df_file_name)
        zip_file_name = df_file_name.replace("csv","zip")
        df.to_csv(f'/tc-web-volumes/media/download/{zip_file_name}', compression=compression_options, index=False, escapechar='\\')

    download_url = request.scheme+"://" + request.META['HTTP_HOST']+ MEDIA_URL + os.path.join('download', zip_file_name)
    if env('WEB_ENV') != 'dev':
        download_url = download_url.replace('http', 'https')

    email_body = render_to_string('taxa/download.html', {'download_url': download_url, })
    send_mail('[TaiCOL] 下載資料', email_body, 'no-reply@taicol.tw', [req.get('download_email')])


def download_search_results(request):
    req = request.POST
    file_format = req.get('file_format','csv')

    solr_query_list, is_chinese = get_conditioned_solr_search(req)
    df = return_download_file_by_solr(solr_query_list, is_chinese)

    now = datetime.datetime.now()+datetime.timedelta(hours=8)

    if file_format == 'json':
        response = HttpResponse(content_type="application/json")
        response['Content-Disposition'] =  f'attachment; filename=taicol_download_{now.strftime("%Y%m%d%H%M%s")}.json'
        df.to_json(response, orient='records')
    else:
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] =  f'attachment; filename=taicol_download_{now.strftime("%Y%m%d%H%M%s")}.csv'
        df.to_csv(response, index=False, escapechar='\\')

    return response


def get_autocomplete_taxon_by_solr(request):

    translation.activate(request.GET.get('lang'))

    names = '[]'
    keyword_reg = ''
    query_list = []

    # 這邊是一定要加的 在網站的查詢一律只回傳 is_in_taiwan=1  的資料
    query_list.append('is_in_taiwan:true')
    query_list.append('is_deleted:false')


    if keyword := request.GET.get('keyword','').strip():

        if request.GET.get('with_cultured') != 'on':
            query_list.append('-is_cultured:true')

        if request.GET.get('lin_rank') == 'on':
            query_list.append('rank_id:(50 OR 49 OR 3 OR 12 OR 18 OR 22 OR 26 OR 30 OR 34 OR 35 OR 36 OR 37 OR 38 OR 39 OR 40 OR 41 OR 42 OR 43 OR 44 OR 45 OR 46)')

        if request.GET.get('with_not_official') == 'off':
            query_list.append('not_official:false')

        # if re.search(r'[\u4e00-\u9fff]+', keyword):
        #     query_list.append('is_primary_common_name:true')

        keyword = html.unescape(keyword)
        keyword_reg = get_variants(keyword)


    query_str = '&fq='.join(query_list)

    taxa_str = f'search_name:"{keyword}"^5 OR search_name_wo_rank:"{keyword}"^5 OR search_name:/{escape_solr_query(keyword)}.*/^4 OR search_name_wo_rank:/{escape_solr_query(keyword)}.*/^4 OR search_name:/{keyword_reg}/^3 OR search_name_wo_rank:/{keyword_reg}/^3 OR search_name:/{keyword_reg}.*/^2 OR search_name_wo_rank:/{keyword_reg}.*/^2 OR search_name:/.*{escape_solr_query(keyword)}.*/^1 OR search_name_wo_rank:/.*{escape_solr_query(keyword)}.*/^1 OR search_name:/.*{keyword_reg}.*/ OR search_name_wo_rank:/.*{keyword_reg}.*/'


    ds = []
    if keyword_reg:

        response = requests.get(f'{SOLR_PREFIX}taxa/select?q.op=OR&q={taxa_str}&fq={query_str}&rows=50')
        taxa_list = response.json()['response']['docs']

        ds = pd.DataFrame(taxa_list)


        if len(ds):

            lack_cols = [k for k in  ['taxon_id', 'simple_name', 'formatted_search_name', 'common_name_c', 'alternative_name_c','status'] if k not in ds.keys()]

            for c in lack_cols:
                ds[c] = ''
            
            ds = ds[['taxon_id', 'simple_name', 'formatted_search_name', 'common_name_c', 'alternative_name_c','status']]
            ds = ds.drop_duplicates().reset_index(drop=True)

            ds = ds.replace({None: '', np.nan: ''})

            for i in ds.index:
                row = ds.iloc[i]
                name_c_str = row.common_name_c
                if row.alternative_name_c:
                    name_c_str += ',' + row.alternative_name_c

                if name_c_str:
                    ds.loc[i, 'text'] = row.simple_name + ' ' + name_c_str
                else:
                    ds.loc[i, 'text'] = row.simple_name 

            if get_language() == 'en-us':
                ds['text'] = ds.apply(lambda x: x['formatted_search_name'] + f" ({name_status_map[x['status']]} {x['text']})" if x['status'] != 'accepted' else x['text'], axis=1)
            else:
                ds['text'] = ds.apply(lambda x: x['formatted_search_name'] + f" ({x['text']} {name_status_map_c[x['status']]})" if x['status'] != 'accepted' else x['text'], axis=1)
            
            ds = ds.rename(columns={'taxon_id': 'id'})
            names = ds[['text','id']].to_json(orient='records')
    
    return HttpResponse(names, content_type='application/json')



def name_match(request):
    url = env('REACT_WEB_INTERNAL_API_URL') + '/api/admin/download/'
    resp = requests.get(url)
    taxon_updated_at = None
    if resp.status_code == 200:
        resp = resp.json()['rows']
        resp = [r for r in resp if r['Category']['name'] == '名錄檔案 (物種)']
        data = pd.DataFrame(resp)
        taxon_updated_at = data.publishedDate.max()
        taxon_updated_at = taxon_updated_at.split('T')[0]

    return render(request, 'taxa/name_match.html', {'taxon_updated_at': taxon_updated_at})


def taxon(request, taxon_id):
    stat_str, higherTaxa_str = '', ''
    refs, new_refs, experts, name_changes, taxon_history, name_history, links, per_usage_refs, taxon_views = [], [], [], [], [], [], [], [], []
    data = {}
    # 確認是否已刪除 & 如果是國外物種不顯示
    is_deleted = 0
    is_in_taiwan = 0
    not_official = 0
    has_taxon = False


    conn = pymysql.connect(**db_settings)

    query = f"""
                SELECT at.is_deleted, at.is_in_taiwan, at.not_official,
                    ac.cites_note, ac.iucn_note, ac.iucn_taxon_id, 
                    ac.red_note, ac.protected_note, tn.original_taxon_name_id, 
                    at.links, at.taieol_images as images, att.tree_stat, at.new_taxon_id
                FROM api_taxon at 
                LEFT JOIN api_taxon_tree att ON at.taxon_id = att.taxon_id
                LEFT JOIN api_conservation ac ON at.taxon_id = ac.taxon_id 
                JOIN taxon_names tn ON at.accepted_taxon_name_id = tn.id
                WHERE at.taxon_id = %s 
            """

    with conn.cursor() as cursor:
        cursor.execute(query, (taxon_id,))
        results = cursor.fetchone()
        if results:
            for i in range(len(cursor.description)):
                data[cursor.description[i][0]] = results[i]
            is_deleted = data['is_deleted']
            is_in_taiwan = data['is_in_taiwan']
            not_official = data['not_official']
            if not_official:
                data['not_official'] = gettext('未經正式記錄')
            has_taxon = True


    if has_taxon:

        # 取有效學名的那筆資料
        response = requests.get(f'{SOLR_PREFIX}taxa/select?fq=status:accepted&fq=taxon_name_id:*&q=taxon_id:{taxon_id}')
        solr_resp = response.json()
        solr_resp = solr_resp['response']['docs'][0]

        data['name'] = solr_resp.get('simple_name')
        sci_name = f"{solr_resp.get('formatted_accepted_name')} {solr_resp.get('name_author') if solr_resp.get('name_author') else ''}"
        data['sci_name'] = sci_name.strip()
        data['name_id'] = int(solr_resp.get('accepted_taxon_name_id').replace('.0',''))
        data['rank_id'] = int(solr_resp.get('taxon_rank_id').replace('.0',''))


        solr_get = ['common_name_c', 'alternative_name_c', 'path','is_endemic', 'is_terrestrial', 'is_freshwater', 'is_brackish', 'is_marine', 'is_fossil', 'alien_type',
                    'cites', 'iucn', 'redlist', 'protected', 'is_cultured', 'alien_status_note']
        
        for ss in solr_get:
            data[ss] = solr_resp.get(ss)

        name_c_str = solr_resp.get('common_name_c')
        higherTaxa_str = solr_resp.get('simple_name')
        if solr_resp.get('alternative_name_c'):
            name_c_str += ',' + solr_resp.get('alternative_name_c')
        if name_c_str:
            higherTaxa_str += ' ' + name_c_str

        # 照片 用資料庫取得
        data['images'] = json.loads(data['images']) if data['images'] else []

        # 學名
        if data['rank_id'] == 47:
            # 不會超過上限 group concat維持
            query = f"""WITH view as (SELECT tnhp.taxon_name_id, CONCAT_WS(' ',an.formatted_name, an.name_author ) as sci_name 
                                    FROM taxon_name_hybrid_parent tnhp 
                                    JOIN api_names an ON tnhp.parent_taxon_name_id = an.taxon_name_id 
                                    WHERE tnhp.taxon_name_id = %s 
                                    ORDER BY tnhp.order) 
                        SELECT group_concat(sci_name SEPARATOR ' × ') FROM view 
                        GROUP BY taxon_name_id """
            with conn.cursor() as cursor:
                cursor.execute(query, (data['name_id'],))
                n = cursor.fetchone()
                if n:
                    data['sci_name'] = n[0] 


        # NOTE 這邊應該一定是accepted or deleted
        data['status'] = status_map_taxon_c['accepted']['en-us'] if get_language() == 'en-us' else f"{status_map_taxon_c['accepted']['zh-tw']} {status_map_taxon_c['accepted']['en-us']}"
        data['rank_d'] = rank_map[data['rank_id']]if get_language() == 'en-us' else f"{rank_map_c[data['rank_id']]} {rank_map[data['rank_id']]}"
        is_list = ['is_endemic','is_terrestrial','is_freshwater','is_brackish','is_marine','is_fossil']
        data['is_list'] = []
        for i in is_list:
            if data[i] == 1:
                data['is_list'].append(attr_map_c[i])
                if i in ['is_marine','is_brackish']:
                    links += [{'href': link_map['worms']['url_prefix'], 'title': link_map['worms']['title'], 'suffix': data['name'], 'category': link_map['worms']['category'], 'hidden_name': True}]
        if not is_in_taiwan:
            data['is_in_taiwan_text'] = gettext('不存在於臺灣')

        # 整理保育資訊
        data = create_conservation_note(data=data)

        # 高階層
        data['higher'] = []
        if data['path']:
            path = data['path'].split('>')
            # 專家列表
            # 如果同一個專家有多個taxon_group要concat
            path = [p for p in path if p != taxon_id]
            if len(path):
                path_str = ' OR '.join(path)
                path_resp = requests.get(f'{SOLR_PREFIX}taxa/select?fq=is_deleted:false&fq=taxon_name_id:*&fq=status:accepted&q=taxon_id:({path_str})&fl=taxon_rank_id,taxon_id,formatted_accepted_name,common_name_c,alternative_name_c,simple_name&rows=1000')
                if path_resp.status_code == 200:
                    higher = pd.DataFrame(path_resp.json()['response']['docs'])
                    for cc in ['common_name_c','alternative_name_c','higherTaxa_str']:
                        if cc not in higher.keys():
                            higher[cc] = ''
                    higher['taxon_rank_id'] = higher['taxon_rank_id'].apply(lambda x: int(str(x).replace('.0','')) if x else '')
                    higher['rank_order'] = higher['taxon_rank_id'].apply(lambda x: rank_order_map[x])
                    higher = higher.replace({np.nan: '', None: ''})
                    for hi in higher.index:
                        higher_row = higher.iloc[hi]
                        name_c_str = higher_row.common_name_c
                        now_higherTaxa_str = higher_row.simple_name
                        if higher_row.alternative_name_c:
                            name_c_str += ',' + higher_row.alternative_name_c
                        if name_c_str:
                            now_higherTaxa_str += ' ' + name_c_str
                        higher.loc[hi, 'higherTaxa_str'] = now_higherTaxa_str
                    higher = higher.rename(columns={'formatted_accepted_name':'formatted_name','taxon_rank_id':'rank_id'})
                    # 補上階層未定 
                    # 先找出應該要有哪些林奈階層
                    current_rank_orders = higher.rank_order.to_list() + [rank_order_map[data['rank_id']]]
                    for x in lin_map.keys():
                        now_order = lin_map_w_order[x]['rank_order']
                        if now_order not in current_rank_orders and now_order < max(current_rank_orders) and now_order > min(current_rank_orders):
                            higher = pd.concat([higher, pd.Series({'rank_id': x, 'common_name_c': '地位未定', 'taxon_id': None, 'rank_order': lin_map_w_order[x]['rank_order']}).to_frame().T], ignore_index=True)
                    # 從最大的rank開始補
                    higher = higher.sort_values('rank_order', ignore_index=True, ascending=False)
                    for hi in higher[higher.taxon_id.isnull()].index:
                        found_hi = hi + 1
                        if found_hi < len(higher):
                            while not higher.loc[found_hi].taxon_id:
                                found_hi += 1
                        higher.loc[hi, 'formatted_name'] = f'{higher.loc[found_hi].formatted_name} {lin_map[higher.loc[hi].rank_id]} incertae sedis'
                    higher = higher.replace({None: '', np.nan: ''})
                    higher = higher.sort_values('rank_order', ignore_index=True)
                    for h in higher.index:
                        current_h_row = higher.loc[h]
                        current_h_dict = {}
                        if get_language() == 'en-us':
                            current_h_dict['a_content'] = f'{rank_map[current_h_row.rank_id]} {current_h_row.formatted_name}'
                        else:
                            current_h_dict['a_content'] = f'{current_h_row.formatted_name} {current_h_row.common_name_c}'
                        if current_h_row.taxon_id:
                            taxon_href = f'/{"en-us" if get_language() == "en-us" else "zh-hant"}/taxon/' + current_h_row.taxon_id
                            current_h_dict['a_href'] = taxon_href
                            current_h_dict['search_href'] = f'/{"en-us" if get_language() == "en-us" else "zh-hant"}/catalogue?status=accepted&higherTaxa={current_h_row.taxon_id}&higherTaxa_str={current_h_row.higherTaxa_str}'
                        else:
                            current_h_dict['a_href'] = None
                            current_h_dict['search_href'] = None
                        current_h_dict['rank_c'] = rank_map_c[current_h_row.rank_id]
                        if higher.loc[h].rank_id in lin_ranks: # 林奈階層
                            current_h_dict['rank_color'] = rank_color_map[current_h_row.rank_id]
                        else:
                            current_h_dict['rank_color'] = 'rank-second-gray'
                        data['higher'].append(current_h_dict)


        # 變更歷史 + 學名變遷
        query = f"""SELECT ath.type, ath.content, ac.short_author, DATE_FORMAT(ath.updated_at, "%%Y-%%m-%%d"), usr.name, ath.reference_id, ath.note, r.type, ath.is_deleted
                        FROM api_taxon_history ath 
                        LEFT JOIN users usr ON usr.id = ath.user_id
                        LEFT JOIN api_citations ac ON ac.reference_id = ath.reference_id
                        LEFT JOIN `references` r ON ath.reference_id = r.id
                        WHERE ath.taxon_id = %s ORDER BY ath.id DESC"""
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            cursor.execute(query, (taxon_id, ))
            th = cursor.fetchall()
            taxon_history_df = pd.DataFrame(th, columns=['history_type', 'content', 'short_author', 'updated_at', 'editor', 'reference_id', 'note', 'reference_type','is_deleted'])
            name_history_list = taxon_history_df[taxon_history_df.history_type.isin([0,5])][['note','updated_at','reference_id','reference_type','history_type']].drop_duplicates().values

        # 取得names的時候要包含taxon_history裡面提到的name

        query = f""" WITH base_name AS (
                        SELECT JSON_EXTRACT(note, "$.taxon_name_id") as taxon_name_id FROM api_taxon_history WHERE `type` IN (1,17) AND taxon_id = %s
                        UNION
                        SELECT JSON_EXTRACT(note, "$.old_taxon_name_id") as taxon_name_id FROM api_taxon_history WHERE `type` = 0 AND taxon_id = %s
                        UNION
                        SELECT JSON_EXTRACT(note, "$.new_taxon_name_id") as taxon_name_id FROM api_taxon_history WHERE `type` = 0 AND taxon_id = %s
                    )
                    SELECT atu.taxon_name_id, an.formatted_name, an.name_author, ac.short_author, atu.status,
                            ru.status, tn.nomenclature_id, tn.publish_year, ru.per_usages, ru.reference_id, 
                            tn.reference_id, r.publish_year, tn.rank_id, r.type, tn.original_taxon_name_id, ru.id,
                            'from_usages'
                    FROM api_taxon_usages atu 
                    LEFT JOIN reference_usages ru ON atu.reference_id = ru.reference_id and atu.accepted_taxon_name_id = ru.accepted_taxon_name_id and atu.taxon_name_id = ru.taxon_name_id
                    LEFT JOIN api_names an ON an.taxon_name_id = atu.taxon_name_id
                    LEFT JOIN `references` r ON r.id = ru.reference_id
                    LEFT JOIN api_citations ac ON ac.reference_id = ru.reference_id
                    LEFT JOIN taxon_names tn ON tn.id = atu.taxon_name_id
                    WHERE atu.taxon_id = %s 
                    UNION 
                    SELECT tn.id, an.formatted_name, an.name_author, '', '', '', 
                           tn.nomenclature_id, tn.publish_year, '', NULL,
                           tn.reference_id, NULL, tn.rank_id, NULL, tn.original_taxon_name_id, NULL, 
                           'from_history'
                    FROM taxon_names tn
                    LEFT JOIN api_names an ON an.taxon_name_id = tn.id
                    WHERE tn.id IN (SELECT taxon_name_id FROM base_name) 
                    """
        with conn.cursor() as cursor:
            cursor.execute(query, (taxon_id, taxon_id, taxon_id, taxon_id))
            names = cursor.fetchall()
            names = pd.DataFrame(names, columns=['taxon_name_id','sci_name','author','ref','taxon_status','ru_status',
                                                'nomenclature_id','publish_year','per_usages','reference_id', 
                                                'o_reference_id','r_publish_year','rank_id','r_type','original_taxon_name_id','ru_id',
                                                'name_source'])
            names = names.replace({np.nan: None})

            # author 學名作者
            # ref 學名使用文獻
            # publish_year 學名發表的文獻年份
            # r_publish_year 學名使用的文獻年份
            # reference_id 學名使用文獻id
            # o_reference_id 學名發表文獻id
            # r_publish_year 學名使用的文獻類別
            # taxon_status 學名在分類群的地位
            # ru_status 學名在學名使用的地位
            if len(names):
                names = names.sort_values('publish_year', ascending=False)
                names = names.replace({None:'',np.nan:''})
                # 如果是雜交組合 要根據parent補上作者資訊    
                # group concat 不會超過上限 維持原本寫法
                for tnid in names[(names.taxon_name_id!=data['name_id'])&(names.rank_id==47)].taxon_name_id:
                    query = """WITH view as (SELECT tnhp.taxon_name_id, CONCAT_WS(' ',an.formatted_name, an.name_author ) as sci_name 
                                FROM taxon_name_hybrid_parent tnhp 
                                JOIN api_names an ON tnhp.parent_taxon_name_id = an.taxon_name_id 
                                WHERE tnhp.taxon_name_id = %s 
                                ORDER BY tnhp.order) 
                                SELECT group_concat(sci_name SEPARATOR ' × ') FROM view 
                                GROUP BY taxon_name_id """
                    with conn.cursor() as cursor:
                        cursor.execute(query, (tnid,))
                        n = cursor.fetchone()
                        if n:
                            names.loc[names.taxon_name_id==tnid,'sci_name'] = n[0] 
                names['per_usages'] = names['per_usages'].apply(lambda x: json.loads(x) if x else [])
                # 給保育資訊note使用的學名連結
                names['sci_name_ori'] = names['sci_name']
                names['sci_name_ori'] = names.apply(lambda x: f'<a href="https://nametool.taicol.tw/{"en-us" if get_language() == "en-us" else "zh-tw"}/taxon-names/{int(x.taxon_name_id)}" target="_blank">{x.sci_name_ori}</a>', axis=1)
                # 為了學名排序
                names['sci_name_ori_1'] = names['sci_name'] 
                # 植物要補上學名發表年份
                names['author'] = names.apply(lambda x: f"{x.author}, {x.publish_year}" if x.nomenclature_id==2 and x.publish_year else x.author, axis=1)
                # 如果有author資訊 加上去
                names['sci_name'] = names.apply(lambda x: f'{x.sci_name} {x.author}' if x.author else x.sci_name, axis=1)
                # 加上學名連結
                names['sci_name'] = names.apply(lambda x: f'''<a href="https://nametool.taicol.tw/{"en-us" if get_language() == "en-us" else "zh-tw"}/taxon-names/{int(x.taxon_name_id)}" {'class="accpname"' if x.taxon_name_id == data['name_id'] else ''} target="_blank">{x.sci_name}</a>''', axis=1)
                # 如果per_usages中有其他ref則補上
                for pp in names['per_usages']:
                    for p in pp:
                        per_usage_refs.append(p.get('reference_id'))
                        if p.get('reference_id') not in new_refs:
                            new_refs.append(p.get('reference_id'))

                # TODO 這邊縮排的順序可能會有問題 有一些沒有names的可能會跳過 造成沒有進入到這個區塊嗎 ? 還是一定會有names

                new_refs += names.reference_id.to_list()
                new_refs += names.o_reference_id.to_list()
                new_refs += [n[2] for n in name_history_list]
                new_refs = list(dict.fromkeys(new_refs))
                
                query = f"""(SELECT distinct(r.id), CONCAT_WS(' ' ,c.author, c.content), 
                            r.publish_year, c.author, c.short_author, r.type 
                            FROM api_citations c 
                            JOIN `references` r ON c.reference_id = r.id 
                            WHERE c.reference_id IN %s AND r.is_publish = 1 GROUP BY r.id 
                            UNION  
                            SELECT distinct(tn.reference_id), CONCAT_WS(' ' ,c.author, c.content), 
                            r.publish_year, c.author, c.short_author, r.type 
                            FROM taxon_names tn
                            JOIN api_citations c ON tn.reference_id = c.reference_id
                            JOIN `references` r ON c.reference_id = r.id
                            WHERE tn.id IN (SELECT DISTINCT(taxon_name_id) FROM api_taxon_usages WHERE taxon_id = %s))
                            ORDER BY author ASC, publish_year DESC """

                with conn.cursor() as cursor:
                    cursor.execute(query, (new_refs, taxon_id))
                    usage_refs = cursor.fetchall()
                    usage_refs = pd.DataFrame(usage_refs, columns=['reference_id','full_ref','publish_year','author','ref','r_type'])

                # 確認是否為歧異
                query = """
                        select taxon_name_id from api_taxon_usages 
                        where `status` = 'not-accepted' and is_deleted != 1 and taxon_name_id IN %s 
                        group by taxon_name_id having count(distinct(taxon_id)) > 1;
                        """

                is_ambiguous = []
                with conn.cursor() as cursor:
                    cursor.execute(query, (list(names.taxon_name_id.unique()), ))
                    is_ambiguous = cursor.fetchall()
                    is_ambiguous = [i[0] for i in is_ambiguous]
                    
                # 只整理目前usage的
                name_change_df = names[names.name_source=='from_usages'].reset_index(drop=True)
                for n in name_change_df.taxon_name_id.unique():
                    has_original = False
                    # 如果是動物法規 且有原始組合名 後面要用冒號接文獻
                    if len(name_change_df[(name_change_df.taxon_name_id==n)&(name_change_df.original_taxon_name_id!='')&(name_change_df.nomenclature_id==1)]):
                        has_original = True
                    ref_list = []
                    ref_str = ''
                    # 如果是誤用名
                    if len(name_change_df[(name_change_df.taxon_name_id==n)&(name_change_df.taxon_status=='misapplied')]):
                        for pu in name_change_df[(name_change_df.taxon_name_id==n)&(name_change_df.ru_status=='misapplied')].per_usages:
                            for ppu in pu:
                                # 排除學名本身發表文獻
                                if not ppu.get('is_from_published_ref', False):
                                    current_ref = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'ref'].values[0]
                                    current_year = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'publish_year'].values[0]
                                    current_r_type = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'r_type'].values[0]
                                    if ppu.get('pro_parte'):
                                        if current_ref:
                                            current_ref += ', pro parte'
                                    if current_ref not in ref_list: 
                                        ref_list.append([current_ref,ppu.get('reference_id'),current_year,current_r_type])
                        # 排除backbone
                        ref_list = [ r for r in ref_list if r[3] not in [4,6] ]
                        # 如果不是動物的非原始組合名 排除自己的發表文獻 
                        if not has_original:
                            ref_list = [r for r in ref_list if r[1] not in name_change_df[name_change_df.taxon_name_id==n].o_reference_id.to_list()]
                        ref_list = pd.DataFrame(ref_list,columns=['ref','ref_id','year','r_type']).drop_duplicates().sort_values('year')
                        min_year = ref_list.year.min()
                        # 決定排序的publish_year
                        ref_list = [f"<a href='https://nametool.taicol.tw/{'en-us' if get_language() == 'en-us' else 'zh-tw'}/references/{int(r[1]['ref_id'])}' target='_blank'>{r[1]['ref']}</a>" for r in ref_list.iterrows()]
                        ref_str = ('; ').join(ref_list)
                        if ref_str:
                            name_changes += [[f"{name_change_df[name_change_df.taxon_name_id==n]['sci_name'].values[0]} ({gettext('誤用')}): {ref_str}", min_year, name_change_df[name_change_df.taxon_name_id==n]['sci_name_ori_1'].values[0]]]
                        else:
                            name_changes += [[name_change_df[name_change_df.taxon_name_id==n]['sci_name'].values[0] + f" ({gettext('誤用')})", '', name_change_df[name_change_df.taxon_name_id==n]['sci_name_ori_1'].values[0]]]
                    # 歧異名
                    elif n in is_ambiguous:
                        for pu in name_change_df[(name_change_df.taxon_name_id==n)].per_usages:
                            for ppu in pu:
                                # 排除學名本身發表文獻
                                if not ppu.get('is_from_published_ref', False):
                                    current_ref = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'ref'].values[0]
                                    current_year = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'publish_year'].values[0]
                                    current_r_type = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'r_type'].values[0]
                                    if ppu.get('pro_parte'):
                                        if current_ref:
                                            current_ref += ', pro parte'
                                    if current_ref not in ref_list: 
                                        ref_list.append([current_ref,ppu.get('reference_id'),current_year,current_r_type])
                        # 排除backbone
                        ref_list = [ r for r in ref_list if r[3] not in [4,6] ]
                        # 如果不是動物的非原始組合名 排除自己的發表文獻 
                        if not has_original:
                            ref_list = [r for r in ref_list if r[1] not in name_change_df[name_change_df.taxon_name_id==n].o_reference_id.to_list()]
                        # else:
                        ref_list = pd.DataFrame(ref_list,columns=['ref','ref_id','year','r_type']).drop_duplicates().sort_values('year')
                        min_year = ref_list.year.min()
                        # 決定排序的publish_year
                        ref_list = [f"<a href='https://nametool.taicol.tw/{'en-us' if get_language() == 'en-us' else 'zh-tw'}/references/{int(r[1]['ref_id'])}' target='_blank'>{r[1]['ref']}</a>" for r in ref_list.iterrows()]
                        ref_str = ('; ').join(ref_list)
                        if ref_str:
                            name_changes += [[f"{name_change_df[name_change_df.taxon_name_id==n]['sci_name'].values[0]} ({gettext('歧異')}): {ref_str}",min_year, name_change_df[name_change_df.taxon_name_id==n]['sci_name_ori_1'].values[0]]]
                        else:
                            name_changes += [[name_change_df[name_change_df.taxon_name_id==n]['sci_name'].values[0] + f" ({gettext('歧異')})", '', name_change_df[name_change_df.taxon_name_id==n]['sci_name_ori_1'].values[0]]]
                    # 非誤用名
                    elif len(name_change_df[(name_change_df.taxon_name_id==n)&(name_change_df.taxon_status!='misapplied')]):
                        # 有效學名使用的發布文獻
                        if len(name_change_df[(name_change_df.taxon_name_id==n)&(name_change_df.ru_status=='accepted')].ref):
                            for r in name_change_df[(name_change_df.taxon_name_id==n)&(name_change_df.ru_status=='accepted')].index:
                                if name_change_df.loc[r].ref:
                                    ref_list += [[name_change_df.loc[r].ref, name_change_df.loc[r].reference_id, name_change_df.loc[r].r_publish_year, name_change_df.loc[r].r_type]]
                        # for pu in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].per_usages:
                        # 學名使用的相同引用文獻
                        for pu in name_change_df[name_change_df.taxon_name_id==n].per_usages:
                            for ppu in pu:
                                if not ppu.get('is_from_published_ref', False):
                                    current_ref = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'ref'].values[0]
                                    current_year = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'publish_year'].values[0]
                                    current_type = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'r_type'].values[0]
                                    if ppu.get('pro_parte'):
                                        if current_ref:
                                            current_ref += ', pro parte'
                                    if current_ref not in ref_list:
                                        ref_list.append([current_ref,ppu.get('reference_id'),current_year,current_type])
                        # 排除backbone & 自己的發表文獻
                        ref_list = [r for r in ref_list if r[3] not in [4,6] ]
                        # 如果不是動物的非原始組合名 排除自己的發表文獻 
                        if not has_original:
                            ref_list = [r for r in ref_list if r[1] not in name_change_df[name_change_df.taxon_name_id==n].o_reference_id.to_list()]
                        ref_list = pd.DataFrame(ref_list,columns=['ref','ref_id','year','r_type']).drop_duplicates().sort_values('year')
                        # 決定排序的publish_year
                        ref_list = [f'<a href="https://nametool.taicol.tw/{"en-us" if get_language() == "en-us" else "zh-tw"}/references/{int(r[1]["ref_id"])}" target="_blank">{r[1]["ref"]}</a>' for r in ref_list.iterrows()]
                        ref_str = ('; ').join(ref_list)
                        sep = ':' if has_original else ';'
                        if ref_str:
                            name_changes += [[f"{name_change_df[name_change_df.taxon_name_id==n]['sci_name'].values[0]}{sep} {ref_str}",name_change_df[name_change_df.taxon_name_id==n]['publish_year'].min(), name_change_df[name_change_df.taxon_name_id==n]['sci_name_ori_1'].values[0]]]
                        else:
                            name_changes += [[name_change_df[name_change_df.taxon_name_id==n]['sci_name'].values[0], name_change_df[name_change_df.taxon_name_id==n]['publish_year'].min(), name_change_df[name_change_df.taxon_name_id==n]['sci_name_ori_1'].values[0]]]
                
                if name_changes:
                    name_changes = pd.DataFrame(name_changes, columns=['name_str','year','name'])
                    name_changes['name'] = name_changes['name'].str.replace('<i>','').str.replace('</i>','')
                    name_changes['year'] = name_changes.year.replace({'': None}) # 讓年份為空值的在最後面
                    name_changes = name_changes.sort_values(by=['year','name'], ascending=[True, True])
                    name_changes = name_changes.name_str.to_list()


        # 文獻
        # 這邊改用 usage_refs 的資料
        # 1 學名本身的發表文獻(taxon_names資料表的reference_id)
        # names.o_reference_id.to_list()
        # 2 有效學名使用的發布文獻(reference_usages資料表的reference_id)(可能會包含(1))
        # names[names.taxon_status=='accepted'].reference_id.to_list()
        # 3 學名使用的相同引用文獻(reference_usages資料表的per_usages裡的reference_id) (彙整不同篇文獻後，(3)可能會和(2)有重複)
        # 4 誤用學名使用的誤用文獻(reference_usages資料表的per_usages裡的reference_id)
        # per_usage_refs

        ref_id_list = []
        ref_id_list += list(names.o_reference_id.unique())
        ref_id_list += list(per_usage_refs)
        ref_id_list += list(names[names.taxon_status=='accepted'].reference_id.unique())

        if len(usage_refs):
            used_refs = [int(str(u).replace('.0','')) for u in ref_id_list if u]
            refs = usage_refs[(~usage_refs.r_type.isin([4,6]))&(usage_refs.reference_id.isin(used_refs))]

        # refs 文獻區塊

        # 取得expert
        if len(refs):
            query = "SELECT person_id FROM person_reference WHERE reference_id in %s"
            person_ids = []
            with conn.cursor() as cursor:
                cursor.execute(query, (list(refs.reference_id.unique()),))
                person_ids = cursor.fetchall()
                person_ids = [str(p[0]) for p in person_ids]
                if len(person_ids):
                    url = f"{env('REACT_WEB_INTERNAL_API_URL')}/api/admin/expert/?person_id={(',').join(person_ids)}"
                    person_resp = requests.get(url)
                    person_resp = person_resp.json()
                    experts = person_resp.get('rows')
                
            refs = list(refs[['reference_id','full_ref']].drop_duplicates().values)


        data['alien_notes'] = []
        alien_notes = []
        has_cultured = 0

        # 這邊改成用solr已經存好的alien_note
        has_cultured, alien_notes = create_alien_type_display(alien_types=data['alien_status_note'])

        data['alien_notes'] = alien_notes
        if data['alien_type']:
            data['alien_type'] = attr_map_c[data['alien_type']]

        # 如果有is_cultured要加上去 如果是backbone不給文獻
        # 因為有些是下階層是栽培豢養才加上is_cultured 會沒有對應的cultured文獻

        if not has_cultured and data['is_cultured']:
            data['alien_notes'].append({'alien_type': attr_map_c['cultured'],'note': None})

        name_history = create_name_history(names=names, name_history_list=name_history_list, ref_df=usage_refs)

        # 相關連結
        # ncbi如果超過一個就忽略

        links += create_link_display(data=data,taxon_id=taxon_id)

        taxon_history_df = taxon_history_df[taxon_history_df.is_deleted==0].reset_index(drop=True)
        taxon_history = create_history_display(taxon_history_df, get_language(), names)
        data['self'] = ''
        data['self'] = {'rank_color': rank_color_map[data['rank_id']] if data['rank_id'] in [3,12,18,22,26,30,34] else 'rank-second-gray',
                        'rank_c': rank_map_c[data['rank_id']],
                        'name_c': data['common_name_c']}

        # 子階層統計
        rank_map_dict = rank_map if get_language() == 'en-us' else rank_map_c
        # 種下
        infra_str = 'Infraspecies' if get_language() == 'en-us' else '種下'

        if stat_list := data.get('tree_stat'):
            # 包含栽培豢養 & 未經正式紀錄
            stat_list = json.loads(stat_list)
            stat_map_key = 'with_not_official_with_cultured'
            stats = []
            for sl in stat_list:
                stats.append({'rank_id': sl['rank_id'], 'count': sl['count'].get(stat_map_key)})
            stats = pd.DataFrame(stats)
            spp = 0
            if len(stats):
                for sr in stats.rank_id.unique():
                    c = stats[stats.rank_id==sr]['count'].sum()
                    count_str = f'{rank_map_dict[sr]} {c}' if get_language() == 'en-us' else f'{c}{rank_map_dict[sr]}'
                    if sr <= 46 and sr >= 35:
                        spp += c
                    elif sr == 47:
                        if spp > 0:
                            infra_count_str = f'{infra_str} {spp}' if get_language() == 'en-us' else f'{spp}{infra_str}'
                            stat_str += f"""<a href='{"en-us" if get_language() == "en-us" else "zh-hant"}/catalogue?status=accepted&rank=35&rank=36&rank=37&rank=38&rank=39&rank=40&rank=41&rank=42&higherTaxa={taxon_id}&higherTaxa_str={higherTaxa_str}'>{infra_count_str} </a>"""
                        stat_str += f"""<a href='/{"en-us" if get_language() == "en-us" else "zh-hant"}/catalogue?status=accepted&rank={sr}&higherTaxa={taxon_id}&higherTaxa_str={higherTaxa_str}'>{count_str} </a>"""
                    else:
                        stat_str += f"""<a href='/{"en-us" if get_language() == "en-us" else "zh-hant"}/catalogue?status=accepted&rank={sr}&higherTaxa={taxon_id}&higherTaxa_str={higherTaxa_str}'>{count_str} </a>"""
                if spp > 0 and infra_str not in stat_str:
                    # 如果沒有47 最後要把種下加回去
                    infra_count_str = f'{infra_str} {spp}' if get_language() == 'en-us' else f'{spp}{infra_str}'
                    stat_str += f"""<a href='/{"en-us" if get_language() == "en-us" else "zh-hant"}/catalogue?status=accepted&rank=35&rank=36&rank=37&rank=38&rank=39&rank=40&rank=41&rank=42&higherTaxa={taxon_id}&higherTaxa_str={higherTaxa_str}'>{infra_count_str}</a>"""
        
        if is_deleted:
            data['rank_d'] = 'Deleted' if get_language() == 'en-us' else '已刪除 Deleted'
            new_taxon_name = '', ''
            query = f"""SELECT tn.name, at.taxon_id FROM api_taxon at
                    JOIN taxon_names tn ON tn.id = at.accepted_taxon_name_id
                    WHERE at.taxon_id = %s
                    """
            with conn.cursor() as cursor:
                cursor.execute(query, (data['new_taxon_id'],))
                new_taxon_name = cursor.fetchone()
                if new_taxon_name:
                    new_taxon_name = new_taxon_name[0]
            data['is_deleted'] = True
            data['new_taxon_name'] = new_taxon_name

        taxon_views = create_view_display(taxon_id=taxon_id, accepted_taxon_name_id=data['name_id'], misapplied_names=list(name_change_df[name_change_df.taxon_status=='misapplied'].taxon_name_id.unique()))

    elif not has_taxon:
        taxon_id = None

    return render(request, 'taxa/taxon.html', {'taxon_id': taxon_id, 'data': data, 'links': links,
                                               'refs': refs, 'experts': experts, 'name_changes': name_changes,
                                               'taxon_history': taxon_history, 'stat_str': stat_str, 'name_history': name_history, 
                                               'taxon_views': taxon_views})


# 根據當下的條件判斷
def get_root_tree(request):
    translation.activate(request.POST.get('lang'))
    lin_rank = request.POST.get('lin_rank')
    with_cultured = request.POST.get('with_cultured')
    with_not_official = request.POST.get('with_not_official') # 未經正式紀錄 off: 排除, on: 包含


    if with_not_official == 'off' and with_cultured == 'off':
        stat_map_key = 'official_not_cultured'
    elif with_not_official == 'off' and with_cultured == 'on':
        stat_map_key = 'official_with_cultured'
    elif with_not_official == 'on' and with_cultured == 'off':
        stat_map_key = 'with_not_official_not_cultured'
    elif with_not_official == 'on' and with_cultured == 'on':
        stat_map_key = 'with_not_official_with_cultured'

    # if with_cultured != 'on': # 排除栽培豢養
    #     is_cultured = [0, None] 
    # else: # 包含栽培豢養
    #     is_cultured = [0,1]
        
    kingdom_dict = []
    infra_str = 'Infraspecies' if get_language() == 'en-us' else '種下'
    rank_map_dict = rank_map if get_language() == 'en-us' else rank_map_c

    conn = pymysql.connect(**db_settings)
    with conn.cursor() as cursor:
        query = f"""SELECT att.tree_stat, at.taxon_id FROM api_taxon_tree att 
                JOIN api_taxon at ON att.taxon_id = at.taxon_id
                WHERE at.rank_id = 3 OR at.rank_id = 50; """
        cursor.execute(query)
        stat_list = cursor.fetchall()
        conn.close()
        total_stats = []
        for sl in stat_list:
            if sl[0] and sl != '[]':
                sl_list = json.loads(sl[0])
                for ssl in sl_list:
                    total_stats.append({'rank_id': ssl['rank_id'], 'count': ssl['count'].get(stat_map_key), 'kingdom_taxon': sl[1]})
        total_stats = pd.DataFrame(total_stats)
        if lin_rank == 'on':
            total_stats = total_stats[total_stats.rank_id.isin(lin_ranks+sub_lin_ranks)]

    for k in kingdom_taxon_map.keys():
        stats = total_stats[total_stats.kingdom_taxon==k]
        spp = 0
        stat_str = ''
        if len(stats):
            for sr in stats.rank_id.unique():
                c = stats[stats.rank_id==sr]['count'].sum()
                count_str = f'{rank_map_dict[sr]} {c}' if get_language() == 'en-us' else f'{c}{rank_map_dict[sr]}'
                if sr <= 46 and sr >= 35:
                    spp += c
                elif sr == 47:
                    if spp > 0:
                        infra_count_str = f'{infra_str} {spp}' if get_language() == 'en-us' else f'{spp}{infra_str}'
                        stat_str += f"{infra_count_str} {count_str}"
                    else:
                        stat_str += f"{count_str} "
                else:
                    stat_str += f"{count_str} "
            if spp > 0 and infra_str not in stat_str:
                # 如果沒有47 最後要把種下加回去
                infra_count_str = f'{infra_str} {spp}' if get_language() == 'en-us' else f'{spp}{infra_str}'
                stat_str += infra_count_str

        kingdom_dict.append({'taxon_id': k, 
                             'name': f"Kingdom {kingdom_taxon_map[k]['name']}" if get_language()=='en-us' else f"{kingdom_taxon_map[k]['common_name_c']} Kingdom {kingdom_taxon_map[k]['name']}",
                             'stat': stat_str.strip()})
    
    return JsonResponse(kingdom_dict, safe=False)

    # return render(request, 'taxa/taxon_tree.html', {'kingdom_dict':kingdom_dict, 'search_stat': search_stat, 'kingdom_dict_c': kingdom_dict_c})


def taxon_tree(request):
    # 預設包含栽培豢養&排除未經正式紀錄
    stat_map_key = 'official_with_cultured'

    # 第一層 kingdom
    kingdom_dict = []
    infra_str = 'Infraspecies' if get_language() == 'en-us' else '種下'
    rank_map_dict = rank_map if get_language() == 'en-us' else rank_map_c
    conn = pymysql.connect(**db_settings)
    with conn.cursor() as cursor:
        # 要加上病毒的unranked
        query = f"""SELECT att.tree_stat, at.taxon_id FROM api_taxon_tree att 
                JOIN api_taxon at ON att.taxon_id = at.taxon_id
                WHERE at.rank_id = 3 OR at.rank_id = 50; """
        cursor.execute(query)
        stat_list = cursor.fetchall()
        conn.close()
        total_stats = []
        for sl in stat_list:
            if sl[0] and sl != '[]':
                sl_list = json.loads(sl[0])
                for ssl in sl_list:
                    total_stats.append({'rank_id': ssl['rank_id'], 'count': ssl['count'].get(stat_map_key), 'kingdom_taxon': sl[1]})
        total_stats = pd.DataFrame(total_stats)
        # 預設僅顯示林奈階層
        total_stats = total_stats[total_stats.rank_id.isin(lin_ranks+sub_lin_ranks)]

    for k in kingdom_taxon_map.keys():
        stats = total_stats[total_stats.kingdom_taxon==k]
        spp = 0
        stat_str = ''
        if len(stats):
            for sr in stats.rank_id.unique():
                c = stats[stats.rank_id==sr]['count'].sum()
                count_str = f'{rank_map_dict[sr]} {c}' if get_language() == 'en-us' else f'{c}{rank_map_dict[sr]}'
                if sr <= 46 and sr >= 35:
                    spp += c
                elif sr == 47:
                    if spp > 0:
                        infra_count_str = f'{infra_str} {spp}' if get_language() == 'en-us' else f'{spp}{infra_str}'
                        stat_str += f"{infra_count_str} {count_str}"
                    else:
                        stat_str += f"{count_str} "
                else:
                    stat_str += f"{count_str} "
            if spp > 0 and infra_str not in stat_str:
                # 如果沒有47 最後要把種下加回去
                infra_count_str = f'{infra_str} {spp}' if get_language() == 'en-us' else f'{spp}{infra_str}'
                stat_str += infra_count_str
        
        kingdom_dict.append({'taxon_id': k, 
                             'name': f"{'Kingdom ' if kingdom_taxon_map[k]['name'] != 'Viruses' else ''}{kingdom_taxon_map[k]['name']}" if get_language()=='en-us' else f"{kingdom_taxon_map[k]['common_name_c']} {'Kingdom ' if kingdom_taxon_map[k]['name'] != 'Viruses' else ''}{kingdom_taxon_map[k]['name']}",
                             'stat': stat_str.strip()})
    
    search_stat = SearchStat.objects.all().order_by('-count')[:100]
    s_taxon = [s.taxon_id for s in search_stat]
    # 要考慮是否已刪除or已被改為不存在於台灣
    if s_taxon:
        query = f"""SELECT DISTINCT(at.taxon_id), acn.name_c as common_name, an.formatted_name
                    FROM api_taxon at
                    JOIN api_names an ON at.accepted_taxon_name_id = an.taxon_name_id 
                    LEFT JOIN api_common_name acn ON acn.taxon_id = at.taxon_id AND acn.is_primary = 1
                    WHERE at.taxon_id IN %s AND at.is_in_taiwan = 1 AND at.is_deleted = 0 LIMIT 6;"""
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            cursor.execute(query, (s_taxon, ))
            tags = cursor.fetchall()
            conn.close()
            search_stat = []
            for t in tags:
                if t[1] and get_language() == 'zh-hant':
                    search_stat.append({'taxon_id': t[0], 'name': t[1]})
                else:
                    search_stat.append({'taxon_id': t[0], 'name': t[2]})

    return render(request, 'taxa/taxon_tree.html', {'kingdom_dict':kingdom_dict, 'search_stat': search_stat})



def get_taxon_path(request):
    taxon_id = request.POST.get('taxon_id')
    lin_rank = request.POST.get('lin_rank')
    with_not_official = request.POST.get('with_not_official')
    with_cultured = request.POST.get('with_cultured')

    not_official_str = ' AND at.not_official = 0' if with_not_official == 'off' else ''
    cultured_str = ' AND at.is_cultured != 1 ' if with_cultured != 'on' else '' # 排除栽培豢養

    resp = {}
    if taxon_id:
        # print(taxon_id)
        conn = pymysql.connect(**db_settings)
        query = f"SELECT {'lin_path' if lin_rank == 'on' else 'path'} FROM api_taxon_tree WHERE taxon_id = %s;"
        with conn.cursor() as cursor:
            cursor.execute(query, (taxon_id, ))
            ps = cursor.fetchone()
            conn.close()
            if ps:
                path = ps[0].split('>')
                query = f"""SELECT at.taxon_id, at.rank_id FROM api_taxon at
                            JOIN `ranks` r ON r.id = at.rank_id
                            WHERE at.taxon_id IN %s {cultured_str} {not_official_str} 
                            ORDER BY r.order DESC;"""
                # print(query) 
                # print(path)
                conn = pymysql.connect(**db_settings)
                with conn.cursor() as cursor:
                    cursor.execute(query, (path,))
                    t_ids = cursor.fetchall()
                    # print('t_ids', t_ids)
                    conn.close()
                    resp['path'] = Reverse([t[0] for t in t_ids])
                    resp['rank_id'] = Reverse([t[1] for t in t_ids])

    return HttpResponse(json.dumps(resp), content_type='application/json') 


def get_sub_tree_list(request):

    sub_dict_list = []
    taxon_id = request.POST.getlist('taxon_id[]')
    rank_id = request.POST.getlist('rank_id[]')
    rank_id = [int(r) for r in rank_id]
    with_cultured = request.POST.get('with_cultured')
    lang = request.POST.get('lang', 'zh-hant')
    lin_rank = request.POST.get('lin_rank')
    with_not_official = request.POST.get('with_not_official')
    from_search_click = request.POST.get('from_search_click')

    # time_s = time.time()
    not_official_str = ' AND at.not_official = 0' if with_not_official == 'off' else ''

    # cultured_condition = ''
    if with_cultured != 'on': # 排除栽培豢養
        is_cultured = [0, None] 
    else: # 包含栽培豢養
        is_cultured = [0,1]


    df = pd.DataFrame({'rank_id': rank_id, 'taxon_id': taxon_id})


    conn = pymysql.connect(**db_settings)

    # time_s = time.time()

    query = f"""
                WITH base_query AS (
                    SELECT att.taxon_id, att.tree_stat, 
                    {'att.lin_parent_taxon_id' if lin_rank == 'on' else 'att.parent_taxon_id'} as parent_taxon_id 
                    FROM api_taxon_tree att
                    JOIN api_taxon at ON at.taxon_id = att.taxon_id
                    WHERE {'att.lin_parent_taxon_id' if lin_rank == 'on' else 'att.parent_taxon_id'} IN %s
                    AND at.is_in_taiwan = 1 
                    AND at.is_deleted != 1 AND at.is_cultured IN %s {not_official_str}
                    {'AND at.rank_id in (50,49,3,12,18,22,26,30,34,35,36,37,38,39,40,41,42,43,44,45,46)' if lin_rank == 'on' else ''} 
                )
                SELECT 
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                        'taxon_id', at.taxon_id,
                        'rank_id', at.rank_id,
                        'name_for_order', an.formatted_name,
                        'formatted_name', CONCAT_WS(' ', {'acn.name_c,' if lang != 'en-us' else ''} r.display ->> '$."en-us"', an.formatted_name) ,
                        'rank', r.display ->> '$."zh-tw"',
                        'tree_stat', bq.tree_stat,
                        'rank_order', r.order
                        ) 
                    ), bq.parent_taxon_id
                FROM api_taxon at
                JOIN api_names an ON at.accepted_taxon_name_id = an.taxon_name_id 
                JOIN base_query bq ON bq.taxon_id = at.taxon_id 
                LEFT JOIN api_common_name acn ON acn.taxon_id = at.taxon_id AND acn.is_primary = 1
                JOIN ranks r ON at.rank_id = r.id
                GROUP BY bq.parent_taxon_id """


    # print(query)
    with conn.cursor() as cursor:
        cursor.execute(query, (taxon_id, is_cultured, ))
        infos = cursor.fetchall()
        # print(infos)
        infos = pd.DataFrame(infos, columns=['info', 'taxon_id'])

    # print(df)
    # print(infos)
    for i in df.index:
        current_rank_order = rank_order_map[df.rank_id[i]]
        info_list = infos[infos.taxon_id==df.taxon_id[i]]['info'].to_list()
        sub_titles = []
        stat_list = []
        for info in info_list:
            infosss = json.loads(info)
            if len(infosss):
                # 考慮林奈階層
                infosss = pd.DataFrame(infosss).sort_values(['rank_order', 'name_for_order'], ascending=[False, True])
                if lin_rank == 'on':
                    infosss = infosss[infosss.rank_id.isin(lin_ranks+sub_lin_ranks)]
                infosss = infosss.to_dict('records')

                for ii in infosss:
                    # 在這步要排除掉比自己高階層的部分
                    if ii['rank_order'] > current_rank_order:
                        sub_titles.append([ii['taxon_id'], ii['rank_id'], ii['formatted_name'], ii['rank'], ii['rank_order']])
                        stat_list.append([ii['tree_stat'], ii['taxon_id']])
        # print(i)
        if x := get_tree_stat(taxon_id=df.taxon_id[i],
                                with_cultured=with_cultured,
                                rank_id=int(df.rank_id[i]),
                                from_search_click=from_search_click,
                                lang=lang,
                                with_not_official=with_not_official, 
                                conn=conn, 
                                stat_list=stat_list, 
                                sub_titles=sub_titles,
                                lin_rank=lin_rank):
            sub_dict_list.append(x)


    return HttpResponse(json.dumps(sub_dict_list), content_type='application/json') 


def Reverse(lst):
    new_lst = lst[::-1]
    return new_lst
 

def get_tree_stat(taxon_id,with_cultured,rank_id,from_search_click,lang,with_not_official,conn, stat_list,sub_titles,lin_rank):
    
    sub_dict = {}
    rank_id = int(rank_id)
    infra_str = 'Infraspecies' if lang == 'en-us' else '種下'
    rank_map_dict = rank_map if lang == 'en-us' else rank_map_c

    if with_not_official == 'off' and with_cultured == 'off':
        stat_map_key = 'official_not_cultured'
    elif with_not_official == 'off' and with_cultured == 'on':
        stat_map_key = 'official_with_cultured'
    elif with_not_official == 'on' and with_cultured == 'off':
        stat_map_key = 'with_not_official_not_cultured'
    elif with_not_official == 'on' and with_cultured == 'on':
        stat_map_key = 'with_not_official_with_cultured'

    # 如果有跳過的部分，要顯示地位未定
    # 先找出下一個林奈階層應該要是什麼
    next_lin_h = None
    if rank_id in lin_ranks:
        if lin_ranks.index(rank_id)+1 < len(lin_ranks):
            if lin_ranks[lin_ranks.index(rank_id)+1] < 34 or lin_ranks[lin_ranks.index(rank_id)+1] > 47:
                next_lin_h = lin_ranks[lin_ranks.index(rank_id)+1]
    # print('next_lin_h', next_lin_h)

    # print(rank_id, next_lin_h)

    uncertains = []
    uncertain_rank_order = []
    uncertain_rank = []
    if next_lin_h:
        next_lin_h_order = lin_map_w_order[next_lin_h]['rank_order']
        # 這邊要改用rank_order來判斷
        for st in sub_titles:
            # print(st)
            if not (st[1] == next_lin_h or st[-1] < next_lin_h_order):
                uncertains.append(st)
                if st[-1] not in uncertain_rank_order:
                    uncertain_rank_order.append(st[-1])
                    uncertain_rank.append(st[1])

    sub_stat = []
    for sl in stat_list:
        for ssl in sl[0]:
            sub_stat.append({'rank_id': ssl['rank_id'], 'count': ssl['count'].get(stat_map_key), 'taxon_id': sl[1], 'rank_order':rank_order_map[ssl['rank_id']]})

    sub_stat = pd.DataFrame(sub_stat, columns=['count','rank_id','taxon_id','rank_order'])
    sub_stat = sub_stat.sort_values('rank_order')
    if lin_rank == 'on':
        sub_stat = sub_stat[sub_stat.rank_id.isin(lin_ranks+sub_lin_ranks)]
    sub_stat = sub_stat.reset_index(drop=True)


    for st in sub_titles:
        stat_str = ''
        spp = 0
        stat_name = ''
        rank_c = st[3]
        # 如果是自己種下的話 這邊要調整
        if st[1] in sub_lin_ranks:
            stats = sub_stat[(sub_stat.taxon_id==st[0])&(sub_stat.rank_id.isin(sub_lin_ranks))]
        else:
            stats = sub_stat[(sub_stat.taxon_id==st[0])&(sub_stat.rank_order>st[-1])]
        stats = stats.reset_index(drop=True)
        if st[1] in lin_ranks:
            rank_color = rank_color_map[st[1]]
        else:
            rank_color = 'rank-second-gray'
        stat_name = st[2]
        # cc = time.time()
        for i in stats.index:
            s = stats.iloc[i]
            if s['count'] > 0:
                r_id = s.rank_id
                count_str = f'{rank_map_dict[r_id]} {int(s["count"])}' if lang == 'en-us' else f'{int(s["count"])}{rank_map_dict[r_id]}'
                if r_id <= 46 and r_id >= 35:
                    spp += s['count']
                elif r_id == 47:
                    if spp > 0:
                        infra_count_str = f'{infra_str} {int(spp)}' if lang == 'en-us' else f'{int(spp)}{infra_str}'
                        stat_str += f"{infra_count_str} {count_str}"
                    else:
                        stat_str += f"{count_str} "
                else:
                    stat_str += f"{count_str} "
        if spp > 0 and infra_str not in stat_str:
            # 如果沒有47 最後要把種下加回去
            infra_count_str = f'{infra_str} {int(spp)}' if lang == 'en-us' else f'{int(spp)}{infra_str}'
            stat_str += infra_count_str
            # stat_str += f"{spp}種下"
        if rank_c not in sub_dict.keys():
            sub_dict[rank_c] = {}
            sub_dict[rank_c]['data'] = [{'taxon_id': st[0], 'rank_id':st[1], 'name': stat_name, 'stat':stat_str.strip()}]
            sub_dict[rank_c]['rank_color'] = rank_color
            sub_dict[rank_c]['taxon_id'] = taxon_id
        else:
            sub_dict[rank_c]['data'] += [{'taxon_id': st[0], 'rank_id':st[1], 'name': stat_name, 'stat':stat_str.strip()}]
            sub_dict[rank_c]['taxon_id'] = taxon_id


    lack_r = []
    if uncertains:

        # 當前的階層
        query = f"""SELECT an.formatted_name 
                    FROM api_taxon at
                    JOIN api_names an ON at.accepted_taxon_name_id = an.taxon_name_id 
                    WHERE at.taxon_id = %s"""
        with conn.cursor() as cursor:
            cursor.execute(query, (taxon_id,))
            taxon_info = cursor.fetchone()
            formatted_name = taxon_info[0]

        # if from_search_click == 'true':

        #     for r in lin_map.keys():
        #         now_order = rank_order_map[r]
        #         if now_order < min(uncertain_rank_order) and now_order > rank_order_map[rank_id]:
        #             lack_r.append(r)
        # else:
        lack_r = [next_lin_h]
        for nlh in lack_r:
            stat_str = ''
            spp = 0
            stat_name = ''
            rank_color = rank_color_map[nlh]
            rank_c = rank_map_c[nlh]
            stats = sub_stat[sub_stat.taxon_id.isin([un[0] for un in uncertains])]
            stats = stats.groupby(['rank_order','rank_id'],as_index=False).sum('count')

            stats = stats[stats.rank_order > rank_order_map[nlh]]
            stats = stats.reset_index(drop=True)
            # 補所有地位未定的部分
            stat_name = f'{formatted_name} {lin_map[nlh]} incertae sedis' if lang == 'en-us' else f'地位未定 {formatted_name} {lin_map[nlh]} incertae sedis' 
            for i in stats.index:
                s = stats.iloc[i]
                if s['count'] > 0:
                    r_id = s.rank_id
                    count_str = f'{rank_map_dict[r_id]} {int(s["count"])}' if lang == 'en-us' else f'{int(s["count"])}{rank_map_dict[r_id]}'
                    if r_id <= 46 and r_id >= 35:
                        spp += s['count']
                    elif r_id == 47:
                        if spp > 0:
                            infra_count_str = f'{infra_str} {int(spp)}' if lang == 'en-us' else f'{int(spp)}{infra_str}'
                            stat_str += f"{infra_count_str} {count_str}"
                        else:
                            stat_str += f"{count_str} "
                    else:
                        stat_str += f"{count_str} "
            if spp > 0 and infra_str not in stat_str:
                # 如果沒有47 最後要把種下加回去
                infra_count_str = f'{infra_str} {int(spp)}' if lang == 'en-us' else f'{int(spp)}{infra_str}'
                stat_str += infra_count_str
            if rank_map_c[nlh] not in sub_dict.keys():
                sub_dict[rank_c] = {}
                sub_dict[rank_c]['data'] = [{'taxon_id': None, 'rank_id':nlh, 'name': stat_name, 'stat':stat_str.strip()}]
                sub_dict[rank_c]['rank_color'] = rank_color
                sub_dict[rank_c]['taxon_id'] = taxon_id
            else:
                sub_dict[rank_c]['data'] += [{'taxon_id': None, 'rank_id':nlh, 'name': stat_name, 'stat':stat_str.strip()}]
                sub_dict[rank_c]['taxon_id'] = taxon_id
    final_sub_dict = {}
    final_sub_dict['has_lack'] = False
    total_ranks = []
    for r in rank_map_c.keys():
        if sub_dict.get(rank_map_c[r]):
            total_ranks.append(r)
            final_sub_dict[rank_map_c[r]] = sub_dict[rank_map_c[r]]

    for r in lack_r:
        final_sub_dict[rank_map_c[r]]['parent_rank_id'] = total_ranks[total_ranks.index(r) - 1]

    # 把補了地位未定的階層拿掉
    if lack_r:
        # print(lack_r)
        # print(final_sub_dict)
        final_sub_dict['has_lack'] = True
        # print(lack_r)
        # print(total_ranks)
        # final_sub_dict[rank_map_c[total_ranks[total_ranks.index(max(lack_r)) + 1]]]['parent_rank_id'] = max(lack_r)
        # if from_search_click == 'false':
        for ur in uncertain_rank:
            if rank_map_c[ur] in final_sub_dict.keys():
                final_sub_dict.pop(rank_map_c[ur])

    return final_sub_dict




def update_search_stat(request):
    if taxon_id := request.POST.get('taxon_id'):
        if SearchStat.objects.filter(taxon_id=taxon_id).exists():
            ss = SearchStat.objects.filter(taxon_id=taxon_id).update(count=F('count')+1,updated_at=timezone.now())
        else:
            ss = SearchStat.objects.create(taxon_id=taxon_id,count=1)
    return HttpResponse(json.dumps({'status': 'done'}), content_type='application/json') 


def get_match_result(request):

    translation.activate(request.POST.get('lang'))
    response = {}
    response['page'] = {}
    namecode_list = []
    best = request.POST.get('best','yes')
    name = request.POST.get('name')
    page = int(request.POST.get('page', 1))

    response['header'] = f'''<tr>
				<td>{gettext("查詢字串")}</td>
				<td>{gettext("比對結果")}</td>
				<td>{gettext("分數")}</td>
				<td>{gettext("地位")}</td>
				<td>{gettext("接受學名")}</td>
				<td>{gettext("中文名")}</td>
				<td>{gettext("界")}</td>
				<td>{gettext("所屬類群")}</td>
				<td>{gettext("階層")}</td>
				<td>{gettext("物種資訊")}</td>
				<td>{gettext("保育類")}</td>
				<td>{gettext("臺灣紅皮書")}</td>
				<td>{gettext("IUCN評估")}</td>
			</tr>'''

    # 用loop取得name match結果 每頁10筆
    if name:
        name = name.splitlines()
        name = [n.strip() for n in name if n]

        # 排除重複 & 空值
        name_list = []
        for n in name:
            if n not in name_list and n:
                name_list.append(n)

        response['page']['current_page'] = page
        response['page']['total_page'] = math.ceil(len(name_list) / 10)
        response['page']['page_list'] = get_page_list(response['page']['current_page'], response['page']['total_page'])
        name_list = name_list[(page-1)*10:page*10]

        names = ('|').join(name_list)
        url = env('NOMENMATCH_ROOT')

        query_dict =  {
            'names': names,
            'best': best,
            'format': 'json',
            'source': 'taicol'
        }

        if request.POST.get('is_in_taiwan') == 'true':
            query_dict['is_in_taiwan'] = True

        if request.POST.get('bio_group-select') != 'all':
            # taxon_group是在NomenaMatch的欄位 -> 改為 bio_group
            query_dict['bio_group'] = request.POST.get('bio_group-select')
        
        if kingdoms := request.POST.getlist('kingdom'):
            if 'all' not in kingdoms:
                query_dict['kingdom'] = ",".join([f'"{k}"' for k in kingdoms])

        
        if ranks := request.POST.getlist('rank'):
            query_dict['taxon_rank'] = ",".join([f'"{rank_map[int(r)]}"' for r in ranks])

        result = requests.post(url, data=query_dict)

        if result.status_code == 200:
            result = result.json()
            data = result['data']
            df_flat = pd.DataFrame()
            namecode_list = []
            for ddd in data:
                for dd in ddd:
                    tmp_dict = {
                        'search_term': dd['search_term'],
                        'matched_clean': dd['matched_clean'], 
                    }
                    for d in dd['results']:
                        tmp_dict.update(d)
                        namecode_list.append(d['namecode'])
                        df_flat = pd.concat([df_flat, pd.DataFrame([tmp_dict])], ignore_index=True)
                    if not dd['results']:
                        df_flat = pd.concat([df_flat, pd.DataFrame([{'search_term': dd['search_term'], 'namecode': 'no match', 'formatted_name': gettext('無結果')}])], ignore_index=True)
            df = df_flat
            # 確認是否有對到多個學名的情況
            matched_count = df[['search_term','namecode']].groupby('search_term', as_index=False).count()
            matched_count = matched_count.rename(columns={'namecode': 'taxon_id'})


            if namecode_list:
                solr_cols = ['is_in_taiwan', 'is_endemic', 'alien_type', 'taxon_id','protected_category', 'red_category', 'iucn_category', 'rank_id', 'formatted_name', 'common_name_c']
                taxon_ids_str = ' OR '.join(namecode_list)
                # 取有效學名的那筆資料
                resp = requests.get(f'{SOLR_PREFIX}taxa/select?fl=is_in_taiwan,is_endemic,alien_type,taxon_id,protected,redlist,iucn,taxon_rank_id,formatted_accepted_name,common_name_c,taxon_id&fq=status:accepted&fq=taxon_name_id:*&q=taxon_id:({taxon_ids_str})&rows=10000000')
                solr_resp = resp.json()
                solr_resp = solr_resp['response']['docs']
                info = pd.DataFrame(solr_resp)
                info = info.rename(columns={
                    'protected': 'protected_category',
                    'redlist': 'red_category',
                    'iucn': 'iucn_category',
                    'taxon_rank_id': 'rank_id',
                    'formatted_accepted_name': 'formatted_name',
                })
                for kk in solr_cols:
                    if kk not in info.keys():
                        info[kk] = None
                info = info[solr_cols]
                info['rank_id'] = info['rank_id'].apply(lambda x: int(x) if x else x)

                # 這邊的simple name是從nomen match來的 是比對到學名本身的simple name
                df = df[['search_term','simple_name','score','name_status','namecode','family','kingdom','phylum','class','order','genus']].merge(info,how='left',left_on='namecode',right_on='taxon_id')
                
                # 如果有多個結果 
                
                custom_dict = {'accepted': 0, 'not-accepted': 1, 'misapplied': 2}

                final_df = []

                # 改成和input names的順序相同
                for dd in name_list:
                # for dd in df.search_term.unique():
                    if matched_count[matched_count.search_term==dd].taxon_id.values[0] > 1:
                        if best == 'yes':
                            taxon_tmp = df[df.search_term==dd].sort_values(by=['name_status'], key=lambda x: x.map(custom_dict)).sort_values(by='is_in_taiwan',ascending=False)
                            taxon_tmp = taxon_tmp.replace({np.nan: '', None: ''})
                            now_record = taxon_tmp.to_dict('records')[0]
                            if len(taxon_tmp[(taxon_tmp.name_status==now_record.get('name_status'))&(taxon_tmp.is_in_taiwan==now_record.get('is_in_taiwan'))]) == 1:
                                # 地位不同 -> 依照優先序給
                                # 要標注有多個結果
                                final_df.append(now_record)
                            else:
                                # 全部地位相同 -> 不回傳 但提示有多個結果
                                final_df.append({'search_term': now_record.get('search_term')})
                        else:
                            # 排序 但全給
                            taxon_tmp = df[df.search_term==dd].sort_values(by=['name_status'], key=lambda x: x.map(custom_dict)).sort_values(by='is_in_taiwan',ascending=False).sort_values(by='score',ascending=False)
                            taxon_tmp = taxon_tmp.replace({np.nan: '', None: ''})
                            now_records = taxon_tmp.to_dict('records')
                            for now_record in now_records:
                                final_df.append(now_record)
                    else:
                        final_df.append(df[df.search_term==dd].to_dict('records')[0])


                df = pd.DataFrame(final_df, columns=['search_term', 'simple_name', 'score', 'name_status', 'namecode', 'family', 'kingdom',
                                                    'phylum', 'class', 'order', 'genus', 'is_in_taiwan', 'is_endemic',
                                                    'alien_type', 'taxon_id', 'protected_category', 'red_category',
                                                    'iucn_category', 'rank_id', 'formatted_name', 'common_name_c'])
                df['name_status'] = df['name_status'].replace({'accepted': gettext('有效'), 'not-accepted': gettext('無效'), 'misapplied': gettext('誤用')})
                df = df.replace({np.nan: '', None: ''})
                df.loc[(df.namecode=='no match'),'formatted_name']= gettext('無結果')

                # taxon group
                for i in df.index:
                    current_rank = df.iloc[i].rank_id
                    if current_rank:
                        if current_rank <= 3:
                            df.loc[i,'taxon_group'] = ''
                        elif current_rank < 30: # 屬以上取上層:
                            higher = [h for h in [3,12,18,22,26] if h < current_rank]
                            df.loc[i,'taxon_group'] = df.loc[i,rank_map[higher[-1]].lower()] 
                        else: #取科
                            df.loc[i,'taxon_group'] = df.loc[i,'family'] 
                    else:
                        df.loc[i,'taxon_group'] = ''
                    if df.iloc[i].alien_type:
                        if get_language() == 'en-us':
                            df.loc[i,'alien_type'] = attr_map[df.iloc[i].alien_type]
                        else:
                            df.loc[i,'alien_type'] = attr_map_c[df.iloc[i].alien_type]

                is_list = ['is_endemic']
                for ii in is_list:
                    if get_language() == 'en-us':
                        df[ii] = df[ii].apply(lambda x: attr_map[ii] if x == 1 else '')
                    else:
                        df[ii] = df[ii].apply(lambda x: attr_map_c[ii] if x == 1 else '')

                df['is_in_taiwan'] = df['is_in_taiwan'].apply(lambda x: gettext('不存在於臺灣') if x == 0 else '')


                df['rank'] = df['rank_id'].apply(lambda x: gettext(rank_map_c[x]) if x else '')


            response['matched_count'] = dict(matched_count.values.tolist())
                    
            df = df.replace({np.nan: '', None: ''})
            df = df.drop_duplicates()

            response['more_than_one_str'] = gettext('查詢字串有多個比對結果')

            response['data'] = json.loads(df.to_json(orient='records'))
            response['next'] = gettext('下一頁')
            response['prev'] = gettext('上一頁')
            

    return HttpResponse(json.dumps(response), content_type='application/json')



def download_match_results_offline(request):
    task = threading.Thread(target=download_match_results, args=(request,))
    task.start()
    return JsonResponse({"status": 'success'}, safe=False)



# 統一改成離線產生
def download_match_results(request):

    # 下載的欄位
    cols = ["search_term","score","simple_name","name_status","accepted_namecode","accepted_name","common_name_c","kingdom","phylum","class","order","family","genus","rank",
            "is_endemic","alien_type","is_terrestrial","is_freshwater","is_brackish","is_marine","is_fossil","protected_category","red_category","iucn_category","cites_listing",
            "is_in_taiwan","not_official", "match_type"]
    

    best = request.POST.get('best','yes')
    name = request.POST.get('name')
    file_format = request.POST.get('file_format','csv')
    download_email = request.POST.get('download_email')
    final_df = pd.DataFrame()

    if name:
        # 去除空白
        name = name.splitlines()
        name = [n.strip() for n in name if n]
        all_name_list = []
        # 排除重複 & 空值
        for n in name:
            if n not in all_name_list:
                all_name_list.append(n)

        total_page = math.ceil(len(all_name_list) / 30)
        for page in range(total_page): 

            name_list = all_name_list[page*30:(page+1)*30]
            names = ('|').join(name_list)
            url = env('NOMENMATCH_ROOT')

            query_dict =  {
                'names': names,
                'best': best,
                'format': 'json',
                'source': 'taicol'
            }

            if request.POST.get('is_in_taiwan') == 'true':
                query_dict['is_in_taiwan'] = True

            if request.POST.get('bio_group-select') != 'all':
                # taxon_group是在NomenaMatch的欄位 -> 改為 bio_group
                query_dict['bio_group'] = request.POST.get('bio_group-select')
            
            if kingdoms := request.POST.getlist('kingdom'):
                if 'all' not in kingdoms:
                    query_dict['kingdom'] = ",".join([f'"{k}"' for k in kingdoms])

            
            if ranks := request.POST.getlist('rank'):
                query_dict['taxon_rank'] = ",".join([f'"{rank_map[int(r)]}"' for r in ranks])

            result = requests.post(url, data=query_dict)

            if result.status_code == 200:
                result = result.json()
                data = result['data']
                df_flat = pd.DataFrame()
                namecode_list = []
                for ddd in data:
                    for dd in ddd:
                        tmp_dict = {
                            'search_term': dd['search_term'],
                            'matched_clean': dd['matched_clean'], 
                        }
                        for d in dd['results']:
                            tmp_dict.update(d)
                            namecode_list.append(d['namecode'])
                            df_flat = pd.concat([df_flat, pd.DataFrame([tmp_dict])], ignore_index=True)
                        if not dd['results']:
                            df_flat = pd.concat([df_flat, pd.DataFrame([{'search_term': dd['search_term'], 'namecode': 'no match'}])], ignore_index=True)
                df = df_flat
                # 確認是否有對到多個學名的情況
                matched_count = df[['search_term','namecode']].groupby('search_term', as_index=False).count()
                matched_count = matched_count.rename(columns={'namecode': 'taxon_id'})

                #JOIN taxon
                if namecode_list:
                    solr_cols = ['is_in_taiwan', 'not_official', 'is_endemic', 'alien_type', 'is_terrestrial', 'is_freshwater', 'is_brackish', 'is_marine', 'is_fossil', 
                                 'taxon_id','protected_category', 'red_category', 'iucn_category', 'cites_listing', 'rank_id', 'formatted_name', 'common_name_c', 'accepted_name']
                    taxon_ids_str = ' OR '.join(namecode_list)
                    # 取有效學名的那筆資料
                    resp = requests.get(f'{SOLR_PREFIX}taxa/select?fl=is_terrestrial,is_freshwater,is_brackish,is_marine,is_fossil,not_official,is_in_taiwan,is_endemic,alien_type,taxon_id,protected,redlist,iucn,cites,taxon_rank_id,formatted_accepted_name,common_name_c,taxon_id&fq=status:accepted&fq=taxon_name_id:*&q=taxon_id:({taxon_ids_str})&rows=10000000')
                    solr_resp = resp.json()
                    solr_resp = solr_resp['response']['docs']
                    info = pd.DataFrame(solr_resp)
                    info = info.rename(columns={
                        'protected': 'protected_category',
                        'redlist': 'red_category',
                        'iucn': 'iucn_category',
                        'cites': 'cites_listing',
                        'taxon_rank_id': 'rank_id',
                        'formatted_accepted_name': 'accepted_name',
                    })

                    info['accepted_name'] = info.accepted_name.str.replace('<i>','')
                    info['accepted_name'] = info.accepted_name.str.replace('</i>','')

                    for kk in solr_cols:
                        if kk not in info.keys():
                            info[kk] = None


                    info = info[solr_cols]
                    info['rank_id'] = info['rank_id'].apply(lambda x: int(x) if x else x)


                    df = df.merge(info,how='left',left_on='namecode', right_on='taxon_id')
                    # # 確認是否有對到多個學名的情況
                    # matched_count = df[['search_term','taxon_id']].groupby('search_term', as_index=False).count()
                    # 如果有多個結果 
                    custom_dict = {'accepted': 0, 'not-accepted': 1, 'misapplied': 2}
                    tmp_df = []
                    # for dd in df.search_term.unique():
                    for dd in name_list:
                        if matched_count[matched_count.search_term==dd].taxon_id.values[0] > 1:
                            if best == 'yes':
                                taxon_tmp = df[df.search_term==dd].sort_values(by=['name_status'], key=lambda x: x.map(custom_dict)).sort_values(by='is_in_taiwan',ascending=False)
                                taxon_tmp = taxon_tmp.replace({np.nan: '', None: ''})
                                now_record = taxon_tmp.to_dict('records')[0]
                                if len(taxon_tmp[(taxon_tmp.name_status==now_record.get('name_status'))&(taxon_tmp.is_in_taiwan==now_record.get('is_in_taiwan'))]) == 1:
                                    # 地位不同 -> 依照優先序給
                                    # 要標注有多個結果
                                    tmp_df.append(now_record)
                                else:
                                    # 全部地位相同 -> 不回傳 但提示有多個結果
                                    tmp_df.append({'search_term': now_record.get('search_term'), 'match_type': now_record.get('match_type')})
                            else:
                                # 排序 但全給
                                taxon_tmp = df[df.search_term==dd].sort_values(by=['name_status'], key=lambda x: x.map(custom_dict)).sort_values(by='is_in_taiwan',ascending=False).sort_values(by='score',ascending=False)
                                taxon_tmp = taxon_tmp.replace({np.nan: '', None: ''})
                                now_records = taxon_tmp.to_dict('records')
                                for now_record in now_records:
                                    tmp_df.append(now_record)
                        else:
                            tmp_df.append(df[df.search_term==dd].to_dict('records')[0])
                    df = pd.DataFrame(tmp_df)
                    df = df.replace({np.nan: '', None: ''})
                    df.loc[(df.namecode=='no match'),'match_type']= 'No match'
                    df['cites_listing'] = df['cites_listing'].apply(lambda x: x.replace('1','I').replace('2','II').replace('3','III'))
                    df['rank'] = df['rank_id'].apply(lambda x: rank_map[x] if x else '')
                    df.loc[df.taxon_id!='','is_endemic'] = df.loc[df.taxon_id.notnull(),'is_endemic'].apply(lambda x: 1 if x == 1 else 0)
                df = df.replace({np.nan: '', None: '', 'no match': ''})
                final_df = pd.concat([final_df,df],ignore_index=True)


    for c in cols:
        if c not in final_df.keys():
            final_df[c] = ''
    
    final_df = final_df[[c for c in cols if c in final_df.keys()]]

    final_df = final_df.rename(columns={"protected_category": "protected", "red_category": "redlist", "iucn_category": "iucn",
                                        "cites_listing": "cites", "accepted_namecode": "taxon_id", "name_status": "usage_status", "simple_name": "match_name"})
   
    final_df = final_df.drop_duplicates()


    now = datetime.datetime.now()+datetime.timedelta(hours=8)
    is_list = ["is_endemic","is_terrestrial","is_freshwater","is_brackish","is_marine","is_fossil","is_in_taiwan",'not_official']

    if file_format == 'json':
        # 改成True False                
        final_df[is_list] = final_df[is_list].replace({0: False, 1: True, '0': False, '1': True})
        df_file_name = f'taicol_download_{now.strftime("%Y%m%d%H%M%s")}.json'
        compression_options = dict(method='zip', archive_name=df_file_name)
        zip_file_name = df_file_name.replace("json","zip")
        final_df.to_json(f'/tc-web-volumes/media/match_result/{zip_file_name}', orient='records', compression=compression_options)
    else:
        # 改成字串true false
        final_df[is_list] = final_df[is_list].replace({0: 'false', 1: 'true', '0': 'false', '1': 'true'})
        df_file_name = f'taicol_download_{now.strftime("%Y%m%d%H%M%s")}.csv'
        compression_options = dict(method='zip', archive_name=df_file_name)
        zip_file_name = df_file_name.replace("csv","zip")
        final_df.to_csv(f'/tc-web-volumes/media/match_result/{zip_file_name}', compression=compression_options, index=False, escapechar='\\')


    download_url = request.scheme+"://" + request.META['HTTP_HOST']+ MEDIA_URL + os.path.join('match_result', zip_file_name)
    if env('WEB_ENV') != 'dev':
        download_url = download_url.replace('http', 'https')

    email_body = render_to_string('taxa/download.html', {'download_url': download_url, })
    send_mail('[TaiCOL] 下載比對結果', email_body, 'no-reply@taicol.tw', [download_email])


    # return response



def send_feedback(request):
    req = request.POST
    date_str = timezone.now()+datetime.timedelta(hours=8)
    date_str = date_str.strftime('%Y/%m/%d')
    name = req.get('name')
    description = req.get('description')
    taxon_id = req.get('taxon_id')

    req = dict(req)

    # Feedback.objects.create(
    #     taxon_id = req.get('taxon_id'),
    #     type = int(req.get('type',1)),
    #     title = req.get('title'),
    #     description = req.get('description'),
    #     reference = req.get('reference'),
    #     notify = True if req.get('notify') == 'yes' else False,
    #     name = req.get('name'),
    #     email = req.get('email'),
    #     response = f"<p>{req.get('name')} 先生/小姐您好，</p><p>收到您{date_str}於TaiCOL的留言：</p><p>『{req.get('description')}』</p><p>回覆如下：</p>",
    # )

    url = f"{env('REACT_WEB_INTERNAL_API_URL')}/api/admin/feedback/save/"
    req['response'] = f"""
    
        <p>{name} 先生/小姐您好，</p>
        <br>
        <p>收到您 {date_str} 於TaiCOL針對物種編號 <a href="{request.scheme}://{request.META["HTTP_HOST"]}/taxon/{taxon_id}">{taxon_id}</a> 的留言：</p>
        <p>『{description}』</p>
        <br>
        <p>回覆如下：</p>
        <br>
        
        <br>
        敬祝   順心<br>
        <br>
        臺灣物種名錄<br>
        臺灣生物多樣性資訊機構<br>
        中央研究院生物多樣性研究中心<br>
        <br>
        TaiCOL<br>
        Taiwan Biodiversity Information Facility | TaiBIF<br>
        Biodiversity Research Centre, Academia Sinica<br>
    """
    resp = requests.post(url, data=req)
    if resp.status_code == 200:

        email_body = f'您好\n  \n 網站有新的錯誤回報\n  \n 請至管理後台查看： {env("REACT_WEB_INTERNAL_API_URL")}/admin/feedback/'
        trigger_send_mail(email_body)

        return HttpResponse(json.dumps({'status': 'done'}), content_type='application/json') 
    else:
        return HttpResponse(json.dumps({'status': 'fail'}), content_type='application/json') 



def trigger_send_mail(email_body):
    task = threading.Thread(target=bk_send_mail, args=(email_body,))
    # task.daemon = True
    task.start()
    return JsonResponse({"status": 'success'}, safe=False)


def bk_send_mail(email_body):
    send_mail('[TaiCOL] 網站錯誤回報', email_body, 'no-reply@taicol.tw', ['catalogueoflife.taiwan@gmail.com'])


def get_solr_data_search(query_list, offset, response, limit, is_chinese):

    response['data'] = []
    response['facet'] = {}
    count = 0

    if is_chinese:

        now_facet = search_facet
        now_facet['taxon_id'] = {
                        'type': 'terms',
                        'field': 'taxon_id',
                        'mincount': 1,
                        'limit': limit,
                        'offset': offset,
                        'sort': 'index',
                        'allBuckets': False,
                        'numBuckets': True
                  }
        query = { "query": "*:*",
                  "limit": 0,
                  "filter": query_list,
                  "facet": search_facet
                }

        query_req = json.dumps(query)

        resp = requests.post(f'{SOLR_PREFIX}taxa/select?', data=query_req, headers={'content-type': "application/json" })
        resp = resp.json()

        response = create_facet_data(resp, response, is_chinese)

        # 先確認有找到資料
        if resp['response']['numFound']:

            # 這邊改成facet bucket的數量
            count = resp['facets']['taxon_id']['numBuckets']

            # 先用facet取得taxon_id 再query 相關data
            taxon_ids = [t.get('val') for t in resp['facets']['taxon_id']['buckets']]

            query_list = [f"taxon_id: ({' OR '.join(taxon_ids)})","is_primary_common_name:true"]

            query = { "query": "*:*",
                      "filter": query_list,
                      "limit": limit,
                    }

            query_req = json.dumps(query)

            resp = requests.post(f'{SOLR_PREFIX}taxa/select?', data=query_req, headers={'content-type': "application/json" })
            resp = resp.json()
    
    else:

        query = { "query": "*:*",
          "offset": offset,
          "limit": limit,
          "filter": query_list,
          "sort": 'search_name asc',
          "facet": search_facet
        }

        query_req = json.dumps(query)

        resp = requests.post(f'{SOLR_PREFIX}taxa/select?', data=query_req, headers={'content-type': "application/json" })
        resp = resp.json()

        # 這邊改成facet bucket的數量
        count = resp['response']['numFound']



        response = create_facet_data(resp, response, is_chinese)

    if count:

        results = pd.DataFrame(resp['response']['docs'])
        results = results.rename(columns={'common_name': 'common_name_c', 'rank_id': 'rank'})

        # 一定要有的欄位
        musthave_cols = ['formatted_search_name','taxon_name_id','formatted_accepted_name','common_name_c','rank','status',
                        'kingdom', 'kingdom_c', 'taxon_group', 'taxon_group_c', 'is_endemic', 'alien_type']

        for m in musthave_cols:
            if m not in results.keys():
                results[m] = None

        results['name'] = results.apply(lambda x: x.formatted_search_name if x.taxon_name_id else x.formatted_accepted_name, axis=1)

        results = results.replace({np.nan: None})

        if get_language() == 'en-us':
            results['rank'] = results['rank'].apply(lambda x: rank_map[int(x)])
            results['status'] = results['status'].apply(lambda x: x.capitalize() if x else None)
            results['alien_type'] = results['alien_type'].apply(lambda x: x.capitalize() if x else None)
        else:
            results['rank'] = results['rank'].apply(lambda x: rank_map_c[int(x)])
            results['status'] = results['status'].apply(lambda x: status_map_c[x] if x else None)
            results['kingdom'] = results.apply(lambda x: f"{x.kingdom_c} {x.kingdom}" if x.kingdom_c else x.kingdom, axis=1)
            results['taxon_group'] = results.apply(lambda x: f"{x.taxon_group_c} {x.taxon_group}" if x.taxon_group_c else x.taxon_group, axis=1)
            results['alien_type'] = results['alien_type'].apply(lambda x: attr_map_c[x] if x else None)

        results['is_endemic'] = results['is_endemic'].apply(lambda x: gettext('臺灣特有') if x == True else None)

        results = results.drop(columns=['path'],errors='ignore')
        results = results.replace({np.nan: '', None: ''})
        results = results.to_json(orient='records')
    
        response['data'] = json.loads(results)

    response['count'] = {}
    response['count']['total'] = [{'count': count}]
    # pagination
    response['page'] = {}
    response['page']['total_page'] = int(math.ceil((response['count']['total'][0]['count']) / limit))
    response['page']['current_page'] = int(offset / limit + 1)
    response['page']['page_list'] = get_page_list(response['page']['current_page'], response['page']['total_page'])

    response['kingdom_title'] = gettext('界')
    response['rank_title'] = gettext('階層')
    response['endemic_title'] = gettext('特有性')
    response['alien_type_title'] = gettext('原生/外來性')
    response['status_title'] = gettext('地位') 

    return response


def create_facet_data(resp, response, is_chinese):

    if 'kingdom' in resp['facets'].keys():
        kingdom = resp['facets']['kingdom']['buckets']
        kingdom = [k for k in kingdom if k['val']  in kingdom_map_c.keys()]
        if is_chinese:
            if get_language() == 'en-us':
                kingdom = [{'title': v['val'], 'val': v['val'], 'count': v['taxon_id']['numBuckets']} for v in kingdom]
            else:
                kingdom = [{'title': kingdom_map_c[v['val']], 'val': v['val'], 'count': v['taxon_id']['numBuckets']} for v in kingdom]
        else:
            if get_language() == 'en-us':
                kingdom = [{'title': v['val'], 'val': v['val'], 'count': v['count']} for v in kingdom]
            else:
                kingdom = [{'title': kingdom_map_c[v['val']], 'val': v['val'], 'count': v['count']} for v in kingdom]
        response['facet']['kingdom'] = kingdom

    if 'status' in resp['facets'].keys():
        status = resp['facets']['status']['buckets']
        if is_chinese:
            status = [{'title': gettext(status_map_c[v['val']]), 'val': v['val'], 'count': v['taxon_id']['numBuckets']} for v in status]
        else:
            status = [{'title': gettext(status_map_c[v['val']]), 'val': v['val'], 'count': v['count']} for v in status]
        response['facet']['status'] = status


    if 'rank_id' in resp['facets'].keys():
        rank_id = resp['facets']['rank_id']['buckets']
        rank_id = sorted(rank_id, key=lambda x: rank_order_map.get(int(x["val"]), float("inf")))
        if is_chinese:
            if get_language() == 'en-us':
                rank_id = [{'title': gettext(rank_map[int(v['val'])]), 'val': v['val'], 'count': v['taxon_id']['numBuckets']} for v in rank_id]
            else:
                rank_id = [{'title': gettext(rank_map_c[int(v['val'])]), 'val': v['val'], 'count': v['taxon_id']['numBuckets']} for v in rank_id]
        else:
            if get_language() == 'en-us':
                rank_id = [{'title': gettext(rank_map[int(v['val'])]), 'val': v['val'], 'count': v['count']} for v in rank_id]
            else:
                rank_id = [{'title': gettext(rank_map_c[int(v['val'])]), 'val': v['val'], 'count': v['count']} for v in rank_id]
        response['facet']['rank'] = rank_id

    if 'is_endemic' in resp['facets'].keys():
        is_endemic = resp['facets']['is_endemic']['buckets']
        if is_chinese:
            is_endemic = [{'title': gettext('臺灣特有'), 'val': v['val'], 'count': v['taxon_id']['numBuckets']} for v in is_endemic if v['val'] == True ]
        else:
            is_endemic = [{'title': gettext('臺灣特有'), 'val': v['val'], 'count': v['count']} for v in is_endemic if v['val'] == True ]
        response['facet']['is_endemic'] = is_endemic

    if 'alien_type' in resp['facets'].keys():
        alien_type = resp['facets']['alien_type']['buckets']
        if is_chinese:
            alien_type = [{'title': gettext(attr_map_c[v['val']]), 'val': v['val'], 'count': v['taxon_id']['numBuckets']} for v in alien_type]
        else:
            alien_type = [{'title': gettext(attr_map_c[v['val']]), 'val': v['val'], 'count': v['count']} for v in alien_type]
        response['facet']['alien_type'] = alien_type

    return response

def catalogue_search(request):
    response = {}
    keyword = request.GET.get('keyword', '').strip()
    limit = 20

    response = {'count': {'total':[{'count':0}]},'page': {'total_page':0, 'page_list': []},'data':[]}

    if request.method == 'POST':
        req = request.POST
        
        # 先確認是不是taxonID 若是的話直接跳轉至物種頁

        if req.get('keyword'):
            taxon_resp = requests.get('{}taxa/select?q=taxon_id:{}'.format(SOLR_PREFIX, req.get('keyword')))
            taxon_resp = taxon_resp.json()
            if taxon_resp['response']['numFound']:
                return HttpResponse(json.dumps({'is_taxon_id': True, 'taxon_id': req.get('keyword')},cls=NpEncoder))

        offset = limit * (int(req.get('page',1))-1)

        solr_query_list, is_chinese = get_conditioned_solr_search(req)
        response = get_solr_data_search(solr_query_list, offset, response, limit, is_chinese)

        response['header'] = f"""
            <tr>
                <td>{gettext('學名')}</td>
                <td>{gettext('中文名')}</td>
                <td>{gettext('地位')}</td>
                <td>{gettext('原生/外來/特有性')}</td>
                <td>{gettext('階層')}</td>
                <td>{gettext('所屬類群')}</td>
                <td>{gettext('界')}</td>
            </tr>
            """
        
        response['next'] = gettext('下一頁')
        response['prev'] = gettext('上一頁')

        return HttpResponse(json.dumps(response,cls=NpEncoder))

    # 0 不開 1 開一層 2 全開
    filter = request.GET.get('filter', 1)
    return render(request, 'taxa/catalogue.html', {'filter': filter, 'ranks': rank_map_c, 'keyword': keyword})


def get_conditioned_solr_search(req): 

    query_list = []

    # 如果有facet的話

    if req.get('facet') and req.get('facet_value'):
        if req.get('facet') == 'rank':
            facet = 'rank_id'
        elif req.get('facet') == 'endemic':
            facet = 'is_endemic'
        else:
            facet = req.get('facet') 
            
        query_list.append('{}:{}'.format(facet, req.get('facet_value')))

    # NOTE 這邊是一定要加的 在網站的查詢一律只回傳 is_in_taiwan=1  的資料
    query_list.append('is_in_taiwan:true')
    query_list.append('is_deleted:false')

    # 如果有輸入keyword的話preselect 但是limit offset要加在preselect這邊
    # /.* .*/

    is_chinese = False

    if keyword := req.get('keyword','').strip():

        if re.search(r'[\u4e00-\u9fff]+', keyword):
            is_chinese = True

        keyword = unicode_to_plain(keyword)

        keyword_w_rank = remove_rank_char(keyword)

        keyword = escape_solr_query(keyword)
        keyword = get_variants(keyword)

        keyword_w_rank = get_variants(keyword_w_rank)
        keyword_type = req.get('name-select','equal')

        
        if keyword_type == "equal":
            # 中文名可能有異體字 英文名有大小寫問題 要修改成REGEXP
            keyword_str = f"search_name:/{keyword}/ OR search_name_wo_rank:/{keyword}/"
        elif keyword_type == "startwith":
            keyword_str = f"search_name:/{keyword}.*/ OR search_name_wo_rank:/{keyword}.*/"
        else: # contain
            keyword_str = f"search_name:/.*{keyword}.*/ OR search_name_wo_rank:/.*{keyword}.*/"

        query_list.append(keyword_str)

    # 如果沒有keyword的話 要排除掉搜尋中文名的資料 不然會有重複的問題

    if not is_chinese:
        query_list.append('taxon_name_id:*') # 確保不是中文名

    # 地位
    if status := req.getlist('status'):
        if len(status) < 3:
            ss_list = []
            for ss in status:
                ss_list.append(f'status:"{ss}"')
            query_list.append(f"({' OR '.join(ss_list)})")

    # is_ 系列

    if req.get('is_endemic'):
        query_list.append('is_endemic:true')

    is_list = ['is_terrestrial','is_freshwater','is_brackish','is_marine']
    is_cond = []
    for i in is_list:
        if req.get(i):
            is_cond.append(f"{i}:true")

    if is_cond:
        query_list.append(f"({' OR '.join(is_cond)})")

    # fossil要獨立出來

    if req.get('is_fossil'):
        query_list.append('is_fossil:true')

    # rank

    rank = req.getlist('rank')
    if rank:
        rr_list = []
        for r in rank:
            rr_list.append(f'rank_id:{int(r)}')
        query_list.append(f"({' OR '.join(rr_list)})")


    # alien_type

    if alien_type := req.getlist('alien_type'):
        # c = 1
        aa_list = []
        for a in alien_type:
            aa_list.append(f'alien_type:"{a}"')
        query_list.append(f"({' OR '.join(aa_list)})")


    # 日期
    # 不用考慮時差 已經是 UTC +8

    if date := req.get('date'):
        date_type = req.get('date-select','gl')
        
        if date_type == "gl":
            date += 'T00:00:00Z'
            query_list.append(f'updated_at:[{date} TO *]')
        elif date_type == "sl":
            date += 'T23:59:59Z'
            query_list.append(f'updated_at:[* TO {date}]')
        else:
            query_list.append(f'updated_at:[{date}T00:00:00Z TO {date}T23:59:59Z]')

    # 保育資訊

    for con in ['protected','redlist','iucn']:
        if cs := req.getlist(con):
            cs_list = []
            for css in cs:
                if css == 'none':
                    cs_list.append(f'-{con}:*')
                else:
                    cs_list.append(f'{con}:"{css}"')
            if cs_list:
                c_str = f"({' OR '.join(cs_list)})"
                query_list.append(c_str)

    # CITES類別要用like

    if cs := req.getlist('cites'):
        cs_list = []
        for css in cs:
            if css == 'none':
                cs_list.append(f'-cites:*')
            else:
                cs_list.append(f'cites:/.*{css}.*/')
        if cs_list:
            c_str = f"({' OR '.join(cs_list)})"
            query_list.append(c_str)

    # 較高分類群

    if higher_taxon_ids := req.getlist('higherTaxa'):
        higher_list = []
        for h in higher_taxon_ids:
            higher_list.append(f'path:/.*{h}.*/')

        query_list.append(f"({' OR '.join(higher_list)})")


    # 常見類群
    if bio_group := req.get('bio_group-select'):
        if bio_group in bio_group_map.keys():
            bio_group_list = []
            bio_groups = bio_group_map[bio_group]
            for b in bio_groups:
                bio_group_list.append(f'path:/.*{b}.*/')
            query_list.append(f"({' OR '.join(bio_group_list)})")


    return query_list, is_chinese
