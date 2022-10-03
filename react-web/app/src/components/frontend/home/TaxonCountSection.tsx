import React from 'react';
import TaxonCount from './TaxonCount'
import type {TaxonCountProps} from 'src/types/frontend'
import MoreButton from 'src/components/frontend/common/MoreButton'
import useSWR from 'swr';

const taxonCountList:TaxonCountProps[] = [
  {
    img: '/images/cancer01.png',
    title: '收錄物種數',
    enTitle:<>SPECIES AND <br/>INFRASPECIES</>,
    count: 0,
    type: 'taxon',
    CircleClassName: 'cir-line1',
    tooltip: '包含種下分類群',

  },
  {
    img: '/images/ssicon02.svg',
    title: '收錄學名數',
    enTitle:'SCIENTIFIC NAMES',
    count: 0,
    type:'name',
    CircleClassName: 'cir-line2',
    tooltip: '包含種上階層學名',
  },
  {
    img: '/images/ssicon03.svg',
    title: '收錄文獻數',
    enTitle:'REFERENCES',
    count: 0,
    type:'reference',
    CircleClassName: 'cir-line1',
  }
]
const TaxonCountSection: React.VFC = () => {
  //const { data } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/web/stat/index`)

  const data:Array<[string, number]> = [["reference", 243], ["taxon", 60214], ["name", 86950]]

  return (
    <section className="section-2-statistics" >
			<div className="maq-area">
				<div className="marquee" >
          <span>STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS
          </span>
				</div>

				<div className="marquee marquee--long" >
          <span>STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS STATISTICS
          </span>
				</div>
			</div>
			<div className="flex-box">
				<div className="left-box">
					<div className="picbox">
						<img src="/images/index-sechtion-2-island.png"/>
						<div className="cbig-hand">
							<img src="/images/cancer01.png"/>
						</div>
						<div className="cbig-hand2">
							<img src="/images/cancer02.png"/>
						</div>
					</div>

				</div>
				<div className="right-box">
					<div className="rel">
						<div className="w-box">
							<ul className="statis-3">
                {taxonCountList?.map((taxonCount: TaxonCountProps, index: number) => {
                  const count = data && data?.find((item) => item[0] === taxonCount.type)?.[1] || 0
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
