from django.shortcuts import render, redirect
from taxa.utils import *
from django.http import HttpResponse,JsonResponse
import json
from conf.settings import env, MEDIA_URL
import pymysql
import pandas as pd
import numpy as np
import math
import re
import glob
import os
import datetime
from taxa.models import Expert, Feedback, SearchStat
from django.contrib.postgres.aggregates import StringAgg
import time
import requests
from django.db.models import F
from django.utils import timezone
from django.core.mail import send_mail
import threading
from django.template.loader import render_to_string

from django.contrib import messages

db_settings = {
    "host": env('DB_HOST'),
    "port": int(env('DB_PORT')),
    "user": env('DB_USER'),
    "password": env('DB_PASSWORD'),
    "db": env('DB_DBNAME'),
}


def send_download_request(request):
    task = threading.Thread(target=download_search_results_offline, args=(request,))
    # task.daemon = True
    task.start()
    return JsonResponse({"status": 'success'}, safe=False)


def download_search_results_offline(request):
    req = request.POST
    file_format = req.get('file_format','csv')
    # subset by taxon_id
    base = get_conditioned_query(req, from_url=True) # 不考慮facet選項
    query = f"""SELECT distinct(at.taxon_id) {base}"""
    conn = pymysql.connect(**db_settings)
    tids = []
    with conn.cursor() as cursor:
        cursor.execute(query)
        tids = cursor.fetchall()
        tids = [t[0] for t in tids]
        conn.close()

    df = get_download_file(tids)
    # df_file_name = 

    if file_format == 'json':
        df_file_name = f'taicol_download_{datetime.datetime.now().strftime("%Y%m%d%H%M%s")}.json'
        # response = HttpResponse(content_type="application/json")
        # response['Content-Disposition'] =  f'attachment; filename=taicol_download_{datetime.datetime.now().strftime("%Y%m%d%H%M%s")}.json'
        df.to_json(f'/tc-web-volumes/media/download/{df_file_name}', orient='records')
    else:
        df_file_name = f'taicol_download_{datetime.datetime.now().strftime("%Y%m%d%H%M%s")}.csv'
        # response = HttpResponse(content_type='text/csv')
        # response['Content-Disposition'] =  f'attachment; filename=taicol_download_{datetime.datetime.now().strftime("%Y%m%d%H%M%s")}.csv'
        df.to_csv(f'/tc-web-volumes/media/download/{df_file_name}', index=False)

    download_url = request.scheme+"://" + request.META['HTTP_HOST']+ MEDIA_URL + os.path.join('download', df_file_name)
    if env('WEB_ENV') != 'dev':
        download_url = download_url.replace('http', 'https')

    email_body = render_to_string('taxa/download.html', {'download_url': download_url, })
    send_mail('[TaiCOL] 下載資料', email_body, 'no-reply@taicol.tw', [req.get('download_email')])


def download_search_results(request):
    req = request.POST
    file_format = req.get('file_format','csv')
    # subset by taxon_id
    base = get_conditioned_query(req, from_url=True) # 不考慮facet選項
    query = f"""SELECT distinct(at.taxon_id) {base}"""
    conn = pymysql.connect(**db_settings)
    tids = []
    with conn.cursor() as cursor:
        cursor.execute(query)
        tids = cursor.fetchall()
        tids = [t[0] for t in tids]
        conn.close()

    df = get_download_file(tids)

    if file_format == 'json':
        response = HttpResponse(content_type="application/json")
        response['Content-Disposition'] =  f'attachment; filename=taicol_download_{datetime.datetime.now().strftime("%Y%m%d%H%M%s")}.json'
        df.to_json(response, orient='records')
    else:
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] =  f'attachment; filename=taicol_download_{datetime.datetime.now().strftime("%Y%m%d%H%M%s")}.csv'
        df.to_csv(response, index=False)

    return response


def get_autocomplete_taxon(request):
    names = []
    if keyword_str := request.GET.get('keyword','').strip():
        keyword_str = get_variants(keyword_str)
        cultured_condition = ''
        if request.GET.get('cultured') != 'on':
            cultured_condition = ' AND at.is_cultured != 1'
        if request.GET.get('from_tree'):
            query = f"""SELECT at.taxon_id, CONCAT_WS (' ',tn.name, CONCAT_WS(',', at.common_name_c, at.alternative_name_c))
                FROM taxon_names tn
                JOIN api_taxon at ON at.accepted_taxon_name_id = tn.id
                JOIN api_taxon_tree att ON att.taxon_id = at.taxon_id
                WHERE tn.deleted_at IS NULL AND at.is_in_taiwan = 1 AND at.is_deleted != 1 {cultured_condition} AND (tn.name REGEXP '{keyword_str}' OR 
                    at.common_name_c REGEXP '{keyword_str}' OR at.alternative_name_c REGEXP '{keyword_str}')"""
        else:
            query = f"""SELECT at.taxon_id, CONCAT_WS (' ',tn.name, CONCAT_WS(',', at.common_name_c, at.alternative_name_c))
                        FROM taxon_names tn
                        JOIN api_taxon at ON at.accepted_taxon_name_id = tn.id
                        WHERE tn.deleted_at IS NULL AND at.is_in_taiwan = 1 AND at.is_deleted != 1 {cultured_condition}  AND (tn.name REGEXP '{keyword_str}' OR 
                        at.common_name_c REGEXP '{keyword_str}' OR at.alternative_name_c REGEXP '{keyword_str}')"""
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            cursor.execute(query)
            results = cursor.fetchall()
            conn.close()
            for r in results:
                names += [{'text': r[1], 'id': r[0]}]
    return HttpResponse(json.dumps(names), content_type='application/json') 


def get_conditioned_query(req, from_url=False):

    condition = 'tn.deleted_at IS NULL AND at.is_in_taiwan = 1 AND at.is_deleted != 1 AND atu.is_deleted = 0'

    if keyword := req.get('keyword','').strip():
        keyword = get_variants(keyword)
        keyword_type = req.get('name-select','contain')
        if keyword_type == "equal":
            keyword_str = f"REGEXP '^{keyword}$'"
        elif keyword_type == "startwith":
            keyword_str = f"REGEXP '^{keyword}'"
        else:
            keyword_str = f"REGEXP '{keyword}'"
        condition += f""" AND (tn.name {keyword_str} OR at.common_name_c {keyword_str} OR at.alternative_name_c {keyword_str})"""

    # is_ 系列

    if req.get('is_endemic'):
        condition += f" AND at.is_endemic = 1"

    is_list = ['is_terrestrial','is_freshwater','is_brackish','is_marine']
    is_cond = []
    for i in is_list:
        if req.get(i):
            is_cond.append(f"at.{i} = 1")

    if is_cond:
        condition += f" AND ({' OR '.join(is_cond)})"
    
    # rank
    if rank := req.getlist('rank'):
        c = 1
        for r in rank:
            if c == 1:
                r_str = 'tn.rank_id = ' + r
            else:
                r_str += ' OR tn.rank_id = ' + r
            c += 1
        if 'OR' in r_str:
            r_str = f" AND ({r_str})"
        else:
            r_str = f" AND {r_str}"
        condition += r_str

    # alien_type
    if alien_type := req.getlist('alien_type'):
        c = 1
        for a in alien_type:
            if c == 1:
                a_str = '''JSON_CONTAINS(at.alien_type, '{"alien_type":"''' + a + '''"}')  > 0'''
            else:
                a_str += ''' OR JSON_CONTAINS(at.alien_type, '{"alien_type":"''' + a + '''"}')  > 0'''
            c += 1
        if 'OR' in a_str:
            a_str = f" AND ({a_str})"
        else:
            a_str = f" AND {a_str}"
        condition += a_str

    # 日期
    # 不用考慮時差 已經是 UTC +8
    if date := req.get('date'):
        date_type = req.get('date-select','gl')
        if date_type == "gl":
            condition += f" AND DATE(at.updated_at) > '{date}'"
        elif date_type == "sl":
            condition += f" AND DATE(at.updated_at) < '{date}'"
        else:
            condition += f" AND DATE(at.updated_at) = '{date}'"

    # 保育資訊
    has_conserv = False
    for con in ['protected_category','red_category','iucn_category']:
        if cs := req.getlist(con):
            cs_list = []
            has_conserv = True
            for css in cs:
                if css == 'none':
                    cs_list.append(f'ac.{con} IS NULL')
                else:
                    cs_list.append(f'ac.{con} = "{css}"')
            if cs_list:
                c_str = f" AND ({' OR '.join(cs_list)})"
                condition += c_str

    # CITES類別要用like
    if cs := req.getlist('cites'):
        cs_list = []
        has_conserv = True
        for css in cs:
            if css == 'none':
                cs_list.append(f'ac.cites_listing IS NULL')
            else:
                cs_list.append(f'ac.cites_listing like "%{css}%"')
        if cs_list:
            c_str = f" AND ({' OR '.join(cs_list)})"
            condition += c_str

    conserv_join = ''
    if has_conserv:
        conserv_join = "LEFT JOIN api_conservation ac ON ac.taxon_id = at.taxon_id"

    # 較高分類群
    # path_join = ''
    if higher_taxon_id := req.get('taxon_group'):
        # path_join = "LEFT JOIN api_taxon_tree att ON att.taxon_id = at.taxon_id"
        condition +=  f' AND att.path like "%>{higher_taxon_id}%"'

    if not from_url:
        if facet := req.get('facet'):
            value = req.get('value')
            if facet == 'rank':
                condition += f" AND tn.rank_id = {int(value)}"
            elif facet == 'kingdom':
                # path_join = "LEFT JOIN api_taxon_tree att ON att.taxon_id = at.taxon_id"
                condition +=  f' AND att.path like "%>{value}%"'
            elif facet == 'endemic':
                condition +=  f' AND at.is_endemic = 1'
            elif facet == 'status':
                condition +=  f' AND atu.status = "{value}"'
            elif facet == 'alien_type':
                condition += ''' AND JSON_CONTAINS(at.alien_type, '{"alien_type":"''' + value + '''"}')  > 0'''

    if condition.startswith(' AND'):
        condition = condition[4:]

    base = f"""
                FROM taxon_names tn 
                JOIN api_taxon_usages atu ON atu.taxon_name_id = tn.id
                JOIN api_taxon at ON atu.taxon_id = at.taxon_id
                LEFT JOIN api_taxon_tree att ON att.taxon_id = at.taxon_id
                {conserv_join}
                WHERE {condition}
            """
    return base



