from django.shortcuts import render, redirect
from taxa.utils import *
from django.http import HttpResponse,JsonResponse
import json
from conf.settings import env
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

from django.contrib import messages

db_settings = {
    "host": env('DB_HOST'),
    "port": int(env('DB_PORT')),
    "user": env('DB_USER'),
    "password": env('DB_PASSWORD'),
    "db": env('DB_DBNAME'),
}



def download_search_results(request):
    req = request.POST
    file_format = req.get('file_format','csv')
    # latest version
    files = glob.glob('/tc-web-volumes/media/archive/物種名錄_物種*') # * means all if need specific format then *.csv
    latest_f = max(files, key=os.path.getctime)
    df = pd.read_csv(latest_f)
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
    df = df[df.taxon_id.isin(tids)]

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
        if request.GET.get('from_tree'):
            query = f"""SELECT at.taxon_id, CONCAT_WS (' ',tn.name, CONCAT_WS(',', at.common_name_c, at.alternative_name_c))
                FROM taxon_names tn
                JOIN api_taxon at ON at.accepted_taxon_name_id = tn.id
                JOIN api_taxon_tree att ON att.taxon_id = at.taxon_id
                WHERE tn.deleted_at IS NULL AND (tn.name like '%{keyword_str}%' OR 
                    at.common_name_c like '%{keyword_str}%' OR at.alternative_name_c like '%{keyword_str}%')"""
        else:
            query = f"""SELECT at.taxon_id, CONCAT_WS (' ',tn.name, CONCAT_WS(',', at.common_name_c, at.alternative_name_c))
                        FROM taxon_names tn
                        JOIN api_taxon at ON at.accepted_taxon_name_id = tn.id
                        WHERE tn.deleted_at IS NULL AND (tn.name like '%{keyword_str}%' OR 
                            at.common_name_c like '%{keyword_str}%' OR at.alternative_name_c like '%{keyword_str}%')"""
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            cursor.execute(query)
            results = cursor.fetchall()
            conn.close()
            for r in results:
                names += [{'text': r[1], 'id': r[0]}]
    return HttpResponse(json.dumps(names), content_type='application/json') 


def get_conditioned_query(req, from_url=False):

    condition = 'tn.deleted_at IS NULL'

    if keyword := req.get('keyword','').strip():
        keyword_type = req.get('name-select','contain')
        if keyword_type == "equal":
            keyword_str = f"= '{keyword}'"
        elif keyword_type == "startwith":
            keyword_str = f"LIKE '{keyword}%'"
        else:
            keyword_str = f"LIKE '%{keyword}%'"
        condition += f""" AND (tn.name {keyword_str} OR at.common_name_c {keyword_str} OR at.alternative_name_c {keyword_str})"""

    # is_ 系列
    is_list = ['is_endemic','is_terrestrial','is_freshwater','is_brackish','is_marine']
    for i in is_list:
        if req.get(i):
            condition += f" AND at.{i} = 1"
    
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
                a_str = f'at.alien_type = "{a}"'
            else:
                a_str += f' OR at.alien_type = "{a}"'
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
            condition += f" AND at.updated_at > '{date}'"
        elif date_type == "sl":
            condition = f" AND at.updated_at < '{date}'"
        else:
            condition = f" AND at.updated_at = '{date}'"

    # 保育資訊
    has_conserv = False
    for con in ['protected_category','red_category','iucn_category']:
        if cs := req.getlist(con):
            has_conserv = True
            c = 1
            for css in cs:
                if c == 1:
                    c_str = f'ac.{con} = "{css}"'
                else:
                    c_str += f' OR ac.{con} = "{css}"'
                c += 1
            if 'OR' in c_str:
                c_str = f" AND ({c_str})"
            else:
                c_str = f" AND {c_str}"
            condition += c_str

    # CITES類別要用like
    if cs := req.getlist('cites'):
        has_conserv = True
        c = 1
        for css in cs:
            if c == 1:
                c_str = f'ac.cites_listing like "%{css}%"'
            else:
                c_str += f' OR ac.cites_listing like "%{css}%"'
            c += 1
        if 'OR' in c_str:
            c_str = f" AND ({c_str})"
        else:
            c_str = f" AND {c_str}"
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
                path_join = "LEFT JOIN api_taxon_tree att ON att.taxon_id = at.taxon_id"
                condition +=  f' AND att.path like "%>{value}%"'
            elif facet == 'endemic':
                condition +=  f' AND at.is_endemic = 1'
            elif facet == 'status':
                condition +=  f' AND atu.status = "{value}"'
            elif facet == 'alien_type':
                condition +=  f' AND at.alien_type = "{value}"'

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



