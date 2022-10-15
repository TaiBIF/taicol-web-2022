import React from 'react';
import type {NewsDataProps} from 'src/types/frontend'
import moment from 'moment';
import {shortDescription} from 'src/utils/helper'


const LatestNews: React.VFC<NewsDataProps> = (props) => {
  const { title, Category, updatedAt, slug } = props
  const date = moment(new Date(updatedAt))

  return (
    <li>
      <a href={`/news/${slug}`}>
        <div className="top-flex-dat">
          <div className="date">
            <div className="day">{date.format('DD')}</div>
            <div className="mon-year">{date.format('MMM')}.{date.format('YYYY')}</div>
          </div>
          <div className={`tag`} style={{ backgroundColor: `${Category.color}`}}>
            {Category.name}
          </div>
        </div>
        <h3 className="news-title">
          {shortDescription(title, 100)}
        </h3>
      </a>
    </li>
  )
}

export default LatestNews
