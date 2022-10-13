import * as React from 'react';
import type { EndemicProps } from '../types';
import { formatNumber } from '../utils/helper';

const RankCountStatisics: React.FC<EndemicProps> = (props) => {
  const { name,image,count,ratio } = props;

  const ratiotoFixed = parseFloat(ratio).toFixed(0);

  return (
    <li>
      <div className="title-sp">
        <p>{name} <span></span></p>
        <div className="num">{formatNumber(count)}</div>
      </div>
      <div className="pie-box">
        <div className="pie">
          <svg width="170" height="170">
            <circle className={`pie${ratiotoFixed}`} r="70" cx="85" cy="85"></circle>
          </svg>
        </div>
        <div className="center-iconbox">
          <div className="center-use">
            <div className="icon">
              <img src={image}/>
            </div>
            <div className="per">{ratio}%</div>
          </div>
        </div>
      </div>
    </li>
  )
};

export default RankCountStatisics;