def get_query_data(base, offset, response, limit):
    conn = pymysql.connect(**db_settings)
    base = base.split('WHERE')
    query = f"""
                SELECT distinct(at.taxon_id), tn.name, tn.rank_id, an.formatted_name, at.common_name_c, atu.status,
                    at.is_endemic, at.alien_type, att.path   
                {base[0]}
                JOIN api_names an ON an.taxon_name_id = tn.id
                WHERE {base[1]}
                ORDER BY tn.name LIMIT {limit} OFFSET {offset} 
            """
    with conn.cursor() as cursor:
        cursor.execute(query)
        results = cursor.fetchall()
        results = pd.DataFrame(results, columns=['taxon_id','simple_name','rank','name','common_name_c','status','is_endemic','alien_type','path'])
        conn.close()
        if len(results):
            results = results.drop(columns=['simple_name'])
            results = results.drop_duplicates()
            results = results.reset_index()
            results['kingdom'] = 3
            results['taxon_group'] = 0
            higher_taxa = pd.DataFrame(columns=['taxon_id','rank_id','name'])
            p = []
            for i in results.index:
                if results.iloc[i].path:
                    path = results.iloc[i].path.split('>')
                    p += [pa for pa in path if pa not in p]
                    if results.iloc[i]['rank'] <= 3:
                        results.loc[i,'taxon_group'] = None
                    elif results.iloc[i]['rank'] < 30: # 屬以上取上層
                        higher = [h for h in [3,12,18,22,26] if h < results.iloc[i]['rank']]
                        results.loc[i,'taxon_group'] = higher[-1]
                    else: # 取科
                        results.loc[i,'taxon_group'] = 26
            if p:
                query = f"SELECT t.taxon_id, t.rank_id, CONCAT_WS(' ', t.common_name_c, tn.name) \
                        FROM api_taxon t \
                        JOIN taxon_names tn ON t.accepted_taxon_name_id = tn.id \
                        WHERE t.taxon_id IN %s AND t.rank_id IN (3,12,18,22,26)"
                conn = pymysql.connect(**db_settings)
                with conn.cursor() as cursor:
                    cursor.execute(query, (p,))
                    higher_taxa = cursor.fetchall()
                    higher_taxa = pd.DataFrame(higher_taxa, columns=['taxon_id','rank_id','name'])
                    conn.close()
                    # 界
            kingdoms = higher_taxa[(higher_taxa.rank_id==3)].taxon_id.to_list()
            for i in results.index:
                alt_list = []
                if results.iloc[i].alien_type:
                    for at in json.loads(results.iloc[i].alien_type):
                        alt_list.append(alien_map_c[at.get('alien_type')])
                alt_list = list(dict.fromkeys(alt_list))
                results.loc[i,'alien_type'] = ','.join(alt_list)
                if results.iloc[i].path:
                    path = results.iloc[i].path.split('>')
                    ks = [k for k in kingdoms if k in path]
                    if ks:
                        results.loc[i,'kingdom'] = higher_taxa[higher_taxa.taxon_id==ks[0]].name.values[0]
                    else:
                        results.loc[i,'kingdom'] = ''
                    # 所屬類群
                    t_groups = higher_taxa[(higher_taxa.rank_id==results.iloc[i].taxon_group)].taxon_id.to_list()
                    ts = [t for t in t_groups if t in path]
                    if ts:
                        results.loc[i,'taxon_group'] = higher_taxa[higher_taxa.taxon_id==ts[0]].name.values[0]
                    else:
                        results.loc[i,'taxon_group'] = ''
                else:
                    results.loc[i,'kingdom'] = ''
                    results.loc[i,'taxon_group'] = ''
            results['rank'] = results['rank'].apply(lambda x: rank_map_c[x])
            results['status'] = results['status'].apply(lambda x: status_map_c[x] if x else None)
            results['is_endemic'] = results['is_endemic'].apply(lambda x: '臺灣特有' if x == 1 else None)
            results = results.drop(columns=['path'])
            results = results.replace({np.nan: '', None: ''})
            results = results.to_json(orient='records')
            response['data'] = json.loads(results)
    return response


def update_catalogue_table(request):
    response = {}
    req = request.POST
    page = int(req.get('page', 1))
    limit = 20
    base = get_conditioned_query(req)
    # pagination
    response['page'] = {}
    if req.get('facet'):
        first_query = f"SELECT COUNT(distinct tn.id, at.id, atu.status) {base}"
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            cursor.execute(first_query)
            count = cursor.fetchone()
            response['total_count'] = count[0]
            response['page']['total_page'] = math.ceil((count[0]) / limit)
            conn.close()
    else:
        response['page']['total_page'] = int(req.get('total_page'))

    response['page']['current_page'] = page
    response['page']['page_list'] = get_page_list(response['page']['current_page'], response['page']['total_page'])

    # 以下的query和起始的相同
    offset = limit * (page-1)
    response = get_query_data(base, offset, response, limit)

    return HttpResponse(json.dumps(response), content_type='application/json')


def catalogue(request):
    response = {}
    # print(request.POST)
    keyword = request.GET.get('keyword', '').strip()
    limit = 20
    if request.method == 'POST':
        req = request.POST
        offset = limit * (int(req.get('page',1))-1)
        base = get_conditioned_query(req, from_url=True)
        count_query = f"""SELECT distinct tn.id, at.id, atu.status, tn.rank_id, at.alien_type, at.is_endemic, SUBSTRING(att.path, -8, 8)
                        {base}
                        """
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            cursor.execute(count_query)
            count = pd.DataFrame(cursor.fetchall(),columns=['taxon_name_id','t_id','status','rank','alien_type','is_endemic','kingdom'])
            conn.close()
        if len(count):
            response['count'] = {}
            # 左側統計 界, 階層, 原生/特有性, 地位
            count['is_endemic_c'] = count['is_endemic'].apply(lambda x: '臺灣特有' if x == '1' or x == 1 else None)
            tmp_alien_type = {}
            for at in count['alien_type']:
                alt_list = []
                if at:
                    for att in json.loads(at):
                        # if att.get('alien_type') not in alt_list:
                        alt_list.append(att.get('alien_type'))
                alt_list = list(dict.fromkeys(alt_list))
                for atl in alt_list:
                    if atl not in tmp_alien_type.keys():
                        tmp_alien_type[atl] = 1
                    else:
                        tmp_alien_type[atl] += 1
            count['status_c'] = count['status'].apply(lambda x: status_map_c[x] if x else None)
            count['rank_c'] = count['rank'].apply(lambda x: rank_map_c[int(x)])
            count['kingdom_c'] = count['kingdom'].apply(lambda x: kingdom_map[x]['common_name_c'] if x in kingdom_map.keys() else None)
            count = count.replace({np.nan: '', None: ''})
            facet = ['is_endemic','status','kingdom','rank']
            for f in facet:
                response['count'][f] = count[~count[f"{f}_c"].isin([None,''])].groupby([f,f"{f}_c"])['t_id'].count().reset_index().rename(columns={'t_id':'count',f:'category', f"{f}_c":'category_c'}).to_dict('records')
            alt_count = []
            for k in tmp_alien_type.keys():
                alt_count.append({'category': k, 'category_c': alien_map_c[k], 'count': tmp_alien_type.get(k)})
            response['count']['alien_type'] = alt_count
            response['count']['total'] = [{'count':len(count)}]
            # pagination
            response['page'] = {}
            response['page']['total_page'] = math.ceil((response['count']['total'][0]['count']) / limit)
            response['page']['current_page'] = offset / limit + 1
            response['page']['page_list'] = get_page_list(response['page']['current_page'], response['page']['total_page'])
            response = get_query_data(base, offset, response, limit)
        else:
            response = {'count': {'total':[{'count':0}]},'page': {'total_page':0, 'page_list': []},'data':[]}
        return HttpResponse(json.dumps(response), content_type='application/json')
    # 0 不開 1 開一層 2 全開
    filter = request.GET.get('filter', 1)
    return render(request, 'taxa/catalogue.html', {'filter': filter, 'ranks': rank_map_c, 'keyword': keyword})


def name_match(request):
    return render(request, 'taxa/name_match.html')


