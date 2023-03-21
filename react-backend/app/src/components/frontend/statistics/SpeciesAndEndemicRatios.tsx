import React from 'react';
import type { EndemicProps } from 'src/types/frontend';
import { formatNumber } from 'src/utils/helper';
import Tooltip from '@mui/material/Tooltip';

const RankCountStatisics: React.VFC<EndemicProps> = (props) => {
  const { name,image,count,ratio,total } = props;

  const ratiotoFixed = parseFloat(ratio).toFixed(0);

  return (
    <li>
      <div className="title-sp">
        <p>{name} <span></span></p>
        <div className="num">{formatNumber(total)}</div>
      </div>
      <div className="pie-box">
        <Tooltip title={formatNumber(count)} enterTouchDelay={0}>
          <div className="pie">
            <svg width="170" height="170">
              <circle className={`pie${ratiotoFixed}`} r="70" cx="85" cy="85"></circle>
            </svg>
          </div>
        </Tooltip>
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
