import * as React from 'react';
import Banner from '../common/Banner'
import RankCountStatisics from './RankCountStatisics'
import SpeciesCountStatisics from './SpeciesCountStatisics'
import useSWR from 'swr';
import { useEffect } from 'react';
import type { RedlistProps, IUCNProps, HabitatProps, RankProps, SourceProps, EndemicProps, SpeciesCompareProps,KingdomProps,CompareTableDataProps,RankInfoProps,EndemicInfoProps,SourceInfoProps,KingdomInfoProps, ProtectedProps, CITESProps } from '../types'
import { CompareType } from './options'
import SpeciesAndEndemicRatiosStatisics from './SpeciesAndEndemicRatiosStatisics'
import SourceDoughnutChart from './SourceDoughnutChart'
import TaiwanSpeciesAndEndemicCompareGlobalStatisics from './TaiwanSpeciesAndEndemicCompareGlobalStatisics'
import TaxonCountSection from './TaxonCountSection'
import { speciesOptions } from './options'
import PopupTable from './PopupTable'
import { fetcher } from '../utils/helper'
import { Translation } from 'react-i18next';
import HabitatCountStatisics from './HabitatCountStatisics';
import ProtectedCountStatisics from './ProtectedCountStatisics';
import RedlistDoughnutChart from './RedlistDoughnutChart';
import IUCNDoughnutChart from './IUCNDoughnutChart';
import CITESCountStatisics from './CITESCountStatisics';


const rankInfo:RankInfoProps[] = [
  { rank: 'kingdom', name: '界',className:'rank-1-red' },
  { rank: 'phylum', name: '門',className:'rank-2-org' },
  { rank: 'class', name: '綱',className:'rank-3-yell' },
  { rank: 'order', name: '目',className:'rank-4-green' },
  { rank: 'family', name: '科',className:'rank-5-blue' },
  { rank: 'genus', name: '屬',className:'rank-6-deepblue' },
  { rank: 'species', name: '種',className:'rank-7-purple' },
  { rank: 'infraspecies', name: '種',className:'rank-second-gray' },
]

const endemicInfo:EndemicInfoProps[] = [
  { endemic: '昆蟲',image:'/static/image/statistic-icon01.svg' },
  { endemic: '魚類',image:'/static/image/statistic-icon02.svg' },
  { endemic: '爬蟲類',image:'/static/image/statistic-icon03.svg' },
  { endemic: '真菌',image:'/static/image/statistic-icon04.svg' },
  { endemic: '植物',image:'/static/image/statistic-icon05.svg' },
  { endemic: '鳥類',image:'/static/image/statistic-icon06.svg' },
  { endemic: '哺乳類',image:'/static/image/statistic-icon07.svg' },
  { endemic: '其他',image:'/static/image/statistic-icon08.svg' },
]

const sourceInfo:SourceInfoProps[] = [
  { source: '原生',color:'#FDD440' },
  { source: '歸化',color:'#85BBD0' },
  { source: '入侵',color:'#74BDB6' },
  { source: '栽培豢養',color:'#BED368' },
  { source: '無資料',color:'#eeeeee' },
]

// const sourceInfo:SourceInfoProps[] = [
//   { source: '原生',color:'#FDD440' },
//   { source: '歸化',color:'#85BBD0' },
//   { source: '入侵',color:'#74BDB6' },
//   { source: '栽培豢養',color:'#BED368' },
//   { source: '無資料',color:'#eeeeee' },
// ]

// const sourceInfo:SourceInfoProps[] = [
//   { source: '原生',color:'#FDD440' },
//   { source: '歸化',color:'#85BBD0' },
//   { source: '入侵',color:'#74BDB6' },
//   { source: '栽培豢養',color:'#BED368' },
//   { source: '無資料',color:'#eeeeee' },
// ]

const kingdomInfo:KingdomInfoProps[] = [
  { kingdom: 'Viruses',chineseName:'病毒' },
  { kingdom: 'Bacteria',chineseName:'細菌界' },
  { kingdom: 'Archaea',chineseName:'古菌界' },
  { kingdom: 'Protozoa',chineseName:'原生生物界' },
  { kingdom: 'Chromista',chineseName:'原藻界' },
  { kingdom: 'Fungi',chineseName:'真菌界' },
  { kingdom: 'Plantae',chineseName:'植物界' },
  { kingdom: 'Animalia',chineseName:'動物界' },
]

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: '資料統計'}
]

