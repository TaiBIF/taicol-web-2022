
import Banner from '../common/Banner'
import * as React from 'react'
import useSWR from 'swr'
import validateColor from 'validate-color'
import * as moment from 'moment';
import { ArticleDataProps } from '../types'
import { fetcher } from '../utils/helper'

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

  return (
  <div className="page-top">
		<div className="big-top">
        	<Banner title='ARTICLES' zhTWTitle='主題文章' breadcrumbs={breadcrumbs} />
		</div>
      <div className="main-box vivi-cont-top">
        <div className="news-cont-title">
				<div className="cont-date-flex">
					<div className="tag"  style={{ backgroundColor: categoryBackgroundColor}}>{data?.current?.Category?.name || ''}</div>
					<div className="date">{date}</div>
				</div>
				<h2>{data?.current?.title}</h2>
      </div>
      <div className="author">
				<p>{data?.current?.authorInfo}</p>
      </div>
      <div className="editor-box">
        {data && <div className='text-[#555]' dangerouslySetInnerHTML={{ __html: data?.current?.description }} />}
      </div>
      <div className="news-article-btn">
          {data?.prev && <a href={`/article/${data.prev.slug}`}>上一則</a>}
				<a href="/article">回列表</a>
          {data?.next && <a href={`/article/${data.next.slug}`}>下一則</a>}
			</div>
    </div>
	</div>
  )
}

export default Article
