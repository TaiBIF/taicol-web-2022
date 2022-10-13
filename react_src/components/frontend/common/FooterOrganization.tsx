import * as React from 'react';

const FooterOrganization: React.FC = () => {

  return (
    <div className="two-related">
        <div className="itembox">
            <p>指導單位</p>
            <a target='_blank' href="https://www.forest.gov.tw">
                <img src="/static/image/footer-logo1.png"/>
            </a>
        </div>
        <div className="itembox">
            <p>維護單位</p>
            <a target='_blank' href="https://portal.taibif.tw">
                <img src="/static/image/footer-logo2.png"/>
            </a>
        </div>
    </div>
  )
}

export default FooterOrganization
