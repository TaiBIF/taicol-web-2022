import BreadCrumb from '../common/BreadCrumb'
import * as React from 'react'
import useSWR from 'swr'
import { fetcher } from '../utils/helper'

type Props = {
  slug: string;
}
const ArticleDetail: React.FC<Props> = (props) => {
  const { slug } = props

  const encoded = encodeURI(slug as string);

  const { data, error } = useSWR(`${process.env.REACT_API_URL}/api/article/info?slug=${encoded}`,fetcher)

  const breadcrumbs = [
    { title: '首頁', href: '/' },
    {title: '更多資訊'},
    {title: '主題文章',href: '/article' },
    {title: data && data?.title || ''},
  ]

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
            <h2>{data?.title || ''} <span></span></h2>
				</div>
			</div>
		</div>
    <div className="main-box vivi-cont-top padb-80 mt-12">
      {data && <div className='text-[#555]' dangerouslySetInnerHTML={{ __html: data.description }} />}
    </div>
	</div>
  )
}

export default ArticleDetail
