import * as React from 'react';
import type { NewsDataProps } from '../types'
import * as moment from 'moment';
import validateColor from "validate-color";

const NewsItem: React.FC<NewsDataProps> = (props) => {
  const { title, Category, updatedAt, slug } = props
  const date = moment(new Date(updatedAt))

  const style = {
    "backgroundColor": Category.color
  }
  const categoryBackgroundColor = Category.color && validateColor(Category.color) ? Category.color : "black"
  
  return (
    <li>
      <a href={`/news/${slug}`}>
        <div className="top-flex-dat">
          <div className="date">
            <div className="day">{date.format('DD')}</div>
            <div className="mon-year">{date.format('MMM')}.{date.format('YYYY')}</div>
          </div>
          <div className={`tag`}  style={{backgroundColor: categoryBackgroundColor}}>
            {Category.name}
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
