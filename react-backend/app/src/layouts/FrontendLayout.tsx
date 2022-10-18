// ** React Imports
import React from 'react'

import Header from 'src/components/frontend/common/Header'
import Footer from 'src/components/frontend/common/Footer'

type Props = { children: React.ReactNode }

const FrontendLayout:React.FC<Props> = (props) => {
  return (
    <>
      <Header />
      {props.children}
      <Footer/>
    </>
  )
}

export default FrontendLayout
