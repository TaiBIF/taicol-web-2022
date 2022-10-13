import * as React from 'react';
import type { NewsDataProps } from '../types'
import * as moment from 'moment';

const NewsItem: React.FC<NewsDataProps> = (props) => {
  const { title, Category, updatedAt, slug } = props
  const date = moment(new Date(updatedAt))

  return (
    <li>
      <a href={`/news/${slug}`}>
        <div className="top-flex-dat">
          <div className="date">
            <div className="day">{date.format('DD')}</div>
            <div className="mon-year">{date.format('ddd')}.{date.format('YYYY')}</div>
          </div>
          <div className={`tag`} style={{ backgroundColor: `${Category.color}`}}>
            {Category.name} - {Category.color}
          </div>
        </div>
        <div className="txt">
          <h3 className="news-title">

            {title}
          </h3>
          <p>
            {title}
          </p>
      </div>
      </a>
    </li>
  )
}

export default NewsItem
