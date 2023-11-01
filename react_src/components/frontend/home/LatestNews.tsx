import * as React from 'react';
import type {NewsDataProps} from '../types'
import * as moment from 'moment';
import {shortDescription} from '../utils/helper'
import validateColor from "validate-color";
import { Translation, useTranslation } from 'react-i18next';

const LatestNews: React.FC<NewsDataProps> = (props) => {
  const { title, Category, publishedDate, slug } = props
  const date = moment(new Date(publishedDate))
  const categoryBackgroundColor = Category.color  && validateColor(Category.color) ? Category.color : "black"

  const { t, i18n } = useTranslation();

  return (
    <li>
      <a href={`/news/${slug}`}>
        <div className="top-flex-dat">
          <div className="date">
            <div className="day">{date.format('DD')}</div>
            <div className="mon-year">{date.format('MMM')}.{date.format('YYYY')}</div>
          </div>
          {/* <Translation>{t => */}
          <div className={`tag`}  style={{backgroundColor: categoryBackgroundColor}}>
            {/* {t(Category.name)} */}
            {i18n.language == 'en-us' ? Category.name_eng : Category.name}
          </div>
          {/* }</Translation> */}
        </div>
        <h3 className="news-title">
          {shortDescription(title, 100)}
        </h3>
      </a>
    </li>
  )
}

export default LatestNews
