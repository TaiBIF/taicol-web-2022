# 產生供使用者下載的名錄檔案
# 學名階層 要使用線上的db

import re
from conf.settings import env
import pymysql
import pandas as pd
from datetime import datetime, timedelta, strftime
import json
import numpy as np
from taxa.utils import rank_map, rank_map_c, lin_map, lin_ranks

db_settings = {
    "host": env('DB_HOST'),
    "port": int(env('DB_PORT')),
    "user": env('DB_USER'),
    "password": env('DB_PASSWORD'),
    "db": env('DB_DBNAME'),
}

# 名錄檔案（物種）

query = "SELECT t.taxon_id, t.accepted_taxon_name_id, tn.name, an.name_author, an.formatted_name, \
        t.rank_id, t.common_name_c, t.alternative_name_c, t.is_hybrid, t.is_in_taiwan, t.is_endemic, JSON_EXTRACT(t.alien_type, '$[*].alien_type'), t.is_fossil, t.is_terrestrial, \
        t.is_freshwater, t.is_brackish, t.is_marine, ac.cites_listing, ac.cites_note, ac.iucn_category, ac.iucn_note, \
        ac.red_category, ac.red_note, ac.protected_category, ac.protected_note, ac.sensitive_suggest, ac.sensitive_note, \
        t.created_at, t.updated_at, att.path \
         FROM api_taxon t \
        JOIN taxon_names tn ON t.accepted_taxon_name_id = tn.id \
        JOIN api_names an ON t.accepted_taxon_name_id = an.taxon_name_id \
        LEFT JOIN api_conservation ac ON t.taxon_id = ac.taxon_id \
        LEFT JOIN api_taxon_tree att ON t.taxon_id = att.taxon_id \
        WHERE t.is_in_taiwan = 1 and t.is_deleted = 0"

conn = pymysql.connect(**db_settings)
with conn.cursor() as cursor:
    cursor.execute(query)
    df = cursor.fetchall()
    df = pd.DataFrame(df, columns=['taxon_id','name_id','simple_name','name_author','formatted_name','rank','common_name_c','alternative_name_c',  
                                    'is_hybrid','is_in_taiwan','is_endemic','alien_type','is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine',
                                    'cites','cites_note','iucn','iucn_note','redlist','redlist_note','protected','protected_note','sensitive','sensitive_note',
                                    'created_at','updated_at','path'])


df['alien_type'] = df['alien_type'].replace({None: '[]'})
df['alien_type'] = df.alien_type.apply(lambda x: ','.join(list(dict.fromkeys(eval(x)))))

df['created_at'] = df.created_at.dt.strftime('%Y-%m-%d')
df['updated_at'] = df.updated_at.dt.strftime('%Y-%m-%d')

# synonyms
query = f"SELECT tu.taxon_id, GROUP_CONCAT(DISTINCT(tn.name) SEPARATOR ','), GROUP_CONCAT(DISTINCT(an.formatted_name) SEPARATOR ',') \
            FROM api_taxon_usages tu \
            JOIN api_names an ON tu.taxon_name_id = an.taxon_name_id \
            JOIN taxon_names tn ON tu.taxon_name_id = tn.id \
            WHERE tu.status = 'not-accepted' AND tu.is_deleted = 0 \
            GROUP BY tu.taxon_id;"
with conn.cursor() as cursor:
    cursor.execute(query)
    syns = cursor.fetchall()
    syns = pd.DataFrame(syns, columns=['taxon_id','synonyms','formatted_synonyms'])

df = df.merge(syns, on='taxon_id', how='left')

