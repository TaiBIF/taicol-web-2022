from conf.settings import env, SOLR_PREFIX
import pymysql
import math
import pandas as pd
# import re
# from datetime import datetime, timedelta, strftime
import json
import numpy as np
from  django.utils.translation import get_language, gettext
import time 
import requests
import unicodedata
import re
from typing import List, Dict

db_settings = {
    "host": env('DB_HOST'),
    "port": int(env('DB_PORT')),
    "user": env('DB_USER'),
    "password": env('DB_PASSWORD'),
    "db": env('DB_DBNAME'),
}


def remove_rank_char(text):
    replace_words = [' subsp. ',' nothosubsp.',' var. ',' subvar. ',' nothovar. ',' fo. ',' subf. ',' f.sp. ',' race ',' strip ',' m. ',' ab. ',' × ', '× ']
    pattern = '|'.join(map(re.escape, replace_words))
    text = re.sub(pattern, ' ', text)
    return text


def unicode_to_plain(text):
    plain_text = []
    for char in text:
        try:
            name = unicodedata.name(char)
            if "MATHEMATICAL" in name:
                # 取得名稱的最後一個單字（對應的普通字母）
                letter = name.split()[-1]
                # 保持大小寫
                if "CAPITAL" in name:
                    plain_text.append(letter.upper())
                else:
                    plain_text.append(letter.lower())
            else:
                plain_text.append(char)
        except ValueError:
            plain_text.append(char)
    
    return ''.join(plain_text)


def get_page_list(current_page, total_page, window=5):
    list_index = math.ceil(current_page/window)
    if list_index*window > total_page:
        page_list = list(range(list_index*window-(window-1),total_page+1))
    else:
        page_list = list(range(list_index*window-(window-1),list_index*window+1))
    return page_list


link_map = {}
conn = pymysql.connect(**db_settings)
query = "SELECT source, title, url_prefix, category FROM api_links"
with conn.cursor() as cursor:
    cursor.execute(query)
    links = cursor.fetchall()
    for l in links:
        link_map[l[0]] = {'title': l[1], 'url_prefix': l[2], 'category': l[3]}


kingdom_taxon_map, kingdom_map, kingdom_map_c = {}, {}, {}
conn = pymysql.connect(**db_settings)
query = '''SELECT tn.name, at.taxon_id, acn.name_c FROM taxon_names tn 
            JOIN api_taxon at ON at.accepted_taxon_name_id = tn.id 
            JOIN api_common_name acn ON acn.taxon_id = at.taxon_id AND acn.is_primary = 1
            WHERE tn.rank_id = 3
            UNION ALL 
            SELECT tn.name, at.taxon_id, "病毒" FROM taxon_names tn 
            JOIN api_taxon at ON at.accepted_taxon_name_id = tn.id 
            WHERE tn.rank_id = 50 
        '''

with conn.cursor() as cursor:
    cursor.execute(query)
    kingdom = cursor.fetchall()
    for k in kingdom:
        kingdom_taxon_map[k[1]] = {'name': k[0], 'common_name_c': k[2]}
        kingdom_map_c[k[0]] = k[2]


rank_map, rank_map_c,rank_map_c_reverse, rank_order_map = {}, {}, {}, {}
conn = pymysql.connect(**db_settings)
query = "SELECT id, display, `order` from ranks"
with conn.cursor() as cursor:
    cursor.execute(query)
    ranks = cursor.fetchall()
    rank_map = dict(zip([r[0] for r in ranks], [eval(r[1])['en-us'] for r in ranks]))
    rank_map_c = dict(zip([r[0] for r in ranks], [eval(r[1])['zh-tw'] for r in ranks]))
    rank_map_c_reverse = dict(zip([eval(r[1])['zh-tw'] for r in ranks],[r[0] for r in ranks]))
    rank_order_map = dict(zip([r[0] for r in ranks], [r[2] for r in ranks]))


# 科以上的階層
family_order = rank_order_map[26]
lower_than_family = [k for k, v in rank_order_map.items() if v >= family_order]


name_status_map_c = {
    'not-accepted': '的無效名',
    'misapplied': '的誤用名',
}

name_status_map = {
    'not-accepted': 'synonym of',
    'misapplied': 'misapplied to',
}


status_map_c = {'accepted': '有效', 'not-accepted': '無效', 'undetermined': '未決', 'misapplied': '誤用'}
status_map_taxon_c = {'accepted': {'en-us': 'Accepted', 'zh-tw': '接受名'}, 'not-accepted': {'en-us': 'Not-accepted', 'zh-tw': '無效'}, 
                      'undetermined': {'en-us': 'Undetermined', 'zh-tw': '未決'}, 'misapplied': {'en-us': 'Misapplied', 'zh-tw': '誤用'}}

rank_color_map = { 3: 'rank-1-red', 12: 'rank-2-org', 18: 'rank-3-yell', 22: 'rank-4-green', 26: 'rank-5-blue', 
                  30: 'rank-6-deepblue', 34: 'rank-7-purple', 49:'rank-second-gray', 50: 'rank-second-gray'}

attr_map_c = {'is_in_taiwan':'存在於臺灣','is_endemic':'臺灣特有','is_terrestrial':'陸生','is_freshwater':'淡水','is_brackish':'半鹹水','is_marine':'海洋','is_fossil':'化石','native': '原生','naturalized':'歸化','invasive':'入侵','cultured':'栽培豢養', 'is_cultured': '栽培豢養', 'not_official': '未經正式紀錄'}
attr_map = {'is_in_taiwan':'Exist in Taiwan','is_endemic':'Endemic to Taiwan','is_terrestrial':'Terrestrial','is_freshwater':'Freshwater','is_brackish':'Brackish','is_marine':'Marine','is_fossil':'Fossil', 'native': 'Native','naturalized':'Naturalized','invasive':'Invasive','cultured':'Cultured', 'is_cultured': 'Cultured', 'not_official': 'Not Officially Recorded'}