def taxon(request, taxon_id):
    stat_str, taxon_group_str = '', ''
    refs, new_refs, experts, links, name_changes, taxon_history, name_history,short_refs = [], [], [], [], [], [], [], []
    data = {}
    # 確認是否已刪除 & 如果是國外物種不顯示
    is_deleted = 0
    is_in_taiwan = 0
    has_taxon = False
    conn = pymysql.connect(**db_settings)
    with conn.cursor() as cursor:
        cursor.execute("SELECT is_deleted, is_in_taiwan FROM api_taxon WHERE taxon_id = %s",taxon_id)
        info = cursor.fetchone()
        if info:
            is_deleted = info[0]
            is_in_taiwan = info[1]
            has_taxon = True
        conn.close()
    if not is_deleted and has_taxon:
        query = f"""SELECT tn.name, an.formatted_name as f_name, concat_WS(' ', an.formatted_name, an.name_author ) as sci_name, 
                    at.common_name_c, at.accepted_taxon_name_id as name_id, at.rank_id,
                    CONCAT(r.display ->> '$."zh-tw"', ' ', r.display ->> '$."en-us"') as rank_d,
                    atu.status, att.path, at.is_endemic, at.is_terrestrial, at.is_freshwater, at.is_brackish,
                    at.is_marine, at.is_in_taiwan, at.alien_type,
                    ac.cites_listing, ac.cites_note, ac.iucn_category, ac.iucn_note, ac.iucn_taxon_id, 
                    ac.red_category, ac.red_note, ac.protected_category, ac.protected_note,
                    tn.original_taxon_name_id, at.links, anc.namecode, at.alternative_name_c, at.is_in_taiwan, at.is_cultured,
                    CONCAT_WS (' ',tn.name, CONCAT_WS(',', at.common_name_c, at.alternative_name_c)) as taxon_group_str
                    FROM api_taxon at 
                    LEFT JOIN api_names an ON at.accepted_taxon_name_id =  an.taxon_name_id 
                    LEFT JOIN api_namecode anc ON at.accepted_taxon_name_id =  anc.taxon_name_id 
                    JOIN ranks r ON at.rank_id = r.id
                    JOIN api_taxon_usages atu ON at.taxon_id = atu.taxon_id
                    LEFT JOIN api_taxon_tree att ON at.taxon_id = att.taxon_id
                    LEFT JOIN api_conservation ac ON at.taxon_id = ac.taxon_id 
                    JOIN taxon_names tn ON at.accepted_taxon_name_id = tn.id
                    WHERE at.taxon_id = %s AND atu.is_deleted = 0 AND atu.is_latest = 1
                """
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            cursor.execute(query, (taxon_id, ))
            results = cursor.fetchone()
            conn.close()
            if results:
                for i in range(len(cursor.description)):
                    data[cursor.description[i][0]] = results[i]
                # 照片
                data['images'] = []
                if data['namecode']:
                    url = 'https://data.taieol.tw/eol/endpoint/image/species/{}'.format(data['namecode'])
                    r = requests.get(url)
                    img = r.json()
                    for ii in img:
                        foto = {'author':ii['author'], 'src':ii['image_big'], 'provider':ii['provider'],'permalink': ii['permalink']}
                        data['images'].append(foto)
                        
                # 學名
                if data['rank_id'] == 47:
                    query = f"WITH view as (SELECT tnhp.taxon_name_id, CONCAT_WS(' ',an.formatted_name, an.name_author ) as sci_name FROM taxon_name_hybrid_parent tnhp \
                            JOIN api_names an ON tnhp.parent_taxon_name_id = an.taxon_name_id \
                            WHERE tnhp.taxon_name_id = %s \
                            ORDER BY tnhp.order) \
                            SELECT group_concat(sci_name SEPARATOR ' × ') FROM view \
                            GROUP BY taxon_name_id "
                    conn = pymysql.connect(**db_settings)
                    with conn.cursor() as cursor:
                        cursor.execute(query, (data['name_id'],))
                        n = cursor.fetchone()
                        conn.close()
                        if n:
                            data['sci_name'] = n[0] 
                data['status'] = f"{status_map_taxon_c[data['status']]['zh-tw']} {status_map_taxon_c[data['status']]['en-us']}"
                is_list = ['is_endemic','is_terrestrial','is_freshwater','is_brackish','is_marine']
                data['is_list'] = []
                for i in is_list:
                    if data[i] == 1:
                        data['is_list'].append(is_map_c[i])
                if not is_in_taiwan:
                    data['is_list'].append('不存在於臺灣')
                
                # 保育資訊
                if c_cites := data['cites_listing']:
                    c_list = c_cites.split('/')
                    c_list_str = []
                    for cl in c_list:
                        c_list_str += [cites_map_c[cl]]
                    data['cites_listing'] = '/'.join(c_list_str)

                if data['cites_note']:
                    if len(json.loads(data['cites_note'])) > 1:
                        c_str = ''
                        for c in json.loads(data['cites_note']):
                            c_str += f"{c['listing']}，{c['name']}；"
                            if c.get('is_primary'):
                                data['cites_url'] = "https://checklist.cites.org/#/en/search/output_layout=taxonomic&scientific_name=" + c['name']
                        data['cites_note'] = c_str.rstrip('；')
                    elif len(json.loads(data['cites_note'])) == 1:
                        if json.loads(data['cites_note'])[0].get('is_primary'):
                            data['cites_url'] = "https://checklist.cites.org/#/en/search/output_layout=taxonomic&scientific_name=" + json.loads(data['cites_note'])[0]['name']
                        data['cites_note'] = ''
                    else:
                        data['cites_note'] = ''

                if c_iucn := data['iucn_category']:
                    data['iucn_category'] = iucn_map_c[c_iucn] + ' ' + c_iucn
                    data['iucn_url'] = "https://apiv3.iucnredlist.org/api/v3/taxonredirect/" + str(data['iucn_taxon_id'])

                if data['iucn_note']:
                    if len(json.loads(data['iucn_note'])) > 1:
                        c_str = ''
                        for c in json.loads(data['iucn_note']):
                            c_str += f"{c['category']}，{c['name']}；"
                        data['iucn_note'] = c_str.rstrip('；')
                    else:
                        data['iucn_note'] = ''

                if c_red := data['red_category']:
                    data['red_category'] = redlist_map_c[c_red] + ' ' + c_red

                if data['red_note']:
                    if len(json.loads(data['red_note'])) > 1:
                        c_str = ''
                        for c in json.loads(data['red_note']):
                            c_str += f"{c['red_category']}，{c['name']}；<br>"
                        data['red_note'] = c_str.rstrip('；<br>')
                    else:
                        data['red_note'] = ''

                if c_protected := data['protected_category']:
                    data['protected_category'] = f'第 {c_protected} 級 {protected_map_c[c_protected]}'

                if data['protected_note']:
                    if len(json.loads(data['protected_note'])) > 1:
                        c_str = ''
                        for c in json.loads(data['protected_note']):
                            c_str += f"{c['category']}，{c['name']}；"
                        data['protected_note'] = c_str.rstrip('；')
                    else:
                        data['protected_note'] = ''

                # 高階層
                data['higher'] = []
                if data['path']:
                    path = data['path'].split('>')
                    # 專家列表
                    # 如果同一個專家有多個taxon_group要concat
                    experts = Expert.objects.filter(taxon_id__in=path).values('name','name_e','email').annotate(taxon_group_agg=StringAgg('taxon_group', delimiter=', '))
                    path = [p for p in path if p != taxon_id]
                    if path:
                        query = f"SELECT t.rank_id, t.taxon_id, an.formatted_name, t.common_name_c, CONCAT_WS (' ',tn.name, CONCAT_WS(',', t.common_name_c, t.alternative_name_c)) \
                                FROM api_taxon t \
                                JOIN api_names an ON t.accepted_taxon_name_id = an.taxon_name_id \
                                JOIN taxon_names tn ON t.accepted_taxon_name_id = tn.id \
                                WHERE t.taxon_id IN %s and t.rank_id >= 3 \
                                ORDER BY t.rank_id ASC"
                        conn = pymysql.connect(**db_settings)
                        with conn.cursor() as cursor:
                            cursor.execute(query,(path,))
                            higher = cursor.fetchall()
                            conn.close()
                            higher = pd.DataFrame(higher, columns=['rank_id','taxon_id','formatted_name','common_name_c', 'taxon_group_str'])
                            # 補上階層未定 
                            # 先找出應該要有哪些林奈階層
                            current_ranks = higher.rank_id.to_list() + [data['rank_id']]
                            for x in lin_map.keys():
                                if x not in current_ranks and x < max(current_ranks) and x > min(current_ranks):
                                    higher = pd.concat([higher, pd.Series({'rank_id': x, 'common_name_c': '地位未定', 'taxon_id': None}).to_frame().T], ignore_index=True)
                            # 從最大的rank開始補
                            higher = higher.sort_values('rank_id', ignore_index=True, ascending=False)
                            for hi in higher[higher.taxon_id.isnull()].index:
                                found_hi = hi + 1
                                if found_hi < len(higher):
                                    while not higher.loc[found_hi].taxon_id:
                                        found_hi += 1
                                higher.loc[hi, 'formatted_name'] = f'{higher.loc[found_hi].formatted_name} {lin_map[higher.loc[hi].rank_id]} incertae sedis'
                            higher = higher.replace({None: '', np.nan: ''})
                            higher = higher.sort_values('rank_id', ignore_index=True)
                            for h in higher.index:
                                current_h_row = higher.loc[h]
                                current_h_dict = {}
                                current_h_dict['a_content'] = f'{current_h_row.formatted_name} {current_h_row.common_name_c}'
                                if current_h_row.taxon_id:
                                    taxon_href = '/taxon/' + current_h_row.taxon_id
                                    current_h_dict['a_href'] = taxon_href
                                    current_h_dict['search_href'] = f"/catalogue?taxon_group={current_h_row.taxon_id}&taxon_group_str={current_h_row.taxon_group_str}"
                                else:
                                    current_h_dict['a_href'] = None
                                    current_h_dict['search_href'] = None
                                current_h_dict['rank_c'] = rank_map_c[current_h_row.rank_id]
                                if higher.loc[h].rank_id in lin_ranks: # 林奈階層
                                    current_h_dict['rank_color'] = rank_color_map[current_h_row.rank_id]
                                else:
                                    current_h_dict['rank_color'] = 'rank-second-gray'
                                data['higher'].append(current_h_dict)
                else:
                    experts = Expert.objects.filter(taxon_id=taxon_id)

                # 學名變遷
                # 需確認是不是原始組合名
                query = f"""SELECT atu.taxon_name_id, an.formatted_name, an.name_author, ac.short_author, atu.status,
                            ru.status, JSON_EXTRACT(ru.properties, '$.is_in_taiwan'), tn.nomenclature_id, 
                            tn.publish_year, ru.per_usages,
                            ru.reference_id, tn.reference_id, r.publish_year, tn.rank_id, r.type, tn.original_taxon_name_id
                            FROM api_taxon_usages atu 
                            LEFT JOIN api_names an ON an.taxon_name_id = atu.taxon_name_id
                            LEFT JOIN reference_usages ru ON ru.id = atu.reference_usage_id
                            JOIN `references` r ON r.id = ru.reference_id
                            LEFT JOIN api_citations ac ON ac.reference_id = ru.reference_id
                            JOIN taxon_names tn ON tn.id = atu.taxon_name_id
                            WHERE atu.taxon_id = %s AND atu.is_deleted = 0"""
                conn = pymysql.connect(**db_settings)
                with conn.cursor() as cursor:
                    cursor.execute(query, (taxon_id, ))
                    names = cursor.fetchall()
                    conn.close()
                    names = pd.DataFrame(names, columns=['taxon_name_id','sci_name','author','ref','taxon_status','ru_status',
                                                        'is_taiwan','nomenclature_id','publish_year','per_usages','reference_id', 
                                                        'o_reference_id','r_publish_year','rank_id','r_type','original_taxon_name_id'])
                    if len(names):
                        names = names.sort_values('publish_year', ascending=False)
                        names = names.replace({None:'',np.nan:''})
                        # names.loc[names.taxon_name_id==data['name_id'],'sci_name'] = data['sci_name']
                        for tnid in names[(names.taxon_name_id!=data['name_id'])&(names.rank_id==47)].taxon_name_id:
                            query = f"WITH view as (SELECT tnhp.taxon_name_id, CONCAT_WS(' ',an.formatted_name, an.name_author ) as sci_name FROM taxon_name_hybrid_parent tnhp \
                                JOIN api_names an ON tnhp.parent_taxon_name_id = an.taxon_name_id \
                                WHERE tnhp.taxon_name_id = %s \
                                ORDER BY tnhp.order) \
                                SELECT group_concat(sci_name SEPARATOR ' × ') FROM view \
                                GROUP BY taxon_name_id "
                            conn = pymysql.connect(**db_settings)
                            with conn.cursor() as cursor:
                                cursor.execute(query, (tnid,))
                                n = cursor.fetchone()
                                conn.close()
                                if n:
                                    names.loc[names.taxon_name_id==tnid,'sci_name'] = n[0] 
                        names['per_usages'] = names['per_usages'].apply(json.loads)
                        names['sci_name_ori'] = names['sci_name']
                        names['sci_name_ori_1'] = names['sci_name'] # 為了學名排序
                        names['author'] = names.apply(lambda x: f"{x.author}, {x.publish_year}" if x.nomenclature_id==2 and x.publish_year else x.author, axis=1)
                        names['author'] = names.apply(lambda x: f'<a href="https://nametool.taicol.tw/references/{int(x.o_reference_id)}" target="_blank">{x.author}</a>' if x.o_reference_id and not x.original_taxon_name_id else x.author, axis=1)
                        names['sci_name'] = names.apply(lambda x: f'{x.sci_name} {x.author}' if x.author else x.sci_name, axis=1)
                        names['sci_name'] = names.apply(lambda x: f'<a href="https://nametool.taicol.tw/taxon-names/{int(x.taxon_name_id)}" target="_blank">{x.sci_name}</a>', axis=1)
                        names['sci_name_ori'] = names.apply(lambda x: f'<a href="https://nametool.taicol.tw/taxon-names/{int(x.taxon_name_id)}" target="_blank">{x.sci_name_ori}</a>', axis=1)
                        # 如果per_usages中有其他ref則補上
                        for pp in names['per_usages']:
                            for p in pp:
                                if p.get('reference_id') not in new_refs:
                                    new_refs.append(p.get('reference_id'))
                        if new_refs:
                            query = f"""SELECT ac.reference_id, ac.short_author, r.publish_year, r.type
                                        FROM api_citations ac 
                                        JOIN `references` r ON r.id = ac.reference_id
                                        WHERE ac.reference_id IN %s"""
                            conn = pymysql.connect(**db_settings)
                            with conn.cursor() as cursor:
                                cursor.execute(query, (new_refs, ))
                                usage_refs = cursor.fetchall()
                                usage_refs = pd.DataFrame(usage_refs, columns=['reference_id','ref','publish_year','r_type'])
                                conn.close()
                        # names = names.append(usage_refs).reset_index(drop=True)
                        for n in names.taxon_name_id.unique():
                            has_original = False
                            # 如果名字有原始組合名 且nomenclature_id=2 就不能排除掉 o_reference_id
                            if len(names[(names.taxon_name_id==n)&(names.original_taxon_name_id!='')&(names.nomenclature_id==1)]):
                                has_original = True
                            ref_list = []
                            ref_str = ''
                            # 如果是原始組合名
                            if n == data['original_taxon_name_id']:
                                if len(names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].ref):
                                    # ref_list = [r for r in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].ref if r ]
                                    for r in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].index:
                                        if names.loc[r].ref:
                                            ref_list += [[names.loc[r].ref, names.loc[r].reference_id, names.loc[r].r_publish_year, names.loc[r].r_type]]
                                    # per_usages
                                for pu in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].per_usages:
                                    for ppu in pu:
                                        if not ppu.get('is_from_published_ref', False):
                                            current_ref = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'ref'].values[0]
                                            current_year = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'publish_year'].values[0]
                                            current_r_type = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'r_type'].values[0]
                                            if ppu.get('pro_parte'):
                                                if current_ref:
                                                    current_ref += ', pro parte'
                                            if current_ref not in ref_list:
                                                ref_list.append([current_ref,ppu.get('reference_id')],current_year, current_r_type)
                                if has_original:
                                    ref_list = [r for r in ref_list if r[3]!=4 ]
                                else:
                                    ref_list = [r for r in ref_list if r[1] not in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].o_reference_id.to_list() and r[3]!=4 ]
                                ref_list = pd.DataFrame(ref_list,columns=['ref','ref_id','year','r_type']).drop_duplicates().sort_values('year')                            
                                ref_list = [f"<a href='https://nametool.taicol.tw/references/{int(r[1]['ref_id'])}' target='_blank'>{r[1]['ref']}</a>" for r in ref_list.iterrows()]
                                ref_str = ('; ').join(ref_list)
                                if ref_str:
                                    name_changes += [[f"{names[names.taxon_name_id==n]['sci_name'].values[0]}; {ref_str}", names[names.taxon_name_id==n]['publish_year'].min(), names[names.taxon_name_id==n]['sci_name_ori_1'].values[0]]]
                                else:
                                    name_changes += [[names[names.taxon_name_id==n]['sci_name'].values[0], names[names.taxon_name_id==n]['publish_year'].min(), names[names.taxon_name_id==n]['sci_name_ori_1'].values[0]]]
                            # 如果是誤用名
                            elif len(names[(names.taxon_name_id==n)&(names.ru_status=='misapplied')]):
                                if len(names[(names.taxon_name_id==n)&(names.ru_status=='accepted')&(names.is_taiwan==1)].ref):
                                    # ref_list += [r for r in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')&(names.is_taiwan==1)].ref if r ]
                                    for r in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')&(names.is_taiwan==1)].index:
                                        if names.loc[r].ref:
                                            ref_list += [[names.loc[r].ref, names.loc[r].reference_id, names.loc[r].publish_year, names.loc[r].r_type]]
                                for pu in names[(names.taxon_name_id==n)&(names.ru_status=='misapplied')].per_usages:
                                    for ppu in pu:
                                        print(ppu)
                                        if not ppu.get('is_from_published_ref', False):
                                            current_ref = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'ref'].values[0]
                                            current_year = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'publish_year'].values[0]
                                            current_r_type = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'r_type'].values[0]
                                            if ppu.get('pro_parte'):
                                                if current_ref:
                                                    current_ref += ', pro parte'
                                            if current_ref not in ref_list:
                                                ref_list.append([current_ref,ppu.get('reference_id'),current_year,current_r_type])
                                if has_original:
                                    ref_list = [r for r in ref_list if r[3]!=4 ]
                                else:
                                    ref_list = [r for r in ref_list if r[1] not in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].o_reference_id.to_list() and r[3]!=4 ]
                                ref_list = pd.DataFrame(ref_list,columns=['ref','ref_id','year','r_type']).drop_duplicates().sort_values('year')
                                min_year = ref_list.year.min()
                                # 決定排序的publish_year
                                ref_list = [f"<a href='https://nametool.taicol.tw/references/{int(r[1]['ref_id'])}' target='_blank'>{r[1]['ref']}</a>" for r in ref_list.iterrows()]
                                ref_str = ('; ').join(ref_list)
                                if ref_str:
                                    name_changes += [[f"{names[names.taxon_name_id==n]['sci_name'].values[0]} (誤用): {ref_str}",min_year, names[names.taxon_name_id==n]['sci_name_ori_1'].values[0]]]
                                else:
                                    name_changes += [[names[names.taxon_name_id==n]['sci_name'].values[0] + ' (誤用)', '', names[names.taxon_name_id==n]['sci_name_ori_1'].values[0]]]
                            # 不是誤用名
                            elif not len(names[(names.taxon_name_id==n)&(names.ru_status=='misapplied')]):
                                if len(names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].ref):
                                    # ref_list = [r for r in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].ref if r ]
                                    for r in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].index:
                                        if names.loc[r].ref:
                                            ref_list += [[names.loc[r].ref, names.loc[r].reference_id, names.loc[r].r_publish_year, names.loc[r].r_type]]
                                for pu in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].per_usages:
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
                                if has_original:
                                    ref_list = [r for r in ref_list if r[3]!=4 ]
                                else:
                                    ref_list = [r for r in ref_list if r[1] not in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].o_reference_id.to_list() and r[3]!=4 ]
                                ref_list = pd.DataFrame(ref_list,columns=['ref','ref_id','year','r_type']).drop_duplicates().sort_values('year')
                                # 決定排序的publish_year
                                ref_list = [f'<a href="https://nametool.taicol.tw/references/{int(r[1]["ref_id"])}" target="_blank">{r[1]["ref"]}</a>' for r in ref_list.iterrows()]
                                ref_str = ('; ').join(ref_list)
                                if ref_str:
                                    name_changes += [[f"{names[names.taxon_name_id==n]['sci_name'].values[0]}: {ref_str}",names[names.taxon_name_id==n]['publish_year'].min(), names[names.taxon_name_id==n]['sci_name_ori_1'].values[0]]]
                                else:
                                    name_changes += [[names[names.taxon_name_id==n]['sci_name'].values[0], names[names.taxon_name_id==n]['publish_year'].min(), names[names.taxon_name_id==n]['sci_name_ori_1'].values[0]]]
                if name_changes:
                    name_changes = pd.DataFrame(name_changes, columns=['name_str','year','name'])
                    name_changes['year'] = name_changes.year.replace({'': None}) # 讓年份為空值的在最後面
                    # name_changes = name_changes.sort_values(by=['year','name'])
                    name_changes = name_changes.sort_values(by=['year'])
                    name_changes = name_changes.name_str.to_list()

                # 文獻
                get_ref_list = new_refs + names.reference_id.to_list()
                if get_ref_list:
                    par1 = get_ref_list
                    query = f"(SELECT distinct(r.id), CONCAT_WS(' ' ,c.author, c.content), r.publish_year, c.author, c.short_author, r.type \
                            FROM api_citations c \
                            JOIN `references` r ON c.reference_id = r.id \
                            WHERE c.reference_id IN %s GROUP BY r.id \
                            UNION  \
                            SELECT distinct(tn.reference_id), CONCAT_WS(' ' ,c.author, c.content), r.publish_year, c.author, c.short_author, r.type \
                            FROM taxon_names tn \
                            JOIN api_citations c ON tn.reference_id = c.reference_id     \
                            JOIN `references` r ON c.reference_id = r.id \
                            WHERE tn.id IN (SELECT taxon_name_id FROM api_taxon_usages WHERE taxon_id = %s AND is_deleted = 0 )) \
                            ORDER BY author ASC, publish_year DESC "  
                else:
                    par1 = taxon_id
                    query = f"(SELECT distinct(r.id), CONCAT_WS(' ' ,c.author, c.content), r.publish_year, c.author, c.short_author, r.type \
                            FROM api_taxon_usages atu \
                            JOIN reference_usages ru ON atu.reference_usage_id = ru.id \
                            JOIN `references` r ON ru.reference_id = r.id \
                            JOIN api_citations c ON ru.reference_id = c.reference_id \
                            WHERE atu.taxon_id = %s and r.type != 4 and ru.status != '' AND atu.is_deleted = 0 GROUP BY r.id \
                            UNION  \
                            SELECT distinct(tn.reference_id), CONCAT_WS(' ' ,c.author, c.content), r.publish_year, c.author, c.short_author, r.type \
                            FROM taxon_names tn \
                            JOIN api_citations c ON tn.reference_id = c.reference_id     \
                            JOIN `references` r ON c.reference_id = r.id \
                            WHERE tn.id IN (SELECT taxon_name_id FROM api_taxon_usages WHERE taxon_id = %s AND is_deleted = 0)) \
                            ORDER BY author ASC, publish_year DESC "  
                # 不給backbone, 要給taxon_names底下的
                conn = pymysql.connect(**db_settings)
                with conn.cursor() as cursor:
                    cursor.execute(query, (par1, taxon_id))
                    refs_r = cursor.fetchall()
                    refs = [[r[0],r[1]] for r in refs_r if [r[0],r[1]] not in refs and r[-1] != 4]
                    short_refs = [[r[0],r[4]] for r in refs_r if [r[0],r[4]] not in short_refs and r[-1] != 4]
                    conn.close()
                
                ref_df = pd.DataFrame(short_refs, columns=['reference_id', 'ref'])

                alt_list = []
                data['alien_types'] = []
                has_cultured = 0
                if data['alien_type']:
                    alien_type_df = pd.DataFrame(json.loads(data['alien_type']))
                    if len(alien_type_df):
                        alt_list = alien_type_df.alien_type.unique()
                        for at in alt_list:
                            if at == 'cultured':
                                has_cultured = 1
                            # 抓出所有的name
                            at_names = alien_type_df[alien_type_df.alien_type==at].taxon_name_id.unique()
                            current_note = []
                            for atn in at_names:
                                # 抓出name對應的非backbone reference
                                if len(alien_type_df[(alien_type_df.alien_type==at)&(alien_type_df.taxon_name_id==atn)&(alien_type_df.reference_type!=4)]):
                                    at_refs_list = alien_type_df[(alien_type_df.alien_type==at)&(alien_type_df.taxon_name_id==atn)&(alien_type_df.reference_type!=4)].reference_id.unique()
                                    at_refs = ref_df[ref_df.reference_id.isin(at_refs_list)].ref.to_list()
                                    current_note.append(f'{names[names.taxon_name_id==atn].sci_name_ori.to_list()[0]}: {", ".join(at_refs)}')
                            data['alien_types'].append({
                                'alien_type': alien_map_c[at],
                                'note': ', '.join(current_note)
                            })
                #  如果有is_cultured要加上去 如果是backbone不給文獻
                if not has_cultured and data['is_cultured']:
                    data['alien_types'].append({'alien_type': alien_map_c['cultured'],'note': None})

                conn = pymysql.connect(**db_settings)
                # 抓過去的
                # 如果是backbone不給ref
                with conn.cursor() as cursor:     
                    query = f'''SELECT ath.note, DATE_FORMAT(ath.updated_at, "%%Y-%%m-%%d"), ru.reference_id, r.type FROM api_taxon_history ath
                                LEFT JOIN reference_usages ru ON ath.reference_usage_id = ru.id
                                LEFT JOIN `references` r ON ru.reference_id = r.id
                                WHERE ath.taxon_id = %s AND ath.`type` = 5 ORDER BY ath.updated_at ASC;'''
                    cursor.execute(query, (taxon_id,))
                    first = cursor.fetchone()
                    if first:
                        current_nid = json.loads(first[0]).get('taxon_name_id')
                        if first[3] != 4: # 如果不是backbone
                            name_history.append({'name_id': current_nid, 'name': names[names.taxon_name_id==current_nid].sci_name_ori.values[0],
                                                 'ref': ref_df[ref_df.reference_id==first[2]].ref.values[0],
                                                 'reference_id': first[2], 'updated_at': first[1]})
                        else:
                            name_history.append({'name_id': current_nid, 'name': names[names.taxon_name_id==current_nid].sci_name_ori.values[0],
                                                 'ref': '', 'reference_id': None, 'updated_at': first[1]})
                with conn.cursor() as cursor:     
                    query = f'''SELECT ath.note, DATE_FORMAT(ath.updated_at, "%%Y-%%m-%%d"), ru.reference_id, r.type FROM api_taxon_history ath
                                LEFT JOIN reference_usages ru ON ath.reference_usage_id = ru.id
                                LEFT JOIN `references` r ON ru.reference_id = r.id
                                WHERE ath.taxon_id = %s AND ath.`type` = 0 ORDER BY ath.updated_at ASC;'''
                    cursor.execute(query, (taxon_id,))
                    nids = cursor.fetchall()
                if nids:
                    for n in nids:
                        current_nid = json.loads(n[0]).get('new_taxon_name_id')
                        if n[3] != 4:
                            name_history.append({'name_id': current_nid,'name': names[names.taxon_name_id==current_nid].sci_name.values[0],
                                                 'ref': ref_df[ref_df.reference_id==n[2]].ref.values[0],
                                                 'reference_id': n[2], 'updated_at': n[1]})
                        else:
                            name_history.append({'name_id': current_nid,'name': names[names.taxon_name_id==current_nid].sci_name.values[0],  
                                                 'ref':'', 'reference_id': None, 'updated_at': n[1]})

                # 相關連結
                # ncbi如果超過一個就忽略
                if data['links']:
                    xx = json.loads(data['links'])
                    tmp_links = []
                    for tl in xx:
                        if tl not in tmp_links:
                            tmp_links.append(tl)
                    for t in tmp_links:
                        if t["source"] in ["antwiki","mycobank","worms","powo","tropicos","lpsn","adw","fishbase_order"]:
                            links += [{'href': link_map[t["source"]]['url_prefix'], 'title': link_map[t["source"]]['title'], 'suffix': data['name'], 'hidden_name': True}]
                        elif t["source"] == 'nc':
                            links += [{'href': link_map[t["source"]]['url_prefix'], 'title': link_map[t["source"]]['title'], 'suffix': t['suffix'], 'id': t['suffix'].split('=')[1].split('&')[0]}]
                        elif t["source"] == 'amphibiansoftheworld':
                            links += [{'href': link_map[t["source"]]['url_prefix'], 'title': link_map[t["source"]]['title'], 'suffix': t['suffix'], 'id': t['suffix'].split('/')[-1]}]
                        elif t["source"] != 'ncbi':
                            links += [{'href': link_map[t["source"]]['url_prefix'], 'title': link_map[t["source"]]['title'], 'suffix': t['suffix']}]
                for s in ['wikispecies','discoverlife','taibif','inat','irmng','gisd','ncbi']:
                    links += [{'href': link_map[s]['url_prefix'], 'title': link_map[s]['title'] ,'suffix': data['name'], 'hidden_name': True}]
                # 全部都接 wikispecies,discoverlife,taibif,inat,irmng
                # 變更歷史
                query = f"""SELECT distinct ath.type, ath.content, ac.short_author, ath.updated_at, usr.name, ru.reference_id, ath.note, r.type
                            FROM api_taxon_history ath 
                            LEFT JOIN reference_usages ru ON ru.reference_id = ath.reference_id and ru.taxon_name_id = ath.taxon_name_id and ru.accepted_taxon_name_id = ath.accepted_taxon_name_id
                            LEFT JOIN import_usage_logs iul ON iul.reference_id = ru.reference_id
                            LEFT JOIN users usr ON usr.id = iul.user_id
                            LEFT JOIN api_citations ac ON ac.reference_id = ru.reference_id
                            LEFT JOIN `references` r ON ath.reference_id = r.id
                            WHERE ath.taxon_id = %s ORDER BY ath.updated_at DESC"""
                conn = pymysql.connect(**db_settings)
                with conn.cursor() as cursor:
                    cursor.execute(query, (taxon_id, ))
                    th = cursor.fetchall()
                    conn.close()
                    for thh in th:
                        if thh[0] == 4:
                            c = json.loads(thh[6])
                            content_str = []
                            old_path_str_name, new_path_str_name = '', ''
                            if c.get('old'):
                                o_path_list = c.get('old').split('>')
                                if len(o_path_list) > 1: # 不包含自己
                                    query = f"""SELECT an.formatted_name
                                                FROM api_taxon at
                                                JOIN api_names an ON an.taxon_name_id = at.accepted_taxon_name_id
                                                WHERE at.taxon_id IN %s
                                                ORDER BY at.rank_id ASC
                                            """
                                    conn = pymysql.connect(**db_settings)
                                    with conn.cursor() as cursor:
                                        cursor.execute(query, (o_path_list, ))
                                        ops = cursor.fetchall()
                                        ops = [o[0] for o in ops]
                                        old_path_str_name = ('>').join(ops)
                                        if old_path_str_name:
                                            old_path_str_name = '原階層：'+old_path_str_name
                            if not old_path_str_name:
                                old_path_str_name = '原階層：無'
                            content_str.append(old_path_str_name)
                            if c.get('new'):
                                n_path_list = c.get('new').split('>')
                                if len(n_path_list) > 1: # 不包含自己
                                    query = f"""SELECT an.formatted_name
                                                FROM api_taxon at
                                                JOIN api_names an ON an.taxon_name_id = at.accepted_taxon_name_id
                                                WHERE at.taxon_id IN %s
                                                ORDER BY at.rank_id ASC
                                            """
                                    conn = pymysql.connect(**db_settings)
                                    with conn.cursor() as cursor:
                                        cursor.execute(query, (n_path_list, ))
                                        nps = cursor.fetchall()
                                        nps = [o[0] for o in nps]
                                        new_path_str_name = ('>').join(nps)
                                        if new_path_str_name:
                                            new_path_str_name = '更新後階層：'+new_path_str_name
                            if not new_path_str_name:
                                new_path_str_name = '更新後階層：無'
                            content_str.append(new_path_str_name)
                            content_str = '，'.join(content_str)
                            row = [taxon_history_map[thh[0]], content_str, f'<a href="https://nametool.taicol.tw/references/{int(thh[5])}" target="_blank">{thh[2]}</a>', thh[3].strftime("%Y-%m-%d"), thh[4]]
                        elif thh[5] and thh[2] and thh[-1] != 4:
                            row = [taxon_history_map[thh[0]], thh[1], f'<a href="https://nametool.taicol.tw/references/{int(thh[5])}" target="_blank">{thh[2]}</a>', thh[3].strftime("%Y-%m-%d"), thh[4]]
                        else:
                            row = [taxon_history_map[thh[0]], thh[1], '', thh[3].strftime("%Y-%m-%d"), thh[4]]
                        taxon_history.append(row)
                taxon_history = pd.DataFrame(taxon_history, columns=['type','content','ref','datetime','editor'])
                taxon_history.loc[taxon_history['type']=='新增Taxon','content'] = ''
                taxon_history = taxon_history.drop_duplicates(subset=['type','content','ref']).to_dict(orient='records')
                data['self'] = ''
                data['self'] = {'rank_color': rank_color_map[data['rank_id']] if data['rank_id'] in [3,12,18,22,26,30,34] else 'rank-second-gray',
                                'rank_c': rank_map_c[data['rank_id']],
                                'name_c': data['common_name_c']}

        taxon_group_str = data['taxon_group_str']
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            query = f"""SELECT COUNT(distinct(att.taxon_id)), at.rank_id FROM api_taxon_tree att 
                    JOIN api_taxon at ON att.taxon_id = at.taxon_id
                    WHERE att.path LIKE %s AND at.rank_id > %s AND at.is_in_taiwan = 1
                    GROUP BY at.rank_id ORDER BY at.rank_id ASC;"""
            cursor.execute(query, (f'%{taxon_id}%', data.get('rank_id'), ))
            stats = cursor.fetchall()
            conn.close()
            stats = pd.DataFrame(stats, columns=['count','rank_id'])
            spp = 0
            for sr in stats.rank_id.unique():
                c = stats[stats.rank_id==sr]['count'].sum()
                if sr <= 46 and sr >= 35:
                    spp += c
                elif sr == 47:
                    if spp > 0:
                        stat_str += f"<a target='_blank' href='/catalogue?rank=35&rank=36&rank=37&rank=38&rank=39&rank=40&rank=41&rank=42&taxon_group={taxon_id}&taxon_group_str={taxon_group_str}'>{spp}種下 </a>"
                    stat_str += f"<a target='_blank' href='/catalogue?&rank={sr}&taxon_group={taxon_id}&taxon_group_str={taxon_group_str}'>{c}{rank_map_c[sr]} </a>"
                else:
                    stat_str += f"<a target='_blank' href='/catalogue?&rank={sr}&taxon_group={taxon_id}&taxon_group_str={taxon_group_str}'>{c}{rank_map_c[sr]} </a>"
            if spp > 0 and '種下' not in stat_str:
                # 如果沒有47 最後要把種下加回去
                stat_str += f"<a target='_blank' href='/catalogue?rank=35&rank=36&rank=37&rank=38&rank=39&rank=40&rank=41&rank=42&taxon_group={taxon_id}&taxon_group_str={taxon_group_str}'>{spp}種下</a>"
    
    elif not has_taxon:
        taxon_id = None
    elif is_deleted:
        conn = pymysql.connect(**db_settings)
        new_taxon_id, new_taxon_name_c = '', ''
        query = f"SELECT common_name_c,taxon_id FROM api_taxon WHERE taxon_id = (SELECT new_taxon_id FROM api_taxon WHERE taxon_id = %s)"
        with conn.cursor() as cursor:
            cursor.execute(query, taxon_id)
            new_taxon_id = cursor.fetchone()
            if new_taxon_id:
                new_taxon_name_c = new_taxon_id[0]
                new_taxon_id = new_taxon_id[1]

        query = f"""SELECT ath.type, ath.content, ac.short_author, ath.created_at, usr.name, ac.reference_id
                    FROM api_taxon_history ath 
                    LEFT JOIN reference_usages ru ON ru.id = ath.reference_usage_id
                    LEFT JOIN import_usage_logs iul ON iul.reference_id = ru.reference_id
                    LEFT JOIN users usr ON usr.id = iul.user_id
                    LEFT JOIN api_citations ac ON ac.reference_id = ru.reference_id
                    WHERE ath.taxon_id = %s AND ath.type=6"""
        
        with conn.cursor() as cursor:
            cursor.execute(query,taxon_id)
            th = cursor.fetchall()
            conn.close()
            for thh in th:
                if new_taxon_id:
                    row = [taxon_history_map[thh[0]], f'''請參見 <a class="new_taxon_aa" href="/taxon/{new_taxon_id}">{new_taxon_name_c if new_taxon_name_c else new_taxon_id}<svg class="fa_size" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="19" height="19" viewBox="0 0 19 19">
										<defs>
											<clipPath id="clip-path">
												<rect id="Rectangle_3657" data-name="Rectangle 3657" width="19" height="19" transform="translate(0 -0.359)" fill="#4c8da7"></rect>
											</clipPath>
										</defs>
										<g id="link-icon" transform="translate(0 0.359)">
											<g id="Group_7678" data-name="Group 7678" clip-path="url(#clip-path)">
												<path id="Path_8148" data-name="Path 8148" d="M136.768,4.994c-.053.253-.094.508-.162.757a5.729,5.729,0,0,1-1.539,2.554q-.923.93-1.85,1.856a.734.734,0,1,1-1.041-1.029c.711-.722,1.44-1.427,2.128-2.169a3.583,3.583,0,0,0,.977-2.125,2.92,2.92,0,0,0-1.291-2.8,3.005,3.005,0,0,0-3.438-.094,4.839,4.839,0,0,0-1,.753c-.916.885-1.811,1.792-2.706,2.7A3.989,3.989,0,0,0,125.7,7.449a3.025,3.025,0,0,0,1.441,3.252.8.8,0,0,1,.445.622.7.7,0,0,1-.337.68.68.68,0,0,1-.757.015,4.51,4.51,0,0,1-2.211-2.954,4.749,4.749,0,0,1,.928-3.99,7.224,7.224,0,0,1,.69-.8c.843-.856,1.7-1.7,2.546-2.55A5.769,5.769,0,0,1,131.3.1a4.578,4.578,0,0,1,5.4,3.612c.021.124.049.247.073.371Z" transform="translate(-118.129 0.001)" fill="#4c8da7"></path>
												<path id="Path_8149" data-name="Path 8149" d="M4.078,146.411c-.264-.059-.532-.1-.793-.178a4.575,4.575,0,0,1-3.251-3.811,4.792,4.792,0,0,1,1.147-3.711c.463-.566,1-1.068,1.515-1.6.287-.3.58-.586.873-.877A.732.732,0,1,1,4.6,137.276c-.632.638-1.27,1.269-1.9,1.909a4.234,4.234,0,0,0-1.151,1.987,3.075,3.075,0,0,0,2.65,3.754,3.526,3.526,0,0,0,2.745-.967c.493-.43.943-.908,1.406-1.372.608-.61,1.227-1.21,1.808-1.844a3.554,3.554,0,0,0,.951-2.059,2.981,2.981,0,0,0-1.117-2.7,4.411,4.411,0,0,0-.461-.323.731.731,0,0,1-.249-1.014.723.723,0,0,1,1.017-.23,4.468,4.468,0,0,1,2.284,4.25,4.415,4.415,0,0,1-1.156,2.824c-1.179,1.27-2.408,2.5-3.667,3.685a4.606,4.606,0,0,1-2.71,1.205.213.213,0,0,0-.063.031Z" transform="translate(0 -127.766)" fill="#4c8da7"></path>
											</g>
										</g>
									</svg></a>''', f'<a href="https://nametool.taicol.tw/references/{int(thh[5])}" target="_blank">{thh[2]}</a>', thh[3].strftime("%Y-%m-%d"), thh[4]]
                else:
                    row = [taxon_history_map[thh[0]], '', f'<a href="https://nametool.taicol.tw/references/{int(thh[5])}" target="_blank">{thh[2]}</a>', thh[3].strftime("%Y-%m-%d"), thh[4]]
                taxon_history.append(row)
        taxon_history = pd.DataFrame(taxon_history, columns=['type','content','ref','datetime','editor'])
        taxon_history = taxon_history.drop_duplicates(subset=['type','content','ref']).to_dict(orient='records')
        
        data['rank_d'] = '已刪除 Deleted'
        data['transfer_taxon'] = new_taxon_id
        data['is_deleted'] = True
        data['new_taxon_name_c'] = new_taxon_name_c

    return render(request, 'taxa/taxon.html', {'taxon_id': taxon_id, 'data': data, 'links': links,
                                                'refs': refs, 'experts': experts, 'name_changes': name_changes,
                                               'taxon_history': taxon_history, 'stat_str': stat_str, 'name_history': name_history })


