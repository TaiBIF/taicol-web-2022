import * as React from 'react';
import TaxonCount from './TaxonCount'
import type {TaxonCountProps} from '../types'
import MoreButton from '../common/MoreButton'
import useSWR from 'swr';
import { Translation, useTranslation } from 'react-i18next';

const taxonCountList:TaxonCountProps[] = [
  {
    img: '/static/image/ssicon01.svg',
    title: '收錄物種數',
    enTitle:<Translation>{t => <>{t('SPECIES AND')}<br/>{t('INFRASPECIES')}</>}</Translation>,
    count: 0,
    type: 'taxon',
    CircleClassName: 'cir-line1',
    tooltip: <Translation>{t => <>{t('排除有種下分類群的種階層')}</>}</Translation>,
  },
  {
    img: '/static/image/ssicon02.svg',
    title: '收錄學名數',
    enTitle:<Translation>{t => <>{t('SCIENTIFIC NAMES')}</>}</Translation>,
    count: 0,
    type:'name',
    CircleClassName: 'cir-line2',
    tooltip: <Translation>{t => <>{t('包含種上階層學名')}</>}</Translation>,
  },
  {
    img: '/static/image/ssicon03.svg',
    title: '收錄文獻數',
    enTitle:<Translation>{t => <>{t('REFERENCES')}</>}</Translation>,
    count: 0,
    type:'reference',
    CircleClassName: 'cir-line1',
  }
]

type style = {
  [key: string]: string 
}

const marqueeStyle:style = {
  "--tw": "50ch",
  "--ad": "30s"
}

const marqueeLongStyle:style = {
  "--tw": "50ch",
  "--ad": "30s"
}

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
    <section className="section-2-statistics" >
			<div className="maq-area">
				<div className="marquee" style={marqueeStyle}>
          <span>STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS
          </span>
				</div>

				<div className="marquee marquee--long"  style={marqueeLongStyle}>
          <span>STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS
          </span>
				</div>
			</div>
			<div className="flex-box">
				<div className="left-box">
					<div className="picbox">
						<img src="/static/image/index-sechtion-2-island.png"/>
						<div className="cbig-hand">
							<img src="/static/image/cancer01.png"/>
						</div>
						<div className="cbig-hand2">
							<img src="/static/image/cancer02.png"/>
						</div>
					</div>

				</div>
				<div className="right-box">
					<div className="rel">
						<div className="w-box">
							<ul className="statis-3">
                {taxonCountList?.map((taxonCount: TaxonCountProps, index: number) => {
                  const count = data && data?.find((item:[string, number]) => item[0] === taxonCount.type)?.[1] || 0
                  taxonCount.count = count
                  return <TaxonCount {...taxonCount} key={`taxon-count-${index}`} />
                })}
              </ul>
              <MoreButton label={'more statistics'} href='/statistics' />
						</div>
					</div>
				</div>
			</div>
		</section>
  )
}

export default TaxonCountSection