is_in_taiwan_map_c =  {1: '存在', 0: '不存在', '1': '存在', '0': '不存在'}

# 台灣紅皮書
redlist_map_c = {
  'EX': '滅絕', 'EW': '野外滅絕', 'RE': '區域滅絕', 'NCR': '極危', 'NEN': '瀕危', 'NVU': '易危', 'NNT': '接近受脅',
  'NLC': '暫無危機', 'DD': '資料缺乏', 'NA': '不適用', 'NE': '未評估'
}

iucn_map_c = {
  'EX': '滅絕', 'EW': '野外滅絕', 'RE': '區域滅絕', 'CR': '極危', 'EN': '瀕危', 'VU': '易危', 'CD': '依賴保育', 'NT': '接近受脅',
  'LC': '暫無危機', 'DD': '資料缺乏', 'NA': '不適用', 'NE': '未評估', 'LR/nt': '近危', 'LR/cd': '保護依賴', 'LR/lc': '無危'
}

cites_map_c = { '1': '附錄 I 有滅種威脅須嚴格管制','2':'附錄 II 族群數量稀少須有效管制','3':'附錄 III 特定國家指定有效管制','NC':'NC 非管制'}
cites_map = { '1': 'Appendix I','2':'Appendix II','3':'Appendix III','NC':'NC'}


protected_map_c = {'I': '瀕臨絕種野生動物', 'II': '珍貴稀有野生動物', 'III': '其他應予保育之野生動物', '1': '文資法珍貴稀有植物'}
protected_map = {'I': 'I Endangered', 'II': 'II Precious and Rare', 'III': 'III Other Conserved', '1': 'Rare and Valuable Plants'}


conserv_map = {'iucn_category': 'IUCN', 'cites_listing': 'CITES', 
               'protected_category': '保育類', 'red_category': '臺灣紅皮書', 'sensitive_suggest': '敏感物種建議模糊層級'}


bio_group_map = {
    '昆蟲': ['t0000512'],
    '蜘蛛': ['t0001697'],
    '魚類': ['t0000203','t0000204','t0000522'],
    '兩棲類': ['t0000464'],
    '爬蟲類': ['t0000545'],
    '鳥類': ['t0000650'],
    '哺乳類': ['t0000517'],
    '維管束植物': ['t0000043'],
    '蕨類植物': ['t0000445','t0000452'],
    '苔蘚植物': ['t0000090','t0000091','t0000095'],
    '藻類': ['t0000007','t0000092','t0000093','t0000096'],
    '病毒': ["t0104550"],
    '細菌': ["t0000005"],
    '真菌': ["t0000008"],
}



# 林奈階層

lin_map = {
    49: 'realm',
    3: 'kingdom',
    12: 'phylum',
    18: 'classis',
    22: 'ordo',
    26: 'familia',
}

lin_map_w_order = {
    50: {'name': '', 'rank_order': 0},
    49: {'name': '', 'rank_order': 1},
    3: {'name': 'kingdom', 'rank_order': 5},
    12: {'name': 'phylum', 'rank_order': 14},
    18: {'name': 'classis', 'rank_order': 23},
    22: {'name': 'ordo', 'rank_order': 27},
    26: {'name': 'familia', 'rank_order': 32},
    30: {'name': '', 'rank_order': 36},
}

lin_ranks = [50, 49, 3, 12, 18, 22, 26, 30, 34]
sub_lin_ranks = [35,36,37,38,39,40,41,42,43,44,45,46]


var_dict = requests.get("https://raw.githubusercontent.com/TaiBIF/tbia-portal/main/data/variants.json")
var_dict = var_dict.json()

comp_dict = requests.get("https://raw.githubusercontent.com/TaiBIF/tbia-portal/main/data/composites.json")
comp_dict = comp_dict.json()

# 1. 異體字群組

variant_groups: List[List[str]] = var_dict

# 2. 會意字 ↔ 合成組合 映射
composite_map: Dict[str, str] = comp_dict
reverse_composite_map: Dict[str, str] = {v: k for k, v in composite_map.items()}

# 3. 查詢某個字的異體群組
def get_word_variants(char: str) -> List[str]:
    for group in variant_groups:
        if char in group:
            return group
    return [char]

# 4. 對一串文字生成正則 pattern，例如「台灣」→ [台臺]灣
def generate_pattern_from_word(word: str) -> str:
    return ''.join(
        f"[{''.join(get_word_variants(c))}]" if len(get_word_variants(c)) > 1 else c
        for c in word
    )

# 5. 主處理函式：將輸入文字轉換為包含異體字與會意字 pattern 的版本
def process_text_variants(text: str) -> str:
    result = ''
    i = 0
    while i < len(text):
        matched = False
        # 處理會意字組合：優先處理最長的詞組
        for composite, composed in composite_map.items():
            if text.startswith(composite, i):
                pattern = f"({composite}|{generate_pattern_from_word(composed)})"
                result += pattern
                i += len(composite)
                matched = True
                break
            elif text.startswith(composed, i):
                pattern = f"({composite}|{generate_pattern_from_word(composed)})"
                result += pattern
                i += len(composed)
                matched = True
                break
        if not matched:
            char = text[i]
            variants = get_word_variants(char)
            if len(variants) > 1:
                result += f"[{''.join(variants)}]"
            else:
                result += char
            i += 1
    return result


