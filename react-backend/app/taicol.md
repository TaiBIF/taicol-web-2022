# 新版TaiCOL API 說明文件 (測試版)
###### tags: `TaiCOL`


> 此文件中所有連結網址為測試網址，非未來正式釋出使用的網址


## ❖ 學名 API - name
- 服務網址：http://18.183.59.124/v1/name

### 🁢 name API 參數說明
| 查詢參數   | 說明 | 範例網址 |
| -------- | -------- | -------- |
| name_id={string} |取得指定學名編碼的學名資料 |http://18.183.59.124/v1/name?name_id=93931 |
| scientific_name={string}|取得完全符合輸入物種學名的學名資料 |http://18.183.59.124/v1/name?scientific_name=Cyclosorus%20acuminatus |
| taxon_group={string}|取得指定分類群以下所有階層學名資料 |http://18.183.59.124/v1/name?taxon_group=Cyclosorus |
| created_at={yyyy-mm-dd}|取得指定年月日以後建立之學名資料 |http://18.183.59.124/v1/name?created_at=2022-01-01 |
| updated_at={yyyy-mm-dd} | 取得指定年月日以後更新之學名資料  | http://18.183.59.124/v1/name?updated_at=2022-06-01 |

  
### 🁢 回傳欄位說明


| 欄位 | 說明 | 備註 |
| -------- | -------- | -------- |
|	name_id	|學名編碼	|如：93931
|   nomenclature_name|命名法規 |如：ICN, ICZN
|	rank	|階層	|如：Species, Genus, Family
|	simple_name	|簡單學名(拉丁名去除學名作者)	|如：Cyclosorus acuminatus
|	name_author	|學名作者	|如：(Houtt.) Nakai
|	formatted_name	|格式化之學名	|如斜體：&lt;i&gt;Cyclosorus acuminatus&lt;/i&gt;
|	name	|學名分欄	|latin_genus:屬名, latin_s1:種小名, s2_rank:種下階層, latin_s2:種下名 ... |
|	original_name_id	|基礎名/原始組合名的學名編碼	|
|	is_hybrid	|是否為雜交	|true:是, false:否|
|	hybrid_parent	|雜交親代	|
|	protologue	|原始發表文獻	|
|	type_name_id	|模式學名的學名編碼	| 
|	created_at	|學名資料建立日期|yyyy-mm-dd
|	updated_at	|學名資料更新日期|yyyy-mm-dd

## ❖ 物種 API - taxon
- 服務網址：http://18.183.59.124/v1/taxon
### 🁢 taxon API 參數說明
| 查詢參數   | 說明 | 範例網址 |
| -------- | -------- | -------- |
| taxon_id={string} |取得指定物種編碼的物種資料 |http://18.183.59.124/v1/taxon?taxon_id=t000001 |
| taxon_group={string}|取得指定分類群以下的所有階層物種資料，可輸入學名或中文名 |http://18.183.59.124/v1/name?taxon_group=Cyclosorus |
| created_at={yyyy-mm-dd}|取得指定年月日以後建立之學名資料 |http://18.183.59.124/v1/name?created_at=2022-01-01 |
| updated_at={yyyy-mm-dd} | 取得指定年月日以後更新之學名資料  | http://18.183.59.124/v1/name?updated_at=2022-06-01 |
| alien_type={string} | 原生/外來類型。可輸入的值有：native, naturalized  , invasive, cultured |http://18.183.59.124/v1/taxon?alien_type=Naturalized |
| is_hybrid={true/false} | 是否為雜交 |http://18.183.59.124/v1/taxon?is_hybrid=true|
| is_endemic={true/false} | 是否為特有 |http://18.183.59.124/v1/taxon?is_endemic=true |
| is_fossil={true/false} | 是否為化石 |http://18.183.59.124/v1/taxon?is_fossil=true |
| is_terrestrial={true/false} | 是否為陸生生物 |http://18.183.59.124/v1/taxon?is_terrestrial=true |
| is_freshwater={true/false} | 是否為淡水生物 |http://18.183.59.124/v1/taxon?is_freshwater=true |
| is_brackish={true/false} | 是否為半鹹水生物 |http://18.183.59.124/v1/taxon?is_brackish=true |
| is_marine={true/false} | 是否為海洋生物 |http://18.183.59.124/v1/taxon?is_marine=true |

### 🁢 回傳欄位說明


| 欄位 | 說明 | 備註 |
| -------- | -------- | -------- |
| taxon_id | 物種編碼 | 
| name_id | 對應有效名的學名編碼 |
| simple_name	| 簡單學名(拉丁名去除學名作者) |
| name_author	| 學名作者	|
| formatted_name	| 格式化之學名	| 如：斜體 |
| synonyms | 同物異名 | 多值時用半形逗號分隔 |
| formatted_synonyms | 格式化之同物異名 | 如：斜體 |
| rank	| 階層	|例：Species, Genus, Family
| common_name_c | 主要使用中文俗名|例：石虎
| alternative_name_c | 其他俗名 |例：華南豹貓,豹貓,山貓,金錢貓
| is_hybrid	| 是否為雜交	|true:是, false:否|
| is_endemic	| 是否為特有	|true:是, false:否|
| alien_type	| 原生/外來類型	|例：native, naturalized , invasive, cultured|
| is_fossil	| 是否為化石	|true:是, false:否|
| is_terrestrial	| 是否為陸生生物	|true:是, false:否|
| is_freshwater	| 是否為淡水生物	|true:是, false:否|
| is_brackish	| 是否為半鹹水生物	|true:是, false:否|
| is_marine	| 是否為海洋生物	|true:是, false:否|
| cites	| CITES華盛頓公約附錄	|例：I, II, III, NC，可能同時存在多個附錄裡
| iucn | IUCN國際自然保育聯盟紅皮書評估 |例：EX, EW, RE, CR, EN, VU, NT, LC, DD, NA, NE
| redlist | 臺灣紅皮書評估 |例：NEX, NEW, NRE, NCR, NEN, NVU, NNT, NLC, NDD, NA, NE
| protected | 臺灣保育類等級 |例：I, II, III
| sensitive | 敏感物種建議模糊層級 |例：無, 輕度, 重度
| created_at	| 物種資料建立日期 |yyyy-mm-dd
| updated_at	| 物種資料更新日期 |yyyy-mm-dd



