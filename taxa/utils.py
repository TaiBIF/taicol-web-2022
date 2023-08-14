from conf.settings import env
import pymysql
import math
import pandas as pd
import re
# from datetime import datetime, timedelta, strftime
import json
import numpy as np
from  django.utils.translation import get_language, gettext


def get_page_list(current_page, total_page, window=3):
  list_index = math.ceil(current_page/window)
  if list_index*window > total_page:
    page_list = list(range(list_index*window-(window-1),total_page+1))
  else:
    page_list = list(range(list_index*window-(window-1),list_index*window+1))
  return page_list



db_settings = {
    "host": env('DB_HOST'),
    "port": int(env('DB_PORT')),
    "user": env('DB_USER'),
    "password": env('DB_PASSWORD'),
    "db": env('DB_DBNAME'),
}

link_map = {}
conn = pymysql.connect(**db_settings)
query = "SELECT source, title, url_prefix FROM api_links"
with conn.cursor() as cursor:
    cursor.execute(query)
    links = cursor.fetchall()
    for l in links:
        link_map[l[0]] = {'title': l[1], 'url_prefix': l[2]}

kingdom_map = {}
conn = pymysql.connect(**db_settings)
query = "SELECT tn.name, at.taxon_id, acn.name_c FROM taxon_names tn \
         JOIN api_taxon at ON at.accepted_taxon_name_id = tn.id \
         JOIN api_common_name acn ON acn.taxon_id = at.taxon_id AND acn.is_primary = 1\
         WHERE tn.rank_id = 3 ORDER BY tn.name"
with conn.cursor() as cursor:
    cursor.execute(query)
    kingdom = cursor.fetchall()
    for k in kingdom:
        kingdom_map[k[1]] = {'name': k[0], 'common_name_c': k[2]}

rank_map, rank_map_c = {}, {}
conn = pymysql.connect(**db_settings)
query = "SELECT id, display from ranks"
with conn.cursor() as cursor:
    cursor.execute(query)
    ranks = cursor.fetchall()
    rank_map = dict(zip([r[0] for r in ranks], [eval(r[1])['en-us'] for r in ranks]))
    rank_map_c = dict(zip([r[0] for r in ranks], [eval(r[1])['zh-tw'] for r in ranks]))


# rank_map = {
#     1: 'Domain', 2: 'Superkingdom', 3: 'Kingdom', 4: 'Subkingdom', 5: 'Infrakingdom', 6: 'Superdivision', 7: 'Division', 8: 'Subdivision', 9: 'Infradivision', 10: 'Parvdivision', 11: 'Superphylum', 12:
#     'Phylum', 13: 'Subphylum', 14: 'Infraphylum', 15: 'Microphylum', 16: 'Parvphylum', 17: 'Superclass', 18: 'Class', 19: 'Subclass', 20: 'Infraclass', 21: 'Superorder', 22: 'Order', 23: 'Suborder',
#     24: 'Infraorder', 25: 'Superfamily', 26: 'Family', 27: 'Subfamily', 28: 'Tribe', 29: 'Subtribe', 30: 'Genus', 31: 'Subgenus', 32: 'Section', 33: 'Subsection', 34: 'Species', 35: 'Subspecies', 36:
#     'Nothosubspecies', 37: 'Variety', 38: 'Subvariety', 39: 'Nothovariety', 40: 'Form', 41: 'Subform', 42: 'Special Form', 43: 'Race', 44: 'Stirp', 45: 'Morph', 46: 'Aberration', 47: 'Hybrid Formula'}

