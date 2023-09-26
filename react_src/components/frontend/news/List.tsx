import * as React from 'react';

import Item from './Item'
import { NewsDataProps, NewsListProps, CategoryDataProps } from '../types'
import useSWR from 'swr'
import { fetcher } from '../utils/helper'
import { Translation } from 'react-i18next';

const NewsItem: React.FC = () => {
  const [selectedCategory, setSelectCategory] = React.useState<number | string>('all')
  const [page, setPage] = React.useState<number>(1)
  const [total, setTotal] = React.useState<number>(0)
  const GET_NEWS_LIST_URL = `${process.env.REACT_API_URL}/api/news?page=${page}&cid=${selectedCategory}`;
  const GET_CATEGORY_LIST_URL = `${process.env.REACT_API_URL}/api/admin/category?type=news`;
  const { data: newsList } = useSWR<NewsListProps>(GET_NEWS_LIST_URL,fetcher);
  const { data: categories } = useSWR<CategoryDataProps[]>(GET_CATEGORY_LIST_URL,fetcher);
  const pageSize: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);

  React.useEffect(() => {
    if (newsList) {
      setTotal(Math.ceil(newsList.count / pageSize))
    }
  }, [newsList])

  const handleCategoryClick = (categoryId:string | number) => {
    setSelectCategory(categoryId)
    setPage(1)
  }

  return (<div className="main-box vivi-cont-top padb-80">
			<div className="cont-tab-area">
				<ul>
        <Translation>{t =>
          <li
            className={selectedCategory == 'all' ? 'now' : ''}
            onClick={() => handleCategoryClick('all')}>
            {t('全部')}
          </li>
          }</Translation>
          {categories?.map((category) => {
            return (<Translation>{t =>
              <li
              onClick={() => handleCategoryClick(category.id)}
              className={selectedCategory === category.id ? 'now' : ''}>
              {t(category.name)}
            </li>
            }</Translation>)
          })}
				</ul>
			</div>
			<div className="news-area-cont">
				<div className="news-list-box">
            <ul>
            {newsList?.rows?.map((news: NewsDataProps, index: number) => <Item {...news} key={`news-${index}`} />)}
					  </ul>
				</div>

			</div>
			<div className="page-num">

      {total > 1 &&
        Array.from(Array(total).keys()).map((index: number) => {
          const pageNumber = index + 1;

          let link = <a href="javascript: void(0)" onClick={() => setPage(pageNumber)} className={`num ${page == index + 1 ? 'now' : ''}`}>{pageNumber}</a>

          console.log('pageNumber', pageNumber)
          console.log('total', total)
          if (pageNumber == 2 && total > 2)
            link = <>
              <a href="javascript: void(0)" onClick={() => {
                if(page > 1)
                  setPage(page - 1)
              }} className="back">
                <img src="/static/image/pagear1.svg"/>
                <Translation>{t =><p>{t("上一頁")}</p>}</Translation>
              </a>
              {link}
            </>

          if (pageNumber == total && total > 2)
            link = <>
              <a href="javascript: void(0)" onClick={() => {
                if(page < total)
                  setPage(page + 1)
              }} className="next">
                <Translation>{t =><p>{t("下一頁")}</p>}</Translation>
                <img src="/static/image/pagear2.svg"/>
                </a>
              {link}
            </>
          return link
        })
      }
			</div>
		</div>
  )
}

export default NewsItem


