import Banner from '../common/Banner'
import * as React from 'react'
import Info from './Info'
import ParamList from './ParamList'
import ReturnParamList from './ReturnParamList'
import ResponseList from './ResponseList'
import useSWR from 'swr'
import { fetcher } from '../utils/helper'

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: 'API說明文件'}
]
const ApiPage: React.FC = () => {
  const GET_APIDOC_LIST_URL = `${process.env.REACT_API_URL}/api/apidoc/info`;
  const { data,isValidating  } = useSWR(GET_APIDOC_LIST_URL,fetcher)

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
