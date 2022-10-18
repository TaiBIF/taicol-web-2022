import * as React from 'react';


const WorkGoal: React.FC = () => {

  return (
    <div className="about-2 vivi">
      <div className="top-bg"></div>
      <div className="gray-bg">
        <div className="main-box">
          <div className="left-txt">
            <div className="mark-title">
              <img src="/static/image/title-mark.svg"/>
              <p>TaiCOL工作目標</p>
            </div>
            <p>
              物種名錄對生物多樣性資源的保育至關重要。推動生物多樣性保育的相關工作，從資源調查、監測，乃至於政策制定，皆須正確引用物種學名，才能確保有效的溝通與管理，因此建置物種名錄、使臺灣有一份最新最正確的物種名資料庫，是推動生物多樣性保育最首要，也是最基礎的工作。此外，物種分類研究與更新是持續不斷的，目前TaiCOL名錄修訂與資訊來源包括：專人依據發表文獻修訂名錄、邀請專家審訂分類群、分類專家於平台上自主修訂、定期比對物種資料庫，以及透過使用者回報錯誤等。本計畫希望能持續更新臺灣物種名錄，並建立與各生物領域分類學者長期合作的名錄修訂模式，以提供給政府部門、研究人員、公眾及生物多樣性資料庫最新的名錄資訊。
            </p>
          </div>
          <div className="right-img">
            <div className="img-area">
              <div className="base">
                <img src="/static/image/abimg2.png"/>
              </div>
              <div className="bird">
                <img src="/static/image/abbitd.png"/>
              </div>
              <div className="cir-blue">
                <img src="/static/image/cir_blue.png"/>
              </div>
              <div className="cir-yel">
                <img src="/static/image/cir_yel.png"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkGoal
