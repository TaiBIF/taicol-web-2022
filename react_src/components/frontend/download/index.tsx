import List from './List'
import Banner from '../common/Banner'
import * as React from 'react'
import { Translation } from 'react-i18next';

const breadcrumbs = [
  {title: '首頁', href: '/' },
  {title: '資料工具'},
  {title: '資料下載'}
]
const DownloadPage:React.VFC = () => {
  return (
    <div className="page-top">
      <Translation>{ t =>
      <Banner title={t('DOWNLOAD')} zhTWTitle={t('資料下載')} picType={'crap'} breadcrumbs={breadcrumbs}/>
      }</Translation>
      <List/>
    </div>
  )
}

export default DownloadPage
