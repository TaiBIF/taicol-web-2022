
import React from 'react';

type Props = {
  label: string,
  href: string,
}

const MoreButton: React.VFC<Props> = (props) => {
  const { label, href } = props

  return (
  <a href={href} className="btn-more">
    <p>{label}</p>
    <div className="arr">
      <div className="arline"></div>
      <div className="arrrot">
        <img src="/images/arrlinrot.svg"/>
      </div>
    </div>
  </a>
  )
}

export default MoreButton

