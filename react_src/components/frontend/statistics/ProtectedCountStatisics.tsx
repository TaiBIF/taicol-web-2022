import * as React from "react";
import { ProtectedProps } from "../types"
import ProtectedCount from "./ProtectedCount"
import { Translation } from "react-i18next";

type Props = {
  data:ProtectedProps[]
}

type zhTWTitles = {
  [key: string]: string
}

type circleTitles = {
  [key: string]: string
}

const zhTWTitles:zhTWTitles = {
  "I": "第 I 級 瀕臨絕種野生動物",
  "II": "第 II 級 珍貴稀有野生動物",
  "III": "第 III 級 其他應予保育之野生動物",
  "1": "文資法珍貴稀有植物",
}

const circleTitles:circleTitles = {
  "I": "I",
  "II": "II",
  "III": "III",
  "1": "珍",
}

const ProtectedCountStatisics: React.VFC<Props> = (props) => {
  const {data} = props

  return (
    <div className="item-p1">
      <div className="mark-title mb-0">
        <img src="/static/image/title-mark.svg"/>
        <Translation>{ t =>
        <p>{t("臺灣保育類統計")}</p>
        }</Translation>
      </div>
      <div className="mark-title-note">
      <Translation>{ t =>
        <p>{t('單位：種 / 種下')}</p>
      }</Translation>
      </div>
      <ul className="stsrank-area">
        {data.map((item:ProtectedProps, index:number) => <ProtectedCount {...item} zhTWTitle={zhTWTitles[item.zhTWTitle]} circleTitle={circleTitles[item.zhTWTitle]} 
                                                                         className={"cir-blue"} key={`class-count-${index}`} />)}
      </ul>
    </div>
  )
};

export default ProtectedCountStatisics;

