import React from 'react';
import {Link} from 'src/types/frontend';

type Props = {
  links: Link[];
}
const Links: React.VFC<Props> = (props) => {
  const { links } = props;

  return (
    <div className="link-box">
      {links.map((link:Link,index:number) => (
      <a target="_blank" href={link.href} key={`policy-link-${index}`}>
        <p>{link.label} </p>
        <div className="arr">
          <svg xmlns="http://www.w3.org/2000/svg" width="8.828" height="14.828" viewBox="0 0 8.828 14.828">
            <g id="Group_7699" data-name="Group 7699" transform="translate(1.449 13.344) rotate(-90)">
              <line id="Line_177" data-name="Line 177" x2="6" y2="6" transform="translate(-0.071 -0.035)" fill="none" stroke="#FFFFFF" stroke-linecap="round" strokeWidth="2"></line>
              <line id="Line_178" data-name="Line 178" x1="6" y2="6" transform="translate(5.929 -0.035)" fill="none" stroke="#FFFFFF" stroke-linecap="round" strokeWidth="2"></line>
            </g>
          </svg>
        </div>
      </a>
      ))}
    </div>
  )
};

export default Links;