# rank_map_c = {1: '域', 2: '總界', 3: '界', 4: '亞界', 5: '下界', 6: '超部|總部', 7: '部|類', 8: '亞部|亞類', 9: '下部|下類', 10: '小部|小類', 11: '超門|總門', 12: '門', 13: '亞門', 14: '下門', 15: '小門', 16: '小門', 17: '超綱|總綱', 18: '綱',
#               19: '亞綱', 20: '下綱', 21: '超目|總目', 22: '目', 23: '亞目', 24: '下目', 25: '超科|總科', 26: '科', 27: '亞科', 28: '族', 29: '亞族', 30: '屬', 31: '亞屬', 32: '組|節', 33: '亞組|亞節', 34: '種', 35: '亞種', 36: '雜交亞種',
#               37: '變種', 38: '亞變種', 39: '雜交變種', 40: '型', 41: '亞型', 42: '特別品型', 43: '種族', 44: '種族', 45: '形態型', 46: '異常個體', 47: '雜交組合'}

name_status_map_c = {
    # 'accepted': 'Accepted',
    'not-accepted': '的無效名',
    'misapplied': '的誤用名',
}

name_status_map = {
    # 'accepted': 'Accepted',
    'not-accepted': 'synonym of',
    'misapplied': 'misapplied to',
}

# attr_map_c
# attr_map_c
# attr_map

# attr_map_c = {'native': '原生','naturalized':'歸化','invasive':'入侵','cultured':'栽培豢養'}

status_map_c = {'accepted': '有效', 'not-accepted': '無效', 'undetermined': '未決', 'misapplied': '誤用'}
status_map_taxon_c = {'accepted': {'en-us': 'Accepted', 'zh-tw': '接受名'}, 'not-accepted': {'en-us': 'Not accepted', 'zh-tw': '無效'}, 
                      'undetermined': {'en-us': 'Undetermined', 'zh-tw': '未決'}, 'misapplied': {'en-us': 'Misapplied', 'zh-tw': '誤用'}}

rank_color_map = { 3: 'rank-1-red', 12: 'rank-2-org', 18: 'rank-3-yell', 22: 'rank-4-green', 26: 'rank-5-blue', 
                  30: 'rank-6-deepblue', 34: 'rank-7-purple'}

attr_map_c = {'is_in_taiwan':'存在於臺灣','is_endemic':'臺灣特有','is_terrestrial':'陸生','is_freshwater':'淡水','is_brackish':'半鹹水','is_marine':'海洋','native': '原生','naturalized':'歸化','invasive':'入侵','cultured':'栽培豢養', 'is_cultured': '栽培豢養'}
attr_map = {'is_in_taiwan':'Exist in Taiwan','is_endemic':'Endemic to Taiwan','is_terrestrial':'Terrestrial','is_freshwater':'Freshwater','is_brackish':'Brackish','is_marine':'Marine', 'native': 'Native','naturalized':'Naturalized','invasive':'Invasive','cultured':'Cultured', 'is_cultured': 'Cultured'}

is_in_taiwan_map_c =  {
  1: '存在', 0: '不存在', '1': '存在', '0': '不存在'
}



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

# 一）瀕臨絕種野生動物。 （二）珍貴稀有野生動物。 （三）其他應予保育之野生動物。


conserv_map = {'iucn_category': 'IUCN', 'cites_listing': 'CITES', 
               'protected_category': '保育類', 'red_category': '臺灣紅皮書', 'sensitive_suggest': '敏感物種建議模糊層級'}


# 林奈階層

lin_map = {
    3: 'kingdom',
    12: 'phylum',
    18: 'classis',
    22: 'ordo',
    26: 'familia',
}

lin_ranks = [3,12,18,22,26,30,34]
sub_lin_ranks = [35,36,37,38,39,40,41,42,43,44,45,46]

