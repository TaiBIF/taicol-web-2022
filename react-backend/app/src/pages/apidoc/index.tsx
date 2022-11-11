import Banner from 'src/components/frontend/common/Banner'
import React from 'react'
import useSWR from 'swr'
import ReactMarkdown from "react-markdown";
import moment from 'moment';
import remarkGfm from 'remark-gfm'
import utf8 from 'utf8';

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: 'API說明文件'}
]

const ApiPage: React.FC = () => {
  const { data, isValidating, error } = useSWR(`/api/apidoc/info`);

  if (data) {

  console.log('data.content',data.content)
  console.log('utf8.decode(data.content)',utf8.decode(data.content))
  }
  return (
    <div className="page-top">
      <Banner title='API DOCUMENTATION' zhTWTitle='API說明文件' breadcrumbs={breadcrumbs} />
      <div className='main-box vivi-cont-top'>
        <div className="api-box">
          <div className='page-update'>更新日期：{data && moment(data.createdAt).format('yyyy/MM/DD') }</div>

          <div id='markdown' className='api-box apitable-style'>
            {data &&
              <ReactMarkdown remarkPlugins={[remarkGfm]} children={utf8.decode(data.content)}  />
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiPage
