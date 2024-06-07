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


db_settings = {
    "host": env('DB_HOST'),
    "port": int(env('DB_PORT')),
    "user": env('DB_USER'),
    "password": env('DB_PASSWORD'),
    "db": env('DB_DBNAME'),
}

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


kingdom_map = {}
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
        kingdom_map[k[1]] = {'name': k[0], 'common_name_c': k[2]}


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

attr_map_c = {'is_in_taiwan':'存在於臺灣','is_endemic':'臺灣特有','is_terrestrial':'陸生','is_freshwater':'淡水','is_brackish':'半鹹水','is_marine':'海洋','is_fossil':'化石','native': '原生','naturalized':'歸化','invasive':'入侵','cultured':'栽培豢養', 'is_cultured': '栽培豢養'}
attr_map = {'is_in_taiwan':'Exist in Taiwan','is_endemic':'Endemic to Taiwan','is_terrestrial':'Terrestrial','is_freshwater':'Freshwater','is_brackish':'Brackish','is_marine':'Marine','is_fossil':'Fossil', 'native': 'Native','naturalized':'Naturalized','invasive':'Invasive','cultured':'Cultured', 'is_cultured': 'Cultured'}

is_in_taiwan_map_c =  {1: '存在', 0: '不存在', '1': '存在', '0': '不存在'}