var_df = pd.DataFrame([
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


def get_variants(string):
  new_string = ''
  # 單個異體字
  for s in string:    
    if len(var_df[var_df['char']==s]):
      new_string += var_df[var_df['char']==s].pattern.values[0]
    else:
      new_string += s
  # 兩個異體字
  for i in var_df_2.index:
    char = var_df_2.loc[i, 'char']
    if char in new_string:
      new_string = new_string.replace(char,f"{var_df_2.loc[i, 'pattern']}")
  return new_string



def get_download_file(taxon_list=[]):  
  query = """
          WITH base_query AS (SELECT taxon_id, GROUP_CONCAT(name_c SEPARATOR ', ') AS alternative_name_c 
                              FROM api_common_name WHERE is_primary = 0 AND taxon_id IN %s GROUP BY taxon_id)
          SELECT t.taxon_id, t.accepted_taxon_name_id, tn.name, an.name_author, an.formatted_name, 
                    t.rank_id, acn.name_c, bq.alternative_name_c, t.is_hybrid, t.is_in_taiwan, t.is_endemic, JSON_EXTRACT(t.alien_type, '$[*].alien_type'), t.is_fossil, t.is_terrestrial, 
                    t.is_freshwater, t.is_brackish, t.is_marine, ac.cites_listing, ac.cites_note, ac.iucn_category, ac.iucn_note, 
                    ac.red_category, ac.red_note, ac.protected_category, ac.protected_note, ac.sensitive_suggest, ac.sensitive_note, 
                    t.created_at, t.updated_at, att.path 
                    FROM api_taxon t 
                    JOIN taxon_names tn ON t.accepted_taxon_name_id = tn.id 
                    JOIN api_names an ON t.accepted_taxon_name_id = an.taxon_name_id 
                    LEFT JOIN api_conservation ac ON t.taxon_id = ac.taxon_id 
                    LEFT JOIN api_taxon_tree att ON t.taxon_id = att.taxon_id 
                    LEFT JOIN api_common_name acn ON acn.taxon_id = t.taxon_id AND acn.is_primary = 1
                    LEFT JOIN base_query bq ON bq.taxon_id = t.taxon_id
                    WHERE t.taxon_id IN %s;
  """
  conn = pymysql.connect(**db_settings)
  with conn.cursor() as cursor:
      cursor.execute(query, (taxon_list,taxon_list))
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
  total_path = []

  for i in df.index:
      row = df.iloc[i]
      if path := row.path:
          path = path.split('>')
          # 拿掉自己
          for p in path:
            if p != row.taxon_id and p not in total_path:
              total_path.append(p)

  query = f"SELECT t.taxon_id, tn.name, t.rank_id, acn.name_c \
          FROM api_taxon t \
          JOIN taxon_names tn ON t.accepted_taxon_name_id = tn.id \
          LEFT JOIN api_common_name acn ON acn.taxon_id = t.taxon_id AND acn.is_primary = 1\
          WHERE t.taxon_id IN %s"

  conn = pymysql.connect(**db_settings)
  with conn.cursor() as cursor:
      cursor.execute(query, (total_path,))
      path_df = cursor.fetchall()
      path_df = pd.DataFrame(path_df, columns=['taxon_id','simple_name','rank','common_name_c'])

  for i in df.index:
      row = df.iloc[i]
      if path := row.path:
          path = path.split('>')
          # 拿掉自己
          path = [p for p in path if p != row.taxon_id]
          # 3,12,18,22,26,30,34 
          if path:
              higher = path_df[path_df.taxon_id.isin(path)&path_df['rank'].isin([3,12,18,22,26,30])][['simple_name','common_name_c','rank','taxon_id']]
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

  df = df.replace({np.nan: '', None: ''})

  # 欄位順序
  cols = ['taxon_id','name_id','simple_name','name_author','formatted_name','synonyms','formatted_synonyms','rank',
          'common_name_c','alternative_name_c','is_hybrid','is_endemic','alien_type','is_fossil','is_terrestrial','is_freshwater',
          'is_brackish','is_marine','cites','iucn','redlist','protected','sensitive','created_at','updated_at',
          'kingdom','kingdom_c','phylum','phylum_c','class','class_c','order','order_c','family','family_c','genus','genus_c']
  
  for c in cols:
    if c not in df.keys():
      df[c] = ''
  # cites要改成 I,II,III
  df['cites'] = df['cites'].apply(lambda x: x.replace('1','I').replace('2','II').replace('3','III') if x else x)

  taxon = df[cols]
  return taxon
  # today = datetime.now() + timedelta(hours=8)

  # taxon.to_csv(f"物種名錄_物種_{today.strftime('%Y%m%d')}.csv",index=False)




taxon_history_map = {
    0: 'Accepted name changed', 
    1: 'New synonym: ',
    2: 'New reference',
    4: 'Classification updated',
    5: 'Taxon created',
    6: 'Taxon deleted',
    7: 'New common name: ',
    8: 'Taxon information added: ',
    9: 'Taxon information removed: ',
    # 10: 'Taxon information updated',
    11: 'Taxon information added: ',
    12: 'Taxon information removed: ',
    13: 'Taxon information updated: ',
    14: 'Taxon merged ',
    15: 'Taxon divided '}


taxon_history_map_c = {
    0: '有效名變更', # v
    1: '新增同物異名：', # v
    2: '新增文獻', # v
    4: '分類階層更新 ',  # v
    5: '新增Taxon', # v
    6: '已刪除 ', # v
    7: '新增中文名：', # v
    8: '新增屬性：',  # v
    9: '移除屬性：', # v
    # 10: '修改屬性', # deprecated
    11: '新增保育資訊：', #v
    12: '移除保育資訊：', #v
    13: '修改保育資訊：', #v
    14: '物種合併 ', #v
    15: '物種拆分 ' #v
    }


def create_history_display(taxon_id, lang, new_taxon_id, new_taxon_name, names):
  taxon_history_dict = taxon_history_map if lang == 'en-us' else taxon_history_map_c
  # taxon_history = []
  taxon_history = pd.DataFrame(columns=['history_type', 'content', 'short_author', 'updated_at', 'user_name', 'reference_id', 'note', 'reference_type'])
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
      taxon_history = pd.DataFrame(th, columns=['history_type', 'content', 'short_author', 'updated_at', 'editor', 'reference_id', 'note', 'reference_type'])
  # 整理文獻
  taxon_history['ref'] = taxon_history.apply(lambda x: f'<a href="https://nametool.taicol.tw/{"en-us" if lang == "en-us" else "zh-tw"}/references/{int(x.reference_id)}" target="_blank">{x.short_author}</a>' if x.short_author and x.reference_type != 4 else '', axis=1)
  # 整理時間
  taxon_history['updated_at'] = taxon_history.updated_at.dt.strftime('%Y-%m-%d')
  # 整理編輯者
  taxon_history.loc[taxon_history['editor']=='TaiCOL管理員','editor'] = 'TaiCOL'
  # 整理標題
  taxon_history['title'] = taxon_history['history_type'].apply(lambda x: taxon_history_dict[x])
  # 整理內容
  # 新增同物異名
  for i in taxon_history[taxon_history.history_type==1].index:
    row = taxon_history.iloc[i]
    c = json.loads(row.note)
    taxon_history.loc[i,'content'] = names[names.taxon_name_id==c.get('taxon_name_id')]['sci_name_ori'].values[0]

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
      query = f"""SELECT tn.name, at.taxon_id FROM api_taxon at
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
  for i in taxon_history[taxon_history.history_type==4].index:
      row = taxon_history.iloc[i]
      c = json.loads(row.note)
      content_str = ''
      if c.get('old'):
          o_path_list = c.get('old').split('>')
          if len(o_path_list) > 1: # 不包含自己
              query = f"""SELECT an.formatted_name
                          FROM api_taxon at
                          JOIN api_names an ON an.taxon_name_id = at.accepted_taxon_name_id
                          WHERE at.taxon_id IN %s
                          ORDER BY at.rank_id ASC"""
              conn = pymysql.connect(**db_settings)
              with conn.cursor() as cursor:
                  cursor.execute(query, (o_path_list, ))
                  ops = cursor.fetchall()
                  ops = [o[0] for o in ops]
                  content_str = (' > ').join(ops)
                  if content_str:
                      content_str = f'({gettext("原階層：")}{content_str})'
      taxon_history.loc[i,'content'] = content_str
  # 新增/移除屬性
  taxon_history.loc[taxon_history.history_type.isin([8,9]),'content'] = taxon_history[taxon_history.history_type.isin([8,9])].note.apply(lambda x: attr_map[x] if lang == 'en-us' else attr_map_c[x] )
  drop_conserv = []
  for i in taxon_history[taxon_history.history_type.isin([11,12,13])].index:
    row = taxon_history.iloc[i]
    c = json.loads(row.note)
    source = c.get('source')
    value = c.get('value')
    content = gettext(conserv_map[source]) + ' '
    if source == 'sensitive_suggest':
        drop_conserv.append(i)
    elif source == 'cites_listing':
        c_list = value.split('/')
        c_list_str = []
        for cl in c_list:
            c_list_str.append(cites_map[cl] if lang == 'en-us' else cites_map_c[cl])
        content += '/'.join(c_list_str)
    elif source == 'iucn_category':
        content += value if lang == 'en-us' else iucn_map_c[value] + ' ' + value
    elif source == 'red_category':
        content +=  value if lang == 'en-us' else redlist_map_c[value] + ' ' + value
    elif source == 'protected_category':
        content +=  protected_map[value] if get_language() == 'en-us' else f'第 {value} 級 {protected_map_c[value]}'
    taxon_history.loc[i,'content'] = content
  taxon_history = taxon_history.drop(index=drop_conserv)

  # 如果是新增文獻，且文獻的type==4 -> 移除
  taxon_history = taxon_history[~((taxon_history.reference_type==4)&(taxon_history.history_type==2))]
  taxon_history = taxon_history[['title','content','ref','updated_at','editor']]
  taxon_history.loc[taxon_history['title']==gettext('新增Taxon'),'content'] = ''
  taxon_history = taxon_history.drop_duplicates(subset=['title','content','ref']).to_dict(orient='records')
  return taxon_history




    # for i in taxon_history[taxon_history.history_type.isin([8,9])].index:
    #     row = taxon_history.iloc[i]
    #     taxon_history.loc[i,'content'] = content_str

      # for thh in th:
      #     if thh[0] == 4:
      #         c = json.loads(thh[6])
      #         # content_str = []
      #         content_str = ''
      #         if c.get('old'):
      #             o_path_list = c.get('old').split('>')
      #             if len(o_path_list) > 1: # 不包含自己
      #                 query = f"""SELECT an.formatted_name
      #                             FROM api_taxon at
      #                             JOIN api_names an ON an.taxon_name_id = at.accepted_taxon_name_id
      #                             WHERE at.taxon_id IN %s
      #                             ORDER BY at.rank_id ASC"""
      #                 conn = pymysql.connect(**db_settings)
      #                 with conn.cursor() as cursor:
      #                     cursor.execute(query, (o_path_list, ))
      #                     ops = cursor.fetchall()
      #                     ops = [o[0] for o in ops]
      #                     content_str = (' > ').join(ops)
      #                     if content_str:
      #                         content_str = f'({gettext("原階層：")}{content_str})'
      #         # content_str = old_path_str_name
      #         # row = [taxon_history_dict[thh[0]], content_str, f'<a href="https://nametool.taicol.tw/{"en-us" if lang == "en-us" else "zh-tw"}/references/{int(thh[5])}" target="_blank">{thh[2]}</a>', thh[3].strftime("%Y-%m-%d"), thh[4]]
      #     elif thh[0] == 6: # 刪除Taxon
      #         if thh[5]:
      #             if new_taxon_id:
      #                 row = [taxon_history_dict[thh[0]], f'''{gettext("請參見")} <a class="new_taxon_aa" href="/{"en-us" if lang == "en-us" else "zh-hant"}/taxon/{new_taxon_id}">{new_taxon_name if new_taxon_name else new_taxon_id}<svg class="fa_size" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="19" height="19" viewBox="0 0 19 19">
      #                                     <defs>
      #                                         <clipPath id="clip-path">
      #                                             <rect id="Rectangle_3657" data-name="Rectangle 3657" width="19" height="19" transform="translate(0 -0.359)" fill="#4c8da7"></rect>
      #                                         </clipPath>
      #                                     </defs>
      #                                     <g id="link-icon" transform="translate(0 0.359)">
      #                                         <g id="Group_7678" data-name="Group 7678" clip-path="url(#clip-path)">
      #                                             <path id="Path_8148" data-name="Path 8148" d="M136.768,4.994c-.053.253-.094.508-.162.757a5.729,5.729,0,0,1-1.539,2.554q-.923.93-1.85,1.856a.734.734,0,1,1-1.041-1.029c.711-.722,1.44-1.427,2.128-2.169a3.583,3.583,0,0,0,.977-2.125,2.92,2.92,0,0,0-1.291-2.8,3.005,3.005,0,0,0-3.438-.094,4.839,4.839,0,0,0-1,.753c-.916.885-1.811,1.792-2.706,2.7A3.989,3.989,0,0,0,125.7,7.449a3.025,3.025,0,0,0,1.441,3.252.8.8,0,0,1,.445.622.7.7,0,0,1-.337.68.68.68,0,0,1-.757.015,4.51,4.51,0,0,1-2.211-2.954,4.749,4.749,0,0,1,.928-3.99,7.224,7.224,0,0,1,.69-.8c.843-.856,1.7-1.7,2.546-2.55A5.769,5.769,0,0,1,131.3.1a4.578,4.578,0,0,1,5.4,3.612c.021.124.049.247.073.371Z" transform="translate(-118.129 0.001)" fill="#4c8da7"></path>
      #                                             <path id="Path_8149" data-name="Path 8149" d="M4.078,146.411c-.264-.059-.532-.1-.793-.178a4.575,4.575,0,0,1-3.251-3.811,4.792,4.792,0,0,1,1.147-3.711c.463-.566,1-1.068,1.515-1.6.287-.3.58-.586.873-.877A.732.732,0,1,1,4.6,137.276c-.632.638-1.27,1.269-1.9,1.909a4.234,4.234,0,0,0-1.151,1.987,3.075,3.075,0,0,0,2.65,3.754,3.526,3.526,0,0,0,2.745-.967c.493-.43.943-.908,1.406-1.372.608-.61,1.227-1.21,1.808-1.844a3.554,3.554,0,0,0,.951-2.059,2.981,2.981,0,0,0-1.117-2.7,4.411,4.411,0,0,0-.461-.323.731.731,0,0,1-.249-1.014.723.723,0,0,1,1.017-.23,4.468,4.468,0,0,1,2.284,4.25,4.415,4.415,0,0,1-1.156,2.824c-1.179,1.27-2.408,2.5-3.667,3.685a4.606,4.606,0,0,1-2.71,1.205.213.213,0,0,0-.063.031Z" transform="translate(0 -127.766)" fill="#4c8da7"></path>
      #                                         </g>
      #                                     </g>
      #                                 </svg></a>''', f'<a href="https://nametool.taicol.tw/{"en-us" if lang == "en-us" else "zh-tw"}/references/{int(thh[5])}" target="_blank">{thh[2]}</a>', thh[3].strftime("%Y-%m-%d"), thh[4]]
      #             else:
      #                 row = [taxon_history_dict[thh[0]], '', f'<a href="https://nametool.taicol.tw/{"en-us" if lang == "en-us" else "zh-tw"}/references/{int(thh[5])}" target="_blank">{thh[2]}</a>', thh[3].strftime("%Y-%m-%d"), thh[4]]
      #         else:
      #             if new_taxon_id:
      #                 row = [taxon_history_dict[thh[0]], f'''{gettext("請參見")} <a class="new_taxon_aa" href="/{"en-us" if lang == "en-us" else "zh-hant"}/taxon/{new_taxon_id}">{new_taxon_name if new_taxon_name else new_taxon_id}<svg class="fa_size" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="19" height="19" viewBox="0 0 19 19">
      #                                     <defs>
      #                                         <clipPath id="clip-path">
      #                                             <rect id="Rectangle_3657" data-name="Rectangle 3657" width="19" height="19" transform="translate(0 -0.359)" fill="#4c8da7"></rect>
      #                                         </clipPath>
      #                                     </defs>
      #                                     <g id="link-icon" transform="translate(0 0.359)">
      #                                         <g id="Group_7678" data-name="Group 7678" clip-path="url(#clip-path)">
      #                                             <path id="Path_8148" data-name="Path 8148" d="M136.768,4.994c-.053.253-.094.508-.162.757a5.729,5.729,0,0,1-1.539,2.554q-.923.93-1.85,1.856a.734.734,0,1,1-1.041-1.029c.711-.722,1.44-1.427,2.128-2.169a3.583,3.583,0,0,0,.977-2.125,2.92,2.92,0,0,0-1.291-2.8,3.005,3.005,0,0,0-3.438-.094,4.839,4.839,0,0,0-1,.753c-.916.885-1.811,1.792-2.706,2.7A3.989,3.989,0,0,0,125.7,7.449a3.025,3.025,0,0,0,1.441,3.252.8.8,0,0,1,.445.622.7.7,0,0,1-.337.68.68.68,0,0,1-.757.015,4.51,4.51,0,0,1-2.211-2.954,4.749,4.749,0,0,1,.928-3.99,7.224,7.224,0,0,1,.69-.8c.843-.856,1.7-1.7,2.546-2.55A5.769,5.769,0,0,1,131.3.1a4.578,4.578,0,0,1,5.4,3.612c.021.124.049.247.073.371Z" transform="translate(-118.129 0.001)" fill="#4c8da7"></path>
      #                                             <path id="Path_8149" data-name="Path 8149" d="M4.078,146.411c-.264-.059-.532-.1-.793-.178a4.575,4.575,0,0,1-3.251-3.811,4.792,4.792,0,0,1,1.147-3.711c.463-.566,1-1.068,1.515-1.6.287-.3.58-.586.873-.877A.732.732,0,1,1,4.6,137.276c-.632.638-1.27,1.269-1.9,1.909a4.234,4.234,0,0,0-1.151,1.987,3.075,3.075,0,0,0,2.65,3.754,3.526,3.526,0,0,0,2.745-.967c.493-.43.943-.908,1.406-1.372.608-.61,1.227-1.21,1.808-1.844a3.554,3.554,0,0,0,.951-2.059,2.981,2.981,0,0,0-1.117-2.7,4.411,4.411,0,0,0-.461-.323.731.731,0,0,1-.249-1.014.723.723,0,0,1,1.017-.23,4.468,4.468,0,0,1,2.284,4.25,4.415,4.415,0,0,1-1.156,2.824c-1.179,1.27-2.408,2.5-3.667,3.685a4.606,4.606,0,0,1-2.71,1.205.213.213,0,0,0-.063.031Z" transform="translate(0 -127.766)" fill="#4c8da7"></path>
      #                                         </g>
      #                                     </g>
      #                                 </svg></a>''', '', thh[3].strftime("%Y-%m-%d"), 'TaiCOL管理員']
      #             else:
      #                 row = [taxon_history_dict[thh[0]], '', '', thh[3].strftime("%Y-%m-%d"), 'TaiCOL管理員']

      #     elif thh[5] and thh[2] and thh[-1] != 4:
      #         row = [taxon_history_dict[thh[0]], thh[1], f'<a href="https://nametool.taicol.tw/{"en-us" if lang == "en-us" else "zh-tw"}/references/{int(thh[5])}" target="_blank">{thh[2]}</a>', thh[3].strftime("%Y-%m-%d"), thh[4]]
      #     else:
      #         row = [taxon_history_dict[thh[0]], thh[1], '', thh[3].strftime("%Y-%m-%d"), thh[4]]
      #     taxon_history.append(row)
  # taxon_history = pd.DataFrame(taxon_history, columns=['type','content','ref','datetime','editor'])