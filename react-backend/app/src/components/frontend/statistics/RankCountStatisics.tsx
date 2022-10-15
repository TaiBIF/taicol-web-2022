import React from 'react';
import {RankProps} from 'src/types/frontend'
import RankCount from 'src/components/frontend/statistics/RankCount'

type Props = {
  data:RankProps[]
}
const RankCountStatisics: React.VFC<Props> = (props) => {
  const {data} = props

  return (
    <div className="item-p1">
      <div className="mark-title">
        <img src="/images/title-mark.svg"/>
        <p>各階層數量統計</p>
      </div>
      <ul className="stsrank-area">
        {data.map((item:RankProps, index:number) => <RankCount {...item} key={`class-count-${index}`} />)}

      </ul>
    </div>
  )
};

export default RankCountStatisics;
