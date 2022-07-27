from django.shortcuts import render
from taxa.utils import get_page_list, rank_map, rank_map_c, alien_map_c, status_map_c, kingdom_map
from django.http import HttpResponse
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
    condition, path_join, conserv_join = get_conditioned_query(req, from_url=True) # 不考慮facet選項
    # 先計算一次
    query = f"""SELECT distinct(at.taxon_id)
                        FROM taxon_names tn 
                        JOIN api_taxon_usages atu ON atu.taxon_name_id = tn.id
                        JOIN api_taxon at ON atu.taxon_id = at.taxon_id
                        {conserv_join}
                        {path_join}
                        WHERE {condition}"""
    conn = pymysql.connect(**db_settings)
    tids = []
    with conn.cursor() as cursor:
        cursor.execute(query)
        tids = cursor.fetchall()
        tids = [t[0] for t in tids]
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
    if keyword_str := request.POST.get('keyword'):
        if len(keyword_str) > 2 or any(re.findall(r'[\u4e00-\u9fff]+', keyword_str)): # 避免太多
            query = f"""SELECT at.taxon_id, CONCAT_WS (' ',tn.name, CONCAT_WS(',', at.common_name_c, at.alternative_name_c))
                        FROM taxon_names tn
                        JOIN api_taxon at ON at.accepted_taxon_name_id = tn.id
                        WHERE tn.name like '%{keyword_str}%' OR 
                            at.common_name_c like '%{keyword_str}%' OR at.alternative_name_c like '%{keyword_str}%'"""
            conn = pymysql.connect(**db_settings)
            with conn.cursor() as cursor:
                cursor.execute(query)
                results = cursor.fetchall()
                for r in results:
                    names += [{'label': r[1], 'value': r[0]}]
    return HttpResponse(json.dumps(names), content_type='application/json') 


def get_conditioned_query(req, from_url=False):
    condition = ''

    if keyword := req.get('keyword'):
        keyword_type = req.get('name-select','contain')
        if keyword_type == "equal":
            keyword_str = f"= '{keyword}'"
        elif keyword_type == "startwith":
            keyword_str = f"LIKE '{keyword}%'"
        else:
            keyword_str = f"LIKE '%{keyword}%'"
        condition = f"""(tn.name {keyword_str} OR at.common_name_c {keyword_str} OR at.alternative_name_c {keyword_str})"""

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
                r_str = 'at.rank_id = ' + r
            else:
                r_str += ' OR at.rank_id = ' + r
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
    path_join = ''
    if higher_taxon_id := req.get('taxon_group_id'):
        path_join = "LEFT JOIN api_taxon_tree att ON att.taxon_id = at.taxon_id"
        condition +=  f' AND att.path like "%>{higher_taxon_id}%"'

    if not from_url:
        if facet := req.get('facet'):
            value = req.get('value')
            if facet == 'rank':
                condition += f" AND at.rank_id = {int(value)}"
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

    return condition, path_join, conserv_join