def taxon_tree(request):
    # 第一層 kingdom
    kingdom_dict = []
    kingdom_dict_c = []
    # for k in kingdom_map.keys():
    conn = pymysql.connect(**db_settings)
    with conn.cursor() as cursor:
        query = f"""SELECT substring(att.path, -8, 8) as kingdom_taxon, COUNT(distinct(att.taxon_id)), at.rank_id, at.is_cultured FROM api_taxon_tree att 
                JOIN api_taxon at ON att.taxon_id = at.taxon_id
                WHERE at.rank_id > 3 AND at.is_in_taiwan = 1 AND at.is_deleted != 1 
                GROUP BY at.rank_id, at.is_cultured, kingdom_taxon ORDER BY at.rank_id ASC;
            """
        cursor.execute(query)
        total_stats = cursor.fetchall()
        conn.close()
        total_stats = pd.DataFrame(total_stats, columns=['kingdom_taxon','count','rank_id','is_cultured'])
    for k in kingdom_map.keys():
        stats = total_stats[total_stats.kingdom_taxon==k]
        stats_c = stats[stats.is_cultured!=1].reset_index(drop=True).sort_values('rank_id') # 排除栽培豢養
        spp = 0
        stat_str = ''
        for sr in stats_c.rank_id.unique():
            c = stats_c[stats_c.rank_id==sr]['count'].sum()
            if sr <= 46 and sr >= 35:
                spp += c
            elif sr == 47:
                stat_str += f"{spp}種下 {c}{rank_map_c[sr]}"
            else:
                stat_str += f"{c}{rank_map_c[sr]} "
        if spp > 0 and '種下' not in stat_str:
            # 如果沒有47 最後要把種下加回去
            stat_str += f"{spp}種下"

        kingdom_dict_c += [{'taxon_id': k, 'name': f"{kingdom_map[k]['common_name_c']} Kingdom {kingdom_map[k]['name']}",'stat': stat_str.strip()}]
        spp = 0
        stat_str = ''
        for sr in stats.rank_id.unique():
            c = stats[stats.rank_id==sr]['count'].sum()
            if sr <= 46 and sr >= 35:
                spp += c
            elif sr == 47:
                stat_str += f"{spp}種下 {c}{rank_map_c[sr]}"
            else:
                stat_str += f"{c}{rank_map_c[sr]} "
        if spp > 0 and '種下' not in stat_str:
            # 如果沒有47 最後要把種下加回去
            stat_str += f"{spp}種下"

        kingdom_dict += [{'taxon_id': k, 'name': f"{kingdom_map[k]['common_name_c']} Kingdom {kingdom_map[k]['name']}",'stat': stat_str.strip()}]
    search_stat = SearchStat.objects.all().order_by('-count')[:6]
    s_taxon = [s.taxon_id for s in search_stat]
    if s_taxon:
        query = f"""SELECT DISTINCT(at.taxon_id), at.common_name_c, an.formatted_name
                    FROM api_taxon at
                    JOIN api_names an ON at.accepted_taxon_name_id = an.taxon_name_id 
                    WHERE at.taxon_id IN %s;"""
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            cursor.execute(query, (s_taxon, ))
            tags = cursor.fetchall()
            conn.close()
            search_stat = []
            for t in tags:
                if t[1]:
                    search_stat.append({'taxon_id': t[0], 'name': t[1]})
                else:
                    search_stat.append({'taxon_id': t[0], 'name': t[2]})

    return render(request, 'taxa/taxon_tree.html', {'kingdom_dict':kingdom_dict, 'search_stat': search_stat, 'kingdom_dict_c': kingdom_dict_c})