const StatisticsPage: React.FC = () => {

  const [speciesCompareTableData, setSpeciesCompareTableData] = React.useState<CompareTableDataProps[]>([]);
  const [kingdomCounts, setKingdomCounts] = React.useState<KingdomProps[]>([]);
  const [citesCounts, setCITESCounts] = React.useState<CITESProps[]>([]);
  const [rankCounts, setRankCounts] = React.useState<RankProps[]>([]);
  const [habitatCounts, setHabitatCounts] = React.useState<HabitatProps[]>([]);
  const [protectedCounts, setProtectedCounts] = React.useState<ProtectedProps[]>([]);
  const [speciesCompare, setSpeciesCompare] = React.useState<string>(speciesOptions[0].value);
  const [endemicCounts, setEndemicCounts] = React.useState<EndemicProps[]>([]);
  const [sourceCounts, setSourceCounts] = React.useState<SourceProps[]>([]);
  const [iucnCounts, setIUCNCounts] = React.useState<IUCNProps[]>([]);
  const [redlistCounts, setRedlistCounts] = React.useState<RedlistProps[]>([]);
  const [speciesCompareCounts, setSpeciesCompareCounts] = React.useState<SpeciesCompareProps[]>([]);
  const [showCompareTable, setShowCompareTable] = React.useState<boolean>(false);
  const [globalUpdated, setGlobalUpdated] = React.useState<string>('');

  const { data } = useSWR(`${process.env.TAICOL_API_URL}/web/stat/statistics`,fetcher)

  const formatProtectedCountData = (props: []):void => {
      const protectedData:ProtectedProps[] = props.map((item):ProtectedProps => {
        const englishName = item['category'] as string
        const count = item['count'] as number

        return {
          zhTWTitle: englishName,
          count: count,
          className: '',
          circleTitle: englishName,
        }
      })

      setProtectedCounts(protectedData)
  }

  const formatHabitatCountData = (props: []):void => {
      const habitatData:HabitatProps[] = props.map((item):HabitatProps => {
        const englishName = item['category'] as string
        const count = item['count'] as number

        return {
          zhTWTitle: englishName,
          enTitle: englishName,
          count: count,
          className: ''
        }
      })

      setHabitatCounts(habitatData)
  }

  const formatCITESCountData = (props: []):void => {
      const citesData:CITESProps[] = props.map((item):CITESProps => {
        const englishName = item['category'] as string
        const count = item['count'] as number

        return {
          zhTWTitle: englishName,
          circleTitle: englishName,
          count: count,
          className: ''
        }
      })

      setCITESCounts(citesData)
  }

  const formatRankCountData = (props: []):void => {

      const rankData:RankProps[] = props.map((item):RankProps => {
        const chineseName = rankInfo.find((r) => r.rank === item['category'])?.name || ''
        const className = rankInfo.find((r) => r.rank === item['category'])?.className || ''
        const englishName = item['category'] as string
        const count = item['count'] as number

        return {
          zhTWTitle: chineseName,
          enTitle: englishName,
          count: count,
          className:className
        }
      })

      setRankCounts(rankData)
  }
    
  const formatEndemicCountData = (props: []): void => {
      const endemicData:EndemicProps[] = props.map((item):EndemicProps => {
        const image = endemicInfo.find((r) => r.endemic === item['category'])?.image || ''
        const name = item['category'] as string
        const count = item['count'] as number
        const total = item['total_count'] as number
        return {
          name: name,
          image: image,
          count: count,
          total: total,
          ratio: ( (count/total)*100).toFixed(2)
        }
      })

      setEndemicCounts(endemicData)
  }
  const formatSpeciesCompareCountData = (props:[],speciesCompare:string): void => {
    let speciesCompareData: SpeciesCompareProps[] = [];
    if (speciesCompare == 'kingdom_compare') {
      speciesCompareData = kingdomInfo.map((item: KingdomInfoProps): SpeciesCompareProps => {
        
        const kingdom = props.find((r) => item.kingdom == r['category'])


        const zhTWName = kingdom ? item.chineseName as string : ''
        const TaiwanCount = kingdom ? kingdom['count'] as number : 0
        const GlobalCount = kingdom ? kingdom['total_count'] as number : 0

        return {
          name: zhTWName,
          TaiwanCount: TaiwanCount,
          GlobalCount: GlobalCount,
        }
      });
    }
    else {
      speciesCompareData = props.map((item): SpeciesCompareProps => {
        const name = item['category'] as string
        const TaiwanCount = item['count'] as number
        const GlobalCount = item['total_count'] as number

        return {
          name: name,
          TaiwanCount: TaiwanCount,
          GlobalCount: GlobalCount,
        }
      })
    }
    setSpeciesCompareCounts(speciesCompareData)
  }
  const formatKingdomCountData = (props:[]): void => {
    const kingdomData: KingdomProps[] = kingdomInfo.map((item: KingdomInfoProps): KingdomProps => {
        const kingdom = props.find((r) => item.kingdom == r['category'])

        const name = kingdom ? kingdom['category'] as string : ''
        const count = kingdom ? kingdom['count'] as number : 0
        const chineseName = kingdom ? kingdomInfo.find((r) => r.kingdom == name)?.chineseName || '' : ''
        return {
          name: chineseName,
          count: count,
        }
    });

      setKingdomCounts(kingdomData)
  }
  const formatSourceCountData = (props:[]): void => {
      const sourceData:SourceProps[] = props.map((item):SourceProps => {
        const color = sourceInfo.find((r) => r.source === item['category'])?.color || '#000'
        const name = item['category'] as string
        const count = item['count'] as number

        return {
          name: name,
          color: color,
          count: count,
        }
      })
      setSourceCounts(sourceData)
  }

  const formatIUCNCountData = (props:[]): void => {
      const iucnData:IUCNProps[] = props.map((item):IUCNProps => {
        // const color = sourceInfo.find((r) => r.source === item['category'])?.color || '#000'
        const name = item['category'] as string
        const count = item['count'] as number

        return {
          name: name,
          // color: color,
          count: count,
        }
      })
      setIUCNCounts(iucnData)
  }

  const formatRedlistCountData = (props:[]): void => {
      const redlistData:RedlistProps[] = props.map((item):RedlistProps => {
        const color = sourceInfo.find((r) => r.source === item['category'])?.color || '#000'
        const name = item['category'] as string
        const count = item['count'] as number

        return {
          name: name,
          color: color,
          count: count,
        }
      })
      setRedlistCounts(redlistData)
  }


  const handleCompareTypeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const compareType = e.target.value as CompareType
    setSpeciesCompare(compareType)
  }

  const handleShowCompareTableClick = (status:boolean): void => {
    setShowCompareTable(status)
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


  useEffect(() => {
    if (data) {
      console.log(data);
      formatIUCNCountData(data.iucn_count)
      formatRedlistCountData(data.redlist_count)
      formatProtectedCountData(data.protected_count)
      formatCITESCountData(data.cites_count)
      formatHabitatCountData(data.habitat_count)
      formatRankCountData(data.rank_count)
      formatEndemicCountData(data.endemic_count)
      formatSourceCountData(data.source_count)
      formatSpeciesCompareCountData(data[speciesCompare],speciesCompare)
      formatKingdomCountData(data.kingdom_count)
      formatSpeciesCompareTableData(data.compare_table)
      setGlobalUpdated(data.global_updated)
    }
  }, [data, speciesCompare])


  return (<>
    <div className="page-top">
      <Translation>{ t =>
        <Banner title={t('STATISTICS')} zhTWTitle={t('資料統計')} picType={'crap'}  breadcrumbs={breadcrumbs}/>
      }</Translation>
        <TaxonCountSection />
        <div className="chart-box">
          <div className="main-box">
            <div className="boxarea-2-1">
                <SpeciesCountStatisics data={kingdomCounts} />
                <RankCountStatisics data={rankCounts} />
            </div>
            <SpeciesAndEndemicRatiosStatisics data={endemicCounts} />
            <div className="boxarea-2-1">
              <SourceDoughnutChart data={sourceCounts} />
              <HabitatCountStatisics data={habitatCounts} />
              <ProtectedCountStatisics data={protectedCounts} />
            </div>
            <div className="boxarea-2-1">
              <RedlistDoughnutChart data={redlistCounts} />
              <IUCNDoughnutChart data={iucnCounts} />
              <CITESCountStatisics data={citesCounts} />
            </div>
            <TaiwanSpeciesAndEndemicCompareGlobalStatisics
              data={speciesCompareCounts}
              compareType={speciesCompare}
              handleCompareTypeChange={handleCompareTypeChange}
              handleShowCompareTableClick={handleShowCompareTableClick}
              kingdomInfo={kingdomInfo}
              globalUpdated={globalUpdated}
            />
          </div>
        </div>
    </div>
    <PopupTable 
      show={showCompareTable} 
      handleShowCompareTableClick={handleShowCompareTableClick} 
      data={speciesCompareTableData} 
      globalUpdated={globalUpdated}
      />
  </>)
};

export default StatisticsPage;
