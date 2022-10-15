import React from 'react';
import type { ArticleDataProps } from 'src/types/frontend'
import moment from 'moment';

const ArticleItem: React.VFC<ArticleDataProps> = (props) => {
  const {   title, author, Category,updatedAt } = props
  const date = moment(new Date(updatedAt))

  return (
    <li>
      <a href="#">
        <div className="top-item">
          <div className="leftbox">
            <div className="date">
            <div className="day">{date.format('DD')}</div>
            <div className="mon-year">{date.format('ddd')}.{date.format('YYYY')}</div>
            </div>
          <div className={`tag`} style={{ backgroundColor: `${Category.color}`}}>
            {Category.name}
            </div>
          </div>
          <div className="right-name">
           {author}
          </div>
        </div>
        <div className="txt">
          <h3 className="news-title">
           {title}
          </h3>
          <div className="arrgo">
            <svg xmlns="http://www.w3.org/2000/svg" width="8.828" height="14.828" viewBox="0 0 8.828 14.828">
              <g id="Group_7699" data-name="Group 7699" transform="translate(1.449 13.344) rotate(-90)">
                <line id="Line_177" data-name="Line 177" x2="6" y2="6" transform="translate(-0.071 -0.035)" fill="none" stroke="#4c8da7" strokeLinecap="round" strokeWidth="2"></line>
                <line id="Line_178" data-name="Line 178" x1="6" y2="6" transform="translate(5.929 -0.035)" fill="none" stroke="#4c8da7" strokeLinecap="round" strokeWidth="2"></line>
              </g>
            </svg>
          </div>
        </div>
      </a>
    </li>
  )
}

export default ArticleItem
