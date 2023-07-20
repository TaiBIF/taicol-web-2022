
import Banner from '../common/Banner'
import * as React from 'react'
import useSWR from 'swr'
import validateColor from 'validate-color'
import * as moment from 'moment';
import { ArticleDataProps } from '../types'
import { fetcher,replaceDomain,replaceIp } from '../utils/helper'
import { Translation } from 'react-i18next';

type Props = {
	current: ArticleDataProps,
	prev: ArticleDataProps,
	next: ArticleDataProps,
}
const Article: React.FC = () => {

  const slug = typeof window !== "undefined" ? window.location.pathname.replace(/\/$/g,'').split("/").pop() : '';
  const encoded = decodeURI(slug as string);
  const { data, error } = useSWR(`${process.env.REACT_API_URL}/api/article/info?slug=${encoded}`,fetcher)

  const categoryBackgroundColor = data?.current?.Category?.color  && validateColor( data.current?.Category?.color) ?  data.current?.Category?.color : "black"

  const breadcrumbs = [
    { title: '首頁', href: '/' },
    {title: '更多資訊'},
    {title: '主題文章',href: '/article' },
  ]

  const date = data?.current?.publishedDate ? moment(data?.current?.publishedDate).format('YYYY-MM-DD') : ''

  let description = '';
  
  if (data) {
    description = data?.current?.description.replace(process.env.REACT_API_URL, '/static');
  }
  const tag_name = data?.current?.Category?.name || ''

  return (
  <div className="page-top">
		<div className="big-top">
    <Translation>{ t =>
        <Banner title={t('ARTICLES')} zhTWTitle={t('主題文章')} breadcrumbs={breadcrumbs}/>
      }</Translation>
		</div>
      <div className="main-box vivi-cont-top">
        <div className="news-cont-title">
				<div className="cont-date-flex">
					<div className="tag"  style={{ backgroundColor: categoryBackgroundColor}}>
          <Translation>{t=> t(tag_name)}</Translation>  
          </div>
					<div className="date">{date}</div>
				</div>
				<h2>{data?.current?.title}</h2>
      </div>
      <div className="author">
				<p>{data?.current?.authorInfo}</p>
      </div>
      <div className="editor-box">
        {data && <div className='text-[#555]' dangerouslySetInnerHTML={{ __html: description }} />}
      </div>
      <div className="news-article-btn">
          {data?.prev && <a href={`/article/${data.prev.slug}`}><Translation>{t=> t('上一則')}</Translation></a>}
				<a href="/article"><Translation>{t=> t('回列表')}</Translation></a>
          {data?.next && <a href={`/article/${data.next.slug}`}><Translation>{t=> t('下一則')}</Translation></a>}
			</div>
    </div>
	</div>
  )
}

export default Article
