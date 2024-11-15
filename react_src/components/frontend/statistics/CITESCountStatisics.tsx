import * as React from 'react';
import {CITESProps} from '../types'
import CITESCount from './CITESCount'
import { Translation } from 'react-i18next';

type Props = {
  data:CITESProps[]
}

type zhTWTitles = {
  [key: string]: string
}


type circleTitles = {
  [key: string]: string
}

const zhTWTitles:zhTWTitles = {
  '1': '附錄一',
  '2': '附錄二',
  '3': '附錄三',
  'NC': 'NC',
}

const circleTitles:circleTitles = {
  '1': 'I',
  '2': 'II',
  '3': 'III',
  'NC': 'NC',
}

const CITESCountStatisics: React.VFC<Props> = (props) => {
  const {data} = props

  return (
    <div className="item-p1">
      <div className="mark-title mb-0">
        <img src="/static/image/title-mark.svg"/>
        <Translation>{ t =>
        <p>{t('CITES附錄統計')}</p>
        }</Translation>
      </div>
      <div className="mark-title-note">
      <Translation>{ t =>
        <p>{t('單位：種 / 種下')}</p>
      }</Translation>
      </div>

      <ul className="stsrank-area">
        {data.map((item:CITESProps, index:number) => <CITESCount {...item} zhTWTitle={zhTWTitles[item.zhTWTitle]} circleTitle={circleTitles[item.zhTWTitle]} 
                                                                         className={"cir-blue"} key={`class-count-${index}`} />)}
      </ul>
    </div>
  )
};

export default CITESCountStatisics;