# 台灣紅皮書
redlist_map_c = {
  'NEX': '滅絕', 'NEW': '野外滅絕', 'NRE': '區域滅絕', 'NCR': '極危', 'NEN': '瀕危', 'NVU': '易危', 'NNT': '接近受脅',
  'NLC': '暫無危機', 'NDD': '資料缺乏', 'NA': '不適用', 'NE': '未評估'
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


var_df = pd.DataFrame([
('鲃','[鲃䰾]'),
('䰾','[鲃䰾]'),
('刺','[刺刺]'),
('刺','[刺刺]'),
('葉','[葉葉]'),
('葉','[葉葉]'),
('鈎','[鈎鉤]'),
('鉤','[鈎鉤]'),
('臺','[臺台]'),
('台','[臺台]'),
('螺','[螺螺]'),
('螺','[螺螺]'),
('羣','[群羣]'),
('群','[群羣]'),
('峯','[峯峰]'),
('峰','[峯峰]'),
('曬','[晒曬]'),
('晒','[晒曬]'),
('裏','[裏裡]'),
('裡','[裏裡]'),
('薦','[荐薦]'),
('荐','[荐薦]'),
('艷','[豔艷]'),
('豔','[豔艷]'),
('粧','[妝粧]'),
('妝','[妝粧]'),
('濕','[溼濕]'),
('溼','[溼濕]'),
('樑','[梁樑]'),
('梁','[梁樑]'),
('秘','[祕秘]'),
('祕','[祕秘]'),
('污','[汙污]'),
('汙','[汙污]'),
('册','[冊册]'),
('冊','[冊册]'),
('唇','[脣唇]'),
('脣','[脣唇]'),
('朶','[朵朶]'),
('朵','[朵朶]'),
('鷄','[雞鷄]'),
('雞','[雞鷄]'),
('猫','[貓猫]'),
('貓','[貓猫]'),
('踪','[蹤踪]'),
('蹤','[蹤踪]'),
('恒','[恆恒]'),
('恆','[恆恒]'),
('獾','[貛獾]'),
('貛','[貛獾]'),
('万','[萬万]'),
('萬','[萬万]'),
('两','[兩两]'),
('兩','[兩两]'),
('椮','[槮椮]'),
('槮','[槮椮]'),
('体','[體体]'),
('體','[體体]'),
('鳗','[鰻鳗]'),
('鰻','[鰻鳗]'),
('蝨','[虱蝨]'),
('虱','[虱蝨]'),
('鲹','[鰺鲹]'),
('鰺','[鰺鲹]'),
('鳞','[鱗鳞]'),
('鱗','[鱗鳞]'),
('鳊','[鯿鳊]'),
('鯿','[鯿鳊]'),
('鯵','[鰺鯵]'),
('鰺','[鰺鯵]'),
('鲨','[鯊鲨]'),
('鯊','[鯊鲨]'),
('鹮','[䴉鹮]'),
('䴉','[䴉鹮]'),
('鴴','(行鳥|鴴)'),
('鵐','(鵐|巫鳥)'),
('䱵','(䱵|魚翁)'),
('䲗','(䲗|魚銜)'),
('䱀','(䱀|魚央)'),
('䳭','(䳭|即鳥)'),
('鱼','[魚鱼]'),
('魚','[魚鱼]'),
('万','[萬万]'),
('萬','[萬万]'),
('鹨','[鷚鹨]'),
('鷚','[鷚鹨]'),
('蓟','[薊蓟]'),
('薊','[薊蓟]'),
('黒','[黑黒]'),
('黑','[黑黒]'),
('隠','[隱隠]'),
('隱','[隱隠]'),
('黄','[黃黄]'),
('黃','[黃黄]'),
('囓','[嚙囓]'),
('嚙','[嚙囓]'),
('莨','[茛莨]'),
('茛','[茛莨]'),
('霉','[黴霉]'),
('黴','[黴霉]'),
('莓','[苺莓]'),  
('苺','[苺莓]'),  
('藥','[葯藥]'),  
('葯','[葯藥]'),  
('菫','[堇菫]'),
('堇','[堇菫]')], columns=['char','pattern'])
var_df['idx'] = var_df.groupby(['pattern']).ngroup()

var_df_2 = pd.DataFrame([('行鳥','(行鳥|鴴)'),
('蝦虎','[鰕蝦]虎'),
('鰕虎','[鰕蝦]虎'),
('巫鳥','(鵐|巫鳥)'),
('魚翁','(䱵|魚翁)'),
('魚銜','(䲗|魚銜)'),
('魚央','(䱀|魚央)'),
('游蛇','[遊游]蛇'),
('遊蛇','[遊游]蛇'),
('即鳥','(䳭|即鳥)'),
('椿象','[蝽椿]象'),
('蝽象','[蝽椿]象')], columns=['char','pattern'])


def is_alpha(word):
    try:
        return word.encode('ascii').isalpha()
    except:
        return False


def get_variants(string):
    new_string = ''
    # 單個異體字
    for s in string:
        if len(var_df[var_df['char']==s]):
            new_string += var_df[var_df['char']==s].pattern.values[0]
        # 如果是英文的話加上大小寫
        elif is_alpha(s):
            new_string += f"[{s.upper()}{s.lower()}]"
        else:
            new_string += s
    # 兩個異體字
    for i in var_df_2.index:
        char = var_df_2.loc[i, 'char']
        if char in new_string:
            new_string = new_string.replace(char,f"{var_df_2.loc[i, 'pattern']}")
    return new_string


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
        data['iucn_url'] = "https://apiv3.iucnredlist.org/api/v3/taxonredirect/" + str(data['iucn_taxon_id'])
        if data['iucn_note']:
            c_str = ''
            for c in json.loads(data['iucn_note']):
                c_str += f"{c['category']}, {c['name']}; "
            data['iucn_note'] = c_str.rstrip(';')

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


def return_download_file_by_solr(query_list):
    
    # 一次處理一千筆
    taxon = pd.DataFrame()

    offset = 0

    has_more_data = True

    while has_more_data:

        query = { "query": "*:*",
                "offset": offset,
                "limit": 1000,
                "filter": query_list,
                "sort": 'search_name asc',
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

        if offset + 1000 > total_count:
            has_more_data = False

        offset += 1000

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
    14: 'Taxon merged ',
    15: 'Taxon divided ',
    16: 'Common name deleted: ',
    17: 'Name deleted: '}

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
    14: '物種合併 ', #v
    15: '物種拆分 ', #v
    16: '刪除中文名 ', #v
    17: '刪除學名 ' #v
}


