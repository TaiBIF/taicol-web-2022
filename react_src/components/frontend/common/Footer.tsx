import * as React from 'react';
import FooterNav from './FooterNav'
import Copyright from './Copyright'
import FooterOrganization from './FooterOrganization'
import FooterContact from './FooterContact'
import GoToTopBtn from './GoToTopBtn'

const Footer: React.FC = () => {

  return (
<div className="footer">
        <GoToTopBtn/>
        <div className="main-box">
          <FooterContact/>
          <FooterNav />
          <FooterOrganization/>
        </div>
        <Copyright/>
	</div>
  )
}

export default Footer
