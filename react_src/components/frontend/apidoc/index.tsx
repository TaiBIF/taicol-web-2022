import Banner from '../common/Banner'
import * as React from 'react'
import * as moment from 'moment';
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import useSWR from 'swr'
import { fetcher } from '../utils/helper'
import * as utf8 from 'utf8';
import { Translation } from 'react-i18next';

const generateSlug = (props:any) => {
  let str = props.replace(/^\s+|\s+$/g, "");
  str = str.replace(/\s+/g, "-");
    
  return str;
};

const  LinkRenderer = (props:any) => {
  // console.log({ props });
  var found = props.href.match(/^#.*/i);
  if (found){
    return (
      <a href={utf8.decode(props.href)}>{props.children[0]}</a>
    );
  }
  else{
    return (
      <a href={props.href} target="_blank" rel="noreferrer">
        {props.children}
      </a>
    );
  }
  
}
 
const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '資料工具'},
  {title: 'API說明文件'}
]

const ApiPage: React.FC = () => {
  let lang = ''
  if (window.location.pathname == '/en-us/api'){
    lang = '_eng'
  }

  const {data} = useSWR(`${process.env.REACT_API_URL}/api/apidoc${lang}/info`,fetcher);

  return (
    <div className="page-top">
      <Translation>{ t =>
      <Banner title={t('API DOCUMENTATION')} zhTWTitle={t('API說明文件')} breadcrumbs={breadcrumbs}/>
      }</Translation>
      <div className='main-box vivi-cont-top'>
        <Translation>{ t =>
        <div className='page-update'>{t('更新日期')}：{data && moment(data.createdAt).format('yyyy/MM/DD') }</div>
        }</Translation>
        <div id='markdown' className='api-box apitable-style'>
          {data &&
            <ReactMarkdown  components={{ 
              h1: ({ node, ...props }) => (
                <h1 id={generateSlug(props.children[0])} {...props}></h1>
              ),
              a: LinkRenderer
            }} remarkPlugins={[remarkGfm]} children={utf8.decode(data.content)}  />
          }
        </div>
      </div>
    </div>
  )
}

export default ApiPage
