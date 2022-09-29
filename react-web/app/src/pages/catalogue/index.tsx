import BannerWithOutIcon from 'src/components/frontend/common/BannerWithOutIcon'
import React from 'react'
import SearchForm from 'src/components/frontend/catalogue/SearchForm'
import AdvancedSearchForm from 'src/components/frontend/catalogue/AdvancedSearchForm'

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '物種名錄'},
]
const CataloguePage:React.VFC = () => {
  return (
    <div className="page-top">
      <BannerWithOutIcon title='CATALOGUE' zhTWTitle='物種名錄' breadcrumbs={breadcrumbs}/>
      <SearchForm />
      <AdvancedSearchForm/>
    </div>
  )
}

export default CataloguePage
