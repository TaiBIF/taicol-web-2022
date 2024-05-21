# 產生供使用者下載的名錄檔案
# 學名階層 要使用線上的db

import re
from conf.settings import env
import pymysql
import pandas as pd
# from datetime import datetime, timedelta, strftime
import json
import numpy as np
from taxa.utils import rank_map, rank_map_c, lin_map, lin_ranks, attr_map_c


# 下載檔案不給刪除的taxon

db_settings = {
    "host": env('DB_HOST'),
    "port": int(env('DB_PORT')),
    "user": env('DB_USER'),
    "password": env('DB_PASSWORD'),
    "db": env('DB_DBNAME'),
}

# JSON_EXTRACT(t.alien_type, '$[*].alien_type'), 

# 名錄檔案（物種）
# 已改成新的common_name寫法
query = """
        SELECT t.taxon_id, t.accepted_taxon_name_id, tn.name, an.name_author, an.formatted_name, 
        t.rank_id, acn.name_c, t.is_hybrid, t.is_in_taiwan, t.is_endemic, t.main_alien_type, t.alien_note,
        t.is_fossil, t.is_terrestrial, 
        t.is_freshwater, t.is_brackish, t.is_marine, ac.cites_listing, ac.cites_note, ac.iucn_category, ac.iucn_note, 
        ac.red_category, ac.red_note, ac.protected_category, ac.protected_note, ac.sensitive_suggest, ac.sensitive_note, 
        t.created_at, t.updated_at, att.path, t.not_official
        FROM api_taxon t 
        LEFT JOIN api_common_name acn ON acn.taxon_id = t.taxon_id AND acn.is_primary = 1 
        JOIN taxon_names tn ON t.accepted_taxon_name_id = tn.id 
        JOIN api_names an ON t.accepted_taxon_name_id = an.taxon_name_id 
        LEFT JOIN api_conservation ac ON t.taxon_id = ac.taxon_id 
        LEFT JOIN api_taxon_tree att ON t.taxon_id = att.taxon_id 
        WHERE t.is_deleted = 0"""

conn = pymysql.connect(**db_settings)
with conn.cursor() as cursor:
    cursor.execute(query)
    df = cursor.fetchall()
    df = pd.DataFrame(df, columns=['taxon_id','name_id','simple_name','name_author','formatted_name','rank','common_name_c',
                                    'is_hybrid','is_in_taiwan','is_endemic','alien_type','alien_status_note','is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine',
                                    'cites','cites_note','iucn','iucn_note','redlist','redlist_note','protected','protected_note','sensitive','sensitive_note',
                                    'created_at','updated_at','path','not_official'])
    # 取回alternative_name
    cursor.execute("select taxon_id, name_c from api_common_name where is_primary = 0;")
    name_c_df = cursor.fetchall()
    name_c_df = pd.DataFrame(name_c_df, columns=['taxon_id', 'alternative_name_c'])
    name_c_df = name_c_df.groupby(['taxon_id'], as_index = False).agg({'alternative_name_c': ','.join})
    df = df.merge(name_c_df, how='left')


# df['alien_type'] = df['alien_type'].replace({None: '[]'})
# df['alien_type'] = df.alien_type.apply(lambda x: ','.join(list(dict.fromkeys(eval(x)))))

last_updated = df['updated_at'].max().strftime('%Y%m%d')

df['created_at'] = df.created_at.dt.strftime('%Y-%m-%d')
df['updated_at'] = df.updated_at.dt.strftime('%Y-%m-%d')


# synonyms
query = f"SELECT DISTINCT tu.taxon_id, an.formatted_name, tn.name \
            FROM api_taxon_usages tu \
            JOIN api_names an ON tu.taxon_name_id = an.taxon_name_id \
            JOIN taxon_names tn ON tu.taxon_name_id = tn.id \
            WHERE tu.status = 'not-accepted' AND tu.is_deleted != 1;"
