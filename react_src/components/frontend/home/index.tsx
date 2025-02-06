import * as React from 'react';
// import React, { Suspense, lazy } from "react";


const TaxonCountSection = React.lazy(() => import("./TaxonCountSection"));
const LatestNewsListSection = React.lazy(() => import('./LatestNewsListSection'));


const Home:React.FC = () => {


  return (
    <div>
      <React.Suspense fallback={<div>loading...</div>}>
        <TaxonCountSection />
      </React.Suspense>
      <React.Suspense fallback={<div>loading...</div>}>
        <LatestNewsListSection />
      </React.Suspense>

    </div>
  )
}

export default Home
