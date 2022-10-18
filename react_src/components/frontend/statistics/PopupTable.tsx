import * as React from 'react';
import {CompareTableDataProps} from '../types'

type Props = {
  data: CompareTableDataProps[];
  show: boolean,
  handleShowCompareTableClick: (status:boolean) => void,
}
const PopupTable: React.FC<Props> = (props) => {
  const { data, show,handleShowCompareTableClick } = props;

  return (show ? <div className="popbox-table">
      <div className="rel">
        <div className="w-bg ">
          <div className="xxx" onClick={() => handleShowCompareTableClick(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
              <g id="Group_8961" data-name="Group 8961" transform="translate(-1288 -210)">
                <g id="Ellipse_145" data-name="Ellipse 145" transform="translate(1288 210)" fill="#fff" stroke="#4c8da7" strokeWidth="2">
                  <circle cx="25" cy="25" r="25" stroke="none"></circle>
                  <circle cx="25" cy="25" r="24" fill="none"></circle>
                </g>
                <g id="Group_7748" data-name="Group 7748" transform="translate(100.696 1061.993) rotate(-45)">
                  <line id="Line_265" data-name="Line 265" x2="25" transform="translate(1429.5 271.5)" fill="none" stroke="#4c8da7" strokeLinecap="round" strokeWidth="2"></line>
                  <line id="Line_266" data-name="Line 266" x2="25" transform="translate(1442.5 259.5) rotate(90)" fill="none" stroke="#4c8da7" strokeLinecap="round" strokeWidth="2"></line>
                </g>
              </g>
            </svg>
          </div>
          <div className="title-area">
            <h2>臺灣與全球物種數比較表 <span></span></h2>
          </div>
          <p className="pad-note">
            請往右滑動 &gt;&gt;&gt;
          </p>
          <div className="pad-mb-scro">
            <table className="table-style1 b-0" cellPadding="0" cellSpacing="0">
              <tbody><tr>
                <td>界</td>
                <td>門</td>
                <td>綱</td>
                <td>全球現有種數</td>
                <td>臺灣現有種數</td>
                <td width="22%">臺灣名錄主要提供者</td>
              </tr>
              {data.map((item:CompareTableDataProps, index:number) => (
                <tr key={`species-compare-table-tr-${index}`}>
                  <td>{item.kingdomName}</td>
                  <td>{item.phylumName}</td>
                  <td>{item.className}</td>
                  <td>{item.globalCount}</td>
                  <td>{item.taiwanCount}</td>
                  <td>{item.twProvider}</td>
                </tr>
              ))}

            </tbody></table>
          </div>
        </div>
      </div>
    </div > : <></>
  )
};

export default PopupTable;
