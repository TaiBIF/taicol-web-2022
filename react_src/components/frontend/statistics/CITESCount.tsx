import * as React from 'react';
import {CITESProps} from '../types'
import { useTranslation } from 'react-i18next';

const CITESCount: React.FC<CITESProps> = (props) => {
  const { zhTWTitle, circleTitle, count, className } = props;
  const { t } = useTranslation();

  return (
    <li className={`item ${className}`}>
      <div className="bg-animate"></div>
      <div className="left_area">
        <div className="cir-box">
          {circleTitle}
        </div>
        <p>{t(zhTWTitle)}</p>
      </div>
      <div className="num">{count}</div>
    </li>
  )
};

export default CITESCount;