def get_query_data(condition, conserv_join, offset, response):
    conn = pymysql.connect(**db_settings)
    query = f"""
                SELECT distinct(at.taxon_id), tn.name, tn.rank_id, an.formatted_name, at.common_name_c, atu.status,
                    at.is_endemic, at.alien_type, att.path   
                FROM taxon_names tn 
                JOIN api_taxon_usages atu ON atu.taxon_name_id = tn.id
                JOIN api_taxon at ON atu.taxon_id = at.taxon_id
                JOIN api_names an ON an.taxon_name_id = tn.id
                LEFT JOIN api_taxon_tree att ON att.taxon_id = at.taxon_id
                {conserv_join}
                WHERE {condition} 
                ORDER BY tn.name LIMIT 10 OFFSET {offset} 
            """
    with conn.cursor() as cursor:
        cursor.execute(query)
        results = cursor.fetchall()
        if results:
            results = pd.DataFrame(results, columns=['taxon_id','simple_name','rank','name','common_name_c','status','is_endemic','alien_type','path'])
            results = results.drop(columns=['simple_name'])
            results = results.drop_duplicates()
            results = results.reset_index()
            results['kingdom'] = ''
            results['taxon_group'] = ''
            for i in results.index:
                if results.iloc[i].path:
                    path = results.iloc[i].path.split('>')
                    if results.iloc[i]['rank'] <= 3:
                        higher = None
                    elif results.iloc[i]['rank'] < 30: # 屬以上取上層
                        higher = [h for h in [3,12,18,22,26] if h < results.iloc[i]['rank']]
                        higher = higher[-1]
                    else: # 取科
                        higher = 26
                    # 一定是科以上所以不用formatted_name
                    query = f"SELECT t.rank_id, t.common_name_c, tn.name \
                            FROM api_taxon t \
                            JOIN taxon_names tn ON t.accepted_taxon_name_id = tn.id \
                            WHERE t.taxon_id IN ({str(path).replace('[','').replace(']','')})"
                    if higher:
                        query += f"AND t.rank_id IN (3,{higher}) ORDER BY t.rank_id ASC"
                    else:
                        query += f"AND t.rank_id = 3"
                    # conn = pymysql.connect(**db_settings)
                    with conn.cursor() as cursor:
                        cursor.execute(query)
                        higher_taxa = cursor.fetchall() 
                        for h in higher_taxa:
                            h_list = [hl for hl in h[1:] if hl]
                            if h[0] == 3:
                                results.loc[i,'kingdom'] = ' '.join(h_list)
                            else:
                                results.loc[i,'taxon_group'] = ' '.join(h_list)
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
    condition, path_join, conserv_join = get_conditioned_query(req)

    # pagination
    response['page'] = {}
    # TODO 如果是from facet的話要修改
    print(req)
    if req.get('facet'):
        first_query = f"""SELECT count(distinct(at.taxon_id)) 
                            FROM taxon_names tn 
                            JOIN api_taxon_usages atu ON atu.taxon_name_id = tn.id
                            JOIN api_taxon at ON atu.taxon_id = at.taxon_id
                            {conserv_join}
                            {path_join}
                            WHERE {condition}"""
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            cursor.execute(first_query)
            count = cursor.fetchone()
            response['page']['total_page'] = math.ceil((count[0]) / 10)
    else:
        response['page']['total_page'] = int(req.get('total_page'))

    # response['page']['total_page'] = math.ceil((response['count']['total'][0]['count']) / 10)
    response['page']['current_page'] = page
    response['page']['page_list'] = get_page_list(response['page']['current_page'], response['page']['total_page'])

    # 以下的query和起始的相同
    offset = 10 * (page-1)
    response = get_query_data(condition, conserv_join, offset, response)

    return HttpResponse(json.dumps(response), content_type='application/json')


