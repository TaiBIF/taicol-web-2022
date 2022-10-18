import List from './List'
import Banner from '../common/Banner'
import * as React from 'react'

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: '最新消息'}
]
const NewsPage:React.FC = () => {
  return (
    <div className="page-top">
      <Banner title='NEWS' zhTWTitle='最新消息' picType={'crap'} breadcrumbs={breadcrumbs}/>
      <React.Suspense><List/></React.Suspense>
    </div>
  )
}

export default NewsPage
