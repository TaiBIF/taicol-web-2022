import Banner from 'src/components/frontend/common/Banner'
import React from 'react'

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: 'API說明文件'}
]
const ApiPage:React.VFC = () => {
  return (
    <div className="page-top">
      <Banner title='API DOCUMENTATION' zhTWTitle='API說明文件' breadcrumbs={breadcrumbs}/>
    </div>
  )
}

export default ApiPage