def get_sub_tree(request):
    taxon_id = request.POST.get('taxon_id')
    cultured = request.POST.get('cultured')
    rank_id = request.POST.get('rank_id')
    sub_dict = get_tree_stat(taxon_id,cultured,rank_id,False)
    return HttpResponse(json.dumps(sub_dict), content_type='application/json') 


def get_taxon_path(request):
    taxon_id = request.POST.get('taxon_id')
    resp = {}
    if taxon_id:
        conn = pymysql.connect(**db_settings)
        query = f"SELECT path FROM api_taxon_tree WHERE taxon_id = %s;"
        with conn.cursor() as cursor:
            cursor.execute(query, (taxon_id, ))
            ps = cursor.fetchone()
            conn.close()
            if ps:
                path = ps[0].split('>')
                if request.POST.get('cultured') != 'on': # 要排除栽培豢養
                    query = f"""SELECT taxon_id, rank_id FROM api_taxon WHERE is_cultured != 1 
                                AND taxon_id IN %s ORDER BY rank_id DESC;"""
                else:
                    query = f"SELECT taxon_id, rank_id FROM api_taxon WHERE taxon_id IN %s ORDER BY rank_id DESC;"
                conn = pymysql.connect(**db_settings)
                with conn.cursor() as cursor:
                    cursor.execute(query, (path,))
                    t_ids = cursor.fetchall()
                    conn.close()
                    resp['path'] = Reverse([t[0] for t in t_ids])
                    resp['rank_id'] = Reverse([t[1] for t in t_ids])
    return HttpResponse(json.dumps(resp), content_type='application/json') 


