import Banner from 'src/components/frontend/common/Banner'
import React from 'react'
import useSWR from 'swr'
import ReactMarkdown from "react-markdown";
import moment from 'moment';
import remarkGfm from 'remark-gfm'

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '更多資訊'},
  {title: 'API說明文件'}
]
const ApiPage: React.VFC = () => {
  const { data, isValidating } = useSWR('/api/apidoc/info');
  const [markdown, setMarkdown] = React.useState<string>('');
  React.useEffect(() => {
    if (data) {
      fetch(`${data.markdown}`).then((md) => md.text()).then((md) => setMarkdown(md));
    }
  }, [data]);

  return (
    <div className="page-top">
      <Banner title='API DOCUMENTATION' zhTWTitle='API說明文件' breadcrumbs={breadcrumbs} />
      <div className='main-box vivi-cont-top'>
        <div className="api-box">
          <div className='page-update'>更新日期：{data && moment(data.createdAt).format('yyyy/MM/DD') }</div>

          <div id='markdown' className='api-box apitable-style'>
            {markdown &&
              <ReactMarkdown remarkPlugins={[remarkGfm]} children={markdown}  />
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiPage
