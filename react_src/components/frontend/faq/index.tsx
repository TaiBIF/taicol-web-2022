import List from './List'
import Banner from '../common/Banner'
import * as React from 'react'
import { Translation } from 'react-i18next';

const breadcrumbs = [
  {title: '首頁', href: '/' },
  {title: '常見問題'}
]
const FaqPage:React.FC = () => {
  return (
    <div className="page-top">
          <Translation>{ t =>
          <Banner title={t('FAQ')} zhTWTitle={t('常見問題')} breadcrumbs={breadcrumbs}/>
          }</Translation>
      <React.Suspense><List/></React.Suspense>
    </div>
  )
}
export default FaqPage
