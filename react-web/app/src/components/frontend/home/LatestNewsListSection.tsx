import LatestNewsList from './LatestNewsList'

const LatestNewsListSection = () => {
  return (
      <section className='section-3-news vivi'>
        <div className="bg-wave">
				<img src="/images/bg-wave2.svg"/>
        </div>
        <div className="float-leaf">
          <img src="/images/leaf.png"/>
        </div>
        <div className='flex-box'>
          <div className="left-news-box">
            <LatestNewsList/>
          </div>
          <div className="right-animal-box">
            <div className="base-box">
              <div className="cir-yel">
                <img src="/images/cir_yel.png"/>
              </div>
              <div className="cir-blue">
                <img src="/images/cir_blue.png"/>
              </div>
              <div className="bg-cir">
                <img src="/images/sec3-img-7.png"/>
              </div>
              <div className="pic-trutle">
                <img src="/images/sec3-img-4.png"/>
              </div>
              <div className="pic-plant1">
                <img src="/images/sec3-img-5.png"/>
              </div>
              <div className="pic-plant2">
                <img src="/images/sec3-img-6.png"/>
              </div>
              <div className="pic-blue1">
                <img src="/images/sec3-img-3.png"/>
              </div>
              <div className="pic-snake">
                <img src="/images/sec3-img-2.png"/>
              </div>
              <div className="pic-plant3">
                <img src="/images/sec3-img-1.png"/>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default LatestNewsListSection
