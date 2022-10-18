import * as React from 'react';
import BreadCrumb from '../common/BreadCrumb'
import type {BreadCrumbProps} from '../types'

type Props = {
  title: string;
  zhTWTitle: string;
  breadcrumbs: BreadCrumbProps[];
  picType?: 'crap' | 'turtle';
}
const Banner: React.FC<Props> = (props) => {
  const {title,zhTWTitle,breadcrumbs,picType = 'turtle'} = props

  return (
<div className="short-top">
    <BreadCrumb breadcrumbs={breadcrumbs} />
		<div className="main-box">
			<div className="float-dot-yel">
				<img src="/static/image/cir_yel.png"/>
			</div>
			<div className="float-dot-blue">
				<img src="/static/image/cir_blue.png"/>
			</div>
			<div className="title-box">
				<h2>{zhTWTitle}</h2>
				<p>{title}</p>
			</div>
		</div>
	</div> )
}

export default Banner
