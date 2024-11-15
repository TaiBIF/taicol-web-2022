import * as React from 'react';
import {HabitatProps} from '../types'
import { useTranslation } from 'react-i18next';

const HabitatCount: React.FC<HabitatProps> = (props) => {
  const { zhTWTitle, count, className } = props;
  const { t } = useTranslation();

  return (
    <li className={`item ${className}`}>
      <div className="bg-animate"></div>
      <div className="left_area">
        <div className="cir-box">
          {zhTWTitle[0]}
        </div>
        <p>{t(zhTWTitle)}</p>
      </div>
      <div className="num">{count}</div>
    </li>
  )
};

export default HabitatCount;