def get_query_data(base, offset, response):
    conn = pymysql.connect(**db_settings)
    base = base.split('WHERE')
    query = f"""
                SELECT distinct(at.taxon_id), tn.name, tn.rank_id, an.formatted_name, at.common_name_c, atu.status,
                    at.is_endemic, at.alien_type, att.path   
                {base[0]}
                JOIN api_names an ON an.taxon_name_id = tn.id
                WHERE {base[1]}
                ORDER BY tn.name LIMIT 10 OFFSET {offset} 
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
                        WHERE t.taxon_id IN ({str(p).replace('[','').replace(']','')}) AND t.rank_id IN (3,12,18,22,26)"
                conn = pymysql.connect(**db_settings)
                with conn.cursor() as cursor:
                    cursor.execute(query)
                    higher_taxa = cursor.fetchall()
                    higher_taxa = pd.DataFrame(higher_taxa, columns=['taxon_id','rank_id','name'])
                    conn.close()
                    # 界
            kingdoms = higher_taxa[(higher_taxa.rank_id==3)].taxon_id.to_list()
            for i in results.index:
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
            results['alien_type'] = results['alien_type'].apply(lambda x: alien_map_c[x] if x else None)
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
            response['page']['total_page'] = math.ceil((count[0]) / 10)
            conn.close()
    else:
        response['page']['total_page'] = int(req.get('total_page'))

    # response['page']['total_page'] = math.ceil((response['count']['total'][0]['count']) / 10)
    response['page']['current_page'] = page
    response['page']['page_list'] = get_page_list(response['page']['current_page'], response['page']['total_page'])

    # 以下的query和起始的相同
    offset = 10 * (page-1)
    response = get_query_data(base, offset, response)

    return HttpResponse(json.dumps(response), content_type='application/json')


def catalogue(request):
    response = {}
    keyword = request.GET.get('keyword', '').strip()
    if request.method == 'POST':
        req = request.POST
        offset = 10 * (int(req.get('page',1))-1)
        base = get_conditioned_query(req, from_url=True)
        conn = pymysql.connect(**db_settings)
        count_query = f"""SELECT distinct tn.id, at.id, atu.status, tn.rank_id, at.alien_type, at.is_endemic, SUBSTRING(att.path, -7, 7)
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
            count['alien_type_c'] = count['alien_type'].apply(lambda x: alien_map_c[x] if x else None)
            count['status_c'] = count['status'].apply(lambda x: status_map_c[x] if x else None)
            count['rank_c'] = count['rank'].apply(lambda x: rank_map_c[int(x)])
            count['kingdom_c'] = count['kingdom'].apply(lambda x: kingdom_map[x]['common_name_c'] if x in kingdom_map.keys() else None)
            count = count.replace({np.nan: '', None: ''})
            facet = ['is_endemic','alien_type','status','kingdom','rank']
            for f in facet:
                response['count'][f] = count[~count[f"{f}_c"].isin([None,''])].groupby([f,f"{f}_c"])['t_id'].count().reset_index().rename(columns={'t_id':'count',f:'category', f"{f}_c":'category_c'}).to_dict('records')
            response['count']['total'] = [{'count':len(count)}]
            # pagination
            response['page'] = {}
            response['page']['total_page'] = math.ceil((response['count']['total'][0]['count']) / 10)
            response['page']['current_page'] = offset / 10 + 1
            response['page']['page_list'] = get_page_list(response['page']['current_page'], response['page']['total_page'])
            response = get_query_data(base, offset, response)
        else:
            response = {'count': {'total':[{'count':0}]},'page': {'total_page':0, 'page_list': []},'data':[]}
        return HttpResponse(json.dumps(response), content_type='application/json')
    # 0 不開 1 開一層 2 全開
    filter = request.GET.get('filter', 1)
    return render(request, 'taxa/catalogue.html', {'filter': filter, 'ranks': rank_map_c, 'keyword': keyword})


def name_match(request):
    return render(request, 'taxa/name_match.html')


