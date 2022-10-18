import List from 'src/components/frontend/news/List'
import Banner from 'src/components/frontend/common/Banner'
import React from 'react'

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: '最新消息'}
]
const NewsPage:React.VFC = () => {
  return (
    <div className="page-top">
      <Banner title='NEWS' zhTWTitle='最新消息' picType={'crap'} breadcrumbs={breadcrumbs}/>
      <List/>
    </div>
  )
}

export default NewsPage
