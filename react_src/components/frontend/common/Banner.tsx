import * as React from 'react';
import BreadCrumb from '../common/BreadCrumb'
import type { BreadCrumbProps } from '../types'
import {timeout} from '../utils/helper'

type Props = {
  title: string;
  zhTWTitle: string;
  breadcrumbs: BreadCrumbProps[];
  picType?: 'crap' | 'turtle';
}
const Banner: React.FC<Props> = (props) => {
  const {title,zhTWTitle,breadcrumbs,picType = 'turtle'} = props

  const [loadBanner, setLoadBanner] = React.useState<boolean>(false);

  React.useEffect( () => {
	setLoadBanner(true)
   /* timeout(1000).then(() => {
      setLoadBanner(true);
    })*/
  }, []);

  return (
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
        {(picType == 'turtle' && loadBanner) && <>
          <div className="pic-right1">
			<img src="/static/image/cont-rightimg1.png" />
          </div>
          <div className="pic-right1s">
            <img src="/static/image/cont-rightimg1s.png"/>
          </div>
        </>}
        {(picType == 'crap'&& loadBanner) && <div className="pic-right2">
			<img src="/static/image/cont-rightimg2.png" />
		</div>}
		<div className="float-dot-yel2">
			<img src="/static/image/cir_yel.png"/>
		</div>
		<div className="float-dot-blue2">
			<img src="/static/image/cir_blue.png"/>
		</div>
		<div className="title-box">
			<h2>{zhTWTitle} <span></span></h2>
			<p className='capitalize-first'>{title}</p>
		</div>
	</div>
</div>  )
}

export default Banner
