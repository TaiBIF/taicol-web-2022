import React from 'react';
import { speciesOptions } from 'src/components/frontend/statistics/options'
import type { SpeciesCompareProps } from 'src/types/frontend'
import CompareSpeciesBarChart from 'src/components/frontend/statistics/CompareSpeciesBarChart'

type Props = {
  data: SpeciesCompareProps[],
  handleCompareTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  handleShowCompareTableClick: (status:boolean) => void,
}

const TaiwanSpeciesAndEndemicCompareGlobalStatisics: React.VFC<Props> = (props) => {
  const { data, handleCompareTypeChange,handleShowCompareTableClick } = props

  return (
    <div className="item-p2">
      <div className="title-flex-box">
        <div className="left-box">
          <div className="mark-title">
            <img src="/images/title-mark.svg"/>
            <p>臺灣與全球物種數比較</p>
          </div>
          <div className="color-inf">
            <div className="colorbox">
              <div className="color1"></div>
              <p>全球現有種數</p>
            </div>
            <div className="colorbox">
              <div className="color2"></div>
              <p>臺灣現有種數</p>
            </div>
          </div>
        </div>
        <div className="right-select">
          <select name="" id="" onChange={handleCompareTypeChange}>
            {speciesOptions.map((item, index) => <option key={`species-option-${index}`} value={item.value}>{item.label}</option>)}
          </select>
        </div>
      </div>
      <div className="for-canvas">
        <CompareSpeciesBarChart data={data} />
      </div>
      <a href="#" className="btn-more" onClick={() => handleShowCompareTableClick(true)}>
        <p>查看比較總表</p>
        <div className="arr">
          <div className="arline"></div>
          <div className="arrrot">
            <img src="/images/arrlinrot.svg"/>
          </div>
        </div>
      </a>
    </div>
  )
};

export default TaiwanSpeciesAndEndemicCompareGlobalStatisics;
