import LatestNewsList from './LatestNewsList'
import * as React from 'react';

const LatestNewsListSection: React.FC = () => {
  return (
      <section className='section-3-news vivi'>
        <div className="bg-wave">
				<img loading="lazy" src="/static/image/bg-wave2.svg"/>
        </div>
        <div className="float-leaf">
          <img loading="lazy" src="/static/image/leaf.png"/>
        </div>
        <div className='flex-box'>
          <div className="left-news-box">
            <LatestNewsList/>
          </div>
          <div className="right-animal-box">
            <div className="base-box">
              <div className="cir-yel">
                <img loading="lazy" src="/static/image/cir_yel.png"/>
              </div>
              <div className="cir-blue">
                <img loading="lazy" src="/static/image/cir_blue.png"/>
              </div>
              <div className="bg-cir">
                <img loading="lazy" src="/static/image/sec3-img-7.png"/>
              </div>
              <div className="pic-trutle">
                <img loading="lazy" src="/static/image/sec3-img-4.png"/>
              </div>
              <div className="pic-plant1">
                <img loading="lazy" src="/static/image/sec3-img-5.png"/>
              </div>
              <div className="pic-plant2">
                <img loading="lazy" src="/static/image/sec3-img-6.png"/>
              </div>
              <div className="pic-blue1">
                <img loading="lazy" src="/static/image/sec3-img-3.png"/>
              </div>
              <div className="pic-snake">
                <img loading="lazy" src="/static/image/sec3-img-2.png"/>
              </div>
              <div className="pic-plant3">
                <img loading="lazy" src="/static/image/sec3-img-1.png"/>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default LatestNewsListSection