# higher taxa
# 要補上地位未定
for i in df.index:
    if i % 1000 == 0:
        print(i)
    row = df.iloc[i]
    if path := row.path:
        path = path.split('>')
        # 拿掉自己
        path = [p for p in path if p != row.taxon_id]
        # 3,12,18,22,26,30,34 
        if path:
            data = []
            higher = df[df.taxon_id.isin(path)&df['rank'].isin([3,12,18,22,26,30])][['simple_name','common_name_c','rank','taxon_id']]
            current_ranks = higher['rank'].to_list() + [row['rank']]
            for x in lin_map.keys():
                if x not in current_ranks and x < max(current_ranks) and x > min(current_ranks):
                    higher = pd.concat([higher, pd.Series({'rank': x, 'common_name_c': '地位未定', 'taxon_id': None, 'simple_name': None}).to_frame().T], ignore_index=True)
            # 從最大的rank開始補
            higher = higher.sort_values('rank', ignore_index=True, ascending=False)
            for hi in higher[higher.taxon_id.isnull()].index:
                found_hi = hi + 1
                while not higher.loc[found_hi].taxon_id:
                    found_hi += 1
                higher.loc[hi, 'simple_name'] = f'{higher.loc[found_hi].simple_name} {lin_map[higher.loc[hi]["rank"]]} incertae sedis'
                higher.loc[hi, 'common_name_c'] = '地位未定'
            for r in higher.index:
                rr = higher.iloc[r]
                r_rank_id = rr['rank']
                df.loc[i, f'{rank_map[r_rank_id].lower()}'] = rr['simple_name']
                df.loc[i, f'{rank_map[r_rank_id].lower()}_c'] = rr['common_name_c']

# rank_id to rank
df['rank'] = df['rank'].apply(lambda x: rank_map[x])

# 0 / 1 要改成 true / false
is_list = ['is_hybrid','is_in_taiwan','is_endemic','is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine']
df[is_list] = df[is_list].replace({0: 'false', 1: 'true', '0': 'false', '1': 'true'})

# alien_type
# for i in df.index:
#     if i % 1000 == 0:
#         print(i)
#     row = df.iloc[i]
#     aliens = []
#     if row.alien_type:
#         for a in json.loads(row.alien_type):
#             # if a.get('alien_type') not in aliens:
#             aliens.append(a.get('alien_type'))
#     aliens = list(dict.fromkeys(aliens))
#     df.loc[i,'alien_type'] = (',').join(aliens)
    # # 保育資訊
    # if row.cites_note:
    #     if len(json.loads(row.cites_note)) > 1:
    #         c_str = ''
    #         for c in json.loads(row.cites_note):
    #             c_str += f"{c['listing']},{c['name']};"
    #         df.loc[i, 'cites_note'] = ''
    #         df.loc[i, 'cites_note'] = c_str.rstrip(';')
    #     else:
    #         df.loc[i, 'cites_note'] = ''
    # if row.iucn_note:
    #     if len(json.loads(row.iucn_note)) > 1:
    #         c_str = ''
    #         for c in json.loads(row.iucn_note):
    #             c_str += f"{c['category']},{c['name']};"
    #         df.loc[i, 'iucn_note'] = ''
    #         df.loc[i, 'iucn_note'] = c_str.rstrip(';')
    #     else:
    #         df.loc[i, 'iucn_note'] = ''
    # if row.redlist_note:
    #     if len(json.loads(row.redlist_note)) > 1:
    #         c_str = ''
    #         for c in json.loads(row.redlist_note):
    #             c_str += f"{c['red_category']},{c['name']};"
    #         df.loc[i, 'redlist_note'] = ''
    #         df.loc[i, 'redlist_note'] = c_str.rstrip(';')
    #     else:
    #         df.loc[i, 'redlist_note'] = ''
    # if row.protected_note:
    #     if len(json.loads(row.protected_note)) > 1:
    #         c_str = ''
    #         for c in json.loads(row.protected_note):
    #             c_str += f"{c['category']},{c['name']};"
    #         df.loc[i, 'protected_note'] = ''
    #         df.loc[i, 'protected_note'] = c_str.rstrip(';')
    #     else:
    #         df.loc[i, 'protected_note'] = ''
    # if row.sensitive_note:
    #     if len(json.loads(row.sensitive_note)) > 1:
    #         c_str = ''
    #         for c in json.loads(row.sensitive_note):
    #             c_str += f"{c['suggest']},{c['name']};"
    #         df.loc[i, 'sensitive_note'] = ''
    #         df.loc[i, 'sensitive_note'] = c_str.rstrip(';')
    #     else:
    #         df.loc[i, 'sensitive_note'] = ''


df = df.replace({np.nan: '', None: ''})

# 欄位順序
cols = ['taxon_id','name_id','simple_name','name_author','formatted_name','synonyms','formatted_synonyms','rank',
        'common_name_c','alternative_name_c','is_hybrid','is_endemic','alien_type','is_fossil','is_terrestrial','is_freshwater',
        'is_brackish','is_marine','cites','iucn','redlist','protected','sensitive','created_at','updated_at',
        'kingdom','kingdom_c','phylum','phylum_c','class','class_c','order','order_c','family','family_c','genus','genus_c']

