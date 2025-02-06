
// import Banner from './Banner'
// import TaxonCountSection from './TaxonCountSection'
// import LatestNewsListSection from './LatestNewsListSection'
import * as React from 'react';
import { Suspense, lazy } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";


// const Banner = lazy(() => import("./Banner"));
const TaxonCountSection = lazy(() => import("./TaxonCountSection"));
const LatestNewsListSection = lazy(() => import('./LatestNewsListSection'));


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
    <div>
      <Suspense fallback={<div>loading...</div>}>
        <TaxonCountSection />
      </Suspense>
      <Suspense fallback={<div>loading...</div>}>
        <LatestNewsListSection />
      </Suspense>

    </div>
  )
}

export default Home