def get_sub_tree_list(request):
    sub_dict_list = []
    taxon_id = request.POST.getlist('taxon_id[]')
    rank_id = request.POST.getlist('rank_id[]')
    rank_id = [int(r) for r in rank_id]
    cultured = request.POST.get('cultured')

    df = pd.DataFrame({'rank_id': rank_id, 'taxon_id': taxon_id})

    for i in df.index:
        if x := get_tree_stat(df.taxon_id[i],cultured,int(df.rank_id[i]),True):
            sub_dict_list.append(x)
    
    return HttpResponse(json.dumps(sub_dict_list), content_type='application/json') 


def Reverse(lst):
    new_lst = lst[::-1]
    return new_lst
 

def get_tree_stat(taxon_id,cultured,rank_id,from_search_click):
    sub_dict = {}
    sub_titles = []
    rank_id = int(rank_id)
    # cultured_condition = ''
    if cultured != 'on': # 排除栽培豢養
        is_cultured = [0, None] 
    else: # 包含栽培豢養
        is_cultured = [0,1]
    conn = pymysql.connect(**db_settings)
    query = f"""SELECT an.formatted_name 
                FROM api_taxon at
                JOIN api_names an ON at.accepted_taxon_name_id = an.taxon_name_id 
                WHERE at.taxon_id = %s"""
    with conn.cursor() as cursor:
        cursor.execute(query, (taxon_id,))
        taxon_info = cursor.fetchone()
        formatted_name = taxon_info[0]
    query = f"""SELECT COUNT(distinct(att.taxon_id)), at.rank_id, 
                SUBSTRING_INDEX(SUBSTRING_INDEX(att.path, %s, 1), '>', -1) AS p_group
                FROM api_taxon_tree att 
                JOIN api_taxon at ON att.taxon_id = at.taxon_id
                WHERE att.path LIKE %s AND at.is_in_taiwan = 1 AND at.is_deleted != 1 AND at.is_cultured IN %s AND at.rank_id > %s
                GROUP BY at.rank_id, p_group;
            """
    with conn.cursor() as cursor:
        cursor.execute(query, (f'>{taxon_id}', f'%>{taxon_id}%', is_cultured, rank_id, ))
        sub_stat = cursor.fetchall()
        sub_stat = pd.DataFrame(sub_stat, columns=['count','rank_id','taxon_id'])
        sub_stat = sub_stat.sort_values('rank_id')
        conn.close()

    query = f"""SELECT at.taxon_id, at.rank_id, CONCAT_WS(' ', at.common_name_c, r.display ->> '$."en-us"',
                an.formatted_name), r.display ->> '$."zh-tw"'
                FROM api_taxon_tree att 
                JOIN api_taxon at ON att.taxon_id = at.taxon_id
                JOIN taxon_names tn ON at.accepted_taxon_name_id = tn.id
                JOIN ranks r ON at.rank_id = r.id
                JOIN api_names an ON at.accepted_taxon_name_id= an.taxon_name_id 
                WHERE att.parent_taxon_id = %s AND at.is_in_taiwan = 1 AND at.is_deleted != 1 AND at.is_cultured IN %s AND at.rank_id > %s ORDER BY at.rank_id DESC, tn.name;"""
    conn = pymysql.connect(**db_settings)
    with conn.cursor() as cursor:
        cursor.execute(query, (taxon_id, is_cultured, rank_id, ))
        sub_titles = cursor.fetchall()
        # 下一層的rank有可能不一樣
        conn.close()    
    # 如果有跳過的部分，要顯示地位未定
    # 先找出下一個林奈階層應該要是什麼
    next_lin_h = None
    if rank_id in lin_ranks:
        if lin_ranks.index(rank_id)+1 < len(lin_ranks):
            if lin_ranks[lin_ranks.index(rank_id)+1] < 34:
                next_lin_h = lin_ranks[lin_ranks.index(rank_id)+1]

    uncertains = []
    uncertain_rank = []
    if next_lin_h:
        for st in sub_titles:
            if not (st[1] == next_lin_h or st[1] < next_lin_h):
                uncertains.append(st)
                if st[1] not in uncertain_rank:
                    uncertain_rank.append(st[1])

    for st in sub_titles:
        stat_str = ''
        spp = 0
        stat_name = ''
        stats = sub_stat[(sub_stat.taxon_id==st[0])&(sub_stat.rank_id>st[1])]
        stats = stats.reset_index(drop=True)
        rank_c = st[3]
        if st[1] in lin_ranks:
            rank_color = rank_color_map[st[1]]
        else:
            rank_color = 'rank-second-gray'
        stat_name = st[2]
        for i in stats.index:
            s = stats.iloc[i]
            if s['count'] > 0:
                r_id = s.rank_id
                if r_id <= 46 and r_id >= 35:
                    spp += s['count']
                elif r_id == 47:
                    if spp > 0:
                        stat_str += f"{spp}種下 "
                    stat_str += f"{s['count']}{rank_map_c[r_id]} "
                else:
                    stat_str += f"{s['count']}{rank_map_c[r_id]} "
        if spp > 0 and '種下' not in stat_str:
            # 如果沒有47 最後要把種下加回去
            stat_str += f"{spp}種下"
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
        if from_search_click:
            for r in lin_map.keys():
                if r < min(uncertain_rank) and r > rank_id:
                    lack_r.append(r)
        else:
            lack_r = [next_lin_h]
        for nlh in lack_r:
            stat_str = ''
            spp = 0
            stat_name = ''
            rank_color = rank_color_map[nlh]
            rank_c = rank_map_c[nlh]
            stats = sub_stat[sub_stat.taxon_id.isin([un[0] for un in uncertains])]
            stats = stats.groupby('rank_id',as_index=False).sum('count')
            stats = stats[stats.rank_id > nlh]
            stats = stats.reset_index(drop=True)
            # 補所有地位未定的部分
            stat_name = f'地位未定 {formatted_name} {lin_map[nlh]} incertae sedis'
            for i in stats.index:
                s = stats.iloc[i]
                if s['count'] > 0:
                    r_id = s.rank_id
                    if r_id <= 46 and r_id >= 35:
                        spp += s['count']
                    elif r_id == 47:
                        if spp > 0:
                            stat_str += f"{spp}種下 "
                        stat_str += f"{s['count']}{rank_map_c[r_id]} "
                    else:
                        stat_str += f"{s['count']}{rank_map_c[r_id]} "
            if spp > 0 and '種下' not in stat_str:
                # 如果沒有47 最後要把種下加回去
                stat_str += f"{spp}種下"
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

    if lack_r:
        final_sub_dict['has_lack'] = True
        final_sub_dict[rank_map_c[total_ranks[total_ranks.index(max(lack_r)) + 1]]]['parent_rank_id'] = max(lack_r)

    return final_sub_dict