def is_alpha(word):
    try:
        return word.encode('ascii').isalpha()
    except:
        return False


def create_conservation_note(data):

    # 保育資訊
    if c_cites := data.get('cites'):
        c_list = c_cites.split('/')
        c_list_str = []
        for cl in c_list:
            c_list_str.append(cites_map[cl] if get_language() == 'en-us' else cites_map_c[cl])
        data['cites'] = '/'.join(c_list_str)
        if data['cites_note']:
            c_str = ''
            for c in json.loads(data['cites_note']):
                c_str += f"{c['listing']}, {c['name']}; "
                if c.get('is_primary'):
                    data['cites_url'] = "https://checklist.cites.org/#/en/search/output_layout=taxonomic&scientific_name=" + c['name']
            data['cites_note'] = c_str.rstrip(';')

    if c_iucn := data.get('iucn'):
        data['iucn'] = c_iucn if get_language() == 'en-us' else iucn_map_c[c_iucn] + ' ' + c_iucn
        # data['iucn_url'] = "https://apiv3.iucnredlist.org/api/v3/taxonredirect/" + str(data['iucn_taxon_id'])
        # data['iucn_url'] = data['iucn_url']
        if data['iucn_note']:
            c_str = ''
            iucn_json = json.loads(data['iucn_note'])
            for c in iucn_json:
                c_str += f"{c['category']}, {c['name']}; "
            data['iucn_note'] = c_str.rstrip(';')
            data['iucn_url'] = iucn_json[0]['url']

    if c_red := data.get('redlist'):
        data['redlist'] =  c_red if get_language() == 'en-us' else redlist_map_c[c_red] + ' ' + c_red
        if data['red_note']: # 紅皮書的note全部都放
            c_str = ''
            for c in json.loads(data['red_note']):
                c_str += f"{c['red_category']}, {c['name']}; <br>"
            data['red_note'] = c_str.rstrip(';<br>')

    if c_protected := data.get('protected'):
        data['protected'] =  protected_map[c_protected] if get_language() == 'en-us' else f'第 {c_protected} 級 {protected_map_c[c_protected]}'
        if data['protected_note']:
            c_str = ''
            for c in json.loads(data['protected_note']):
                c_str += f"{c['protected_category']}, {c['name']}; "
            data['protected_note'] = c_str.rstrip(';')

    return data


def return_download_file_by_solr(query_list, is_chinese):
    
    # 一次處理一千筆
    taxon = pd.DataFrame()

    offset = 0

    has_more_data = True

    while has_more_data:

        if is_chinese:

            download_limit = 100

            query = { "query": "*:*",
                    "limit": 0,
                    "filter": query_list,
                    # "sort": 'search_name asc',
                    "facet": { "taxon_id": { 
                            'type': 'terms',
                            'field': 'taxon_id',
                            'mincount': 1,
                            'limit': download_limit,
                            'offset': offset,
                            'sort': 'index',
                            'allBuckets': False,
                            'numBuckets': True
                            }
                        }
                    }

            query_req = json.dumps(query)

            resp = requests.post(f'{SOLR_PREFIX}taxa/select?', data=query_req, headers={'content-type': "application/json" })
            resp = resp.json()

            # print(resp)

            # 先確認有沒有資料
            if resp['response']['numFound']:

                # 這邊改成facet bucket的數量
                total_count = resp['facets']['taxon_id']['numBuckets']

                # 先用facet取得taxon_id 再query 相關data
                taxon_ids = [t.get('val') for t in resp['facets']['taxon_id']['buckets']]

                now_query_list = [f"taxon_id: ({' OR '.join(taxon_ids)})","is_primary_common_name:true"]

                query = { "query": "*:*",
                        "filter": now_query_list,
                        # "sort": 'index asc',
                        "limit": download_limit
                        }
                

                query_req = json.dumps(query)

                resp = requests.post(f'{SOLR_PREFIX}taxa/select?', data=query_req, headers={'content-type': "application/json" })
                resp = resp.json()

        else:

            download_limit = 1000

            query = { "query": "*:*",
                    "offset": offset,
                    "limit": 1000,
                    "filter": query_list,
                    # "sort": 'search_name asc',
                    }

            query_req = json.dumps(query)

            resp = requests.post(f'{SOLR_PREFIX}taxa/select?', data=query_req, headers={'content-type': "application/json" })
            resp = resp.json()
            total_count = resp['response']['numFound']

        df = pd.DataFrame(resp['response']['docs'])

        df['created_at'] = df.created_at.apply(lambda x: x[0].split('T')[0])
        df['updated_at'] = df.updated_at.apply(lambda x: x[0].split('T')[0])

        # 從這邊開始merge從solr過來的資料
        df = df.rename(columns={
                'formatted_accepted_name': 'formatted_name',
                'status': 'usage_status',
                'accepted_taxon_name_id': 'name_id',
                'rank_id': 'rank',
            })
        
        # 一定要有的欄位
        musthave_cols = ['search_name','usage_status','taxon_id','formatted_name','rank','common_name_c',
            'is_hybrid','is_in_taiwan','is_endemic','alien_type','is_fossil','is_terrestrial',
            'is_freshwater','is_brackish','is_marine','not_official','cites','iucn','redlist','protected']

        for m in musthave_cols:
            if m not in df.keys():
                df[m] = None


        # rank_id to rank
        df['rank'] = df['rank'].apply(lambda x: rank_map[int(x)])

        # 0 / 1 要改成 true / false
        is_list = ['is_hybrid','is_in_taiwan','is_endemic','is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine','not_official']
        df[is_list] = df[is_list].replace({0: 'false', 1: 'true', '0': 'false', '1': 'true', True: 'true', False: 'false'})

        df = df.replace({np.nan: '', None: ''})

        # 欄位順序
        cols = ['search_name','usage_status','taxon_id','name_id','simple_name','name_author','formatted_name','synonyms','formatted_synonyms','misapplied','formatted_misapplied','rank',
                'common_name_c','alternative_name_c','is_hybrid','is_in_taiwan','is_endemic','alien_type','alien_status_note','is_fossil','is_terrestrial','is_freshwater',
                'is_brackish','is_marine','not_official','cites','iucn','redlist','protected','sensitive','created_at','updated_at',
                'kingdom','kingdom_c','phylum','phylum_c','class','class_c','order','order_c','family','family_c','genus','genus_c']

        for c in cols:
            if c not in df.keys():
                df[c] = ''

        # cites要改成 I,II,III
        df['cites'] = df['cites'].apply(lambda x: x.replace('1','I').replace('2','II').replace('3','III') if x else x)

        taxon = pd.concat([taxon,df[cols]],ignore_index=True)

        if offset + download_limit > total_count:
            has_more_data = False

        offset += download_limit

    return taxon



