import TaxonCountSection from 'src/components/frontend/home/TaxonCountSection'
import LatestNewsListSection from 'src/components/frontend/home/LatestNewsListSection'
import Banner from 'src/components/frontend/home/Banner'
import React, { useRef,useEffect } from 'react'
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const Home = () => {

  useEffect(() => {

    ScrollTrigger.create({
      trigger: '.section-2-statistics',
			start: "top-=60% top",
      toggleClass: "vivi"
    });

    ScrollTrigger.create({
      trigger: '.section-3-news',
			start: "top-=40% top",
      toggleClass: "vivi"
    });
  }, [])


  return (
    <div className="ovh">
      <Banner/>
      <TaxonCountSection   />
      <LatestNewsListSection/>
    </div>
  )
}

export default Home