# cites要改成 I,II,III
df['cites'] = df['cites'].apply(lambda x: x.replace('1','I').replace('2','II').replace('3','III') if x else x)
# df['protected'] = df['protected'].str.replace('none','無')


taxon = df[cols]

today = datetime.now() + timedelta(hours=8)

taxon.to_csv(f"物種名錄_物種_{today.strftime('%Y%m%d')}.csv",index=False)


# 名錄檔案（學名）
# 需包含非台灣的學名，取最新的usage
taxa_cols = ['name_id','taxon_id','common_name_c','alternative_name_c','is_in_taiwan','is_endemic','alien_type','is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine','cites','cites_note',
            'iucn','redlist','protected','sensitive','kingdom','kingdom_c','phylum','phylum_c','class','class_c','order','order_c','family','family_c','genus','genus_c']

taxon_for_name = df[taxa_cols]

# 先找出所有names
query = """SELECT distinct(tn.id), n.name, tn.rank_id, tn.name, an.name_author, an.formatted_name,
                  tn.properties ->> '$.latin_genus', tn.properties ->> '$.latin_s1', tn.properties ->> '$.species_layers',
                  tn.original_taxon_name_id, tn.properties ->> '$.is_hybrid', CONCAT_WS(' ', c.author,  c.content),
                  tn.properties ->> '$.type_name', tn.created_at, tn.updated_at
           FROM taxon_names tn 
           JOIN nomenclatures n ON n.id = tn.nomenclature_id
           LEFT JOIN api_names an ON an.taxon_name_id = tn.id
           LEFT JOIN api_citations c ON tn.reference_id = c.reference_id
           WHERE tn.deleted_at IS NULL
        """
conn = pymysql.connect(**db_settings)
with conn.cursor() as cursor:
    cursor.execute(query)
    names = cursor.fetchall()
    names = pd.DataFrame(names, columns=['name_id','nomenclature_name','rank','simple_name','name_author','formatted_name',
                                         'latin_genus','latin_s1','species_layers','original_name_id','is_hybrid','protologue',
                                         'type_name_id','created_at','updated_at'])

# 先找出可以直接對到taxon的
names = names.merge(taxon_for_name,on='name_id',how='left')
names.loc[names.taxon_id.notnull(),'usage_status'] = 'accepted'


# date
names['created_at'] = names.created_at.dt.strftime('%Y-%m-%d')
names['updated_at'] = names.updated_at.dt.strftime('%Y-%m-%d')


# 階層, common_name_c, alternative_name_c, is_fossil, is_terrestrial, is_freshwater, is_brackish, is_marine
notaxon = names[names.taxon_id.isnull()]

# 從學名使用中找到name對應到的taxon_id
# 若對應到一筆，提供文件中的灰底資料
# 若無對應或對應到多筆，則不提供灰底資料
# 應該要考慮is_latest

query = """SELECT taxon_name_id, taxon_id, `status`, is_latest FROM api_taxon_usages WHERE taxon_name_id IS NOT NULL"""
conn = pymysql.connect(**db_settings)
with conn.cursor() as cursor:
    cursor.execute(query)
    res = cursor.fetchall()
    res = pd.DataFrame(res, columns=['name_id','taxon_id', 'usage_status', 'is_latest'])
    res['name_id'] = res['name_id'].astype('int64')

found_taxon = notaxon[['name_id']].merge(res[res['is_latest']==1], on='name_id')

found_taxon.groupby('name_id').count('taxon_id')

x = found_taxon.groupby('name_id',as_index=False).taxon_id.nunique()
x_list = x[x.taxon_id>1].name_id.to_list()

for x in x_list:
    tmp_taxon_ids = []
    tmp_status = []
    rows = found_taxon[found_taxon['name_id']==x]
    for r in rows.index:
        tmp_taxon_ids.append(rows.loc[r].taxon_id)
        tmp_status.append(rows.loc[r].usage_status)
    names.loc[names.name_id==x,'taxon_id'] = ','.join(tmp_taxon_ids)
    names.loc[names.name_id==x,'usage_status'] = ','.join(tmp_status)

