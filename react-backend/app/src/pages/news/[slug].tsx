import BreadCrumb from 'src/components/frontend/common/BreadCrumb'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import React from 'react'


const News:React.VFC = () => {
  const router = useRouter();
  const { slug } = router.query
  const encoded = encodeURI(slug as string);

  const { data, error } = useSWR(`/api/news/info?slug=${encoded}`)

  const breadcrumbs = [
    { title: '首頁', href: '/' },
    {title: '更多資訊'},
    {title: '最新消息',href: '/news' },
    {title: data?.title || ''},
  ]

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

export default News
