import React from 'react';
import Banner from 'src/components/frontend/common/Banner'
import RankCountStatisics from 'src/components/frontend/statistics/RankCountStatisics'
import SpeciesCountStatisics from 'src/components/frontend/statistics/SpeciesCountStatisics'
import useSWR from 'swr';
import { useEffect } from 'react';
import type { RankProps, SourceProps, EndemicProps, SpeciesCompareProps,KingdomProps,CompareTableDataProps } from 'src/types/frontend'
import { CompareType } from 'src/components/frontend/statistics/options'
import SpeciesAndEndemicRatiosStatisics from 'src/components/frontend/statistics/SpeciesAndEndemicRatiosStatisics'
import SourceDoughnutChart from 'src/components/frontend/statistics/SourceDoughnutChart'
import { getTotal } from 'src/utils/helper'
import TaiwanSpeciesAndEndemicCompareGlobalStatisics  from 'src/components/frontend/statistics/TaiwanSpeciesAndEndemicCompareGlobalStatisics'
import { speciesOptions } from 'src/components/frontend/statistics/options'
import PopupTable from 'src/components/frontend/statistics/PopupTable'
import TaxonCountSection from 'src/components/frontend/statistics/TaxonCountSection'

type RankInfoProps = {
  rank: string;
  name: string;
  className:string;
}

type EndemicInfoProps = {
  endemic: string;
  image: string;
}

type SourceInfoProps = {
  source: string;
  color:string;
}

type KingdomInfoProps = {
  kingdom: string;
  chineseName:string;
}

const rankInfo:RankInfoProps[] = [
  { rank: 'kingdom', name: '界',className:'rank-1-red' },
  { rank: 'phylum', name: '門',className:'rank-2-org' },
  { rank: 'class', name: '綱',className:'rank-3-yell' },
  { rank: 'order', name: '目',className:'rank-4-green' },
  { rank: 'family', name: '科',className:'rank-5-blue' },
  { rank: 'genus', name: '屬',className:'rank-6-deepblue' },
  { rank: 'species', name: '種',className:'rank-7-purple' },
]

const endemicInfo:EndemicInfoProps[] = [
  { endemic: '昆蟲',image:'/images/statistic-icon01.svg' },
  { endemic: '魚類',image:'/images/statistic-icon02.svg' },
  { endemic: '爬蟲類',image:'/images/statistic-icon03.svg' },
  { endemic: '真菌(含地衣)',image:'/images/statistic-icon04.svg' },
  { endemic: '植物',image:'/images/statistic-icon05.svg' },
  { endemic: '鳥類',image:'/images/statistic-icon06.svg' },
  { endemic: '哺乳類',image:'/images/statistic-icon07.svg' },
  { endemic: '其他',image:'/images/statistic-icon08.svg' },
]

const sourceInfo:SourceInfoProps[] = [
  { source: '原生',color:'#FDD440' },
  { source: '歸化',color:'#85BBD0' },
  { source: '入侵',color:'#74BDB6' },
  { source: '栽培豢養',color:'#BED368' },
  { source: '無資料',color:'#FDC440' },
]

const kingdomInfo:KingdomInfoProps[] = [
  { kingdom: 'Viruses',chineseName:'病毒' },
  { kingdom: 'Bacteria',chineseName:'細菌界' },
  { kingdom: 'Archaea',chineseName:'古菌界' },
  { kingdom: 'Protozoa',chineseName:'原生生物界' },
  { kingdom: 'Chromista',chineseName:'原藻界' },
  { kingdom: 'Fungi',chineseName:'直菌界' },
  { kingdom: 'Plantae',chineseName:'植物界' },
  { kingdom: 'Animalia',chineseName:'動物界' },
]


const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: '資料統計'}
]


