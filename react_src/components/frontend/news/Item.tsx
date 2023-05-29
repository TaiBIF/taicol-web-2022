import * as React from 'react';
import type { NewsDataProps } from '../types'
import * as moment from 'moment';
import validateColor from "validate-color";
import { shortDescription } from '../utils/helper'
import { Translation } from 'react-i18next';

const NewsItem: React.FC<NewsDataProps> = (props) => {
  const { title,description, Category, publishedDate, slug } = props
  const date = moment(new Date(publishedDate))

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
          <Translation>{t=> t(Category.name)}</Translation>  
          </div>
        </div>
        <div className="txt">
          <h3 className="news-title">
            {title}
          </h3>
          <p>
            {shortDescription(description,100)}
          </p>
      </div>
      </a>
    </li>
  )
}

export default NewsItem
