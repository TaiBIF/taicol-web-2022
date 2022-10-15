import React from 'react';
import BreadCrumb from 'src/components/frontend/common/BreadCrumb'
import type {BreadCrumbProps} from 'src/types/frontend'

type Props = {
  title: string;
  zhTWTitle: string;
  breadcrumbs: BreadCrumbProps[];
  picType?: 'crap' | 'turtle';
}
const Banner: React.VFC<Props> = (props) => {
  const {title,zhTWTitle,breadcrumbs,picType = 'turtle'} = props

  return (
<div className="short-top">
    <BreadCrumb breadcrumbs={breadcrumbs} />
		<div className="main-box">
			<div className="float-dot-yel">
				<img src="/images/cir_yel.png"/>
			</div>
			<div className="float-dot-blue">
				<img src="/images/cir_blue.png"/>
			</div>
			<div className="title-box">
				<h2>{zhTWTitle}</h2>
				<p>{title}</p>
			</div>
		</div>
	</div> )
}

export default Banner
