import React from 'react';
import {formatNumber} from 'src/utils/helper';
import type {TaxonCountProps} from 'src/types/frontend'

const TaxonCount: React.VFC<TaxonCountProps> = (props) => {
  const { img, title, count } = props;

  return (
    <li>
      <div className="titlebox">
        <div className="cir_icon">
          <img src={img} />
          <div className="cir-line1"></div>
        </div>
        <div className="txtbox">
          <div className="title">
            <h3>{title}</h3>
          </div>
          <p>references</p>
        </div>
      </div>
      <div className="numberbox">
        {formatNumber(count)}
      </div>
    </li>
  )
}

export default TaxonCount
