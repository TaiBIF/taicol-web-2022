import * as React from 'react';
import { speciesOptions } from './options'
import type { SpeciesCompareProps,KingdomInfoProps } from '../types'
import CompareSpeciesBarChart from './CompareSpeciesBarChart'
import { Translation } from 'react-i18next';
import { useTranslation } from 'react-i18next';

type Props = {
  data: SpeciesCompareProps[],
  handleCompareTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  handleShowCompareTableClick: (status: boolean) => void,
  kingdomInfo: KingdomInfoProps[],
  compareType: string,
  globalUpdated?: string
}

const TaiwanSpeciesAndEndemicCompareGlobalStatisics: React.FC<Props> = (props) => {
  const { data, handleCompareTypeChange, handleShowCompareTableClick, kingdomInfo, compareType, globalUpdated } = props
  const [kingdomSelected, setKingdomSelect] = React.useState<string[]>(kingdomInfo.map((item: KingdomInfoProps, index: number) => {
    return item.chineseName
  } ))

  const handleKingdomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKingdomSelected = e.target.checked ? [...kingdomSelected, e.target.value] : kingdomSelected.filter((item) => item !== e.target.value)

    setKingdomSelect(newKingdomSelected.map((chineseName) => {
      return chineseName
    }));
  }

  let filterData = data

  if (compareType == 'kingdom_compare') {
    filterData = data.filter((item: SpeciesCompareProps, number: number) => kingdomSelected.includes(item.name))
  }
  const { t, i18n } = useTranslation();
  const speciesOptions_table = speciesOptions.map((item, index) => {
    return (<option key={`species-option-${index}`} value={item.value}>
      {t((item.label||'').toString())}
      </option>)})
  return (
    // <div className="item-p2">
  <div className="boxarea-2-1">
    <div className="item-p2 item-p-100">
      <div className="title-flex-box">
        <div className="left-box">
          <div className="mark-title">
            <img src="/static/image/title-mark.svg"/>
            <Translation>{ t =>
            <p>{t('臺灣與全球物種數比較')}</p>
            }</Translation>
          </div>
          <div className="color-inf">
            <div className="colorbox">
              <div className="color1"></div>
              <Translation>{ t =>
              <p>{t('全球現有種數')}</p>
              }</Translation>
            </div>
            <div className="colorbox">
              <div className="color2"></div>
              <Translation>{ t =>
              <p>{t('臺灣現有種數')}</p>
              }</Translation>
            </div>
          </div>
        </div>
        <div className="right-select">
          <select name="" id="" onChange={handleCompareTypeChange}>
            {speciesOptions_table}
          </select>
        </div>
      </div>
      <p className='global-stat-updated'>{t('全球物種數更新時間')}: {globalUpdated} / {t('單位：種')}</p>
      <div className="for-canvas-vh">
        <CompareSpeciesBarChart data={filterData} />
        {compareType == 'kingdom_compare' && <div className='more-selection-area'>
          <div className='item-box check-set"'>
            <div className="right-check">
              {kingdomInfo?.map((item: KingdomInfoProps, index: number): React.ReactElement => {
                return <label className="check-item mr-[8px]">{i18n.language == 'en-us' ? item.kingdom : item.chineseName} 
                  <input type="checkbox" name="alien_type" checked={kingdomSelected.includes(item.chineseName) ? true : false} value={item.chineseName} onChange={handleKingdomChange} />
                  <span className="checkmark"></span>
                </label>
              })}
            </div>
          </div>
        </div>}
      </div>
      <a href="#" className="btn-more" onClick={() => handleShowCompareTableClick(true)}>
        <Translation>{ t => <p className={i18n.language == 'en-us' ? 'fs-12' : ''}>{t('查看比較總表')}</p> }</Translation>
        <div className="arr">
          <div className="arline"></div>
          <div className="arrrot">
            <img src="/static/image/arrlinrot.svg"/>
          </div>
        </div>
      </a>
    </div>
    </div>
  )
};

export default TaiwanSpeciesAndEndemicCompareGlobalStatisics;