import BreadCrumb from '../common/BreadCrumb'
import * as React from 'react'
import useSWR from 'swr'
import validateColor from 'validate-color'
import * as moment from 'moment';
import { NewsDataProps } from '../types'
import { fetcher } from '../utils/helper'

type Props = {
	current: NewsDataProps,
	prev: NewsDataProps,
	next: NewsDataProps,
}
const News: React.FC = () => {

  const slug = typeof window !== "undefined" ? window.location.pathname.replace(/\/$/g,'').split("/").pop() : '';
  const encoded = decodeURI(slug as string);
  const { data, error } = useSWR(`${process.env.REACT_API_URL}/api/news/info?slug=${encoded}`,fetcher)

  const categoryBackgroundColor = data?.current?.Category?.color  && validateColor( data.current?.Category?.color) ?  data.current?.Category?.color : "black"

  const breadcrumbs = [
    { title: '首頁', href: '/' },
    {title: '更多資訊'},
    {title: '最新消息',href: '/news' },
  ]

  const date = data?.current?.publishedDate ? moment(data?.current?.publishedDate).format('YYYY-MM-DD') : ''

  return (
  <div className="page-top">
		<div className="big-top">
			<div className="float-dot-yel">
				<img src="/static/image/cir_yel.png"/>
			</div>
			<div className="float-dot-blue">
				<img src="/static/image/cir_blue.png"/>
			</div>
			<div className="top-wave"></div>
			<BreadCrumb breadcrumbs={breadcrumbs} />
			<div className="main-box">
				<div className="pic-right1">
					<img src="/static/image/cont-rightimg1.png"/>
				</div>
				<div className="pic-right1s">
					<img src="/static/image/cont-rightimg1s.png"/>
				</div>
				<div className="float-dot-yel2">
					<img src="/static/image/cir_yel.png"/>
				</div>
				<div className="float-dot-blue2">
					<img src="/static/image/cir_blue.png"/>
				</div>
				<div className="title-box">
            <h2>最新消息 <span></span></h2>
            <p>NEWS</p>
				</div>
			</div>
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
		{data?.prev && <a href={`/news/${data.prev.slug}`}>上一則</a>}
			<a href="/news">回列表</a>
		{data?.next && <a href={`/news/${data.next.slug}`}>下一則</a>}
	  </div>
    </div>
	</div>
  )
}

export default News
