import React from 'react';
import { KingdomProps } from 'src/types/frontend';
import SpeciesCountBarChart from './SpeciesCountBarChart';

type Props = {
  data:KingdomProps[]
}
const SpeciesCountStatisics: React.VFC<Props> = (props) => {
  const { data } = props;

  return (
    <div className="item-p2">
      <div className="mark-title">
        <img src="/images/title-mark.svg"/>
        <p>各界物種數統計</p>
      </div>
      <div className="for-canvas">
        <SpeciesCountBarChart data={data}/>
      </div>
    </div>
  )
};

export default SpeciesCountStatisics;
