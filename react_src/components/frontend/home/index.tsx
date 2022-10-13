
import Banner from './Banner'
import TaxonCountSection from './TaxonCountSection'
import LatestNewsListSection from './LatestNewsListSection'
import * as React from 'react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const Home:React.FC = () => {

  React.useEffect(() => {

    ScrollTrigger.create({
      trigger: '.section-2-statistics',
			start: "top-=60%",
      toggleClass: "vivi",
      once: true,
    });

    ScrollTrigger.create({
      trigger: '.section-3-news',
			start: "top-=40% top",
      toggleClass: "vivi",
      once: true,
    });
  }, [])


  return (
    <div className="ovh">
      <Banner />
      <TaxonCountSection />
      <LatestNewsListSection/>
    </div>
  )
}

export default Home
