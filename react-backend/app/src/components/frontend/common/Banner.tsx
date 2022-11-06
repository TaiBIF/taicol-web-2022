import React from 'react';
import BreadCrumb from 'src/components/frontend/common/BreadCrumb'
import type { BreadCrumbProps } from 'src/types/frontend'
import {timeout} from 'src/utils/helper'


type Props = {
  title: string;
  zhTWTitle: string;
  breadcrumbs: BreadCrumbProps[];
  picType?: 'crap' | 'turtle';
}
const Banner: React.VFC<Props> = (props) => {
  const {title,zhTWTitle,breadcrumbs,picType = 'turtle'} = props
  const [loadBanner, setLoadBanner] = React.useState<boolean>(false);

  React.useEffect( () => {
    timeout(1000).then(() => {
      setLoadBanner(true);
    })
  }, []);

  return (
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
        {picType == 'turtle' && <>
          <div className="pic-right1">
             {loadBanner && <img src="/images/cont-rightimg1.png" />}
          </div>
          <div className="pic-right1s">
            <img src="/images/cont-rightimg1s.png" />
          </div>
        </>}
        {picType == 'crap' && <div className="pic-right2">
          {loadBanner && <img src="/images/cont-rightimg2.png" />}
				</div>}
				<div className="float-dot-yel2">
					<img src="/images/cir_yel.png"/>
				</div>
				<div className="float-dot-blue2">
					<img src="/images/cir_blue.png"/>
				</div>
				<div className="title-box">
					<h2>{zhTWTitle} <span></span></h2>
					<p className='capitalize-first'>{title}</p>
				</div>
			</div>
		</div>  )
}

export default Banner
