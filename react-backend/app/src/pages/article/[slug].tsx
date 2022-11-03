import BreadCrumb from 'src/components/frontend/common/BreadCrumb'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import React from 'react'
import moment from 'moment'
import validateColor from "validate-color";
const Article: React.VFC = () => {

  const slug = typeof window !== "undefined" ? window.location.pathname.replace(/\/$/g,'').split("/").pop() : '';
  const encoded = decodeURI(slug as string);

  if(typeof window !== "undefined")
    console.log('window.location.pathname',window.location.pathname)
  console.log('slug',slug)
  const { data, error } = useSWR(slug ? `/api/article/info?slug=${encoded}`: [])
  const categoryBackgroundColor = data?.current?.Category?.color  && validateColor( data.current?.Category?.color) ?  data.current?.Category?.color : "black"

  const breadcrumbs = [
    { title: '首頁', href: '/' },
    {title: '更多資訊'},
    {title: '主題文章',href: '/article' },
  ]

  const date = moment(data?.publishedDate).format('YYYY-MM-DD')

  return (
  <div className="page-top">
		<div className="big-top">
			<div className="float-dot-yel">
				<img src="/images/cir_yel.png"/>
			</div>
			<div className="float-dot-blue">
				<img src="/images/cir_blue.png"/>
			</div>
			<div className="top-wave"></div>
			<BreadCrumb breadcrumbs={breadcrumbs} />
			<div className="main-box">
				<div className="pic-right1">
					<img src="/images/cont-rightimg1.png"/>
				</div>
				<div className="pic-right1s">
					<img src="/images/cont-rightimg1s.png"/>
				</div>
				<div className="float-dot-yel2">
					<img src="/images/cir_yel.png"/>
				</div>
				<div className="float-dot-blue2">
					<img src="/images/cir_blue.png"/>
				</div>
				<div className="title-box">
            <h2>主題文章 <span></span></h2>
            <p>ARTICLES</p>
				</div>
			</div>
		</div>
      <div className="main-box vivi-cont-top">
        <div className="news-cont-title">
				<div className="cont-date-flex">
					<div className="tag"  style={{ backgroundColor: categoryBackgroundColor}}>{data?.current?.Category?.name || ''}</div>
					<div className="date">{date}</div>
				</div>
				<h2>台灣物種名錄分界說明</h2>
      </div>
      <div className="author">
				<p>{data?.authorInfo}</p>
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