with conn.cursor() as cursor:
    cursor.execute(query)
    syns = cursor.fetchall()
    syns = pd.DataFrame(syns, columns=['taxon_id','formatted_synonyms','synonyms'])
    syns = syns.groupby(['taxon_id'], as_index = False).agg({'formatted_synonyms': ','.join, 'synonyms': ','.join})


df = df.merge(syns, on='taxon_id', how='left')


query = f"SELECT DISTINCT tu.taxon_id, an.formatted_name, tn.name \
            FROM api_taxon_usages tu \
            JOIN api_names an ON tu.taxon_name_id = an.taxon_name_id \
            JOIN taxon_names tn ON tu.taxon_name_id = tn.id \
            WHERE tu.status = 'misapplied' AND tu.is_deleted != 1;"
with conn.cursor() as cursor:
    cursor.execute(query)
    misapplied = cursor.fetchall()
    misapplied = pd.DataFrame(misapplied, columns=['taxon_id','formatted_misapplied','misapplied'])
    misapplied = misapplied.groupby(['taxon_id'], as_index = False).agg({'formatted_misapplied': ','.join, 'misapplied': ','.join})



df = df.merge(misapplied, on='taxon_id', how='left')


df = df.drop_duplicates().reset_index(drop=True)
# higher taxa
# 要補上地位未定
for i in df.index:
    if i % 1000 == 0:
        print(i)
    row = df.iloc[i]
    if row.alien_status_note:
        alien_rows = json.loads(row.alien_status_note)
        final_aliens = []
        already_types = []
        if len(alien_rows) > 1:
            for at in alien_rows:
                already_types.append(at.get('alien_type'))
                if at.get('status_note'):
                    final_aliens.append(f"{at.get('alien_type')}:{at.get('status_note')}")
                else:
                    if at.get('alien_type') not in already_types:
                        final_aliens.append(at.get('alien_type'))
        final_aliens = list(dict.fromkeys(final_aliens))
    df.loc[i, 'alien_status_note'] = '|'.join(final_aliens)

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


is_list = ['is_hybrid','is_in_taiwan','is_endemic','is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine','not_official']
df[is_list] = df[is_list].replace({0: 'false', 1: 'true', '0': 'false', '1': 'true'})

# is_in_taiwan null要改成false
df['is_in_taiwan'] = df['is_in_taiwan'].replace({2: 'false', None: 'false'})


df = df.replace({np.nan: '', None: ''})

# 欄位順序
cols = ['taxon_id','name_id','simple_name','name_author','formatted_name','synonyms','formatted_synonyms','misapplied','formatted_misapplied','rank',
        'common_name_c','alternative_name_c','is_hybrid','is_endemic','alien_type','alien_status_note','is_fossil','is_terrestrial','is_freshwater',
        'is_brackish','is_marine','cites','iucn','redlist','protected','sensitive','created_at','updated_at',
        'kingdom','kingdom_c','phylum','phylum_c','class','class_c','order','order_c','family','family_c','genus','genus_c','is_in_taiwan','not_official']

# cites要改成 I,II,III
df['cites'] = df['cites'].apply(lambda x: x.replace('1','I').replace('2','II').replace('3','III') if x else x)


# df['protected'] = df['protected'].str.replace('none','無')


taxon = df[cols]


# taxon[taxon.is_in_taiwan=='true'].drop(columns=['is_in_taiwan']).to_csv(f"TaiCOL_taxon_{today.strftime('%Y%m%d')}.csv",index=False)
# taxon[taxon.is_in_taiwan=='true'].drop(columns=['is_in_taiwan']).to_csv(f"TaiCOL_taxon_20230728.csv",index=False)
# TODO 

compression_options = dict(method='zip', archive_name=f"TaiCOL_taxon_{last_updated}.csv")
taxon.to_csv(f'TaiCOL_taxon_{last_updated}.zip', compression=compression_options, index=False)


