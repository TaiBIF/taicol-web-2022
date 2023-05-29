import List from './List'
import Banner from '../common/Banner'
import * as React from 'react'
import { Translation } from 'react-i18next';

const breadcrumbs = [
  {title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: '最新消息'}
]
const NewsPage:React.FC = () => {
  return (
    <div className="page-top">
          <Translation>{ t =>
          <Banner title={t('NEWS')} zhTWTitle={t('最新消息')} picType={'crap'} breadcrumbs={breadcrumbs}/>
          }</Translation>
      <React.Suspense><List/></React.Suspense>
    </div>
  )
}
export default NewsPage