taxon_history_map = {
    0: 'Accepted name changed', 
    1: 'New name: ',
    2: 'New reference',
    4: 'Classification updated',
    5: 'Taxon created',
    6: 'Taxon deleted',
    7: 'New common name: ',
    8: 'Taxon information added: ',
    9: 'Taxon information removed: ',
    10: 'Taxon information updated',
    11: 'Taxon information added: ',
    12: 'Taxon information removed: ',
    13: 'Taxon information updated: ',
    14: 'Taxon merged: ',
    15: 'Taxon divided: ',
    16: 'Common name deleted: ',
    17: 'Name deleted: ',
    18: 'Taxon revived',
    19: 'Taxon merged: ',
    20: 'Taxon divided: ',
    }

taxon_history_map_c = {
    0: '有效名變更', # v
    1: '新增學名 ', # v
    2: '新增文獻', # v
    4: '分類階層更新 ',  # v
    5: '新增Taxon', # v
    6: '已刪除 ', # v
    7: '新增中文名 ', # v
    8: '新增屬性 ',  # v
    9: '移除屬性 ', # v
    10: '修改屬性', # 
    11: '新增保育資訊 ', #v
    12: '移除保育資訊 ', #v
    13: '修改保育資訊 ', #v
    14: '物種合併：', #v
    15: '物種拆分：', #v
    16: '刪除中文名 ', #v
    17: '刪除學名 ', #v
    18: '已復原 ', #v
    19: '物種合併：', #v
    20: '物種拆分：', #v
}