# 名錄檔案（學名）
# 需包含非台灣的學名，取最新的usage
taxa_cols = ['name_id','taxon_id','common_name_c','alternative_name_c','is_in_taiwan','is_endemic','alien_type','alien_status_note','is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine','cites','cites_note',
            'iucn','redlist','protected','sensitive','kingdom','kingdom_c','phylum','phylum_c','class','class_c','order','order_c','family','family_c','genus','genus_c']

taxon_for_name = df[taxa_cols]


# 要先補上所有的taxon

conn = pymysql.connect(**db_settings)

query = """SELECT distinct taxon_id, taxon_name_id, `status` FROM api_taxon_usages WHERE is_deleted != 1; """
conn = pymysql.connect(**db_settings)
with conn.cursor() as cursor:
    cursor.execute(query)
    all_taxon = cursor.fetchall()
    all_taxon = pd.DataFrame(all_taxon, columns=['taxon_id','name_id','status'])


all_taxon = all_taxon.merge(taxon_for_name.drop(columns=['name_id']))


y = all_taxon.groupby('name_id',as_index=False).taxon_id.nunique()
y[y.taxon_id>1]


only_one_taxon = all_taxon[all_taxon.name_id.isin(y[y.taxon_id==1].name_id.to_list())]

# 先找出所有names
# group concat 不會超過上限 維持原本寫法
query = """SELECT distinct(tn.id), n.name, tn.rank_id, tn.name, an.name_author, an.formatted_name,
                  tn.properties ->> '$.latin_genus', tn.properties ->> '$.latin_s1', tn.properties ->> '$.species_layers',
                  tn.original_taxon_name_id, tn.properties ->> '$.is_hybrid', CONCAT_WS(' ', c.author,  c.content),
                  tn.properties ->> '$.type_name', GROUP_CONCAT(anc.namecode), tn.created_at, tn.updated_at
           FROM taxon_names tn 
           JOIN nomenclatures n ON n.id = tn.nomenclature_id
           LEFT JOIN api_names an ON an.taxon_name_id = tn.id
           LEFT JOIN api_namecode anc ON anc.taxon_name_id = tn.id
           LEFT JOIN api_citations c ON tn.reference_id = c.reference_id
           WHERE tn.deleted_at IS NULL GROUP BY tn.id 
        """
conn = pymysql.connect(**db_settings)
with conn.cursor() as cursor:
    cursor.execute(query)
    names = cursor.fetchall()
    names = pd.DataFrame(names, columns=['name_id','nomenclature_name','rank','simple_name','name_author','formatted_name',
                                         'latin_genus','latin_s1','species_layers','original_name_id','is_hybrid','protologue',
                                         'type_name_id','namecode','created_at','updated_at'])

# 先找出可以直接對到taxon的
# 有一對一的taxon就補灰底資訊
names = names.merge(only_one_taxon,on='name_id',how='left').drop_duplicates()
names = names.rename(columns={'status': 'usage_status'})

# date
names['created_at'] = names.created_at.dt.strftime('%Y-%m-%d')
names['updated_at'] = names.updated_at.dt.strftime('%Y-%m-%d')

# 階層, common_name_c, alternative_name_c, is_fossil, is_terrestrial, is_freshwater, is_brackish, is_marine
notaxon = names[names.taxon_id.isnull()]

# 從學名使用中找到name對應到的taxon_id
# 若對應到一筆，提供文件中的灰底資料
# 若無對應或對應到多筆，則不提供灰底資料
# 應該要考慮is_latest


more_than_one = all_taxon[all_taxon.name_id.isin(y[y.taxon_id>1].name_id.to_list())]


# TODO 這邊2023-12實作的時候要確認有沒有問題
for x in more_than_one.name_id.to_list():
    tmp_taxon_ids = []
    tmp_status = []
    rows = more_than_one[more_than_one['name_id']==x]
    taxon_tmp = rows[['status','is_in_taiwan','taxon_id']]
    custom_dict = {'accepted': 0, 'not-accepted': 1, 'misapplied': 2}
    taxon_tmp = taxon_tmp.sort_values(by=['status'], key=lambda x: x.map(custom_dict)).sort_values(by='is_in_taiwan',ascending=False)
    names.loc[names.name_id==x,'taxon_id'] = ','.join(taxon_tmp.taxon_id.to_list())
    names.loc[names.name_id==x,'usage_status'] = ','.join(taxon_tmp.status.to_list())
    names.loc[names.name_id==x,'is_in_taiwan'] = ','.join(taxon_tmp.is_in_taiwan.to_list())

