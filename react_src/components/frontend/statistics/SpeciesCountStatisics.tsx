import * as React from 'react';
import { KingdomProps } from '../types';
import SpeciesCountBarChart from './SpeciesCountBarChart';
import { Translation } from 'react-i18next';

type Props = {
  data:KingdomProps[]
}
const SpeciesCountStatisics: React.FC<Props> = (props) => {
  const { data } = props;

  return (
    <div className="item-p2">
      <div className="mark-title">
        <img src="/static/image/title-mark.svg"/>
        <Translation>{ t =>
        <p>{t('各界物種數統計')}</p>
      }</Translation>
        
      </div>
      <div className="for-canvas">
        <SpeciesCountBarChart data={data}/>
      </div>
    </div>
  )
};

export default SpeciesCountStatisics;