def create_history_display(taxon_history, lang, names, current_page=1,limit=8):
    taxon_history_dict = taxon_history_map if lang == 'en-us' else taxon_history_map_c
    # 整理文獻
    taxon_history['ref'] = taxon_history.apply(lambda x: f'<a href="https://nametool.taicol.tw/{"en-us" if lang == "en-us" else "zh-tw"}/references/{int(x.reference_id)}" target="_blank">{x.short_author}</a>' if x.short_author and x.reference_type not in [4,6] else '', axis=1)
    # 整理時間
        #   taxon_history['updated_at'] = taxon_history.updated_at.dt.strftime('%Y-%m-%d')
    # 整理編輯者
    taxon_history.loc[taxon_history['editor']=='TaiCOL管理員','editor'] = 'TaiCOL'
    # 整理標題
    taxon_history['title'] = taxon_history['history_type'].apply(lambda x: taxon_history_dict[x])
    # 整理內容
    # 新增同物異名
    for i in taxon_history[taxon_history.history_type.isin([1,17])].index:
        row = taxon_history.iloc[i]
        c = json.loads(row.note)
        #  這邊有可能會沒有學名 需要重新 query -> 應該不會了
        if len(names[names.taxon_name_id==c.get('taxon_name_id')]):
            taxon_history.loc[i,'content'] = names[names.taxon_name_id==c.get('taxon_name_id')]['sci_name_ori'].values[0]
    # else:
    #     query = f"SELECT formatted_name FROM api_names WHERE taxon_name_id = %s"
    #     conn = pymysql.connect(**db_settings)
    #     with conn.cursor() as cursor:
    #         cursor.execute(query, (c.get('taxon_name_id'),))
    #         name_ = cursor.fetchone()
    #         conn.close()
    #         taxon_history.loc[i,'content'] = f'''<a href="https://nametool.taicol.tw/{"en-us" if get_language() == "en-us" else "zh-tw"}/taxon-names/{int(c.get('taxon_name_id'))}" target="_blank">{name_[0]}</a>'''
    # 已刪除 只會是學名使用被刪除 or 過去手動刪除 不會有new_taxon_id
    for i in taxon_history[taxon_history.history_type==6].index:
        row = taxon_history.iloc[i]
        taxon_history.loc[i,'content'] = ''
    # 物種拆分 物種合併
    for i in taxon_history[taxon_history.history_type.isin([14,15,19,20])].index:
        row = taxon_history.iloc[i]
        _taxon_id, _taxon_name = '', ''
        query = """SELECT tn.name, at.taxon_id FROM api_taxon at
                    JOIN taxon_names tn ON tn.id = at.accepted_taxon_name_id
                    WHERE at.taxon_id = %s
                    """
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            cursor.execute(query, (row.note,))
            _taxon_id = cursor.fetchone()
            if _taxon_id:
                _taxon_name = _taxon_id[0]
                _taxon_id = _taxon_id[1]
            conn.close()
        if _taxon_id:
            _taxon_link = f'''<a class="new_taxon_aa" href="/{"en-us" if lang == "en-us" else "zh-hant"}/taxon/{_taxon_id}">{_taxon_name if _taxon_name else _taxon_id}
                                <svg class="fa_size" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="19" height="19" viewBox="0 0 19 19">
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
                                </svg></a>'''

            # 根據14, 15, 19, 20分別有不同的文字
            if row.history_type == 14:
                taxon_history.loc[i,'content'] = f'''{gettext("被併入")} {_taxon_link}'''
            elif row.history_type == 15:
                taxon_history.loc[i,'content'] = f'''{gettext("拆出")} {_taxon_link}'''
            elif row.history_type == 19:
                taxon_history.loc[i,'content'] = f'''{gettext("將 ")} {_taxon_link} {"併入" if lang == 'zh-hant' else ''}'''
            elif row.history_type == 20:
                taxon_history.loc[i,'content'] = f'''{gettext("由 ")} {_taxon_link} {"拆出" if lang == 'zh-hant' else '' }'''

        else:
            taxon_history.loc[i,'content'] = ''
    # 分類階層更新
    # s = time.time()
    for i in taxon_history[taxon_history.history_type==4].index:
        row = taxon_history.iloc[i]
        c = json.loads(row.note)
        content_str = ''
        if c.get('old'):
            o_path_list = c.get('old').split('>')
            o_path_list.reverse()
            path_str = ' OR '.join(o_path_list)
            # NOTE 這邊會需要query已經刪除的taxon
            path_resp = requests.get(f'{SOLR_PREFIX}taxa/select?fq=taxon_name_id:*&fq=status:accepted&q=taxon_id:({path_str})&fl=taxon_id,formatted_accepted_name&rows=1000')
            content_str = ''
            if path_resp.status_code == 200:
                higher = pd.DataFrame(path_resp.json()['response']['docs'])
                ops = []
                for pp in o_path_list: # 要根據path的的順序排
                    ops.append(higher[higher.taxon_id==pp].formatted_accepted_name.values[0])
                content_str = (' > ').join(ops)
                if content_str:
                    content_str = f'({gettext("原階層：")}{content_str})'
        taxon_history.loc[i,'content'] = content_str
    # print('path changed', time.time()-s)
    # 新增/移除屬性
    taxon_history.loc[taxon_history.history_type.isin([8,9]),'content'] = taxon_history[taxon_history.history_type.isin([8,9])].note.apply(lambda x: attr_map[x] if lang == 'en-us' else attr_map_c[x] )
    drop_conserv = []
    for i in taxon_history[taxon_history.history_type.isin([11,12,13])].index:
        row = taxon_history.iloc[i]
        c = json.loads(row.note)
        source = c.get('source')
        value = c.get('value')
        old_value = c.get('old_value')
        old_str = ''
        content = gettext(conserv_map[source]) + ' '
        if source == 'sensitive_suggest':
            drop_conserv.append(i)
        elif source == 'cites_listing':
            c_list = value.split('/')
            c_list_str = []
            for cl in c_list:
                c_list_str.append(cites_map[cl] if lang == 'en-us' else cites_map_c[cl])
            content += '/'.join(c_list_str)
            if old_value:
                c_list = old_value.split('/')
                c_list_str = []
                for cl in c_list:
                    c_list_str.append(cites_map[cl] if lang == 'en-us' else cites_map_c[cl])
                old_str = '/'.join(c_list_str)
        elif source == 'iucn_category':
            content += value if lang == 'en-us' else iucn_map_c[value] + ' ' + value
            if old_value:
                old_str = old_value if lang == 'en-us' else iucn_map_c[old_value] + ' ' + old_value
        elif source == 'red_category':
            content +=  value if lang == 'en-us' else redlist_map_c[value] + ' ' + value
            if old_value:
                old_str = old_value if lang == 'en-us' else redlist_map_c[old_value] + ' ' + old_value
        elif source == 'protected_category':
            content +=  protected_map[value] if get_language() == 'en-us' else f'第 {value} 級 {protected_map_c[value]}'
            if old_value:
                old_str = protected_map[old_value] if get_language() == 'en-us' else f'第 {old_value} 級 {protected_map_c[old_value]}'
        if row.history_type == 13:
            content += f' ({gettext("原類別：")}{old_str})'
        taxon_history.loc[i,'content'] = content
    taxon_history = taxon_history.drop(index=drop_conserv)

    # 如果是新增文獻，且文獻的type==4 or 6 -> 移除
    taxon_history = taxon_history[~((taxon_history.reference_type.isin([4,6]))&(taxon_history.history_type==2))]
    taxon_history = taxon_history[['title','content','ref','updated_at','editor']]
    taxon_history.loc[taxon_history['title']==gettext('新增Taxon'),'content'] = ''
    #   taxon_history = taxon_history.drop_duplicates(subset=['title','content','ref']).to_dict(orient='records')
    taxon_history = taxon_history.replace({np.nan: '', None: ''})
    taxon_history = taxon_history.drop_duplicates().to_dict(orient='records')
    #   total_page = math.ceil(len(taxon_history) / limit)
    #   page_list = get_page_list(current_page=current_page, total_page=total_page)
    #   taxon_history = taxon_history[(current_page-1)*limit:current_page*limit]
    return taxon_history #, current_page, total_page, page_list


