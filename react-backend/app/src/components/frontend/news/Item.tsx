import React from 'react';
import type { NewsDataProps } from 'src/types/frontend'
import moment from 'moment';
import { shortDescription } from 'src/utils/helper';

const NewsItem: React.VFC<NewsDataProps> = (props) => {
  const { title, Category, updatedAt, slug } = props
  const date = moment(new Date(updatedAt))
  console.log('news item date',date)

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
