import * as React from 'react';
import {HabitatProps} from '../types'
import HabitatCount from './HabitatCount'
import { Translation } from 'react-i18next';

type Props = {
  data:HabitatProps[]
}


type zhTWTitles = {
  [key: string]: string
}

const zhTWTitles:zhTWTitles = {
  is_terrestrial: '陸生',
  is_freshwater: '淡水',
  is_brackish: '半鹹水',
  is_marine: '海洋',
}

const HabitatCountStatisics: React.VFC<Props> = (props) => {
  const {data} = props

  return (
    <div className="item-p1 m_marb_20">
      <div className="mark-title mb-0">
        <img src="/static/image/title-mark.svg"/>
        <Translation>{ t =>
        <p>{t('棲地環境統計')}</p>
        }</Translation>
      </div>
      <div className="mark-title-note">
      <Translation>{ t =>
        <p>{t('單位：種 / 種下')}</p>
      }</Translation>
      </div>
      <ul className="stsrank-area">
        {data.map((item:HabitatProps, index:number) => <HabitatCount {...item} zhTWTitle={zhTWTitles[item.enTitle]} className={"cir-blue"} key={`class-count-${index}`} />)}
      </ul>
    </div>
  )
};

export default HabitatCountStatisics;