def create_history_display(taxon_history, lang, new_taxon_id, new_taxon_name, names, current_page=1,limit=8):
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
    # 已刪除
    for i in taxon_history[taxon_history.history_type==6].index:
        row = taxon_history.iloc[i]
        if new_taxon_id:
            taxon_history.loc[i,'content'] = f'''{gettext("請參見")} <a class="new_taxon_aa" href="/{"en-us" if lang == "en-us" else "zh-hant"}/taxon/{new_taxon_id}">{new_taxon_name if new_taxon_name else new_taxon_id}<svg class="fa_size" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="19" height="19" viewBox="0 0 19 19">
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
        else:
            taxon_history.loc[i,'content'] = ''
    # 物種拆分 物種合併
    for i in taxon_history[taxon_history.history_type.isin([14,15])].index:
        row = taxon_history.iloc[i]
        new_taxon_id, new_taxon_name = '', ''
        query = """SELECT tn.name, at.taxon_id FROM api_taxon at
                    JOIN taxon_names tn ON tn.id = at.accepted_taxon_name_id
                    WHERE at.taxon_id = %s
                    """
        conn = pymysql.connect(**db_settings)
        with conn.cursor() as cursor:
            cursor.execute(query, (row.note,))
            new_taxon_id = cursor.fetchone()
            if new_taxon_id:
                new_taxon_name = new_taxon_id[0]
                new_taxon_id = new_taxon_id[1]
            conn.close()
        if new_taxon_id:
            taxon_history.loc[i,'content'] = f'''{gettext("請參見")} <a class="new_taxon_aa" href="/{"en-us" if lang == "en-us" else "zh-hant"}/taxon/{new_taxon_id}">{new_taxon_name if new_taxon_name else new_taxon_id}<svg class="fa_size" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="19" height="19" viewBox="0 0 19 19">
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
        else:
            taxon_history.loc[i,'content'] = ''
    # 分類階層更新
    s = time.time()
    for i in taxon_history[taxon_history.history_type==4].index:
        row = taxon_history.iloc[i]
        c = json.loads(row.note)
        content_str = ''
        if c.get('old'):
            o_path_list = c.get('old').split('>')
            path_str = ' OR '.join(o_path_list)
            # NOTE 這邊可能會需要query已經刪除的taxon
            path_resp = requests.get(f'{SOLR_PREFIX}taxa/select?fq=taxon_name_id:*&q=taxon_id:({path_str})&fl=taxon_id,formatted_accepted_name&rows=1000')
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
    print('path changed', time.time()-s)
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
        if n[2] and n[3] not in [4,6]:
            name_history.append({'name_id': current_nid,'name': name_, 'ref': '',
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

            if now_aa == 'cultured':
                has_cultured = 1

            if len(now_aa) > 1:
                final_aliens.append({
                    'alien_type': attr_map_c[now_aa[0]],
                    'note': now_aa[1]
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
    for s in ['wikispecies','discoverlife','inat','irmng','gisd','ncbi']:
        links += [{'href': link_map[s]['url_prefix'], 'title': link_map[s]['title'] ,'suffix': data['name'], 'hidden_name': True, 'category': link_map[s]['category']}]
    
    
    links = pd.DataFrame(links).drop_duplicates()
    links['category'] = links['category'].apply(lambda x: '; '.join([ gettext(xx) for xx in x.split(';')]))
    
    links = links.sort_values('category', ascending=False).to_dict('records')

    return links



spe_chars = ['+','-', '&','&&', '||', '!','(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '/']

def escape_solr_query(string):
    final_string = ''
    for s in string:
        if s in spe_chars:
            final_string += f'\{s}'
        else:
            final_string += s
    return final_string




# def check_alien_latest(temp, conn):
#     # temp = temp[temp.ru_status=='accepted']
#     query = '''SELECT r.publish_year, ac.publish_date, r.id FROM `api_citations` ac
#                 JOIN   `references` r ON r.id = ac.reference_id
#                 WHERE r.id in %s'''
#     with conn.cursor() as cursor:
#         execute_line = cursor.execute(query, (list(temp.reference_id.unique()),))
#         # ref_more_info = cursor.fetchall()
#         temp_year = pd.DataFrame(cursor.fetchall(), columns=['publish_year', 'publish_date', 'reference_id'])
#         temp = temp.merge(temp_year)

#     latest_ru_id_list = []
#     # 如果有super backbone 忽略其他
#     if len(temp[temp['reference_type']==6]):
#         latest_ru_id_list += temp[temp['reference_type'] == 6].reference_usage_id.to_list()
#     else:
#         # 如果有文獻的話就忽略backbone
#         ignore_backbone = False
#         ignore_checklist = False
#         if len(temp[(temp['reference_type']!=4)]):
#             temp = temp[(temp['reference_type']!=4)]
#             ignore_backbone = True
#         # 如果有非名錄文獻的話 忽略名錄文獻
#         if len(temp[(temp['reference_type']!=5)]):
#             temp = temp[(temp['reference_type']!=5)]
#             ignore_checklist = True
#         # 如果都是backbone就直接比, 如果有大於一個reference_id, 比較年份
#         yr = temp[['reference_id', 'publish_year']].drop_duplicates()
#         max_yr = yr.publish_year.max()
#         if len(yr[yr['publish_year'] == max_yr]) > 1:
#             currently_cannot_decide = False
#             temp = temp[(temp.publish_year==max_yr)]
#             dt = temp[['reference_id', 'publish_date']].drop_duplicates()
#             if len(dt[dt.publish_date!='']):
#                 max_dt = dt[dt.publish_date!=''].publish_date.max()
#                 if len(dt[dt['publish_date'] == max_dt]) > 1:
#                     currently_cannot_decide = True
#                 else:
#                     latest_ru_id_list += temp[temp['publish_date'] == max_dt].reference_usage_id.to_list()
#             else:
#                 currently_cannot_decide = True
#             if currently_cannot_decide:
#                 ref_ids = dt.reference_id.to_list()
#                 query = '''SELECT JSON_EXTRACT(r.properties, "$.book_title"), 
#                             JSON_EXTRACT(r.properties, "$.volume"), JSON_EXTRACT(r.properties, "$.issue") FROM `references` r
#                             WHERE r.id in %s'''
#                 with conn.cursor() as cursor:
#                     execute_line = cursor.execute(query, (ref_ids,))
#                     ref_more_info = cursor.fetchall()
#                     ref_more_info = pd.DataFrame(ref_more_info, columns=['book_title', 'volume', 'issue'])
#                     if len(ref_more_info.drop_duplicates()) == 1:
#                     # 判斷是同一期期刊的不同篇文章  擇一當作最新文獻
#                         latest_ru_id_list += temp[temp['reference_id'] == ref_ids[0]].reference_usage_id.to_list()
#         else:
#             if ignore_backbone and ignore_checklist:
#                 latest_ru_id_list += temp[(temp['publish_year'] == max_yr) & (temp['reference_type'] != 5)  & (temp['reference_type'] != 4)].reference_usage_id.to_list()
#             elif ignore_checklist and not ignore_backbone:
#                 latest_ru_id_list += temp[(temp['publish_year'] == max_yr) & (temp['reference_type'] != 5)].reference_usage_id.to_list()
#             # 這裡也要排除backbone
#             elif ignore_backbone and not ignore_checklist:
#                 latest_ru_id_list += temp[(temp['publish_year'] == max_yr) & (temp['reference_type'] != 4)].reference_usage_id.to_list()
#             else:
#                 latest_ru_id_list += temp[(temp['publish_year'] == max_yr)].reference_usage_id.to_list()
#     # if len(latest_ru_id_list) > 1:
#     if len(latest_ru_id_list):
#         main_at = temp[temp.reference_usage_id==latest_ru_id_list[0]].alien_type.values[0]
#     else:
#         main_at = None
#     return main_at
#     # # 如果最新的是同一篇文獻 且互為同模異名 要判斷usage中的group 來決定誰是最新
#     # is_obj_syns = False
#     # if len(latest_ru_id_list) > 1:
#     #     temp_rows = temp[temp.reference_usage_id.isin(latest_ru_id_list)]
#     #     # 先確認是不是同模
#     #     # 1. 全部有一樣的original_taxon_name_id (長度可以超過2)
#     #     if len(temp_rows.original_taxon_name_id.unique()) == 1:
#     #         if temp_rows.original_taxon_name_id.unique()[0] is not None:
#     #             is_obj_syns = True
#     #     # 2. A 是 B 的基礎名
#     #     # 3. B 是 A 的基礎名
#     #     elif len(latest_ru_id_list) == 2:
#     #         if len(temp_rows[temp_rows.original_taxon_name_id.notnull()]) == 1:
#     #             a_name = temp_rows[temp_rows.original_taxon_name_id.notnull()].original_taxon_name_id.values[0]
#     #             if len(temp_rows[temp_rows.taxon_name_id==a_name]) == 1:
#     #                 is_obj_syns = True
#     #     if is_obj_syns:
#     #         # 抓出group
#     #         group_min = temp_rus[temp_rus.reference_usage_id.isin(latest_ru_id_list)].group.min()
#     #         latest_ru_id_list = temp_rus[(temp_rus.reference_usage_id.isin(latest_ru_id_list))&(temp_rus.group==group_min)].reference_usage_id.to_list()
#     # return latest_ru_id_list, is_obj_syns


# deprecated
# def return_download_file(base, base_query):

#     if base_query:
#         # tnn 接受名
#         # tn 查詢名
#         query = base_query + f"""
#                         SELECT distinct tn.name, atu.status, at.taxon_id, at.accepted_taxon_name_id, 
#                             tnn.name, an.name_author, an.formatted_name, at.rank_id, acnn.name_c, 
#                             at.is_hybrid, at.is_in_taiwan, at.is_endemic, at.main_alien_type, at.alien_note,
#                             at.is_fossil, at.is_terrestrial, at.is_freshwater, at.is_brackish, at.is_marine,
#                             at.not_official, ac.cites_listing, ac.iucn_category, ac.red_category, ac.protected_category, ac.sensitive_suggest,
#                             at.created_at, at.updated_at, att.path, r.order
#                         {base[0]}
#                         INNER JOIN taxon_names tn ON tn.id = atu.taxon_name_id 
#                         INNER JOIN taxon_names tnn ON tnn.id = at.accepted_taxon_name_id
#                         JOIN `ranks` r ON r.id = at.rank_id
#                         LEFT JOIN api_names an ON at.accepted_taxon_name_id = an.taxon_name_id
#                         LEFT JOIN api_common_name acnn ON at.taxon_id = acnn.taxon_id AND acnn.is_primary = 1
#                         WHERE {base[1]} 
#                 """
#     else:

#         query = f"""
#                         SELECT distinct tn.name, atu.status, at.taxon_id, at.accepted_taxon_name_id, 
#                             tnn.name, an.name_author, an.formatted_name, at.rank_id, acnn.name_c, 
#                             at.is_hybrid, at.is_in_taiwan, at.is_endemic, at.main_alien_type, at.alien_note,
#                             at.is_fossil, at.is_terrestrial, at.is_freshwater, at.is_brackish, at.is_marine,
#                             at.not_official, ac.cites_listing, ac.iucn_category, ac.red_category, ac.protected_category, ac.sensitive_suggest,
#                             at.created_at, at.updated_at, att.path, r.order
#                         {base[0]}
#                         INNER JOIN taxon_names tn ON tn.id = atu.taxon_name_id 
#                         INNER JOIN taxon_names tnn ON tnn.id = at.accepted_taxon_name_id
#                         JOIN `ranks` r ON r.id = at.rank_id
#                         LEFT JOIN api_names an ON at.accepted_taxon_name_id = an.taxon_name_id
#                         LEFT JOIN api_common_name acnn ON at.taxon_id = acnn.taxon_id AND acnn.is_primary = 1
#                         WHERE {base[1]} 
#                 """
        
#     conn = pymysql.connect(**db_settings)
#     with conn.cursor() as cursor:
#         cursor.execute(query)
#         df = cursor.fetchall()
#         df = pd.DataFrame(df, columns=['search_name','usage_status', 'taxon_id','name_id','simple_name','name_author','formatted_name','rank','common_name_c',
#                                         'is_hybrid','is_in_taiwan','is_endemic','alien_type','alien_status_note','is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine',
#                                         'not_official','cites','iucn','redlist','protected','sensitive','created_at','updated_at','path','rank_order'])
#         df = df.drop_duplicates()
#         df = df.reset_index(drop=True)
#         # 在這步取得alternative_common_name
#         name_c_query = "select name_c, taxon_id from api_common_name where taxon_id IN %s and is_primary = 0"
#         cursor.execute(name_c_query, (df.taxon_id.to_list(),))
#         name_c = cursor.fetchall()
#         if len(name_c):
#             name_c = pd.DataFrame(name_c, columns=['alternative_name_c', 'taxon_id'])
#             name_c = name_c.groupby(['taxon_id'], as_index = False).agg({'alternative_name_c': ','.join})
#             df = df.merge(name_c, how='left')
#         else:
#             df['alternative_name_c'] = None

#     df['created_at'] = df.created_at.dt.strftime('%Y-%m-%d')
#     df['updated_at'] = df.updated_at.dt.strftime('%Y-%m-%d')

#     # synonyms
#     query = f"SELECT DISTINCT tu.taxon_id, an.formatted_name, tn.name \
#                 FROM api_taxon_usages tu \
#                 JOIN api_names an ON tu.taxon_name_id = an.taxon_name_id \
#                 JOIN taxon_names tn ON tu.taxon_name_id = tn.id \
#                 WHERE tu.status = 'not-accepted' AND tu.is_deleted != 1 AND tu.taxon_id IN %s;"
#     with conn.cursor() as cursor:
#         cursor.execute(query, (df.taxon_id.to_list(),))
#         syns = cursor.fetchall()
#         syns = pd.DataFrame(syns, columns=['taxon_id','formatted_synonyms','synonyms'])
#         syns = syns.groupby(['taxon_id'], as_index = False).agg({'formatted_synonyms': ','.join, 'synonyms': ','.join})

#     df = df.merge(syns, on='taxon_id', how='left')

#     # misapplied
#     query = f"SELECT DISTINCT tu.taxon_id, an.formatted_name, tn.name \
#                 FROM api_taxon_usages tu \
#                 JOIN api_names an ON tu.taxon_name_id = an.taxon_name_id \
#                 JOIN taxon_names tn ON tu.taxon_name_id = tn.id \
#                 WHERE tu.status = 'misapplied' AND tu.is_deleted != 1 AND tu.taxon_id IN %s;"
#     with conn.cursor() as cursor:
#         cursor.execute(query, (df.taxon_id.to_list(),))
#         misapplied = cursor.fetchall()
#         misapplied = pd.DataFrame(misapplied, columns=['taxon_id','formatted_misapplied','misapplied'])
#         misapplied = misapplied.groupby(['taxon_id'], as_index = False).agg({'formatted_misapplied': ','.join, 'misapplied': ','.join})

#     df = df.merge(misapplied, on='taxon_id', how='left')


#     query = "SELECT r.id, c.short_author, r.type \
#                 FROM `references` r  \
#                 LEFT JOIN api_citations c ON r.id = c.reference_id \
#                 JOIN api_taxon_usages atu ON r.id = atu.reference_id  \
#                 WHERE atu.taxon_id IN %s"  
#     conn = pymysql.connect(**db_settings)
#     with conn.cursor() as cursor:
#         cursor.execute(query, (df.taxon_id.to_list(), ))
#         refs = pd.DataFrame(cursor.fetchall(), columns=['reference_id', 'ref', 'type'])

#     # higher taxa
#     total_path = []

#     for i in df.index:
#         row = df.iloc[i]
#         if path := row.path:
#             path = path.split('>')
#             # 拿掉自己
#             for p in path:
#                 if p != row.taxon_id and p not in total_path:
#                     total_path.append(p)

#     query = f"SELECT t.taxon_id, tn.name, t.rank_id, acn.name_c, r.order \
#             FROM api_taxon t \
#             JOIN taxon_names tn ON t.accepted_taxon_name_id = tn.id \
#             JOIN `ranks` r ON r.id = t.rank_id \
#             LEFT JOIN api_common_name acn ON acn.taxon_id = t.taxon_id AND acn.is_primary = 1\
#             WHERE t.taxon_id IN %s"

#     conn = pymysql.connect(**db_settings)
#     with conn.cursor() as cursor:
#         cursor.execute(query, (total_path,))
#         path_df = cursor.fetchall()
#         path_df = pd.DataFrame(path_df, columns=['taxon_id','simple_name','rank','common_name_c','rank_order'])

#     for i in df.index:
#         row = df.iloc[i]
#         final_aliens = []
#         if row.alien_status_note:
#             # alien_rows = json.loads(row.alien_status_note)
#             alien_rows = pd.DataFrame(json.loads(row.alien_status_note))
#             if len(alien_rows):
#                 # ref_list = alien_rows.reference_id.to_list()

#                 alien_rows = alien_rows.merge(refs,how='left')
#                 alien_rows = alien_rows.replace({np.nan: None})
#                 # 排除backbone & note 為null
#                 # 是backbone 沒有note
#                 # 不顯示
#                 alien_rows = alien_rows[~((alien_rows['type'].isin([4,6]))&(alien_rows.status_note.isnull()))]
#                 alien_rows = alien_rows.sort_values('is_latest', ascending=False)
#                 alien_rows = alien_rows[['alien_type','status_note','ref','type']].drop_duplicates()
#                 for at in alien_rows.to_dict('records'):
#                     # 是backbone 有note
#                     # 歸化: note
#                     if at.get('type') in [4,6] and at.get('status_note'):
#                         final_aliens.append(f"{at.get('alien_type')}: {at.get('status_note')}")
#                     # 不是backbone 有note
#                     # 原生: Chang-Yang et al., 2022 (note)
#                     elif at.get('status_note'):
#                         final_aliens.append(f"{at.get('alien_type')}: {at.get('ref')} ({at.get('status_note')})")
#                     # 不是backbone 沒有notenote
#                     # 原生: Chang-Yang et al., 2022
#                     else:
#                         final_aliens.append(f"{at.get('alien_type')}: {at.get('ref')}")

#         df.loc[i, 'alien_status_note'] = '|'.join(final_aliens)

#         if path := row.path:
#             path = path.split('>')
#             # 拿掉自己
#             path = [p for p in path if p != row.taxon_id]
#             # 3,12,18,22,26,30,34 
#             if path:
#                 higher = path_df[path_df.taxon_id.isin(path)&path_df['rank'].isin([50,49,3,12,18,22,26,30])][['simple_name','common_name_c','rank','taxon_id','rank_order']]
#                 current_rank_orders = higher.rank_order.to_list() + [row.rank_order]
#                 for x in lin_map.keys():
#                     now_order = lin_map_w_order[x]['rank_order']
#                     if now_order not in current_rank_orders and now_order < max(current_rank_orders) and now_order > min(current_rank_orders):
#                         higher = pd.concat([higher, pd.Series({'rank': x, 'common_name_c': '地位未定', 'taxon_id': None, 'rank_order': lin_map_w_order[x]['rank_order']}).to_frame().T], ignore_index=True)
#                 # 從最大的rank開始補
#                 higher = higher.sort_values('rank_order', ignore_index=True, ascending=False)
#                 for hi in higher[higher.taxon_id.isnull()].index:
#                     # 病毒域可能會找不到東西補 
#                     found_hi = hi + 1
#                     if found_hi < len(higher):
#                         while not higher.loc[found_hi].taxon_id:
#                             found_hi += 1
#                     higher.loc[hi, 'simple_name'] = f'{higher.loc[found_hi].simple_name} {lin_map[higher.loc[hi]["rank"]]} incertae sedis'
#                     higher.loc[hi, 'common_name_c'] = '地位未定'
#                 higher = higher.replace({None: '', np.nan: ''})
#                 # 這邊還是只給lin_ranks
#                 higher = higher[higher['rank'].isin([3,12,18,22,26,30])]
#                 higher = higher.sort_values('rank_order', ignore_index=True)
#                 for r in higher.index:
#                     rr = higher.iloc[r]
#                     r_rank_id = rr['rank']
#                     df.loc[i, f'{rank_map[r_rank_id].lower()}'] = rr['simple_name']
#                     df.loc[i, f'{rank_map[r_rank_id].lower()}_c'] = rr['common_name_c']

#     # rank_id to rank
#     df['rank'] = df['rank'].apply(lambda x: rank_map[x])

#     # 0 / 1 要改成 true / false
#     is_list = ['is_hybrid','is_in_taiwan','is_endemic','is_fossil','is_terrestrial','is_freshwater','is_brackish','is_marine','not_official']
#     df[is_list] = df[is_list].replace({0: 'false', 1: 'true', '0': 'false', '1': 'true'})


#     df = df.replace({np.nan: '', None: ''})

#     # 欄位順序
#     cols = ['search_name','usage_status','taxon_id','name_id','simple_name','name_author','formatted_name','synonyms','formatted_synonyms','misapplied','formatted_misapplied','rank',
#             'common_name_c','alternative_name_c','is_hybrid','is_in_taiwan','is_endemic','alien_type','alien_status_note','is_fossil','is_terrestrial','is_freshwater',
#             'is_brackish','is_marine','not_official','cites','iucn','redlist','protected','sensitive','created_at','updated_at',
#             'kingdom','kingdom_c','phylum','phylum_c','class','class_c','order','order_c','family','family_c','genus','genus_c']

#     # print(df.keys())
#     for c in cols:
#         if c not in df.keys():
#             # print(c)
#             df[c] = ''
#     # cites要改成 I,II,III
#     df['cites'] = df['cites'].apply(lambda x: x.replace('1','I').replace('2','II').replace('3','III') if x else x)

#     taxon = df[cols]

#     return taxon