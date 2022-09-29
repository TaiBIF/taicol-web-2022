import List from 'src/components/frontend/article/List'
import Banner from 'src/components/frontend/common/Banner'
import React from 'react'

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: '主題文章'}
]
const ArticlePage:React.VFC = () => {
  return (
    <div className="page-top">
      <Banner title='ARTICLES' zhTWTitle='主題文章' breadcrumbs={breadcrumbs}/>
      <List/>
    </div>
  )
}

export default ArticlePage
