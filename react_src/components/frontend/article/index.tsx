import List from './List'
import Banner from '../common/Banner'
import * as React from 'react'
import { Translation } from 'react-i18next';

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: '主題文章'}
]
const ArticlePage:React.FC = () => {
  return (
    <div className="page-top">
      <Translation>{ t =>
        <Banner title={t('ARTICLES')} zhTWTitle={t('主題文章')} breadcrumbs={breadcrumbs}/>
      }</Translation>
      <List/>
    </div>
  )
}

export default ArticlePage
