import * as React from 'react';
import {RankProps} from '../types'
import RankCount from '../statistics/RankCount'

type Props = {
  data:RankProps[]
}
const RankCountStatisics: React.FC<Props> = (props) => {
  const {data} = props

  return (
    <div className="item-p1">
      <div className="mark-title">
        <img src="/static/image/title-mark.svg"/>
        <p>各階層數量統計</p>
      </div>
      <ul className="stsrank-area">
        {data.map((item:RankProps, index:number) => <RankCount {...item} key={`class-count-${index}`} />)}

      </ul>
    </div>
  )
};

export default RankCountStatisics;