## ❖ 較高階層 API - higherTaxa 
- 服務網址：http://18.183.59.124/v1/higherTaxa

### 🁢 higherTaxa API 參數說明
| 查詢參數   | 說明 | 範例網址 |
| -------- | -------- | -------- |
| taxon_id={string} |取得指定物種編碼的較高階層資料 |http://18.183.59.124/v1/higherTaxa?taxon_id=t000001 |


### 🁢 回傳欄位說明


| 欄位 | 說明 | 備註 |
| -------- | -------- | -------- |
| taxon_id | 物種編碼 | 
| name_id | 學名編碼 |
| simple_name	| 簡單學名(拉丁名去除學名作者) |
| name_author	| 學名作者	|
| formatted_name	| 格式化之學名	| 如：斜體 |
| rank	| 階層	|
| common_name_c | 主要使用中文俗名|


## ❖ 文獻 API - references 
- 服務網址：http://18.183.59.124/v1/references

### 🁢 references API 參數說明
| 查詢參數   | 說明 | 範例網址 |
| -------- | -------- | -------- |
| name_id={string} | 取得指定學名編碼的文獻資料 |http://18.183.59.124/v1/references?name_id=33607 |


### 🁢 回傳欄位說明

| 欄位 | 說明 | 備註 |
| -------- | -------- | -------- |
| reference_id | 文獻編碼 | 
| citation | 完整文獻引用 | 如：Wu, S.S. (2019) Reassessment of the generic definition of Sesapa Walker, 1854, with descriptions of two new species of Taiwan. &lt;i&gt;Tinea&lt;/i&gt; 25(S1): 75–83. | 
| status	| 查詢學名在文獻中的地位 | 回傳字串：accepted, not-accepted, misapplied, unresolved |
| indications	| 查詢學名在文獻中的標註	| 如：sp. nov.
| is_taiwan	| 查詢學名在文獻中表示是否存在於台灣 | true:是, false:否 |
| is_endemic	| 查詢學名在文獻中是否為特有	| true:是, false:否 |
| alien_type | 查詢學名在文獻中的原生/外來類型|回傳字串：native, naturalized , invasive, cultured |


## ❖ 學名比對 API - nameMatch
- 服務網址：http://18.183.59.124/v1/nameMatch

### 🁢 nameMatch API 參數說明
| 查詢參數   | 說明 | 範例網址 |
| -------- | -------- | -------- |
| name_id={string} |查詢指定學名編碼對應的物種資料 | http://18.183.59.124/v1/nameMatch?name_id=1  |
| name={string} | 模糊比對學名/中文俗名 | http://18.183.59.124/v1/nameMatch?name=Miltochrista |
| best={yes/no} | 是否只取最佳結果。預設為yes |http://18.183.59.124/v1/nameMatch?name=石龍尾&best=no | 


### 🁢 回傳欄位說明

| 欄位 | 說明 | 備註 |
| -------- | -------- | -------- |
| matched_name | 比對到的學名 | 
| accepted_name | 比對到學名的目前接受名 |
| taxon_id	| 物種編碼 |
| usage_status	| 地位	|


### 🁢 格式及共同參數說明
- 本API回傳格式為JSON。
- 各參數可用「&」相互組合，但可能因性質而異。
- 回傳狀態代碼說明：

| 代碼(code) | 訊息(message) | 說明 |
| -------- | -------- | -------- |
| 200    | Success| 成功 | 
| 400     | Bad Request: Unsupported parameters | 查詢不支援的參數  |
| 400     | Bad Request: Page does not exist | 輸入頁碼不存在  |
| 400     | Bad Request: Type error of limit or page | 頁碼或限制筆數格式錯誤  |
| 500     | Unexpected Error | 查無資料 / 未知錯誤  |




- 分頁參數說明：

| 參數 | 說明 | 範例網址 |
| -------- | -------- | -------- |
| limit    | 限制每頁回傳筆數。預設20筆，上限300| http://18.183.59.124/v1/name?limit=5  |
| offset     | 指定每頁起始編號。預設為0| http://18.183.59.124/v1/name?offset=1  |

- 回傳格式：
    ```
    { 
     "status": {
        "code": 200,
        "message": "Success"
     },
     "info": {
        "total": 93735,
        "limit": 20,
        "offset": 0
     },
        ......
    ```
    

### 🁢 使用規範
本API採「政府資料開放授權條款」



