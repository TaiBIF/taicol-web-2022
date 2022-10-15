import React from 'react';
import Banner from 'src/components/frontend/common/Banner'
import Infbox from 'src/components/frontend/policy/Infbox';

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: '資料使用規範'}
]

const ZhTwLinks = [
  { label: '使用的授權標章', href: 'https://tw.creativecommons.net' },
  { label: '創用cc台灣首頁', href: 'https://tw.creativecommons.net/home-page/' },
]

const EnLinks = [
  { label: 'Netlabels we used are', href: 'https://tw.creativecommons.net' },
  { label: 'Main site for Creative Commons', href: 'https://tw.creativecommons.net/home-page/' },
]

const Policy: React.VFC = () => {
  return (<div className="page-top">
      <Banner title='ARTICLES' zhTWTitle='主題文章' breadcrumbs={breadcrumbs}/>
      <div className="main-box vivi-cont-top">
        <div className="data-policy-area">
          <h2>本網站文字資料採用 Creative Commons (創用CC) 提供的準則與條款 (V4.0) 作為資料使用的依據。</h2>
          <Infbox title='使用的授權標章' links={ZhTwLinks} />

          <h2>Except where otherwise noted, this site is licensed under a Creative Commons Attribution 4.0 License</h2>
          <Infbox title='Netlabels we used are' links={EnLinks} />

          <h2>臺灣物種名錄(TaiCOL)引用格式</h2>
          <div className="gray-infbox">
            鍾國芳、邵廣昭 (2022) 臺灣物種名錄 https://taicol.tw (於2022-09-15查詢)
            <br/><br/>

            K. F. Chung, K. T. Shao (2022) Catalogue of life in Taiwan. Retrieved 2022-09-15 from https://taicol.tw
          </div>
        </div>
      </div>
  </div>)
};

export default Policy;
