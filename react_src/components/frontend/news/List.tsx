import * as React from 'react';

import Item from './Item'
import { NewsDataProps, NewsListProps, CategoryDataProps } from '../types'
import useSWR from 'swr'
import { fetcher } from '../utils/helper'
const NewsItem: React.FC = () => {
  const [selectedCategory, setSelectCategory] = React.useState<number | string>('all')
  const [page, setPage] = React.useState<number>(1)
  const [total, setTotal] = React.useState<number>(0)
  const GET_NEWS_LIST_URL = `${process.env.REACT_API_URL}/api/news?page=${page}&cid=${selectedCategory}`;
  const GET_CATEGORY_LIST_URL = `${process.env.REACT_API_URL}/api/admin/category?type=news`;
  const { data:newsList } = useSWR<NewsListProps>(GET_NEWS_LIST_URL,fetcher);
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
          <li
            className={selectedCategory == 'all' ? 'now' : ''}
            onClick={() => handleCategoryClick('all')}>
            全部
          </li>
          {categories?.map((category) => {
            return <li
              onClick={() => handleCategoryClick(category.id)}
              className={selectedCategory === category.id ? 'now' : ''}>
              {category.name}
            </li>
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

          if (pageNumber > 1 && total > 2)
            link = <>
              {link}
              <a href="javascript: void(0)" onClick={() => setPage(page-1)} className="back">
                <img src="/static/image/pagear1.svg"/>
                <p>上一頁</p>
              </a>
            </>

          if (pageNumber == total && total > 2)
            link = <>
              <a href="javascript: void(0)" onClick={() => setPage(page+1)} className="next">
                <img src="/static/image/pagear2.svg"/>
                <p>下一頁</p>
                </a>
            </>
          return link
        })
      }
			</div>
		</div>
  )
}

export default NewsItem