def update_search_stat(request):
    if taxon_id := request.POST.get('taxon_id'):
        if SearchStat.objects.filter(taxon_id=taxon_id).exists():
            ss = SearchStat.objects.filter(taxon_id=taxon_id).update(count=F('count')+1,updated_at=timezone.now())
        else:
            ss = SearchStat.objects.create(taxon_id=taxon_id,count=1)
    return HttpResponse(json.dumps({'status': 'done'}), content_type='application/json') 


def get_match_result(request):
    response = {}
    response['page'] = {}
    namecode_list = []
    best = request.POST.get('best','yes')
    name = request.POST.get('name')
    page = int(request.POST.get('page', 1))
    
    # 用loop取得name match結果 每頁10筆
    if name:
        name = name.splitlines()
        names = []
        # 排除重複 & 空值
        for n in name:
            if n not in names and n:
                names.append(n)
        response['page']['current_page'] = page
        response['page']['total_page'] = math.ceil(len(names) / 10)
        response['page']['page_list'] = get_page_list(response['page']['current_page'], response['page']['total_page'])

        names = ('|').join(names[(page-1)*10:page*10])
        url = env('NOMENMATCH_ROOT')
        result = requests.post(url, data = {
            'names': names,
            'best': best,
            'format': 'json',
            'source': 'taicol'
        })
        if result.status_code == 200:
            result = result.json()
            df = pd.DataFrame(result['data'])
            df['r'] = df[0].apply(lambda x: pd.json_normalize(x, 'results', ['search_term', 'matched_clean']))
            df_flat = pd.DataFrame()
            for i in df.index:
                yi = df.iloc[i].r
                if len(yi):
                    for yii in range(len(yi)):
                        if yi.accepted_namecode[yii]:
                            namecode_list.append(yi.accepted_namecode[yii])
                        df_flat = df_flat.append(yi.loc[yii])
                else:
                    df_flat = df_flat.append({'search_term': df.iloc[i,0]['search_term']},ignore_index=True)
            df = df_flat
            #JOIN taxon
            if namecode_list:
                query = f""" SELECT at.is_endemic, at.alien_type, at.is_terrestrial, 
                             at.is_freshwater, at.is_brackish, at.is_marine,
                             at.taxon_id, ac.protected_category, ac.red_category, ac.iucn_category, ac.cites_listing,
                             at.rank_id, an.formatted_name, at.common_name_c
                            FROM api_taxon at
                            LEFT JOIN api_conservation ac ON ac.taxon_id = at.taxon_id
                            LEFT JOIN api_names an ON an.taxon_name_id = at.accepted_taxon_name_id
                            WHERE at.taxon_id IN %s AND at.is_deleted != 1
                        """
                conn = pymysql.connect(**db_settings)
                with conn.cursor() as cursor:
                    cursor.execute(query,(namecode_list,))
                    info = cursor.fetchall()
                    conn.close()
                    info = pd.DataFrame(info, columns=['is_endemic', 'alien_type', 'is_terrestrial', 'is_freshwater', 'is_brackish', 'is_marine',
                                                        'taxon_id', 'protected_category', 'red_category', 'iucn_category', 'cites_listing', 'rank_id', 'formatted_name', 'common_name_c'])
                    # info = info.astype({'accepted_namecode': 'str'})
                    df = df[['search_term','namecode','family','kingdom','phylum','class','order','genus']].merge(info,how='left',left_on='namecode',right_on='taxon_id')
                    df = df.replace({np.nan: '', None: ''})
                    df['cites_listing'] = df['cites_listing'].apply(lambda x: x.replace('1','I').replace('2','II').replace('3','III'))
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
                        alt_list = []
                        if df.iloc[i].alien_type:
                            for at in json.loads(df.iloc[i].alien_type):
                                # if at.get('alien_type') not in alt_list:
                                alt_list.append(alien_map_c[at.get('alien_type')])
                        alt_list = list(dict.fromkeys(alt_list))
                        df.loc[i,'alien_type'] = ','.join(alt_list)

                    df['rank'] = df['rank_id'].apply(lambda x: rank_map_c[x] if x else '')
                    df['is_endemic'] = df['is_endemic'].apply(lambda x: '臺灣特有' if x == 1 else '')
            df = df.replace({np.nan: '', None: ''})
            df = df.drop_duplicates()
            response['data'] = json.loads(df.to_json(orient='records'))

    return HttpResponse(json.dumps(response), content_type='application/json')