# id to int
names.original_name_id = names.original_name_id.replace({np.nan: 0})
names.original_name_id = names.original_name_id.astype('int')
names.original_name_id = names.original_name_id.replace({0: None})


# # 0 / 1 to true / false
# is_list = ['is_hybrid','is_endemic','is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine']
# names[is_list] = names[is_list].replace({0: 'false', 1: 'true', '0': 'false', '1': 'true'})

names = names.reset_index(drop=True)
names = names.replace({np.nan: None, 'null': None})

names[names.name_id.notnull()]

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
        # group concat 不會超過上限 維持原本寫法
        query_hybrid_parent = f"SELECT GROUP_CONCAT( CONCAT(tn.name, ' ',tn.formatted_authors) SEPARATOR ' × ' ) FROM taxon_name_hybrid_parent AS tnhp \
                                JOIN taxon_names AS tn ON tn.id = tnhp.parent_taxon_name_id \
                                WHERE tnhp.taxon_name_id = {row['name_id']} \
                                GROUP BY tnhp.taxon_name_id"
        with conn.cursor() as cursor:
            cursor.execute(query_hybrid_parent)
            hybrid_name_result = cursor.fetchall()
        if hybrid_name_result:
            names.loc[names.name_id == row['name_id'], 'hybrid_parent'] = hybrid_name_result[0][0]


# 'null' to None
names = names.replace({np.nan: None, 'null': None})




name_cols = ['name_id','nomenclature_name','rank','simple_name','name_author','formatted_name','latin_genus','latin_s1','s2_rank','latin_s2',
's3_rank','latin_s3','original_name_id','is_hybrid','hybrid_parent','protologue','type_name_id','namecode','created_at','updated_at',
'taxon_id','usage_status','is_in_taiwan','common_name_c','alternative_name_c','is_endemic','alien_type','alien_status_note',
'is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine','cites','iucn','redlist','protected','sensitive',
'kingdom','kingdom_c','phylum','phylum_c','class','class_c','order','order_c','family','family_c','genus','genus_c']


names = names[name_cols]

names = names.replace({np.nan: '', None: ''})

# TODO 確定學名多對應的status問題

compression_options = dict(method='zip', archive_name=f"TaiCOL_name_{last_updated}.csv")
names.to_csv(f'TaiCOL_name_{last_updated}.zip', compression=compression_options, index=False)


# 學名檔案2024-03
#  //就學名有幾筆
# 共XXXX筆
# 共 165701 筆


# 物種檔案2024-03
# //就Taxon有幾筆，但括號內只統計種rank34
# 共xxxx筆（其中臺灣存在計??????種）
# taxon[taxon.is_in_taiwan=='true'].groupby('rank',as_index=False).taxon_id.nunique()

# 共 103482 筆（其中臺灣存在計 63840 種）



## namecode檔案
conn = pymysql.connect(**db_settings)


# 改成 query namecode & taxon_name_id就好 再和name merge

query = "SELECT anc.namecode, anc.taxon_name_id FROM api_namecode anc"
with conn.cursor() as cursor:
    cursor.execute(query)
    namecode = pd.DataFrame(cursor.fetchall(), columns=['namecode','name_id'])


namecode = namecode.merge(names[['name_id', 'taxon_id', 'usage_status', 'is_in_taiwan']])

compression_options = dict(method='zip', archive_name=f"TaiCOL_namecode_{last_updated}.csv")
namecode.to_csv(f'TaiCOL_namecode_{last_updated}.zip', compression=compression_options, index=False)



# 新舊學名編碼對照2023-12
# 舊版臺灣物種名錄學名編碼對照新版學名編碼