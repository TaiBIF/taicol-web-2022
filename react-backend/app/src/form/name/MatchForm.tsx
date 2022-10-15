import React from 'react'
const MatchForm:React.VFC = () => {
  return (
    <form id="matchForm" action="/download_match_results" method="POST">
      <div className="flex-item">
        <div className="left-title">最佳結果</div>
        <div className="radiobox">
          <div className="flex">
            <input type="radio" name="best" value="yes" checked/>
            <p>是</p>
          </div>
          <div className="flex">
            <input type="radio" name="best" value="no"/>
            <p>否</p>
          </div>
        </div>
      </div>
      <div className="text-areabox">
        <p>學名/中文名</p>
        <textarea name="name"></textarea>
      </div>
      <button className="search">搜尋</button>
    </form>
  )
}

export default MatchForm