# 有一對一的taxon就補灰底資訊
found_taxon = found_taxon[~found_taxon.name_id.isin(x_list)]

t_cols = ['common_name_c','alternative_name_c','is_in_taiwan','is_endemic','alien_type',
'is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine','cites','iucn','redlist','protected','sensitive',
'kingdom','kingdom_c','phylum','phylum_c','class','class_c','order','order_c','family','family_c','genus','genus_c']

for f in found_taxon.index:
    print(f)
    row = found_taxon.loc[f]
    info_row = names[names.taxon_id==row.taxon_id]
    for t in t_cols:
        if info_row[t].values:
            names.loc[names.name_id==row.name_id,t] = info_row[t].values[0]




# query = """SELECT ru.properties ->> '$.common_names', ru.properties ->> '$.is_fossil', ru.properties ->> '$.is_terrestrial',
#            ru.properties ->> '$.is_freshwater', ru.properties ->> '$.is_brackish', ru.properties ->> '$.is_marine', 
#            r.publish_year, ru.taxon_name_id, ru.id, r.id
#            FROM reference_usages ru
#            JOIN `references` r ON r.id = ru.reference_id
#            WHERE taxon_name_id NOT IN (SELECT DISTINCT(taxon_name_id) FROM api_taxon_usages ) AND ru.is_title=0
#         """
    # res = pd.DataFrame(res, columns=['common_names','is_fossil', 'is_terrestrial', 'is_freshwater', 'is_brackish', 'is_marine','publish_year','name_id', 'ru_id', 'reference_id'])


# manual_list = []

# for i in res.index:
#     row = res.iloc[i]
#     if len(res[res.name_id==row.name_id]) > 1:
#         if len(res[res.name_id==row.name_id].reference_id.unique()) > 1:
#             # 取最新的
#             max_year = res[res.name_id==row.name_id].publish_year.max()
#             res.loc[(res.name_id==row.name_id)&(res.publish_year==max_year),'is_latest'] = True
#             res.loc[(res.name_id==row.name_id)&(res.publish_year!=max_year),'is_latest'] = False
#         else:
#             # 手動排除
#             manual_list += list(res[res.name_id==row.name_id].index)
#     else:
#         res.loc[i, 'is_latest'] = True

# res.loc[manual_list]
# # 選 1619
# res = res.drop(axis=0,index=1618)
# res = res[res.is_latest==True]

# res = res.reset_index(drop=True)

# common_names
# for i in res.index:
#     if res.iloc[i].common_names:
#         c_list = json.loads(res.iloc[i].common_names)
#         c_list = [c['name'] for c in c_list if c['language']=='zh-tw']
#         if len(c_list) == 1:
#             res.loc[i,'common_name_c'] = c_list[0]
#         elif len(c_list) > 1:
#             res.loc[i,'alternative_name_c'] = ','.join(c_list[1:])

# # merge back
# test = names
# m_cols = ['name_id','common_name_c','alternative_name_c','is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine']
# names[m_cols] = names[['name_id']].merge(res[m_cols],on='name_id',how='left')

# # 階層
# query = """SELECT taxon_name_id, path FROM taicol_tree
#            WHERE taxon_name_id NOT IN (SELECT DISTINCT(taxon_name_id) FROM api_taxon_usages )
#         """
# conn = pymysql.connect(**db_settings)
# with conn.cursor() as cursor:
#     cursor.execute(query)
#     higher = cursor.fetchall()

# conn = pymysql.connect(**db_settings)
# for h in higher:
#     name_id = h[0]
#     path = h[1].split('>')
#     path = [p for p in path if p != str(name_id)]
#     if path:
#         query = f"""SELECT tn.rank_id, tn.name, au.properties ->> '$.common_names[0].name' FROM accepted_usages au
#                     JOIN taxon_names tn ON au.taxon_name_id = tn.id
#                     WHERE au.taxon_name_id IN ({str(path).replace('[','').replace(']','')}) AND 
#                     tn.rank_id IN (3,12,18,22,26,30)"""
#         with conn.cursor() as cursor:
#             cursor.execute(query)
#             results = cursor.fetchall()
#             for r in results:
#                 names.loc[names.name_id==name_id, f'{rank_map[r[0]].lower()}'] = r[1]
#                 names.loc[names.name_id==name_id, f'{rank_map[r[0]].lower()}_c'] = r[2]

