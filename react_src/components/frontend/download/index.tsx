import List from './List'
import Banner from '../common/Banner'
import * as React from 'react'

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: '資料下載'}
]
const DownloadPage:React.VFC = () => {
  return (
    <div className="page-top">
      <Banner title='DOWNLOAD' zhTWTitle='資料下載' picType={'crap'} breadcrumbs={breadcrumbs}/>
      <List/>
    </div>
  )
}

export default DownloadPage
