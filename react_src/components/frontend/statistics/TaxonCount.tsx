import * as React from 'react';
import {formatNumber} from '../utils/helper';
import type {TaxonCountProps} from '../types'
import { Translation } from 'react-i18next';

const TaxonCount: React.FC<TaxonCountProps> = (props) => {
  const { img, title, count ,CircleClassName,enTitle,tooltip } = props;

  return (
    <li>
      <div className="titlebox">
        <div className="cir_icon">
          <img src={img} />
          <div className={CircleClassName}></div>
        </div>
        <div className="txtbox">
          <div className="title">
          <Translation>{ t =>
          <h3>{t(title)}</h3>
          }</Translation>
            {tooltip && <div className="markq">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                <g id="qs_mark" transform="translate(-1536.736 -1209.631)">
                  <g id="Ellipse_8" data-name="Ellipse 8" transform="translate(1536.736 1209.631)" fill="#fff" stroke="#aaa" strokeWidth="1">
                    <circle cx="14" cy="14" r="14" stroke="none"></circle>
                    <circle cx="14" cy="14" r="13.5" fill="none"></circle>
                  </g>
                  <text id="_" data-name="?" transform="translate(1545.736 1230.631)" fill="#aaa" fontSize="20" fontFamily="Fredoka-Regular, Fredoka" letterSpacing="0.05em"><tspan x="0" y="0">?</tspan></text>
                </g>
              </svg>
              <div className="hvbubble">
                <p>{tooltip}</p>
              </div>
            </div>}
          </div>
          <p className='uppercase'>
            {enTitle}
            </p>
        </div>
      </div>
      <div className="numberbox">
        {formatNumber(count)}
      </div>
    </li>
  )
}

export default TaxonCount