# # rank_id to rank
# names['rank'] = names['rank'].apply(lambda x: rank_map[x])

# id to int
names.original_name_id = names.original_name_id.replace({np.nan: 0})
names.original_name_id = names.original_name_id.astype('int')
names.original_name_id = names.original_name_id.replace({0: None})


# # 0 / 1 to true / false
# is_list = ['is_hybrid','is_endemic','is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine']
# names[is_list] = names[is_list].replace({0: 'false', 1: 'true', '0': 'false', '1': 'true'})

# 種下 species_layers
for i in names.index:
    if i % 1000 == 0:
        print(i)
    row = names.iloc[i]
    spe_l = json.loads(row.species_layers)
    if spe_l:
        names.loc[i,'s2_rank'] = spe_l[0]['rank_abbreviation']
        names.loc[i,'latin_s2'] = spe_l[0]['latin_name']
        if len(spe_l) > 1:
            names.loc[i,'s3_rank'] = spe_l[1]['rank_abbreviation']
            names.loc[i,'latin_s3'] = spe_l[1]['latin_name']
    # hybrid_parent
    if row['is_hybrid'] == 'true':
        query_hybrid_parent = f"SELECT GROUP_CONCAT( CONCAT(tn.name, ' ',tn.formatted_authors) SEPARATOR ' × ' ) FROM taxon_name_hybrid_parent AS tnhp \
                                JOIN taxon_names AS tn ON tn.id = tnhp.parent_taxon_name_id \
                                WHERE tnhp.taxon_name_id = {row['name_id']} \
                                GROUP BY tnhp.taxon_name_id"
        with conn.cursor() as cursor:
            cursor.execute(query_hybrid_parent)
            hybrid_name_result = cursor.fetchall()
        if hybrid_name_result:
            names.loc[names.name_id == row['name_id'], 'hybrid_parent'] = hybrid_name_result[0]
# query_hybrid_parent = f"SELECT tnhp.taxon_name_id, GROUP_CONCAT(CONCAT_WS(' ', tn.name, an.name_author) SEPARATOR ' × ' ) FROM taxon_name_hybrid_parent AS tnhp \
#                         JOIN taxon_names AS tn ON tn.id = tnhp.parent_taxon_name_id \
#                         LEFT JOIN api_names an ON an.taxon_name_id = tn.id \
#                         GROUP BY tnhp.taxon_name_id"
# conn = pymysql.connect(**db_settings)
# with conn.cursor() as cursor:
#     cursor.execute(query_hybrid_parent)
#     hybrid_name_result = cursor.fetchall()
#     for h in hybrid_name_result:
#         names.loc[names.name_id == h[0], 'hybrid_parent'] = h[1].strip()
#         names.loc[names.name_id == h[0], 'is_hybrid'] = 'true'


# 'null' to None
names = names.replace({np.nan: None, 'null': None})




name_cols = ['name_id','nomenclature_name','rank','simple_name','name_author','formatted_name','latin_genus','latin_s1','s2_rank','latin_s2',
's3_rank','latin_s3','original_name_id','is_hybrid','hybrid_parent','protologue','type_name_id','created_at','updated_at',
'usage_status','taxon_id','common_name_c','alternative_name_c','is_in_taiwan','is_endemic','alien_type',
'is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine','cites','iucn','redlist','protected','sensitive',
'kingdom','kingdom_c','phylum','phylum_c','class','class_c','order','order_c','family','family_c','genus','genus_c']

# name_cols = ['name_id','nomenclature_name','rank','simple_name','name_author','formatted_name','latin_genus','latin_s1','s2_rank','latin_s2','s3_rank',
#             'latin_s3','original_name_id','is_hybrid','hybrid_parent','protologue','type_name_id','created_at','updated_at','usage_status','taxon_id',
#             'common_name_c','alternative_name_c','is_in_taiwan','is_endemic','alien_type',
#             'is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine','cites','iucn','redlist','protected','sensitive',
#             'kindom','kindom_c','phylum','phylum_c','class','class_c','order','order_c','family','family_c','genus','genus_c']


names = names[name_cols]

names = names.replace({np.nan: '', None: ''})


today = datetime.now() + timedelta(hours=8)

names.to_csv(f"物種名錄_學名_{today.strftime('%Y%m%d')}.csv",index=False)