def taxon(request, taxon_id):
    higher_html_str = ''
    info_html_str = ''
    self_html_str = ''
    refs = []
    data = {}
    experts = []
    links = []
    name_changes = []
    taxon_history = []

    query = f"""SELECT tn.name, an.formatted_name as f_name, concat_WS(' ', an.formatted_name, an.name_author ) as sci_name, 
                at.common_name_c, at.accepted_taxon_name_id as name_id, at.rank_id,
                CONCAT(r.display ->> '$."zh-tw"', ' ', r.display ->> '$."en-us"') as rank_d,
                atu.status, att.path, at.is_endemic, at.is_terrestrial, at.is_freshwater, at.is_brackish,
                at.is_marine, at.alien_type,
                ac.cites_listing, ac.cites_note, ac.iucn_category, ac.iucn_note, 
                ac.red_category, ac.red_note, ac.protected_category, ac.protected_note,
                tn.original_taxon_name_id, at.links, anc.namecode
                FROM api_taxon at 
                LEFT JOIN api_names an ON at.accepted_taxon_name_id =  an.taxon_name_id 
                LEFT JOIN api_namecode anc ON at.accepted_taxon_name_id =  anc.taxon_name_id 
                JOIN ranks r ON at.rank_id = r.id
                JOIN api_taxon_usages atu ON at.taxon_id = atu.taxon_id
                LEFT JOIN api_taxon_tree att ON at.taxon_id = att.taxon_id
                LEFT JOIN api_conservation ac ON at.taxon_id = ac.taxon_id 
                JOIN taxon_names tn ON at.accepted_taxon_name_id = tn.id
                WHERE at.taxon_id = "{taxon_id}"
             """
    conn = pymysql.connect(**db_settings)
    with conn.cursor() as cursor:
        cursor.execute(query)
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
                    foto = {'author':ii['author'], 'src':ii['image_big'], 'provider':ii['provider']}
                    data['images'].append(foto)

            # 學名
            if data['rank_id'] == 47:
                query = f"WITH view as (SELECT tnhp.taxon_name_id, CONCAT_WS(' ',an.formatted_name, an.name_author ) as sci_name FROM taxon_name_hybrid_parent tnhp \
                JOIN api_names an ON tnhp.parent_taxon_name_id = an.taxon_name_id \
                WHERE tnhp.taxon_name_id = {data['name_id']} \
                ORDER BY tnhp.order) \
                SELECT group_concat(sci_name SEPARATOR ' × ') FROM view \
                GROUP BY taxon_name_id "
                conn = pymysql.connect(**db_settings)
                with conn.cursor() as cursor:
                    cursor.execute(query)
                    n = cursor.fetchone()
                    conn.close()
                    if n:
                        data['sci_name'] = n[0] 
            data['status'] = f"{status_map_taxon_c[data['status']]['zh-tw']} {status_map_taxon_c[data['status']]['en-us']}"
            is_list = ['is_endemic','alien_type','is_terrestrial','is_freshwater','is_brackish','is_marine']
            for i in is_list:
                if i == 'alien_type' and (a_type := data['alien_type']):
                    info_html_str += f'<div class="item">{alien_map_c[a_type]}</div>'
                elif data[i] == 1:
                    info_html_str += f'<div class="item">{is_map_c[i]}</div>'

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
                    data['cites_note'] = c_str.rstrip('；')
                else:
                    data['cites_note'] = ''

            if c_iucn := data['iucn_category']:
                data['iucn_category'] = iucn_map_c[c_iucn] + ' ' + c_iucn

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
            if data['path']:
                path = data['path'].split('>')
                # 專家列表
                # 如果同一個專家有多個taxon_group要concat
                experts = Expert.objects.filter(taxon_id__in=path).values('name','name_e','email').annotate(taxon_group_agg=StringAgg('taxon_group', delimiter=', '))
                path = [p for p in path if p!=taxon_id]
                if path:
                    query = f"SELECT t.rank_id, t.taxon_id, an.formatted_name, t.common_name_c \
                            FROM api_taxon t \
                            JOIN api_names an ON t.accepted_taxon_name_id = an.taxon_name_id \
                            WHERE t.taxon_id IN ({str(path).replace('[','').replace(']','')}) and t.rank_id >= 3\
                            ORDER BY t.rank_id ASC"
                    conn = pymysql.connect(**db_settings)
                    with conn.cursor() as cursor:
                        cursor.execute(query)
                        higher = cursor.fetchall()
                        conn.close()
                        for h in higher:
                            if h[0] in [3,12,18,22,26,30,34]:
                                higher_html_str += f"""<div class="item">
                                                    <div class="cir-box {rank_color_map[h[0]]}">
                                                        {rank_map_c[h[0]]}
                                                    </div>
                                                    <a class="rank-p" target="_blank" href="/taxon/{h[1]}">
                                                        {h[2]} {h[3]}</a>
                                                    </div>
                                                    """
                            else:
                                higher_html_str += f"""<div class="item">
                                <div class="cir-box rank-second-gray">
                                    {rank_map_c[h[0]]}
                                </div>
                                <a class="rank-p" target="_blank" href="/taxon/{h[1]}"></a>
                                    {h[2]} {h[3]}
                                </div>
                                """
            else:
                experts = Expert.objects.filter(taxon_id=taxon_id)

            # 學名變遷
            # 需確認是不是原始組合名
            new_refs = []
            query = f"""SELECT atu.taxon_name_id, an.formatted_name, an.name_author, ac.short_author, atu.status,
                        ru.status, JSON_EXTRACT(ru.properties, '$.is_in_taiwan'), tn.nomenclature_id, 
                        tn.publish_year, ru.per_usages,
                        ru.reference_id, tn.reference_id, r.publish_year
                        FROM api_taxon_usages atu 
                        LEFT JOIN api_names an ON an.taxon_name_id = atu.taxon_name_id
                        LEFT JOIN reference_usages ru ON ru.id = atu.reference_usage_id
                        JOIN `references` r ON r.id = ru.reference_id
                        LEFT JOIN api_citations ac ON ac.reference_id = ru.reference_id
                        JOIN taxon_names tn ON tn.id = atu.taxon_name_id
                        WHERE atu.taxon_id = '{taxon_id}' and ru.reference_id != 153"""
            conn = pymysql.connect(**db_settings)
            with conn.cursor() as cursor:
                cursor.execute(query)
                names = cursor.fetchall()
                conn.close()
                names = pd.DataFrame(names, columns=['taxon_name_id','sci_name','author','ref','taxon_status','ru_status',
                                                     'is_taiwan','nomenclature_id','publish_year','per_usages','reference_id', 'o_reference_id','r_publish_year'])
                if len(names):
                    names = names.sort_values('publish_year', ascending=False)
                    names = names.replace({None:''})
                    names['per_usages'] = names['per_usages'].apply(json.loads)
                    names['sci_name'] = names.apply(lambda x: f'<a href="https://nametool.taicol.tw/taxon-names/{x.taxon_name_id}", target="_blank">{x.sci_name}</a>', axis=1)
                    names['author'] = names.apply(lambda x: f"{x.author}, {x.publish_year}" if x.nomenclature_id==2 and x.publish_year else x.author, axis=1)
                    names['author'] = names.apply(lambda x: f'<a href="https://nametool.taicol.tw/references/{x.o_reference_id}", target="_blank">{x.author}</a>' if x.o_reference_id else x.author, axis=1)
                    names['sci_name'] = names.apply(lambda x: f'{x.sci_name} {x.author}' if x.author else x.sci_name, axis=1)
                    # 如果per_usages中有其他ref則補上
                    for pp in names['per_usages']:
                        for p in pp:
                            if p.get('reference_id') not in new_refs and p.get('reference_id') not in names.reference_id:
                                new_refs.append(p.get('reference_id'))
                    if new_refs:
                        query = f"""SELECT ac.reference_id, ac.short_author, r.publish_year
                                    FROM api_citations ac 
                                    JOIN `references` r ON r.id = ac.reference_id
                                    WHERE ac.reference_id IN ({str(new_refs).replace('[','').replace(']','')})"""
                        conn = pymysql.connect(**db_settings)
                        with conn.cursor() as cursor:
                            cursor.execute(query)
                            usage_refs = cursor.fetchall()
                            usage_refs = pd.DataFrame(usage_refs, columns=['reference_id','ref','publish_year'])
                            conn.close()
                    # names = names.append(usage_refs).reset_index(drop=True)
                    for n in names.taxon_name_id.unique():
                        # 如果是原始組合名
                        ref_list = []
                        ref_str = ''
                        if n == data['original_taxon_name_id']:
                            if len(names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].ref):
                                # ref_list = [r for r in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].ref if r ]
                                for r in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].index:
                                    if names.loc[r].ref:
                                        ref_list += [[names.loc[r].ref, names.loc[r].reference_id, names.loc[r].r_publish_year]]
                                # per_usages
                            for pu in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].per_usages:
                                for ppu in pu:
                                    if not ppu.get('is_from_published_ref', False):
                                        current_ref = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'ref'].values[0]
                                        current_year = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'publish_year'].values[0]
                                        if ppu.get('pro_parte'):
                                            current_ref += ', pro parte'
                                        if current_ref not in ref_list:
                                            ref_list.append([current_ref,ppu.get('reference_id')],current_year)
                            ref_list = pd.DataFrame(ref_list,columns=['ref','ref_id','year']).drop_duplicates().sort_values('year')
                            ref_list = [f"<a href='https://nametool.taicol.tw/references/{int(r[1]['ref_id'])}' target='_blank'>{r[1]['ref']}</a>" for r in ref_list.iterrows()]
                            ref_str = ('; ').join(ref_list)
                            if ref_str:
                                name_changes += [[f"{names[names.taxon_name_id==n]['sci_name'].values[0]}; {ref_str}", names[names.taxon_name_id==n]['r_publish_year'].min()]]
                            else:
                                name_changes += [[names[names.taxon_name_id==n]['sci_name'].values[0], names[names.taxon_name_id==n]['r_publish_year'].min()]]
                        # 如果是誤用名
                        elif len(names[(names.taxon_name_id==n)&(names.ru_status=='misapplied')]):
                            if len(names[(names.taxon_name_id==n)&(names.ru_status=='accepted')&(names.is_taiwan==1)].ref):
                                # ref_list += [r for r in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')&(names.is_taiwan==1)].ref if r ]
                                for r in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')&(names.is_taiwan==1)].index:
                                    if names.loc[r].ref:
                                        ref_list += [[names.loc[r].ref, names.loc[r].reference_id, names.loc[r].publish_year]]
                            for pu in names[(names.taxon_name_id==n)&(names.ru_status=='misapplied')].per_usages:
                                for ppu in pu:
                                    if not ppu.get('is_from_published_ref', False):
                                        current_ref = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'ref'].values[0]
                                        current_year = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'publish_year'].values[0]
                                        if ppu.get('pro_parte'):
                                            current_ref += ', pro parte'
                                        if current_ref not in ref_list:
                                            ref_list.append([current_ref,ppu.get('reference_id'),current_year])
                            ref_list = pd.DataFrame(ref_list,columns=['ref','ref_id','year']).drop_duplicates().sort_values('year')
                            min_year = ref_list.year.min()
                            # 決定排序的publish_year
                            ref_list = [f"<a href='https://nametool.taicol.tw/references/{int(r[1]['ref_id'])}' target='_blank'>{r[1]['ref']}</a>" for r in ref_list.iterrows()]
                            ref_str = ('; ').join(ref_list)
                            if ref_str:
                                name_changes += [[f"{names[names.taxon_name_id==n]['sci_name'].values[0]} (誤用): {ref_str}",min_year]]
                            else:
                                name_changes += [[names[names.taxon_name_id==n]['sci_name'].values[0] + ' (誤用)', '']]
                        elif not len(names[(names.taxon_name_id==n)&(names.ru_status=='misapplied')]):
                            if len(names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].ref):
                                # ref_list = [r for r in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].ref if r ]
                                for r in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].index:
                                    if names.loc[r].ref:
                                        ref_list += [[names.loc[r].ref, names.loc[r].reference_id, names.loc[r].r_publish_year]]
                            for pu in names[(names.taxon_name_id==n)&(names.ru_status=='accepted')].per_usages:
                                for ppu in pu:
                                    if not ppu.get('is_from_published_ref', False):
                                        current_ref = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'ref'].values[0]
                                        current_year = usage_refs.loc[usage_refs.reference_id==ppu.get('reference_id'),'publish_year'].values[0]
                                        if ppu.get('pro_parte'):
                                            current_ref += ', pro parte'
                                        if current_ref not in ref_list:
                                            ref_list.append([current_ref,ppu.get('reference_id'),current_year])
                            ref_list = pd.DataFrame(ref_list,columns=['ref','ref_id','year']).drop_duplicates().sort_values('year')
                            # 決定排序的publish_year
                            ref_list = [f"<a href='https://nametool.taicol.tw/references/{int(r[1]['ref_id'])}' target='_blank'>{r[1]['ref']}</a>" for r in ref_list.iterrows()]
                            # ref_list = [f"<a href='https://nametool.taicol.tw/references/{int(r[1])}' target='_blank'>{r[0]}</a>" for r in ref_list]
                            ref_str = ('; ').join(ref_list)
                            if ref_str:
                                name_changes += [[f"{names[names.taxon_name_id==n]['sci_name'].values[0]}: {ref_str}",names[names.taxon_name_id==n]['publish_year'].min()]]
                            else:
                                name_changes += [[names[names.taxon_name_id==n]['sci_name'].values[0], names[names.taxon_name_id==n]['publish_year'].min()]]
            if name_changes:
                name_changes = pd.DataFrame(name_changes, columns=['name_str','year']).sort_values('year')
                name_changes = name_changes.name_str.to_list()
            # 文獻
            get_ref_list = new_refs + names.reference_id.to_list()
            if get_ref_list:
                query = f"(SELECT distinct(r.id), CONCAT_WS(' ' ,c.author, c.content), r.publish_year, c.author\
                        FROM api_citations c \
                        JOIN `references` r ON c.reference_id = r.id \
                        WHERE c.reference_id IN ({str(get_ref_list).replace('[','').replace(']','')}) GROUP BY r.id \
                        UNION  \
                        SELECT distinct(tn.reference_id), CONCAT_WS(' ' ,c.author, c.content), r.publish_year, c.author \
                        FROM taxon_names tn \
                        JOIN api_citations c ON tn.reference_id = c.reference_id     \
                        JOIN `references` r ON c.reference_id = r.id \
                        WHERE tn.id IN (SELECT taxon_name_id FROM api_taxon_usages WHERE taxon_id = '{taxon_id}' )) \
                        ORDER BY author ASC, publish_year DESC "  
            else:
                query = f"(SELECT distinct(r.id), CONCAT_WS(' ' ,c.author, c.content), r.publish_year, c.author\
                        FROM api_taxon_usages atu \
                        JOIN reference_usages ru ON atu.reference_usage_id = ru.id \
                        JOIN `references` r ON ru.reference_id = r.id \
                        JOIN api_citations c ON ru.reference_id = c.reference_id \
                        WHERE atu.taxon_id = '{taxon_id}' and r.id != 153 and ru.status != '' GROUP BY r.id \
                        UNION  \
                        SELECT distinct(tn.reference_id), CONCAT_WS(' ' ,c.author, c.content), r.publish_year, c.author \
                        FROM taxon_names tn \
                        JOIN api_citations c ON tn.reference_id = c.reference_id     \
                        JOIN `references` r ON c.reference_id = r.id \
                        WHERE tn.id IN (SELECT taxon_name_id FROM api_taxon_usages WHERE taxon_id = '{taxon_id}' )) \
                        ORDER BY author ASC, publish_year DESC "  
            # 不給TaiCOL backbone 還要給taxon_names底下的
            conn = pymysql.connect(**db_settings)
            with conn.cursor() as cursor:
                cursor.execute(query)
                refs_r = cursor.fetchall()
                refs = [[r[0],r[1]] for r in refs_r if [r[0],r[1]] not in refs]
                conn.close()
            
            # 相關連結
            # ncbi如果超過一個就忽略
            if data['links']:
                xx = json.loads(data['links'])
                tmp_links = []
                for tl in xx:
                    if tl not in tmp_links:
                        tmp_links.append(tl)
                ncbi_count = 0
                for t in tmp_links:
                    if t["source"] == 'ncbi':
                        ncbi_count += 1
                use_ncbi = True
                if ncbi_count > 1:
                    use_ncbi = False
                for t in tmp_links:
                    if t["source"] in ["antwiki","mycobank","worms","powo","tropicos","lpsn","adw","fishbase_order","gisd"]:
                        links += [{'href': link_map[t["source"]]['url_prefix'], 'title': link_map[t["source"]]['title'], 'suffix': data['name'], 'hidden_name': True}]
                    elif t["source"] == 'nc':
                        links += [{'href': link_map[t["source"]]['url_prefix'], 'title': link_map[t["source"]]['title'], 'suffix': t['suffix'], 'id': t['suffix'].split('=')[1].split('&')[0]}]
                    elif t["source"] == 'amphibiansoftheworld':
                        links += [{'href': link_map[t["source"]]['url_prefix'], 'title': link_map[t["source"]]['title'], 'suffix': t['suffix'], 'id': t['suffix'].split('/')[-1]}]
                    elif t["source"] != 'ncbi':
                        links += [{'href': link_map[t["source"]]['url_prefix'], 'title': link_map[t["source"]]['title'], 'suffix': t['suffix']}]
                    elif t["source"] == 'ncbi' and use_ncbi:
                        links += [{'href': link_map[t["source"]]['url_prefix'], 'title': link_map[t["source"]]['title'], 'suffix': t['suffix']}]
            for s in ['wikispecies','discoverlife','taibif','inat','irmng']:
                links += [{'href': link_map[s]['url_prefix'], 'title': link_map[s]['title'] ,'suffix': data['name'], 'hidden_name': True}]
            # 全部都接 wikispecies,discoverlife,taibif,inat,irmng
            # 變更歷史
            query = f"""SELECT ath.type, ath.content, CONCAT_WS(' ' , ac.author, ac.content), ath.created_at
                        FROM api_taxon_history ath 
                        LEFT JOIN reference_usages ru ON ru.id = ath.reference_usage_id
                        LEFT JOIN api_citations ac ON ac.reference_id = ru.reference_id
                        WHERE ath.taxon_id = '{taxon_id}'"""
            conn = pymysql.connect(**db_settings)
            with conn.cursor() as cursor:
                cursor.execute(query)
                th = cursor.fetchall()
                conn.close()
                for thh in th:
                    row = [taxon_history_map[thh[0]], thh[1], thh[2], thh[3].strftime("%Y-%m-%d<br>%H:%M:%S")]
                    taxon_history.append(row)
            taxon_history = pd.DataFrame(taxon_history, columns=['type','content','ref','datetime'])
            taxon_history = taxon_history.drop_duplicates(subset=['type','content','ref']).to_dict(orient='records')
            self_html_str = ""
            if data['rank_id'] in [3,12,18,22,26,30,34]:
                self_html_str += f""" <div class="r-cir-box {rank_color_map[data['rank_id']]}">
									 {rank_map_c[data['rank_id']]}
                                    </div> 
                                    <span class="r-name">{data['common_name_c']}<span>"""
            else:
                self_html_str += f"""<div class="r-cir-box rank-second-gray">
                                        {rank_map_c[data['rank_id']]}
                                    </div>
                                    <span class="r-name">{data['common_name_c']}<span>"""

    return render(request, 'taxa/taxon.html', {'taxon_id': taxon_id, 'data': data, 'higher_html_str': higher_html_str, 'links': links,
                                               'info_html_str': info_html_str, 'refs': refs, 'experts': experts, 'name_changes': name_changes,
                                               'taxon_history': taxon_history, 'self_html_str': self_html_str})


