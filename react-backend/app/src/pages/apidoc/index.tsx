import Banner from 'src/components/frontend/common/Banner'
import React from 'react'
import Info from 'src/components/frontend/apidoc/Info'
import ParamList from 'src/components/frontend/apidoc/ParamList'
import ReturnParamList from 'src/components/frontend/apidoc/ReturnParamList'
import ResponseList from 'src/components/frontend/apidoc/ResponseList'
import useSWR from 'swr'

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: 'API說明文件'}
]
const ApiPage: React.VFC = () => {
  const { data,isValidating  } = useSWR('/api/apidoc/info')

  return (
    <div className="page-top">
      <Banner title='API DOCUMENTATION' zhTWTitle='API說明文件' breadcrumbs={breadcrumbs} />
      <div className='main-box vivi-cont-top'>
        <div className='api-box'>
          {!isValidating && <Info {...data.info} />}
          {!isValidating && <ParamList {...data.params} />}
          {!isValidating && <ResponseList data={data.responses} />}
          {!isValidating && <ReturnParamList {...data.returnParams} />}
        </div>
      </div>
    </div>
  )
}

export default ApiPage
