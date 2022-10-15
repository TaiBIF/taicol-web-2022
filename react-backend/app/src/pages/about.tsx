import Banner from 'src/components/frontend/common/Banner'
import AboutUs from 'src/components/frontend/about/AboutUs'
import WorkGoal from 'src/components/frontend/about/WorkGoal'
import React from 'react'

const breadcrumbs = [
  { title: '首頁', href: '/' },
  {title: '關於TaiCOL'}
]

const About:React.VFC = () => {
  return (
    <div className="page-top">
      <Banner title='ABOUT' zhTWTitle='關於TaiCOL' breadcrumbs={breadcrumbs}/>
      <AboutUs/>
      <WorkGoal/>
    </div>
  )
}

export default About