def taxon_tree(request):
    # 第一層 kingdom
    kingdom_dict = []
    for k in kingdom_map.keys():
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            query = f"""SELECT COUNT(distinct(att.taxon_id)), at.rank_id FROM api_taxon_tree att 
                    JOIN api_taxon at ON att.taxon_id = at.taxon_id
                    WHERE att.path LIKE '%{k}%' and at.rank_id > 3
                    GROUP BY at.rank_id ORDER BY at.rank_id ASC;
                """
            cursor.execute(query)
            stats = cursor.fetchall()
            conn.close()
            spp = 0
            stat_str = ''
            for s in stats:
                r_id = s[1]
                if r_id <= 46 and r_id >= 35:
                    spp += s[0]
                elif r_id == 47:
                    stat_str += f"{spp}種下 {s[0]}{rank_map_c[r_id]}"
                else:
                    stat_str += f"{s[0]}{rank_map_c[r_id]} "
            kingdom_dict += [{'taxon_id': k, 'name': f"{kingdom_map[k]['common_name_c']} Kingdom {kingdom_map[k]['name']}",'stat': stat_str.strip()}]
    search_stat = SearchStat.objects.all().order_by('-count')[:6]
    s_taxon = [s.taxon_id for s in search_stat]
    if s_taxon:
        query = f"""SELECT DISTINCT(at.taxon_id), at.common_name_c, an.formatted_name
                    FROM api_taxon at
                    JOIN api_names an ON at.accepted_taxon_name_id= an.taxon_name_id 
                    WHERE at.taxon_id IN ({str(s_taxon).replace('[','').replace(']','')});"""
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            cursor.execute(query)
            tags = cursor.fetchall()
            conn.close()
            search_stat = []
            for t in tags:
                if t[1]:
                    search_stat.append({'taxon_id': t[0], 'name': t[1]})
                else:
                    search_stat.append({'taxon_id': t[0], 'name': t[2]})

    return render(request, 'taxa/taxon_tree.html', {'kingdom_dict':kingdom_dict, 'search_stat': search_stat})

