import React from 'react';
import {RankProps} from 'src/types/frontend'

const RankCount: React.VFC<RankProps> = (props) => {
  const { zhTWTitle, enTitle, count, className } = props;

  return (
    <li className={`item ${className}`}>
      <div className="bg-animate"></div>
      <div className="left_area">
        <div className="cir-box">
          {zhTWTitle}
        </div>
        <p>{enTitle}</p>
      </div>
      <div className="num">{count}</div>
    </li>
  )
};

export default RankCount;
