import * as React from 'react';
import TaxonCount from './TaxonCount'
import type {TaxonCountProps} from '../types'
import useSWR from 'swr';

const taxonCountList:TaxonCountProps[] = [
  {
    img: '/static/image/ssicon01.svg',
    title: '收錄物種數',
    enTitle:<>SPECIES AND <br/>INFRASPECIES</>,
    count: 0,
    type: 'taxon',
    CircleClassName: 'cir-line1',
    tooltip: '包含種下分類群',

  },
  {
    img: '/static/image/ssicon02.svg',
    title: '收錄學名數',
    enTitle:'SCIENTIFIC NAMES',
    count: 0,
    type:'name',
    CircleClassName: 'cir-line2',
    tooltip: '包含種上階層學名',
  },
  {
    img: '/static/image/ssicon03.svg',
    title: '收錄文獻數',
    enTitle:'REFERENCES',
    count: 0,
    type:'reference',
    CircleClassName: 'cir-line1',
  }
]


const TaxonCountSection: React.FC = () => {
  const [data, setData] = React.useState<Array<[string,number]>>([])
  React.useEffect(() => {
    fetch(`${process.env.TAICOL_API_URL}/web/stat/index`)
      .then(res => res.json())
      .then(data => {
        setData(data)
      })
  }, [])

  return (
    <div className="statis-3-cont">
      <div className='main-box'>
        <ul className="statis-3">
          {taxonCountList?.map((taxonCount: TaxonCountProps, index: number) => {
            const count = data && data?.find((item:[string, number]) => item[0] === taxonCount.type)?.[1] || 0
            taxonCount.count = count
            return <TaxonCount {...taxonCount} key={`taxon-count-${index}`} />
          })}
        </ul>
      </div>
    </div>
  )
}

export default TaxonCountSection
