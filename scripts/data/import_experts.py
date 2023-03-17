from taxa.models import Expert
import pandas as pd 
import pymysql
from conf.settings import env
import numpy as np

db_settings = {
    "host": env('DB_HOST'),
    "port": int(env('DB_PORT')),
    "user": env('DB_USER'),
    "password": env('DB_PASSWORD'),
    "db": env('DB_DBNAME'),
}

# Index(['name', 'name_e', 'email', 'taxon_group'], dtype='object')

df = pd.read_csv('/bucket/新版TaiCOL專家名錄.csv')
df['taxon_list'] = df.taxon_group.apply(lambda x: x.split(','))

# 一個分類群一個row
df = df.explode('taxon_list')
df = df.drop(['taxon_group'],axis=1)
df = df.rename(columns={'taxon_list': 'taxon_group'})
df = df.apply(lambda x: x.str.strip())
# 先比對name取得taxon_id
# names = str(list(df.taxon_group.unique())).replace('[','(').replace(']',')')
names = list(df.taxon_group.unique())

# 同名異物的情況?
conn = pymysql.connect(**db_settings)
query = f"""SELECT tn.name, at.taxon_id
           FROM taxon_names tn 
           JOIN api_taxon at ON tn.id = at.accepted_taxon_name_id
           WHERE tn.name IN %s"""

with conn.cursor() as cursor:
    cursor.execute(query, (names,))
    results = cursor.fetchall()
    results = pd.DataFrame(results, columns=['taxon_group', 'taxon_id'])


df = df.merge(results, how='left')

lack = df[df.taxon_id.isnull()]
lack = lack[['taxon_group']].sort_values('taxon_group').drop_duplicates()

df = df[df.taxon_id.notnull()]
df = df.reset_index()

df = df.replace({np.nan: '', None: ''})

for i in df.index:
    row = df.iloc[i]
    Expert.objects.create(
        name = row['name'],
        name_e = row.name_e,
        email = row.email,
        taxon_id = row.taxon_id,
        taxon_group = row.taxon_group
    )
