import * as React from 'react';
import type { EndemicProps } from '../types';
import SpeciesAndEndemicRatios from './SpeciesAndEndemicRatios';

type Props = {
  data: EndemicProps[]
}

const SpeciesAndEndemicRatiosStatisics: React.FC<Props> = (props) => {
  const { data } = props

  return (
    <div className="boxarea-1 vivi">
      <div className="title-flex">
        <div className="mark-title">
          <img src="/static/image/title-mark.svg"/>
          <p>臺灣各類生物種數與特有比例</p>
        </div>
        <div className="color-inf">
          <div className="blue-sq"></div>
          <p>特有種</p>
        </div>
      </div>
      <ul className="special-specise">
        {data.map((item:EndemicProps, index:number) => {
          return (
            <SpeciesAndEndemicRatios key={`species-and-endemic-ratios-${index}`} {...item} />
          )
        })}
      </ul>
    </div>
  )
};

export default SpeciesAndEndemicRatiosStatisics;