def create_name_history(names, name_history_list, ref_df):
    name_history = []
    # conn = pymysql.connect(**db_settings)
    for n in name_history_list:
        if n[-1] == 5: # 新增taxon
            current_nid = json.loads(n[0]).get('taxon_name_id')
        elif n[-1] == 0: # 有效名變更
            current_nid = json.loads(n[0]).get('new_taxon_name_id')
        # TODO 這邊也有可能沒有對應的name
        if len(names[names.taxon_name_id==current_nid]):
            name_ = names[names.taxon_name_id==current_nid].sci_name_ori.values[0]
        # else:
        #     query = f"SELECT formatted_name FROM api_names WHERE taxon_name_id = %s"
        #     with conn.cursor() as cursor:
        #         cursor.execute(query, (current_nid,))
        #         name_ = cursor.fetchone()
        #         name_ = f'''<a href="https://nametool.taicol.tw/{"en-us" if get_language() == "en-us" else "zh-tw"}/taxon-names/{int(current_nid)}" target="_blank">{name_[0]}</a>'''
        if n[2] and (n[3] not in [4,6]):
            name_history.append({'name_id': current_nid,'name': name_, 'ref': ref_df[ref_df.reference_id==n[2]].ref.values[0],
                                 'reference_id': n[2], 'updated_at': n[1]})
        else:
            name_history.append({'name_id': current_nid,'name': name_, 'ref':'', 
                                 'reference_id': None, 'updated_at': n[1]})
                            
    name_history = pd.DataFrame(name_history)

    # # 先找出reference_id沒有在ref_df裡面的
    # all_ref = name_history[name_history.reference_id.notnull()].reference_id.unique()
    # no_ref = [a for a in all_ref if a not in ref_df.reference_id.unique()]
    
    # print('no_ref', no_ref)
    # if len(no_ref):
    #     query = f"SELECT distinct(r.id), c.short_author \
    #             FROM api_citations c \
    #             JOIN `references` r ON c.reference_id = r.id \
    #             WHERE c.reference_id IN %s AND r.type not in (4,6) GROUP BY r.id" 
    #     conn = pymysql.connect(**db_settings)
    #     with conn.cursor() as cursor:
    #         cursor.execute(query, (no_ref, ))
    #         short_refs = cursor.fetchall()
    #         for sr in short_refs:
    #             ref_df = pd.concat([ref_df, pd.DataFrame([{'reference_id': sr[0], 'ref': sr[1]}])], ignore_index=True)

    #     conn.close()

    if len(ref_df):
        ref_df['reference_id'] = ref_df['reference_id'].astype('object')
        name_history['reference_id'] = name_history['reference_id'].astype('object')

    name_history = name_history.merge(ref_df, how='left', sort=False)
    name_history = name_history.to_dict('records')

    return name_history



def create_alien_type_display(alien_types):

    final_aliens = []
    has_cultured = 0

    if alien_types:

        alien_rows = alien_types.split('|')

        for aa in alien_rows:

            now_aa = aa.split(':')
            now_note = (':').join(now_aa[1:])

            if now_aa[0] == 'cultured':
                has_cultured = 1

            if len(now_aa) > 1:
                final_aliens.append({
                    'alien_type': attr_map_c[now_aa[0]],
                    'note': now_note
                })
            elif len(now_aa) == 1:
                final_aliens.append({
                    'alien_type': attr_map_c[now_aa[0]],
                })

    return has_cultured, final_aliens
    

def create_link_display(data,taxon_id):

    links = []

    # taibif / tbia 接taxonID
    links += [{'href': link_map['tbia']['url_prefix'], 'title': link_map['tbia']['title'] ,'suffix': taxon_id, 'hidden_name': True, 'category': link_map['tbia']['category']}]
    links += [{'href': link_map['taibif']['url_prefix'], 'title': link_map['taibif']['title'] ,'suffix': taxon_id, 'hidden_name': True, 'category': link_map['taibif']['category']}]
    

    if data['links']:

        tmp_links = json.loads(data['links'])

        for t in tmp_links:
            if t["source"] in ["fishbase_order","amphibiansoftheworld"]:
                links += [{'href': link_map[t["source"]]['url_prefix'], 'title': link_map[t["source"]]['title'], 'suffix': data['name'], 'hidden_name': True, 'category': link_map[t["source"]]['category']}]
            elif t["source"] == 'nc':
                links += [{'href': link_map[t["source"]]['url_prefix'], 'title': link_map[t["source"]]['title'], 'suffix': t['suffix'], 'id': t['suffix'].split('=')[1].split('&')[0], 'category': link_map[t["source"]]['category']}]
            elif t["source"] == 'amphibiansoftheworld':
                links += [{'href': link_map[t["source"]]['url_prefix'], 'title': link_map[t["source"]]['title'], 'suffix': t['suffix'], 'id': t['suffix'].split('/')[-1], 'category': link_map[t["source"]]['category']}]
            elif t["source"] != 'ncbi':
                links += [{'href': link_map[t["source"]]['url_prefix'], 'title': link_map[t["source"]]['title'], 'suffix': t['suffix'], 'category': link_map[t["source"]]['category']}]
    
    if data['path']:
        # LPSN 
        if 't0000005' in data['path'] or 't0000004' in data['path']:
            suffix = f"{rank_map[data['rank_id']].lower()}/{data['name'].replace(' ','-').lower()}"
            links += [{'href': link_map['lpsn']['url_prefix'], 'title': link_map['lpsn']['title'], 'suffix': suffix, 'category': link_map['lpsn']['category'], 'hidden_name': True}]
        # Antwiki
        if 't0005989' in data['path']:
            links += [{'href': link_map['antwiki']['url_prefix'], 'title': link_map['antwiki']['title'], 'suffix': data['name'], 'category': link_map['antwiki']['category'], 'hidden_name': True}]
        # mycobank
        if 't0000008' in data['path']:
            links += [{'href': link_map['mycobank']['url_prefix'], 'title': link_map['mycobank']['title'], 'suffix': data['name'], 'category': link_map['mycobank']['category'], 'hidden_name': True}]
        # Animal Diversity Web
        if 't0000009' in data['path']:
            links += [{'href': link_map['adw']['url_prefix'], 'title': link_map['adw']['title'], 'suffix': data['name'], 'category': link_map['adw']['category'], 'hidden_name': True}]
        # POWO, tropicos
        if 't0000003' in data['path']:
            for pp in ['powo','tropicos','taiherbarium']:
                links += [{'href': link_map[pp]['url_prefix'], 'title': link_map[pp]['title'], 'suffix': data['name'], 'category': link_map[pp]['category'], 'hidden_name': True}]
        if any([ccc in data['path'] for ccc in ['t0000007','t0000092','t0000096','t0000093','t0000243','t0000338']]):
            links += [{'href': link_map['algaebase']['url_prefix'], 'title': link_map['algaebase']['title'], 'suffix': data['name'], 'category': link_map['algaebase']['category'], 'hidden_name': True}]
    
    # 全部都接 wikispecies,discoverlife,taibif,inat,irmng
    for s in ['wikispecies','discoverlife','inat','irmng','ncbi']:
        links += [{'href': link_map[s]['url_prefix'], 'title': link_map[s]['title'] ,'suffix': data['name'], 'hidden_name': True, 'category': link_map[s]['category']}]
    
    for s in ['gisd']:
        links += [{'href': link_map[s]['url_prefix'], 'title': link_map[s]['title'] ,'suffix': data['name'].replace(' ', '+'), 'hidden_name': True, 'category': link_map[s]['category']}]


    links = pd.DataFrame(links).drop_duplicates()
    links['category'] = links['category'].apply(lambda x: '; '.join([ gettext(xx) for xx in x.split(';')]))
    
    links = links.sort_values('category', ascending=False).to_dict('records')

    return links



