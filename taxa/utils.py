from conf.settings import env
import pymysql
import math

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
query = "SELECT tn.name, at.taxon_id, at.common_name_c FROM taxon_names tn\
         JOIN api_taxon at ON at.accepted_taxon_name_id = tn.id WHERE tn.rank_id = 3"
with conn.cursor() as cursor:
    cursor.execute(query)
    kingdom = cursor.fetchall()
    for k in kingdom:
        kingdom_map[k[1]] = {'name': k[0], 'common_name_c': k[2]}


rank_map = {
    1: 'Domain', 2: 'Superkingdom', 3: 'Kingdom', 4: 'Subkingdom', 5: 'Infrakingdom', 6: 'Superdivision', 7: 'Division', 8: 'Subdivision', 9: 'Infradivision', 10: 'Parvdivision', 11: 'Superphylum', 12:
    'Phylum', 13: 'Subphylum', 14: 'Infraphylum', 15: 'Microphylum', 16: 'Parvphylum', 17: 'Superclass', 18: 'Class', 19: 'Subclass', 20: 'Infraclass', 21: 'Superorder', 22: 'Order', 23: 'Suborder',
    24: 'Infraorder', 25: 'Superfamily', 26: 'Family', 27: 'Subfamily', 28: 'Tribe', 29: 'Subtribe', 30: 'Genus', 31: 'Subgenus', 32: 'Section', 33: 'Subsection', 34: 'Species', 35: 'Subspecies', 36:
    'Nothosubspecies', 37: 'Variety', 38: 'Subvariety', 39: 'Nothovariety', 40: 'Form', 41: 'Subform', 42: 'Special Form', 43: 'Race', 44: 'Stirp', 45: 'Morph', 46: 'Aberration', 47: 'Hybrid Formula'}

rank_map_c = {1: '域', 2: '總界', 3: '界', 4: '亞界', 5: '下界', 6: '超部|總部', 7: '部|類', 8: '亞部|亞類', 9: '下部|下類', 10: '小部|小類', 11: '超門|總門', 12: '門', 13: '亞門', 14: '下門', 15: '小門', 16: '小門', 17: '超綱|總綱', 18: '綱',
              19: '亞綱', 20: '下綱', 21: '超目|總目', 22: '目', 23: '亞目', 24: '下目', 25: '超科|總科', 26: '科', 27: '亞科', 28: '族', 29: '亞族', 30: '屬', 31: '亞屬', 32: '組|節', 33: '亞組|亞節', 34: '種', 35: '亞種', 36: '雜交亞種',
              37: '變種', 38: '亞變種', 39: '雜交變種', 40: '型', 41: '亞型', 42: '特別品型', 43: '種族', 44: '種族', 45: '形態型', 46: '異常個體', 47: '雜交組合'}

alien_map_c = {'native': '原生','naturalized':'歸化','invasive':'入侵','cultured':'栽培豢養'}

status_map_c = {'accepted': '有效', 'not-accepted': '無效', 'undetermined': '未決', 'misapplied': '誤用'}
status_map_taxon_c = {'accepted': {'en-us': 'Accepted', 'zh-tw': '接受名'}, 'not-accepted': {'en-us': 'Not accepted', 'zh-tw': '無效'}, 
                      'undetermined': {'en-us': 'Undetermined', 'zh-tw': '未決'}, 'misapplied': {'en-us': 'Misapplied', 'zh-tw': '誤用'}}

rank_color_map = { 3: 'rank-1-red', 12: 'rank-2-org', 18: 'rank-3-yell', 22: 'rank-4-green', 26: 'rank-5-blue', 
                  30: 'rank-6-deepblue', 34: 'rank-7-purple'}

is_map_c = {'is_endemic':'臺灣特有','is_terrestrial':'陸生','is_freshwater':'淡水','is_brackish':'半鹹水','is_marine':'海水'}

# 台灣紅皮書
redlist_map_c = {
  'NEX': '滅絕', 'NEW': '野外滅絕', 'NRE': '區域滅絕', 'NCR': '極危', 'NEN': '瀕危', 'NVU': '易危', 'NNT': '接近受脅',
  'NLC': '暫無危機', 'NDD': '資料缺乏', 'NA': '不適用', 'NE': '未評估'
}

iucn_map_c = {
  'EX': '滅絕', 'EW': '野外滅絕', 'RE': '區域滅絕', 'CR': '極危', 'EN': '瀕危', 'VU': '易危', 'CD': '依賴保育', 'NT': '接近受脅',
  'LC': '暫無危機', 'DD': '資料缺乏', 'NA': '不適用', 'NE': '未評估'
}


cites_map_c = { '1': '附錄 I 有滅種威脅須嚴格管制','2':'附錄 II 族群數量稀少須有效管制','3':'附錄 III 特定國家指定有效管制','NC':'NC 無'}


protected_map_c = {'I': '瀕臨絕種野生動物', 'II': '珍貴稀有野生動物', 'III': '其他應予保育之野生動物'}

# 一）瀕臨絕種野生動物。 （二）珍貴稀有野生動物。 （三）其他應予保育之野生動物。