def catalogue(request):
    # from 進階搜尋
    response = {}
    keyword = request.GET.get('keyword', '')
    if request.method == 'POST':
        req = request.POST
        offset = 10 * (int(req.get('page',1))-1)

        condition, path_join, conserv_join = get_conditioned_query(req, from_url=True)
        # 先計算一次
        first_query = f"""SELECT count(distinct(at.taxon_id)) 
                            FROM taxon_names tn 
                            JOIN api_taxon_usages atu ON atu.taxon_name_id = tn.id
                            JOIN api_taxon at ON atu.taxon_id = at.taxon_id
                            {conserv_join}
                            {path_join}
                            WHERE {condition}"""
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            cursor.execute(first_query)
            count = cursor.fetchone()
        if count[0] > 0:
            total_count = count[0]
            count_query = f"""
                                (
                                SELECT count(distinct(at.taxon_id)) as `value`, tn.rank_id as `category`, 'rank' as `facet`
                                FROM taxon_names tn 
                                JOIN api_taxon_usages atu ON atu.taxon_name_id = tn.id
                                JOIN api_taxon at ON atu.taxon_id = at.taxon_id
                                {conserv_join}
                                {path_join}
                                WHERE {condition}
                                GROUP BY tn.rank_id 
                                UNION
                                SELECT count(distinct(at.taxon_id)) as `value`, atu.status as `category`, 'status' as `facet`
                                FROM taxon_names tn 
                                JOIN api_taxon_usages atu ON atu.taxon_name_id = tn.id
                                JOIN api_taxon at ON atu.taxon_id = at.taxon_id
                                {conserv_join}
                                {path_join}
                                WHERE {condition}
                                GROUP BY atu.status
                                UNION
                                SELECT count(distinct(at.taxon_id)) as `value`, at.alien_type as `category`, 'alien_type' as `facet`
                                FROM taxon_names tn 
                                JOIN api_taxon_usages atu ON atu.taxon_name_id = tn.id
                                JOIN api_taxon at ON atu.taxon_id = at.taxon_id
                                {conserv_join}
                                {path_join}
                                WHERE {condition}
                                GROUP BY at.alien_type
                                UNION
                                SELECT count(distinct(at.taxon_id)) as `value`, at.alien_type as `category`, 'alien_type' as `facet`
                                FROM taxon_names tn 
                                JOIN api_taxon_usages atu ON atu.taxon_name_id = tn.id
                                JOIN api_taxon at ON atu.taxon_id = at.taxon_id
                                {conserv_join}
                                {path_join}
                                WHERE {condition}
                                GROUP BY at.alien_type
                                UNION
                                SELECT count(distinct(at.taxon_id)) as `value`, at.is_endemic as `category`, 'is_endemic' as `facet`
                                FROM taxon_names tn 
                                JOIN api_taxon_usages atu ON atu.taxon_name_id = tn.id
                                JOIN api_taxon at ON atu.taxon_id = at.taxon_id
                                {conserv_join}
                                {path_join}
                                WHERE {condition}
                                GROUP BY at.is_endemic
                                UNION
                                SELECT count(distinct(at.taxon_id)), SUBSTRING(att.path, -7, 7) AS kingdom, 'kingdom' as `facet`
                                FROM taxon_names tn 
                                JOIN api_taxon_usages atu ON atu.taxon_name_id = tn.id
                                JOIN api_taxon at ON atu.taxon_id = at.taxon_id
                                JOIN api_names an ON an.taxon_name_id = tn.id
                                LEFT JOIN api_taxon_tree att ON att.taxon_id = at.taxon_id
                                {conserv_join}
                                WHERE {condition}
                                GROUP BY kingdom) ORDER BY category
                            """
            with conn.cursor() as cursor:
                cursor.execute(count_query)
                count = cursor.fetchall()
            if count:
                response['count'] = {}
                # 左側統計 界, 階層, 原生/特有性, 地位
                count = pd.DataFrame(count, columns=['count','category','facet'])
                count.loc[count.facet=='is_endemic','category_c'] = count.loc[count.facet=='is_endemic','category'].apply(lambda x: '臺灣特有' if x == '1' or x == 1 else None)
                count.loc[count.facet=='alien_type','category_c'] = count.loc[count.facet=='alien_type','category'].apply(lambda x: alien_map_c[x] if x else None)
                count.loc[count.facet=='status','category_c'] = count.loc[count.facet=='status','category'].apply(lambda x: status_map_c[x] if x else None)
                count.loc[count.facet=='rank','category_c'] = count.loc[count.facet=='rank','category'].apply(lambda x: rank_map_c[int(x)])
                count.loc[count.facet=='kingdom','category_c'] = count.loc[count.facet=='kingdom','category'].apply(lambda x: kingdom_map[x]['common_name_c'] if x in kingdom_map.keys() else None)
                count = count.replace({np.nan: '', None: ''})
                count = count[~count.category.isin([None,''])]
                facet = ['is_endemic','alien_type','status','kingdom','rank']
                for f in facet:
                    response['count'][f] = json.loads(count[(count.facet==f)&(count.category_c!='')].to_json(orient='records'))
                response['count']['total'] = [{'count':total_count}]
                # pagination
                response['page'] = {}
                response['page']['total_page'] = math.ceil((response['count']['total'][0]['count']) / 10)
                response['page']['current_page'] = offset / 10 + 1
                response['page']['page_list'] = get_page_list(response['page']['current_page'], response['page']['total_page'])
                response = get_query_data(condition, conserv_join, offset, response)

        else:
            response = {'count': {'total':[{'count':0}]},'page': {'total_page':0, 'page_list': []},'data':[]}
        return HttpResponse(json.dumps(response), content_type='application/json')
    # 0 不開 1 開一層 2 全開
    filter = request.GET.get('filter', 1)
    return render(request, 'taxa/catalogue.html', {'filter': filter, 'ranks': rank_map_c, 'keyword': keyword})


def name_match(request):
    return render(request, 'taxa/name_match.html')


def taxon_tree(request):
    return render(request, 'taxa/taxon_tree.html')

    
def taxon(request, taxon_id):
    return render(request, 'taxa/taxon.html', {'taxon_id': taxon_id})