spe_chars = ['+','-', '&','&&', '||', '!','(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '/', '.']

def escape_solr_query(string):
    final_string = ''
    for s in string:
        if s in spe_chars:
            final_string += f'\{s}'
        else:
            final_string += s
    return final_string



# type= 1 or 2 or 3 地位是相同的 
custom_reference_type_order = {
    1: 1,
    2: 1,
    3: 1,
    4: 3,
    5: 2,
}


# # 其他分類觀點
def create_view_display(taxon_id, accepted_taxon_name_id, misapplied_names):
    
    taxon_views = []
    other_misapplied = []
    conn = pymysql.connect(**db_settings)
 
    # 1. 接受學名為其他台灣存在的Taxon 同物異名 / 誤用名 的觀點 -> 從 reference_usages 找
    # 先找出對應的有效學名有哪些
    query = "SELECT distinct accepted_taxon_name_id FROM reference_usages WHERE taxon_name_id = %s AND accepted_taxon_name_id != %s AND deleted_at IS NULL;"
    with conn.cursor() as cursor:
        cursor.execute(query, (accepted_taxon_name_id,accepted_taxon_name_id))
        acp_names = cursor.fetchall()
        acp_names = [a[0] for a in acp_names]

    # 這邊只能抓到誤用的
    if len(acp_names):
        query = """WITH base_query AS (SELECT distinct at.taxon_id, at.accepted_taxon_name_id, atu.reference_id
                    FROM api_taxon_usages atu
                    JOIN api_taxon at ON atu.taxon_id = at.taxon_id AND at.taxon_id != %s AND at.is_in_taiwan = 1 AND at.is_deleted = 0
                    WHERE atu.accepted_taxon_name_id IN %s AND atu.taxon_name_id = %s AND atu.status = 'misapplied')
                    SELECT an.taxon_name_id, an.formatted_name, ac.short_author, ac.reference_id, base_query.taxon_id, r.type, r.publish_year
                    FROM base_query 
                    JOIN `references` r ON r.id = base_query.reference_id
                    JOIN api_names an ON an.taxon_name_id = base_query.accepted_taxon_name_id
                    JOIN api_citations ac ON ac.reference_id = base_query.reference_id;
                """
        with conn.cursor() as cursor:
            cursor.execute(query, (taxon_id, acp_names, accepted_taxon_name_id))
            results = cursor.fetchall()
            other_misapplied = [r[0] for r in results]
            taxon_views += list(results)

    # 同物異名要直接用accepted抓 但 taxon_id & reference 要分開query
    acp_names = [a for a in acp_names if a not in other_misapplied]
    if len(acp_names):
        query = """WITH base_query AS (SELECT at.taxon_id, at.accepted_taxon_name_id
                    FROM api_taxon at WHERE at.taxon_id != %s AND at.is_in_taiwan = 1 AND at.is_deleted = 0
                    AND at.accepted_taxon_name_id IN %s)
                    SELECT an.taxon_name_id, an.formatted_name, ac.short_author, ac.reference_id, base_query.taxon_id, r.type, r.publish_year
                    FROM reference_usages ru
                    JOIN base_query ON base_query.accepted_taxon_name_id = ru.accepted_taxon_name_id AND ru.taxon_name_id = %s
                    JOIN `references` r ON r.id = ru.reference_id
                    JOIN api_names an ON an.taxon_name_id = base_query.accepted_taxon_name_id
                    JOIN api_citations ac ON ac.reference_id = ru.reference_id;
                """
        with conn.cursor() as cursor:
            cursor.execute(query, (taxon_id, acp_names, accepted_taxon_name_id))
            results = cursor.fetchall()
            taxon_views += list(results)

    # 2. 誤用名還有活著、台灣存在的taxon (誤用名為該接受名)
    # 不需調整

    if len(misapplied_names):
        query = """
                WITH base_query AS (SELECT distinct at.taxon_id, at.accepted_taxon_name_id, atu.reference_id
                FROM api_taxon_usages atu
                JOIN api_taxon at ON atu.taxon_id = at.taxon_id AND at.is_in_taiwan = 1 AND at.is_deleted = 0
                WHERE atu.taxon_name_id IN %s AND atu.status = 'accepted' AND atu.is_latest = 1)
                SELECT an.taxon_name_id, an.formatted_name, ac.short_author, ac.reference_id, base_query.taxon_id, r.type, r.publish_year
                FROM base_query 
                JOIN `references` r ON r.id = base_query.reference_id
                JOIN api_names an ON an.taxon_name_id = base_query.accepted_taxon_name_id
                JOIN api_citations ac ON ac.reference_id = base_query.reference_id;
                """
        with conn.cursor() as cursor:
            cursor.execute(query, (misapplied_names, ))
            results = cursor.fetchall()
            taxon_views += list(results)


    # 這邊會有重複的usage 要按照優先序排序 並只取第一筆
    # 要改成顯示多筆
    final_taxon_views = []
    if len(taxon_views):
        taxon_views = pd.DataFrame(taxon_views, columns=['name_id','formatted_name','citation','reference_id','taxon_id','reference_type','publish_year'])
        # taxon_views['reference_order'] = taxon_views['reference_type'].apply(lambda x: custom_reference_type_order[x])
        taxon_views['reference_id'] = taxon_views['reference_id'].astype('int')
        # 先處理排序 先排year再排type
        # taxon_views = taxon_views.sort_values('publish_year', ascending=False).sort_values('reference_order')
        # 多筆文獻 改成單純用年份排序
        taxon_views = taxon_views.sort_values(['taxon_id','publish_year'])
        taxon_views.loc[taxon_views.reference_type==4, 'reference_id'] = 0
        taxon_views.loc[taxon_views.reference_type==4, 'citation'] = ''
        taxon_views = taxon_views.drop(columns=['publish_year','reference_type']) #,'reference_order'])

        for t in taxon_views.taxon_id.unique():
            rows = taxon_views[taxon_views.taxon_id==t]
            if len(rows[rows.reference_id!=0]):
                rows = rows[rows.reference_id!=0]
            refs = []
            for row in rows[['citation','reference_id']].to_dict('records'):
                if row.get('reference_id'):
                    refs.append(f'<a target="_blank" href="https://nametool.taicol.tw/{"en-us" if get_language() == "en-us" else "zh-tw"}/references/{row.get("reference_id")}">{row.get("citation")}</a>')
            final_taxon_views.append({
                'taxon_id': rows.taxon_id.values[0],
                'name_id': int(rows.name_id.values[0]),
                'formatted_name': rows.formatted_name.values[0],
                'refs': '; '.join(refs)
            })
            
        # 只取第一個
        # taxon_views = taxon_views.groupby(['name_id', 'formatted_name','taxon_id'],as_index=False).first()
        # taxon_views = taxon_views.to_dict('records')

    conn.close() 

    return final_taxon_views



def get_ambiguous_list(names):

    is_ambiguous_list = []

    # names['marked'] = False
    # names['pro_parte'] = False

    # 先處理同模學名
    conn = pymysql.connect(**db_settings)
    object_groups = list(names[names.object_group.notnull()].object_group.unique())
    if len(object_groups):
        query = """select distinct at.taxon_id, at.parent_taxon_id, atu.taxon_name_id, tn.object_group, tn.autonym_group 
                    from api_taxon_usages atu
                    join taxon_names tn ON tn.id = atu.taxon_name_id
                    join api_taxon at ON at.taxon_id = atu.taxon_id
                    where atu.is_deleted = 0 AND atu.status != 'misapplied' AND tn.object_group in %s;"""
        with conn.cursor() as cursor:
            cursor.execute(query, (object_groups, ))
            df = pd.DataFrame(cursor.fetchall(), columns=['taxon_id','parent_taxon_id','taxon_name_id','object_group','autonym_group'])
        for object_group in object_groups:
            rows = df[df.object_group==object_group]
            rows_taxon_ids = rows.taxon_id.unique()
            rows_parent_taxon_ids = rows.parent_taxon_id.unique()
            # 排除掉互為上下階層的taxon_id
            excluded_taxon_ids = [r for r in rows_taxon_ids if r not in rows_parent_taxon_ids]
            if len(excluded_taxon_ids) > 1:
                is_ambiguous_list += list(rows.taxon_name_id.unique())
            #     name_ids = list(rows.taxon_name_id.unique())
            #     names.loc[names.taxon_name_id.isin(name_ids),'marked'] = True


        # 找單純重複的學名 
        # 這邊就不會有互為上下階層的問題了

        query = """
                select taxon_name_id from api_taxon_usages 
                where `status` = 'not-accepted' and is_deleted != 1 and taxon_name_id IN %s 
                group by taxon_name_id having count(distinct(taxon_id)) > 1;
                """
    
        with conn.cursor() as cursor:
            cursor.execute(query, (list(names.taxon_name_id.unique()), ))
            is_ambiguous = cursor.fetchall()
            is_ambiguous_list += [i[0] for i in is_ambiguous]
            

    return list(set(is_ambiguous_list))

