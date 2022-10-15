import React from 'react';
import { Link } from 'src/types/frontend';
import Links from 'src/components/frontend/policy/Links';

type Props = {
  title: string;
  links: Link[];
}
const Infbox: React.VFC<Props> = (props) => {
  const { title, links } = props;
  console.log('props',props)
  return (
    <div className="gray-infbox">
      <div className="ccflex">
        <p>{title}</p>
        <div className="cc-mark">
          <img src="/images/ccby.png"/>
        </div>
      </div>
      <Links links={links}/>
    </div>
  )
};

export default Infbox;