def get_sub_tree(request):
    taxon_id = request.POST.get('taxon_id')
    sub_dict = get_tree_stat(taxon_id)
    return HttpResponse(json.dumps(sub_dict), content_type='application/json') 


def get_taxon_path(request):
    taxon_id = request.POST.get('taxon_id')
    conn = pymysql.connect(**db_settings)
    path = []

    if taxon_id:
        query = f"""SELECT path FROM api_taxon_tree WHERE taxon_id = '{taxon_id}';"""
        with conn.cursor() as cursor:
            cursor.execute(query)
            ps = cursor.fetchone()
            conn.close()
            if ps:
                path = ps[0].split('>')
    # sub_dict_list = []
    # for t in Reverse(path):
    #     sub_dict_list.append(get_tree_stat(t))
    return HttpResponse(json.dumps(Reverse(path)), content_type='application/json') 


def get_sub_tree_list(request):
    sub_dict_list = []
    taxon_id = request.POST.getlist('taxon_id[]')
    for t in taxon_id:
        sub_dict_list.append(get_tree_stat(t))
    return HttpResponse(json.dumps(sub_dict_list), content_type='application/json') 



def Reverse(lst):
    new_lst = lst[::-1]
    return new_lst
 

def get_tree_stat(taxon_id):
    sub_dict = {}
    sub_titles = []

    conn = pymysql.connect(**db_settings)

    query = f"""SELECT COUNT(distinct(att.taxon_id)), at.rank_id, 
                SUBSTRING_INDEX(SUBSTRING_INDEX(att.path, '>{taxon_id}', 1), '>', -1) AS p_group 
                FROM api_taxon_tree att 
                JOIN api_taxon at ON att.taxon_id = at.taxon_id
                WHERE att.path LIKE '%>{taxon_id}%' AND at.rank_id > (SELECT rank_id from api_taxon WHERE taxon_id = '{taxon_id}')
                GROUP BY at.rank_id, p_group;
            """
    with conn.cursor() as cursor:
        cursor.execute(query)
        sub_stat = cursor.fetchall()
        sub_stat = pd.DataFrame(sub_stat, columns=['count','rank_id','taxon_id'])
        conn.close()
    query = f"""SELECT at.taxon_id, at.rank_id, CONCAT_WS(' ',at.common_name_c, r.display ->> '$."en-us"' ,an.formatted_name),
                r.display ->> '$."zh-tw"'
                FROM api_taxon_tree att 
                JOIN api_taxon at ON att.taxon_id = at.taxon_id
                JOIN taxon_names tn ON at.accepted_taxon_name_id = tn.id
                JOIN ranks r ON at.rank_id = r.id
                JOIN api_names an ON at.accepted_taxon_name_id= an.taxon_name_id 
                WHERE att.parent_taxon_id = '{taxon_id}' ORDER BY at.rank_id DESC, tn.name;"""
    conn = pymysql.connect(**db_settings)
    with conn.cursor() as cursor:
        cursor.execute(query)
        sub_titles = cursor.fetchall()
        # 下一層的rank有可能不一樣
        conn.close()
    for st in sub_titles:
        rank_c = st[3]
        if st[1] in [3,12,18,22,26,30,34]:
            rank_color = rank_color_map[st[1]]
        else:
            rank_color = 'rank-second-gray'
        stat_str = ''
        spp = 0
        stats = sub_stat[(sub_stat.taxon_id==st[0])&(sub_stat.rank_id!=st[1])]
        for i in stats.index:
            s = sub_stat.iloc[i]
            if s['count'] > 0:
                r_id = s.rank_id
                if r_id <= 46 and r_id >= 35:
                    spp += s['count']
                elif r_id == 47:
                    if spp > 0:
                        stat_str += f"{spp}種下 {s['count']}{rank_map_c[r_id]}"
                    else:
                        stat_str += f"{s['count']}{rank_map_c[r_id]}"
                else:
                    stat_str += f"{s['count']}{rank_map_c[r_id]} "
        if spp > 0 and '種下' not in stat_str:
            # 如果沒有47 最後要把種下加回去
            stat_str += f"{spp}種下"
        if rank_c not in sub_dict.keys():
            sub_dict[rank_c] = {}
            sub_dict[rank_c]['data'] = [{'taxon_id': st[0],'rank_id':st[1],'name':st[2], 'stat':stat_str.strip()}]
            sub_dict[rank_c]['rank_color'] = rank_color
            sub_dict[rank_c]['taxon_id'] = taxon_id
        else:
            sub_dict[rank_c]['data'] += [{'taxon_id': st[0],'rank_id':st[1],'name':st[2], 'stat':stat_str.strip()}]
            sub_dict[rank_c]['taxon_id'] = taxon_id
    return sub_dict


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
        names = [n for n in name if n not in names and n] # 排除重複 & 空值
        response['page']['current_page'] = page
        response['page']['total_page'] = math.ceil(len(names) / 10)
        response['page']['page_list'] = get_page_list(response['page']['current_page'], response['page']['total_page'])

        names = ('|').join(names[(page-1)*10:page*10])
        url = f"{env('NOMENMATCH_ROOT')}"
        # url = 'http://host.docker.internal:8080/api.php'
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
                query = f""" SELECT at.accepted_taxon_name_id, at.is_endemic, at.alien_type, at.is_terrestrial, 
                             at.is_freshwater, at.is_brackish, at.is_marine,
                             at.taxon_id, ac.protected_category, ac.red_category, ac.iucn_category, ac.cites_listing,
                             at.rank_id, an.formatted_name, at.common_name_c
                            FROM api_taxon at
                            LEFT JOIN api_conservation ac ON ac.taxon_id = at.taxon_id
                            JOIN api_names an ON an.taxon_name_id = at.accepted_taxon_name_id
                            WHERE at.accepted_taxon_name_id IN ({','.join(namecode_list)})
                        """
                conn = pymysql.connect(**db_settings)
                with conn.cursor() as cursor:
                    cursor.execute(query)
                    info = cursor.fetchall()
                    conn.close()
                    info = pd.DataFrame(info, columns=['accepted_namecode','is_endemic', 'alien_type', 'is_terrestrial', 'is_freshwater', 'is_brackish', 'is_marine',
                                                        'taxon_id', 'protected_category', 'red_category', 'iucn_category', 'cites_listing', 'rank_id', 'formatted_name', 'common_name_c'])
                    info = info.astype({'accepted_namecode': 'str'})
                    # print(info, df_flat)
                    df = df.merge(info,how='left')
                    df = df.replace({np.nan: '', None: ''})
                    df['cites_listing'] = df['cites_listing'].apply(lambda x: x.replace('1','I').replace('2','II').replace('3','III'))
                    # taxon group
                    for i in df.index:
                        current_rank = df.iloc[i].rank_id
                        # print(current_rank)
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
                    df['rank'] = df['rank_id'].apply(lambda x: rank_map_c[x] if x else '')
                    df['alien_type'] = df['alien_type'].apply(lambda x: alien_map_c[x] if x else '')
                    df['is_endemic'] = df['is_endemic'].apply(lambda x: '臺灣特有' if x == 1 else '')
            df = df.replace({np.nan: '', None: ''})
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
            url = f"{env('NOMENMATCH_ROOT')}"
            # url = 'http://host.docker.internal:8080/api.php'
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
                    query = f""" SELECT at.accepted_taxon_name_id, at.is_endemic, at.alien_type, at.is_terrestrial, 
                                at.is_freshwater, at.is_brackish, at.is_marine,
                                at.taxon_id, ac.protected_category, ac.red_category, ac.iucn_category, ac.cites_listing,
                                at.rank_id, an.formatted_name, at.common_name_c
                                FROM api_taxon at
                                LEFT JOIN api_conservation ac ON ac.taxon_id = at.taxon_id
                                JOIN api_names an ON an.taxon_name_id = at.accepted_taxon_name_id
                                WHERE at.accepted_taxon_name_id IN ({','.join(namecode_list)})
                            """
                    conn = pymysql.connect(**db_settings)
                    with conn.cursor() as cursor:
                        cursor.execute(query)
                        info = cursor.fetchall()
                        conn.close()
                        info = pd.DataFrame(info, columns=['accepted_namecode','is_endemic', 'alien_type', 'is_terrestrial', 'is_freshwater', 'is_brackish', 'is_marine',
                                                            'taxon_id', 'protected_category', 'red_category', 'iucn_category', 'cites_listing', 'rank_id', 'formatted_name', 'common_name_c'])
                        info = info.astype({'accepted_namecode': 'str'})
                        # print(info, df_flat)
                        df = df.merge(info,how='left')
                        df = df.replace({np.nan: '', None: ''})
                        df['cites_listing'] = df['cites_listing'].apply(lambda x: x.replace('1','I').replace('2','II').replace('3','III'))
                        df['rank'] = df['rank_id'].apply(lambda x: rank_map[x] if x else '')
                        df.loc[df.taxon_id!='','is_endemic'] = df.loc[df.taxon_id.notnull(),'is_endemic'].apply(lambda x: 1 if x == 1 else 0)
                df = df.replace({np.nan: '', None: ''})
                final_df = final_df.append(df)
    # 移除不需要的欄位
    cols = ["search_term","matched","common_name_c","kingdom","phylum","class","order","family","genus","rank","is_endemic","alien_type",
            "is_terrestrial","is_freshwater","is_brackish","is_marine","protected_category","red_category","iucn_category","cites_listing","taxon_id"]
    # [c for c in cols if c in final_df.keys()]
    final_df = final_df[[c for c in cols if c in final_df.keys()]]
    final_df = final_df.rename(columns={
        "search_term":"查詢字串","matched":"比對結果","common_name_c":"中文名","kingdom":"界","phylum":"門","class":"綱","order":"目","family":"科",
        "genus":"屬","rank":"階層","is_endemic":"臺灣特有",
        "alien_type":"原生/外來性","is_terrestrial":"陸生","is_freshwater":"淡水","is_brackish":"半鹹水","is_marine":"海水",
        "protected_category":"保育類","red_category":"臺灣紅皮書",
        "iucn_category":"IUCN評估","cites_listing":"CITES附錄","taxon_id":"Taxon ID"
    })

    if file_format == 'json':
        response = HttpResponse(content_type="application/json")
        response['Content-Disposition'] =  f'attachment; filename=taicol_download_{datetime.datetime.now().strftime("%Y%m%d%H%M%s")}.json'
        final_df.to_json(response, orient='records')
    else:
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
    send_mail('[TaiCOL]網站錯誤回報', email_body, 'no-reply@taicol.tw', ['catalogueoflife.taiwan@gmail.com'])
