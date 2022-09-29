import Banner from 'src/components/frontend/common/Banner'
import React from 'react'
import MatchForm from 'src/form/name/MatchForm'

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: '學名比對工具'}
]
const NewsList:React.VFC = () => {
  return (
    <div className="page-top">
      <Banner title='NEWS' zhTWTitle='最新消息' picType={'crap'} breadcrumbs={breadcrumbs}/>
      <div className="main-box vivi-cont-top">
			<div className="mark-title">
				<img src="/images/title-mark.svg"/>
				<p>查詢設定</p>
			</div>

			<div className="name-checkitem-box">
				<MatchForm />
			</div>
		</div>
    </div>
  )
}

export default NewsList
