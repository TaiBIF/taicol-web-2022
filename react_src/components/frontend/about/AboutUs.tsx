import * as React from 'react';


const AboutUs: React.FC = () => {

  return (
  <div className="aobut-1">
    <div className="main-box">
      <div className="left-logo">
        <div className="picbox">
          <div className="base">
            <img src="/static/image/abpic01.png"/>
          </div>
          <div className="logoball">
            <img src="/static/image/abpic02.png"/>
          </div>
          <div className="cir-blue">
            <img src="/static/image/cir_blue.png"/>
          </div>
          <div className="cir-yel">
            <img src="/static/image/cir_yel.png"/>
          </div>
        </div>
      </div>
      <div className="right-txt">
        <div className="mark-title">
          <img src="/static/image/title-mark.svg"/>
          <p>關於TaiCOL</p>
        </div>
        <p>
          臺灣物種名錄 (Catalogue of Life in Taiwan, TaiCOL) 為一收集整合臺灣物種學名相關資訊並提供物種名錄的資料庫，早期稱為「臺灣生物多樣性國家資訊網」(TaiBNET)。資料庫建置之起源可溯至「生物多樣性公約」中，第十七條要求締約國應促進一切公眾可得的生物多樣性保護和永續利用相關資訊的交流。為配合行政院2001年頒布之《生物多樣性推動方案》，科技部 (原國科會) 於2002至2004年間委託中央研究院整合臺灣生物多樣性資訊並建置資料庫，臺灣物種名錄網站於2003年建立並對外公開。2006年起計畫經費改由農委會支助，持續修訂名錄且逐步擴充同物異名、中文俗名、文獻，以及原生/外來/保育屬性等物種相關資訊，並釋出物種學名編碼予國內各大生物多樣性資料庫作為資料骨幹或資料交換之用。
        </p>
      </div>
    </div>
    </div>
  )
}

export default AboutUs