def download_match_results(request):
    best = request.POST.get('best','yes')
    name = request.POST.get('name')
    file_format = request.POST.get('file_format','csv')
    final_df = pd.DataFrame()
    # 用loop取得name match結果 每頁30筆
    if name:
        name = name.splitlines()
        t_names = []
        t_names = [n for n in name if n not in t_names and n] # 排除重複 & 空值
        total_page = math.ceil(len(t_names) / 30)
        for page in range(total_page): 
            namecode_list = []
            names = ('|').join(t_names[page*30:(page+1)*30])
            df = pd.DataFrame()
            url = env('NOMENMATCH_ROOT')
            result = requests.post(url, data = {
                'names': names,
                'best': best,
                'format': 'json',
                'source': 'taicol'
            })
            if result.status_code == 200:
                result = result.json()
                df = pd.DataFrame(result['data'])
                df['r'] = df[0].apply(lambda x: pd.json_normalize(x, 'results', ['search_term', 'matched_clean']))
                df_flat = pd.DataFrame()
                for i in df.index:
                    yi = df.iloc[i].r
                    if len(yi):
                        for yii in range(len(yi)):
                            if yi.accepted_namecode[yii]:
                                namecode_list.append(yi.accepted_namecode[yii])
                            df_flat = df_flat.append(yi.loc[yii])
                    else:
                        df_flat = df_flat.append({'search_term': df.iloc[i,0]['search_term']},ignore_index=True)
                df = df_flat
                #JOIN taxon
                if namecode_list:
                    query = f""" SELECT at.is_endemic, at.alien_type, at.is_terrestrial, 
                                at.is_freshwater, at.is_brackish, at.is_marine,
                                at.taxon_id, ac.protected_category, ac.red_category, ac.iucn_category, ac.cites_listing,
                                at.rank_id, tn.name, at.common_name_c
                                FROM api_taxon at
                                LEFT JOIN api_conservation ac ON ac.taxon_id = at.taxon_id
                                JOIN taxon_names tn ON tn.id = at.accepted_taxon_name_id
                                WHERE at.taxon_id IN %s AND at.is_deleted != 1 
                            """
                    conn = pymysql.connect(**db_settings)
                    with conn.cursor() as cursor:
                        cursor.execute(query, (namecode_list, ))
                        info = cursor.fetchall()
                        conn.close()
                        info = pd.DataFrame(info, columns=['is_endemic', 'alien_type', 'is_terrestrial', 'is_freshwater', 'is_brackish', 'is_marine',
                                                            'taxon_id', 'protected_category', 'red_category', 'iucn_category', 'cites_listing', 'rank_id', 'name', 'common_name_c'])
                        df = df.merge(info,how='left',left_on='accepted_namecode', right_on='taxon_id')
                        df = df.replace({np.nan: '', None: ''})
                
                        for i in df.index:
                            alt_list = []
                            if df.iloc[i].alien_type:
                                for at in json.loads(df.iloc[i].alien_type):
                                    # if at.get('alien_type') not in alt_list:
                                    alt_list.append(alien_map_c[at.get('alien_type')])
                            alt_list = list(dict.fromkeys(alt_list))
                            df.loc[i,'alien_type'] = ','.join(alt_list)
                        df['cites_listing'] = df['cites_listing'].apply(lambda x: x.replace('1','I').replace('2','II').replace('3','III'))
                        df['rank'] = df['rank_id'].apply(lambda x: rank_map[x] if x else '')
                        df.loc[df.taxon_id!='','is_endemic'] = df.loc[df.taxon_id.notnull(),'is_endemic'].apply(lambda x: 1 if x == 1 else 0)

                df = df.replace({np.nan: '', None: ''})
                final_df = final_df.append(df)
    # 移除不需要的欄位
    cols = ["search_term","name","common_name_c","kingdom","phylum","class","order","family","genus","rank","is_endemic","alien_type",
            "is_terrestrial","is_freshwater","is_brackish","is_marine","protected_category","red_category","iucn_category","cites_listing","accepted_namecode"]
    # [c for c in cols if c in final_df.keys()]
    final_df = final_df[[c for c in cols if c in final_df.keys()]]
    final_df = final_df.rename(columns={
        "search_term":"查詢字串","name":"比對結果","common_name_c":"中文名","kingdom":"界","phylum":"門","class":"綱","order":"目","family":"科",
        "genus":"屬","rank":"階層","is_endemic":"是否為特有",
        "alien_type":"原生/外來性","is_terrestrial":"是否為陸生生物","is_freshwater":"是否為淡水生物","is_brackish":"是否為半鹹水生物","is_marine":"是否為海洋生物",
        "protected_category":"臺灣保育類等級","red_category":"臺灣紅皮書評估",
        "iucn_category":"IUCN國際自然保育聯盟紅皮書評估","cites_listing":"CITES華盛頓公約附錄","accepted_namecode":"物種編碼"
    })

    final_df = final_df.drop_duplicates()

    is_list = ['是否為特有',"是否為陸生生物","是否為淡水生物","是否為半鹹水生物","是否為海洋生物"]
    if file_format == 'json':
        # 改成True False                
        final_df[is_list] = final_df[is_list].replace({0: False, 1: True, '0': False, '1': True})
        response = HttpResponse(content_type="application/json")
        response['Content-Disposition'] =  f'attachment; filename=taicol_download_{datetime.datetime.now().strftime("%Y%m%d%H%M%s")}.json'
        final_df.to_json(response, orient='records')
    else:
        # 改成字串true false
        final_df[is_list] = final_df[is_list].replace({0: 'false', 1: 'true', '0': 'false', '1': 'true'})
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] =  f'attachment; filename=taicol_download_{datetime.datetime.now().strftime("%Y%m%d%H%M%s")}.csv'
        final_df.to_csv(response, index=False)

    return response



def send_feedback(request):
    req = request.POST
    date_str = timezone.now()+datetime.timedelta(hours=8)
    date_str = date_str.strftime('%Y/%m/%d')
    Feedback.objects.create(
        taxon_id = req.get('taxon_id'),
        type = int(req.get('type',1)),
        title = req.get('title'),
        description = req.get('description'),
        notify = True if req.get('notify') == 'yes' else False,
        name = req.get('name'),
        email = req.get('email'),
        response = f"<p>{req.get('name')} 先生/小姐您好，</p><p>收到您{date_str}於TaiCOL的留言：</p><p>『{req.get('description')}』</p><p>回覆如下：</p>",
    )
    email_body = f'您好\n  \n 網站有新的錯誤回報\n  \n 請至管理後台查看： {request.scheme}://{request.META["HTTP_HOST"]}/admin/taxa/feedback/'

    trigger_send_mail(email_body)

    return HttpResponse(json.dumps({'status': 'done'}), content_type='application/json') 



def trigger_send_mail(email_body):
    task = threading.Thread(target=bk_send_mail, args=(email_body,))
    # task.daemon = True
    task.start()
    return JsonResponse({"status": 'success'}, safe=False)


def bk_send_mail(email_body):
    # send_mail('[TaiCOL]網站錯誤回報', email_body, 'no-reply@taicol.tw', ['catalogueoflife.taiwan@gmail.com'])
    send_mail('[TaiCOL] 網站錯誤回報', email_body, 'no-reply@taicol.tw', ['catalogueoflife.taiwan@gmail.com'])