const Statistics: React.VFC = () => {

  const [speciesCompareTableData, setSpeciesCompareTableData] = React.useState<CompareTableDataProps[]>([]);
  const [kingdomCounts, setKingdomCounts] = React.useState<KingdomProps[]>([]);
  const [rankCounts, setRankCounts] = React.useState<RankProps[]>([]);
  const [speciesCompare, setSpeciesCompare] = React.useState<CompareType>(speciesOptions[0].value);
  const [endemicCounts, setEndemicCounts] = React.useState<EndemicProps[]>([]);
  const [sourceCounts, setSourceCounts] = React.useState<SourceProps[]>([]);
  const [speciesCompareCounts, setSpeciesCompareCounts] = React.useState<SpeciesCompareProps[]>([]);
  const [showCompareTable, setShowCompareTable] = React.useState<boolean>(false);

  const { data } = useSWR(`${process.env.NEXT_PUBLIC_TAICOL_API_URL}/web/stat/statistics`)
  //const data = {"kingdom_count": [["Plantae", 9494], ["Animalia", 37714], ["Chromista", 1561], ["Fungi", 6460], ["Protozoa", 1146]], "rank_count": [["kingdom", 5], ["phylum", 54], ["class", 167], ["order", 730], ["family", 3562], ["genus", 19951], ["species", 56816]], "endemic_count": [["\u6606\u87f2", 7100, 21881], ["\u9b5a\u985e", 114, 3306], ["\u722c\u87f2\u985e", 24, 125], ["\u771f\u83cc(\u542b\u5730\u8863)", 8, 6460], ["\u690d\u7269", 957, 9494], ["\u9ce5\u985e", 29, 384], ["\u54fa\u4e73\u985e", 23, 91], ["\u5176\u4ed6", 707, 14636]], "source_count": [["\u539f\u751f", 53604], ["\u6b78\u5316", 1250], ["\u683d\u57f9\u8c62\u990a", 1715], ["\u5165\u4fb5", 218], ["\u7121\u8cc7\u6599", 29]], "kingdom_compare": [["Plantae", 9494, null], ["Animalia", 37714, null], ["Chromista", 1561, null], ["Fungi", 6460, null], ["Protozoa", 1146, null]], "animalia_compare": [["\u74b0\u7bc0\u52d5\u7269\u9580", 164, null], ["\u7bc0\u80a2\u52d5\u7269\u9580", 27708, null], ["\u810a\u7d22\u52d5\u7269\u9580", 3984, null], ["\u523a\u80de\u52d5\u7269\u9580", 976, null], ["\u68d8\u76ae\u52d5\u7269\u9580", 268, null], ["\u8edf\u9ad4\u52d5\u7269\u9580", 4150, null], ["\u6241\u5f62\u52d5\u7269\u9580", 193, null], ["\u8f2a\u87f2\u52d5\u7269\u9580", 62, null]], "arthropoda_compare": [["\u86db\u5f62\u7db1", 1917, null], ["\u5f48\u5c3e\u7db1", 40, null], ["\u6a48\u8db3\u7db1", 0, null], ["\u500d\u8db3\u7db1", 93, null], ["\u5167\u53e3\u7db1", 82, null], ["\u6606\u87f2\u7db1", 21881, null], ["\u8edf\u7532\u7db1", 2009, null], ["\u4ecb\u5f62\u87f2\u7db1", 853, null]], "chordata_compare": [["\u689d\u9c2d\u9b5a\u7db1", 3099, null], ["\u5169\u751f\u7db1", 56, null], ["\u6d77\u9798\u7db1", 2, null], ["\u9ce5\u7db1", 384, null], ["\u8edf\u9aa8\u9b5a\u7db1", 194, null], ["\u54fa\u4e73\u7db1", 91, null], ["\u76f2\u9c3b\u7db1", 13, null], ["\u6d77\u6a3d\u7db1", 16, null]], "plantae_compare": [["\u85fb\u985e\u690d\u7269", 880, null], ["\u82d4\u861a\u690d\u7269", 1530, null], ["\u8568\u985e\u690d\u7269", 779, null], ["\u88f8\u5b50\u690d\u7269", 118, null], ["\u986f\u82b1\u690d\u7269", 6187, null]], "compare_table": [["\u75c5\u6bd2\u754c", "10,434", "0", "\u5f90\u4e9e\u8389\u3001\u8449\u932b\u6771\u3001\u5433\u548c\u751f\u3001\u9ec3\u5143\u54c1\u3001\u8d99\u78d0\u83ef\u3001\u6d82\u5805"], ["\u7d30\u83cc\u754c", "9,980", "0", "\u8881\u570b\u82b3\u3001\u694a\u79cb\u5fe0"], ["\u53e4\u83cc\u754c", "377", "0", "\u8cf4\u7f8e\u6d25"], ["\u539f\u751f\u751f\u7269\u754c", "2,614", "1,146", "\u5289\u9326\u60e0\u3001\u738b\u5efa\u5e73"], ["\u539f\u85fb\u754c", "62,311", "1,561", "\u9ec3\u6dd1\u82b3\u3001\u5433\u4fca\u5b97\u3001\u8b1d\u7165\u5112"], ["\u771f\u83cc\u754c", "146,154", "6,460", "\u8cf4\u660e\u6d32\u3001\u8b1d\u6587\u745e\u3001\u9673\u91d1\u4eae\u3001\u8b1d\u7165\u5112\u3001\u66fe\u986f\u96c4\u3001\u5433\u8072\u83ef\u3001\u9ec3\u4fde\u83f1\u7b49"], ["\u690d\u7269\u754c>\u85fb\u985e\u690d\u7269", "20,066", "880", "\u738b\u5efa\u5e73\u3001\u6797\u7d89\u7f8e\u3001\u9ec3\u6dd1\u82b3"], ["\u690d\u7269\u754c>\u82d4\u861a\u690d\u7269", "21,018", "1,530", "\u8523\u93ae\u5b87"], ["\u690d\u7269\u754c>\u8568\u985e\u690d\u7269", "13,661", "779", "\u90ed\u57ce\u5b5f\u3001TPG"], ["\u690d\u7269\u754c>\u88f8\u5b50\u690d\u7269", "1,420", "118", "\u5f6d\u93e1\u6bc5"], ["\u690d\u7269\u754c>\u986f\u82b1\u690d\u7269", "339,411", "6,187", "\u5f6d\u93e1\u6bc5\u3001\u8b1d\u9577\u5bcc\u3001\u937e\u570b\u82b3\u3001\u6797\u653f\u9053"], ["\u52d5\u7269\u754c>\u6d77\u7dbf\u52d5\u7269\u9580", "9,540", "50", "\u5b8b\u514b\u7fa9"], ["\u52d5\u7269\u754c>\u523a\u80de\u52d5\u7269\u9580", "14,791", "976", "\u6234\u660c\u9cf3\u3001\u7f85\u6587\u589e\u3001\u912d\u6709\u5bb9\u3001\u5ed6\u904b\u5fd7"], ["\u52d5\u7269\u754c>\u6241\u5f62\u52d5\u7269\u9580", "21,447", "193", "\u65bd\u79c0\u60e0\u3001\u9673\u5ba3\u6c76"], ["\u52d5\u7269\u754c>\u5713\u5f62\u52d5\u7269\u9580", "13,129", "7", "\u65bd\u79c0\u60e0"], ["\u52d5\u7269\u754c>\u7dda\u5f62\u52d5\u7269\u9580", "356", "2", "\u90b1\u540d\u937e"], ["\u52d5\u7269\u754c>\u9264\u982d\u52d5\u7269\u9580", "1,330", "23", "\u9673\u5ba3\u6c76"], ["\u52d5\u7269\u754c>\u8f2a\u87f2\u52d5\u7269\u9580", "2,014", "62", "\u5f35\u6587\u70b3"], ["\u52d5\u7269\u754c>\u7bc0\u80a2\u52d5\u7269\u9580>\u4ecb\u5f62\u87f2\u7db1", "11,079", "853", "\u80e1\u5fe0\u6046\u3001\u9676\u932b\u73cd"], ["\u52d5\u7269\u754c>\u7bc0\u80a2\u52d5\u7269\u9580>\u6d77\u8718\u86db\u7db1", "1,366", "7", "\u5b6b\u980c\u582f"], ["\u52d5\u7269\u754c>\u7bc0\u80a2\u52d5\u7269\u9580>\u8edf\u7532\u7db1", "36,162", "2,009", "\u4f55\u5e73\u5408\u3001\u9673\u5929\u4efb\u3001\u65bd\u7fd2\u5fb7\u3001\u77f3\u9577\u6cf0\u3001\u7f85\u6587\u589e"], ["\u52d5\u7269\u754c>\u7bc0\u80a2\u52d5\u7269\u9580>\u6a48\u8db3\u7db1", "14,674", "0", "\u77f3\u9577\u6cf0\u3001\u6797\u6e05\u9f8d\u3001\u738b\u5efa\u5e73\u3001\u5ed6\u904b\u5fd7\u3001\u912d\u6709\u5bb9"], ["\u52d5\u7269\u754c>\u7bc0\u80a2\u52d5\u7269\u9580>\u9798\u7532\u7db1", "N/A", "0", "\u9673\u570b\u52e4\u3001\u5433\u6587\u54f2"], ["\u52d5\u7269\u754c>\u7bc0\u80a2\u52d5\u7269\u9580>\u86db\u5f62\u7db1", "89,189", "1,917", "\u9ec3\u5764\u7152\u3001\u5ed6\u6cbb\u69ae\u3001\u6731\u8000\u6c82\u3001\u7f85\u82f1\u5143"], ["\u52d5\u7269\u754c>\u7bc0\u80a2\u52d5\u7269\u9580>\u500d\u8db3\u7db1", "13,232", "93", "\u5f35\u5b78\u6587\u3001Zolt\u00e1n Kors\u00f3s"], ["\u52d5\u7269\u754c>\u7bc0\u80a2\u52d5\u7269\u9580>\u5507\u8db3\u7db1", "3,145", "73", "\u8d99\u745e\u9686"], ["\u52d5\u7269\u754c>\u7bc0\u80a2\u52d5\u7269\u9580>\u5167\u53e3\u7db1", "759", "82", "\u5433\u6587\u54f2"], ["\u52d5\u7269\u754c>\u7bc0\u80a2\u52d5\u7269\u9580>\u5f48\u5c3e\u7db1", "8,767", "40", "\u9f4a\u5fc3\u3001\u5f35\u667a\u6db5\u3001\u912d\u6b23\u5982"], ["\u52d5\u7269\u754c>\u7bc0\u80a2\u52d5\u7269\u9580>\u6606\u87f2\u7db1", "952,776", "21,881", "\u5433\u6587\u54f2\u3001\u694a\u6b63\u6fa4\u3001\u5468\u6a11\u93b0\u3001\u856d\u65ed\u5cf0\u3001\u984f\u8056\u7d18\u3001\u674e\u5947\u5cf0\u3001\u5468\u6587\u4e00\u3001\u674e\u6625\u9716\u3001\u694a\u66fc\u5999\u3001\u8521\u660e\u8aed\u3001\u5f90\u5809\u5cf0\u3001\u5433\u58eb\u7def\u3001\u6797\u5b97\u5c90\u3001\u912d\u660e\u502b\u3001\u5f90\u6b77\u9d6c\u3001\u8521\u7d93\u752b\u7b49"], ["\u52d5\u7269\u754c>\u7bc0\u80a2\u52d5\u7269\u9580>\u9c13\u8db3\u7db1", "1,421", "25", "\u9ec3\u7965\u9e9f\u3001\u5468\u84ee\u9999"], ["\u52d5\u7269\u754c>\u7bc0\u80a2\u52d5\u7269\u9580>\u80a2\u53e3\u7db1", "5", "1", "\u8b1d\u8559\u84ee"], ["\u52d5\u7269\u754c>\u7d10\u5f62\u52d5\u7269\u9580", "1,353", "4", "\u8cf4\u4ea6\u5fb7"], ["\u52d5\u7269\u754c>\u74b0\u7bc0\u52d5\u7269\u9580", "17,071", "164", "\u5f35\u667a\u6db5\u3001\u9673\u4fca\u5b8f\u3001\u8b1d\u8559\u84ee"], ["\u52d5\u7269\u754c>\u661f\u87f2\u52d5\u7269\u9580", "206", "26", "\u859b\u6500\u6587"], ["\u52d5\u7269\u754c>\u8edf\u9ad4\u52d5\u7269\u9580", "119,766", "4,150", "\u76e7\u91cd\u6210\u3001\u5deb\u6587\u9686\u3001\u8cf4\u666f\u967d\u3001\u674e\u5f65\u931a"], ["\u52d5\u7269\u754c>\u8155\u8db3\u52d5\u7269\u9580", "435", "1", ""], ["\u52d5\u7269\u754c>\u7de9\u6b65\u52d5\u7269\u9580", "1,018", "23", "\u674e\u66c9\u6668"], ["\u52d5\u7269\u754c>\u82d4\u861a\u52d5\u7269\u9580", "20,573", "51", "Dennis P. Gordon"], ["\u52d5\u7269\u754c>\u6bdb\u984e\u52d5\u7269\u9580", "132", "21", "\u7f85\u6587\u589e"], ["\u52d5\u7269\u754c>\u68d8\u76ae\u52d5\u7269\u9580", "11,554", "268", "\u8d99\u4e16\u6c11\u3001\u674e\u5764\u7444"], ["\u52d5\u7269\u754c>\u810a\u7d22\u52d5\u7269\u9580>\u72f9\u5fc3\u7db1", "30", "0", "\u6797\u79c0\u747e"], ["\u52d5\u7269\u754c>\u810a\u7d22\u52d5\u7269\u9580>\u6d77\u6a3d\u7db1", "78", "16", "\u7f85\u6587\u589e"], ["\u52d5\u7269\u754c>\u810a\u7d22\u52d5\u7269\u9580>\u6d77\u9798\u7db1", "2,966", "2", ""], ["\u52d5\u7269\u754c>\u810a\u7d22\u52d5\u7269\u9580>\u76f2\u9c3b\u7db1", "82", "13", "\u83ab\u986f\u854e\u3001\u90b5\u5ee3\u662d"], ["\u52d5\u7269\u754c>\u810a\u7d22\u52d5\u7269\u9580>\u8edf\u9aa8\u9b5a\u7db1", "1,282", "194", "\u838a\u5b88\u6b63\u3001\u674e\u67cf\u5cf0\u3001\u90b5\u5ee3\u662d"], ["\u52d5\u7269\u754c>\u810a\u7d22\u52d5\u7269\u9580>\u689d\u9c2d\u9b5a\u7db1", "32,513", "3,099", "\u90b5\u5ee3\u662d\u3001\u9673\u6b63\u5e73\u3001\u9673\u7fa9\u96c4\u3001\u9673\u9e97\u6dd1\u3001\u4f55\u5ba3\u6176\u3001\u5433\u9ad8\u9038\u3001\u9ec3\u4e16\u5f6c\u7b49"], ["\u52d5\u7269\u754c>\u810a\u7d22\u52d5\u7269\u9580>\u722c\u87f2\u7db1", "N/A", "125", "\u5442\u5149\u6d0b\u3001\u9673\u6dfb\u559c\u3001\u674e\u57f9\u82ac"], ["\u52d5\u7269\u754c>\u810a\u7d22\u52d5\u7269\u9580>\u5169\u751f\u7db1", "8,054", "56", "\u5433\u8072\u6d77\u3001\u694a\u61ff\u5982"], ["\u52d5\u7269\u754c>\u810a\u7d22\u52d5\u7269\u9580>\u9ce5\u7db1", "10,599", "384", "\u5289\u5c0f\u5982\u3001\u4e01\u5b97\u8607"], ["\u52d5\u7269\u754c>\u810a\u7d22\u52d5\u7269\u9580>\u54fa\u4e73\u7db1", "6,025", "91", "\u5468\u84ee\u9999\u3001\u674e\u73b2\u73b2\u3001\u738b\u660e\u667a\u3001\u912d\u932b\u5947"], ["\u5408\u8a08", ">2,050,000", "60214", null]]}

  const formatRankCountData = (props: (string | number)[][]):void => {
      const rankData:RankProps[] = props.map((item: (string | number)[]):RankProps => {
        const chineseName = rankInfo.find((r) => r.rank === item[0])?.name || ''
        const className = rankInfo.find((r) => r.rank === item[0])?.className || ''
        const englishName = item[0] as string
        const count = item[1] as number

        return {
          zhTWTitle: chineseName,
          enTitle: englishName,
          count: count,
          className:className
        }
      })

      setRankCounts(rankData)
  }
  const formatEndemicCountData = (props: (string | number)[][]): void => {
      const endemicData:EndemicProps[] = props.map((item: (string | number)[]):EndemicProps => {
        const image = endemicInfo.find((r) => r.endemic === item[0])?.image || ''
        const name = item[0] as string
        const count = item[1] as number
        const total = item[2] as number

        return {
          name: name,
          image: image,
          count: count,
          ratio: ( (count/total)*100).toFixed(2)
        }
      })

      setEndemicCounts(endemicData)
  }
  const formatSpeciesCompareCountData = (props: (string | number| null)[][]): void => {
      const speciesCompareData:SpeciesCompareProps[] = props.map((item: (string | number| null)[]):SpeciesCompareProps => {
        const name = item[0] as string
        const TaiwanCount = item[1] as number
        const GlobalCount = item[2] as number

        return {
          name: name,
          TaiwanCount: TaiwanCount,
          GlobalCount: GlobalCount,
        }
      })

      setSpeciesCompareCounts(speciesCompareData)
  }
  const formatKingdomCountData = (props: (string | number)[][]): void => {
    const kingdomData: KingdomProps[] = kingdomInfo.map((item: KingdomInfoProps): KingdomProps => {
        const kingdom = props.find((r) => item.kingdom == r[0])

        const name = kingdom ? kingdom[0] as string : ''
        const count = kingdom ? kingdom[1] as number : 0
        const chineseName = kingdom ? kingdomInfo.find((r) => r.kingdom == name)?.chineseName || '' : ''
        return {
          name: [chineseName, name],
          count: count,
        }
    });

      setKingdomCounts(kingdomData)
  }
  const formatSourceCountData = (props: (string | number)[][]): void => {
      const sourceData:SourceProps[] = props.map((item: (string | number)[]):SourceProps => {
        const color = sourceInfo.find((r) => r.source === item[0])?.color || '#000'
        const name = item[0] as string
        const count = item[1] as number

        return {
          name: name,
          color: color,
          count: count,
        }
      })

      setSourceCounts(sourceData)
  }
  const formatSpeciesCompareTableData = (props: (string | null)[][]): void => {
    const compareTableData: CompareTableDataProps[] = props.map((item: (string | null | number)[]): CompareTableDataProps => {
        const name = item[0] as string

        const names =name.split('>')
        const kingdomName = names?.[0] || ''
        const phylumName = names?.[1] || ''
        const className = names?.[2] || ''
        const globalCount = item[1] as number
        const taiwanCount = item[2] as number
        const twProvider = item[3] as string

        return {
          kingdomName: kingdomName,
          phylumName: phylumName,
          className: className,
          globalCount: globalCount,
          taiwanCount: taiwanCount,
          twProvider: twProvider,
        }
      })

      setSpeciesCompareTableData(compareTableData)
  }

  const handleCompareTypeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const compareType = e.target.value as CompareType
    setSpeciesCompare(compareType)
  }

  const handleShowCompareTableClick = (status:boolean): void => {
    setShowCompareTable(status)
  }

  useEffect(() => {
    if (data) {
      formatRankCountData(data.rank_count)
      formatEndemicCountData(data.endemic_count)
      formatSourceCountData(data.source_count)
      formatSpeciesCompareCountData(data[speciesCompare])
      formatKingdomCountData(data.kingdom_count)
      formatSpeciesCompareTableData(data.compare_table)
    }
  }, [data,speciesCompare])

  return (<>
    <div className="page-top">
      <Banner title='STATISTICS' zhTWTitle='資料統計' breadcrumbs={breadcrumbs} picType={'crap'} />
      <div className="statis-3-cont">
        <TaxonCountSection/>
        <div className="chart-box">
          <div className="main-box">
            <div className="boxarea-2-1">
                <SpeciesCountStatisics data={kingdomCounts} />
                <RankCountStatisics data={rankCounts} />
            </div>
            <SpeciesAndEndemicRatiosStatisics data={endemicCounts} />

            <div className="boxarea-2-1">
              <SourceDoughnutChart data={sourceCounts} />
              <TaiwanSpeciesAndEndemicCompareGlobalStatisics
                data={speciesCompareCounts}
                handleCompareTypeChange={handleCompareTypeChange}
                handleShowCompareTableClick={handleShowCompareTableClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <PopupTable show={showCompareTable} handleShowCompareTableClick={handleShowCompareTableClick} data={speciesCompareTableData} />
  </>)
};

export default Statistics;
